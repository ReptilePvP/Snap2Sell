import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

serve(async (req) => {
  // Add CORS headers for web app
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { imageUrl } = await req.json();
    
    if (!imageUrl) {
      return new Response(JSON.stringify({
        success: false,
        message: 'No image URL provided.'
      }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const apiKey = Deno.env.get('SEARCH_API_KEY');
    if (!apiKey) {
      throw new Error('SEARCH_API_KEY is not set in environment variables.');
    }
    
    const params = new URLSearchParams({
      engine: 'google_lens',
      url: imageUrl,
      hl: 'en',
      gl: 'us',
      api_key: apiKey,
      search_type: 'all',
    });

    const apiUrl = `https://www.searchapi.io/api/v1/search?${params.toString()}`;
    const apiResponse = await fetch(apiUrl);
    
    if (!apiResponse.ok) {
      const errorBody = await apiResponse.text();
      console.error(`SearchAPI error: ${apiResponse.status} ${apiResponse.statusText}`, errorBody);
      throw new Error(`SearchAPI returned status ${apiResponse.status}`);
    }
    
    const data = await apiResponse.json();

    // Transform the SearchAPI response to match the expected format
    const transformedData = {
      id: `web_searchapi_${Date.now()}`,
      title: 'SearchAPI Analysis',
      description: `Found ${data.visual_matches?.length || 0} visual matches for your item.`,
      value: data.visual_matches?.length > 0 ? 'See matches for pricing details' : 'No matches found',
      aiExplanation: 'Google Lens analyzed your image and found the following similar items. Prices and availability may vary.',
      visualMatches: data.visual_matches || [],
      apiProvider: 'SearchAPI',
      timestamp: Date.now(),
      imageUrl: imageUrl
    };

    return new Response(JSON.stringify({
      success: true,
      data: transformedData
    }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (error) {
    console.error("Error in web-analyze-searchapi function:", error);
    return new Response(JSON.stringify({
      success: false,
      message: error instanceof Error ? error.message : 'An unknown error occurred with SearchAPI.'
    }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});
