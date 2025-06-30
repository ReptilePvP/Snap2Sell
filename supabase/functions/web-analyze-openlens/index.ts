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

    // Call your Railway OpenLens service with the new URL endpoint
    const OPENLENS_API_URL = 'https://snap2sell-production.up.railway.app'
    console.log('Calling OpenLens Railway API with image URL')
    
    const openLensResponse = await fetch(`${OPENLENS_API_URL}/analyze-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageUrl: imageUrl }),
      // Add timeout for Cloud Run requests
      signal: AbortSignal.timeout(120000) // 2 minutes timeout
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
        description: data.analysis && data.analysis !== 'Error processing with OpenAI: Connection error.'
          ? (data.analysis.length > 200 ? data.analysis.substring(0, 200) + '...' : data.analysis)
          : 'OpenLens analysis completed with limited results',
        value: extractValue(data.analysis),
        aiExplanation: data.analysis && data.analysis !== 'Error processing with OpenAI: Connection error.'
          ? data.analysis
          : 'OpenLens processed your image but encountered connectivity issues with the AI analysis service.',
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
    
    // Provide more detailed error information
    let errorMessage = 'Analysis failed'
    if (error instanceof Error) {
      if (error.name === 'TimeoutError' || error.message.includes('timeout')) {
        errorMessage = 'OpenLens service timed out. The analysis may take longer for complex images.'
      } else if (error.message.includes('Failed to fetch image')) {
        errorMessage = 'Could not access the image URL. Please ensure the image is publicly accessible.'
      } else if (error.message.includes('OpenLens API error')) {
        errorMessage = 'OpenLens analysis service is temporarily unavailable. Please try again.'
      } else if (error.message.includes('Failed to fetch image from URL')) {
        errorMessage = 'OpenLens service could not retrieve the image from Supabase storage. Please try uploading again.'
      } else {
        errorMessage = error.message
      }
    }
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: errorMessage, 
        message: error instanceof Error ? error.message : 'Unknown error occurred'
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
