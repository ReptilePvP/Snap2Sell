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
    console.log('SerpAPI function called');
    
    let requestBody;
    try {
      requestBody = await req.json();
      console.log('Request body received:', !!requestBody);
    } catch (jsonError) {
      console.error('Failed to parse JSON:', jsonError);
      return new Response(JSON.stringify({
        success: false,
        message: 'Invalid JSON in request body'
      }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const { imageUrl } = requestBody;
    
    if (!imageUrl) {
      console.error('No imageUrl provided');
      return new Response(JSON.stringify({
        success: false,
        message: 'No image URL provided.'
      }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // Try multiple environment variable names for the API key
    const apiKey = Deno.env.get('SERPAPI_API_KEY') || 
                   Deno.env.get('VITE_SERPAPI_API_KEY') || 
                   '0df2fcc3b6090d2083f7e1840e585f994b0d0b5339a53c77c4d30a7760701e60'; // Fallback for testing
    
    console.log('API key found:', apiKey ? 'Yes' : 'No');
    console.log('API key length:', apiKey?.length || 0);
    
    if (!apiKey) {
      console.error('No SerpAPI key found in environment');
      return new Response(JSON.stringify({
        success: false,
        message: 'SerpAPI key not configured in environment variables.'
      }), { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // Construct the SerpAPI URL with proper parameters
    const params = new URLSearchParams({
      engine: 'google_lens',
      url: imageUrl,
      hl: 'en',
      gl: 'us',
      api_key: apiKey,
    });

    const apiUrl = `https://serpapi.com/search.json?${params.toString()}`;
    console.log('Making request to SerpAPI (URL length):', apiUrl.length);
    
    const apiResponse = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Snapalyze-Web/1.0'
      }
    });
    
    console.log('SerpAPI response status:', apiResponse.status);
    console.log('SerpAPI response headers:', Object.fromEntries(apiResponse.headers.entries()));
    
    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error(`SerpAPI HTTP error: ${apiResponse.status} ${apiResponse.statusText}`, errorText);
      return new Response(JSON.stringify({
        success: false,
        message: `SerpAPI returned status ${apiResponse.status}: ${errorText}`
      }), { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }
    
    const data = await apiResponse.json();
    console.log('SerpAPI response data keys:', Object.keys(data || {}));
    console.log('Visual matches found:', data.visual_matches?.length || 0);

    // Check if the response has an error
    if (data.error) {
      console.error('SerpAPI API error:', data.error);
      return new Response(JSON.stringify({
        success: false,
        message: `SerpAPI error: ${data.error}`
      }), { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // Extract visual matches or similar results
    const rawVisualMatches = data.visual_matches || [];
    const shoppingResults = data.shopping_results || [];
    const knowledgeGraph = data.knowledge_graph || {};
    
    console.log('Found visual matches:', rawVisualMatches.length);
    console.log('Found shopping results:', shoppingResults.length);

    // Process visual matches to handle price objects correctly
    const processedVisualMatches = rawVisualMatches.map(match => {
      let formattedPrice = 'Price not available';
      
      if (match.price) {
        if (typeof match.price === 'object') {
          // Handle price objects like {value: 10.99, currency: "USD", extracted_value: 10.99}
          if (match.price.value !== undefined) {
            const currency = match.price.currency === 'USD' ? '$' : (match.price.currency || '$');
            formattedPrice = `${currency}${match.price.value}`;
          } else if (match.price.extracted_value !== undefined) {
            const currency = match.price.currency === 'USD' ? '$' : (match.price.currency || '$');
            formattedPrice = `${currency}${match.price.extracted_value}`;
          }
        } else if (typeof match.price === 'string') {
          // Handle string prices
          formattedPrice = match.price;
        }
      }
      
      return {
        ...match,
        price: formattedPrice
      };
    });

    // Find the best price information
    const priceInfo = processedVisualMatches.find(match => 
      match.price && match.price !== 'Price not available'
    );
    
    const estimatedValue = priceInfo 
      ? `Similar items found around ${priceInfo.price}` 
      : processedVisualMatches.length > 0 
        ? 'Multiple matches found - check individual items for pricing' 
        : 'No matches found';

    // Transform the SerpAPI response for web usage
    const transformedData = {
      id: `serpapi_${Date.now()}`,
      title: 'SerpAPI Visual Analysis',
      description: `Found ${processedVisualMatches.length} visual matches${shoppingResults.length > 0 ? ` and ${shoppingResults.length} shopping results` : ''}.`,
      value: estimatedValue, // Now guaranteed to be a string
      aiExplanation: `SerpAPI analyzed your image using Google Lens technology and found ${processedVisualMatches.length} visually similar items across the web. ${priceInfo ? 'Pricing information was extracted from the most relevant matches.' : 'Check individual matches for specific pricing details.'}`,
      visualMatches: processedVisualMatches, // Now with properly formatted prices
      shoppingResults: shoppingResults,
      knowledgeGraph: knowledgeGraph,
      apiProvider: 'SERPAPI',
      timestamp: Date.now(),
      imageUrl: imageUrl,
      // Include search metadata
      searchMetadata: data.search_metadata || {}
    };

    console.log('Returning success response');
    return new Response(JSON.stringify({
      success: true,
      data: transformedData
    }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (error) {
    console.error("Unexpected error in web-analyze-serpapi function:", error);
    console.error("Error stack:", error.stack);
    return new Response(JSON.stringify({
      success: false,
      message: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      errorType: error.constructor.name
    }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});
