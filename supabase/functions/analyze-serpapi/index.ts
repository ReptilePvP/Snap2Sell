import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

serve(async (req) => {
  try {
    const { imageUrl } = await req.json();
    
    if (!imageUrl) {
      return new Response(JSON.stringify({
        success: false,
        message: 'No image URL provided.'
      }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const apiKey = Deno.env.get('SERPAPI_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({
        success: false,
        message: 'SerpAPI key not configured.'
      }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    const params = new URLSearchParams({
      engine: 'google_lens',
      url: imageUrl,
      hl: 'en',
      gl: 'us',
      api_key: apiKey,
    });

    const apiUrl = `https://serpapi.com/search?${params.toString()}`;
    const apiResponse = await fetch(apiUrl);
    const data = await apiResponse.json();

    if (!apiResponse.ok) {
      throw new Error(`SerpAPI returned status ${apiResponse.status}`);
    }

    return new Response(JSON.stringify({
      success: true,
      data
    }), { headers: { 'Content-Type': 'application/json' } });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: error instanceof Error ? error.message : 'An unknown error occurred with SerpAPI.'
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
});
