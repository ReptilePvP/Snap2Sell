import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface OpenLensRequest {
  imageUrl: string; // Supabase public URL
}

interface OpenLensResponse {
  analysis: string;
  request_id: string;
  google_lens_links_found: number | string;
  scraped_content_length: number;
  csv_file: string;
  content_file: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { imageUrl }: OpenLensRequest = await req.json()

    if (!imageUrl) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'No imageUrl provided' 
        }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Fetch the image from Supabase storage and convert to base64
    console.log('Fetching image from Supabase:', imageUrl)
    const imageResponse = await fetch(imageUrl)
    
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.statusText}`)
    }

    const imageBuffer = await imageResponse.arrayBuffer()
    const base64Image = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)))

    console.log('Image converted to base64, calling OpenLens API')

    // Call your local OpenLens FastAPI server
    const openLensResponse = await fetch('http://127.0.0.1:8000/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: base64Image })
    })

    if (!openLensResponse.ok) {
      throw new Error(`OpenLens API error: ${openLensResponse.status} ${openLensResponse.statusText}`)
    }

    const data: OpenLensResponse = await openLensResponse.json()
    console.log('OpenLens analysis completed')

    // Parse and structure the response
    const analysisResult = {
      success: true,
      data: {
        id: data.request_id || `openlens_${Date.now()}`,
        title: extractTitle(data.analysis),
        description: data.analysis.length > 200 
          ? data.analysis.substring(0, 200) + '...'
          : data.analysis,
        value: extractValue(data.analysis),
        aiExplanation: data.analysis,
        apiProvider: 'OpenLens',
        timestamp: Date.now(),
        imageUrl: imageUrl,
        metadata: {
          google_lens_links_found: data.google_lens_links_found,
          scraped_content_length: data.scraped_content_length,
          csv_file: data.csv_file,
          content_file: data.content_file
        }
      }
    }

    return new Response(
      JSON.stringify(analysisResult), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('OpenLens analysis error:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Analysis failed', 
        message: error.message 
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

function extractTitle(analysis: string): string {
  const lines = analysis.split('\n').filter(line => line.trim())
  
  // Look for title patterns
  const titleMatch = lines.find(line => 
    line.includes('Image Description') || 
    line.includes('Product') ||
    line.includes('Item')
  )
  
  if (titleMatch) {
    const colonIndex = titleMatch.indexOf(':')
    if (colonIndex !== -1) {
      return titleMatch.substring(colonIndex + 1).trim()
        .replace(/^\*\*|\*\*$/g, '') // Remove markdown bold
        .substring(0, 100) // Limit length
    }
  }
  
  return 'OpenLens Analysis'
}

function extractValue(analysis: string): string {
  // Look for price/value information
  const priceMatch = analysis.match(/\$[\d,]+(?:\.\d{2})?|\$\d+(?:-\$\d+)?|price[:\s]*\$?[\d,]+/i)
  if (priceMatch) {
    return priceMatch[0]
  }
  
  return 'Analysis Complete'
}
