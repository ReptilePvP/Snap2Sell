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
    console.log('Starting web-analyze-gemini function...');
    const { imageUrl } = await req.json();
    console.log('Received imageUrl:', imageUrl);
    
    if (!imageUrl) {
      console.log('No image URL provided');
      return new Response(JSON.stringify({
        success: false,
        message: 'No image URL provided.'
      }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      console.log('Gemini API key not found');
      return new Response(JSON.stringify({
        success: false,
        message: 'Gemini API key not configured.'
      }), { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }
    console.log('API key found, proceeding with image fetch...');

    // Fetch the image and convert to base64
    console.log('Fetching image from URL...');
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      console.log('Failed to fetch image:', imageResponse.status, imageResponse.statusText);
      throw new Error(`Failed to fetch image from URL: ${imageResponse.statusText}`);
    }
    
    console.log('Converting image to base64...');
    const imageBuffer = await imageResponse.arrayBuffer();
    
    // Check image size to prevent memory issues
    const imageSizeInMB = imageBuffer.byteLength / (1024 * 1024);
    console.log('Image size:', imageSizeInMB.toFixed(2), 'MB');
    
    if (imageSizeInMB > 20) {
      throw new Error(`Image too large: ${imageSizeInMB.toFixed(2)}MB. Maximum size is 20MB.`);
    }
    
    // Convert to base64 more efficiently
    const uint8Array = new Uint8Array(imageBuffer);
    let binaryString = '';
    const chunkSize = 8192; // Process in chunks to avoid stack overflow
    
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.slice(i, i + chunkSize);
      binaryString += String.fromCharCode.apply(null, Array.from(chunk));
    }
    
    const base64Data = btoa(binaryString);
    const mimeType = imageResponse.headers.get('content-type') || 'image/jpeg';
    console.log('Image converted, MIME type:', mimeType, 'Base64 length:', base64Data.length);

    const prompt = `Analyze the item in the provided image for a resale value estimation app.

Use Google Search to find current market information about this item, including:
- Current resale prices for similar items
- Brand information and authenticity markers
- Market demand and trends
- Comparable listings on platforms like eBay, Facebook Marketplace, etc.

IMPORTANT: You must respond with ONLY a valid JSON object. Do not include any explanatory text before or after the JSON. Do not wrap the JSON in markdown code blocks. Start your response immediately with { and end with }.

The JSON object must have exactly these keys:
{
  "itemName": "A concise and descriptive name for the item",
  "itemDescription": "A detailed description of the item in Markdown format, including type, material, brand, condition, and notable features",
  "estimatedValue": "An estimated resale value range based on current market data (e.g., '$50 - $75')",
  "valuationRationale": "An explanation in Markdown format of how the value was derived, incorporating real market data from search results"
}

Example response format:
{
  "itemName": "Vintage Royal Albert Bone China Teapot",
  "itemDescription": "A vintage-style ceramic teapot with floral pattern. Appears to be Royal Albert or similar English bone china. Good condition with no visible chips or cracks. Complete with lid.",
  "estimatedValue": "$25 - $40",
  "valuationRationale": "Based on current eBay and marketplace research, similar vintage floral bone china teapots sell for $25-$40. The good condition and complete set (with lid) supports the higher end of this range."
}

Remember: Respond with ONLY the JSON object, no other text.`;

    console.log('Preparing Gemini API request...');
    const requestBody = {
      contents: [{
        parts: [
          {
            text: prompt
          },
          {
            inline_data: {
              mime_type: mimeType,
              data: base64Data
            }
          }
        ]
      }],
      tools: [{
        google_search: {}
      }],
      generationConfig: {
        temperature: 0.5
      }
    };

    console.log('Calling Gemini API...');
    
    // Create a timeout controller with increased timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90000); // 90 second timeout
    
    let geminiData;
    try {
      const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      console.log('Gemini API response status:', geminiResponse.status);
      if (!geminiResponse.ok) {
        const errorText = await geminiResponse.text();
        console.log('Gemini API error response:', errorText);
        throw new Error(`Gemini API returned status ${geminiResponse.status}: ${errorText}`);
      }
      
      console.log('Parsing Gemini response...');
      geminiData = await geminiResponse.json();
      
      if (!geminiData.candidates || !geminiData.candidates[0] || !geminiData.candidates[0].content) {
        throw new Error('Invalid response from Gemini API');
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        throw new Error('Gemini API request timed out after 90 seconds');
      }
      throw fetchError;
    }

    const responseText = geminiData.candidates[0].content.parts[0].text;
    if (!responseText) {
      throw new Error("Received an empty response from Gemini.");
    }

    console.log('Raw Gemini response:', responseText);

    // Log grounding metadata if available (for debugging)
    if (geminiData.candidates[0].groundingMetadata) {
      console.log('Grounding metadata received:', JSON.stringify(geminiData.candidates[0].groundingMetadata, null, 2));
    }

    // Try to parse as JSON first
    let parsedData;
    let jsonStr = responseText.trim();
    
    // Remove markdown code fences if present
    const fenceRegex = /^```(?:json)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[1]) {
      jsonStr = match[1].trim();
    }
    
    // Look for JSON object in the response
    const jsonStartIndex = jsonStr.indexOf('{');
    const jsonEndIndex = jsonStr.lastIndexOf('}');
    
    if (jsonStartIndex !== -1 && jsonEndIndex !== -1 && jsonStartIndex < jsonEndIndex) {
      // Try to parse the JSON
      const extractedJson = jsonStr.substring(jsonStartIndex, jsonEndIndex + 1);
      try {
        parsedData = JSON.parse(extractedJson);
        console.log('Successfully parsed JSON response');
      } catch (parseError) {
        console.log('JSON parsing failed, will create structured response from text');
        parsedData = null;
      }
    }
    
    // If JSON parsing failed, create a structured response from the text
    if (!parsedData) {
      console.log('Creating structured response from descriptive text...');
      
      // Extract item information from the descriptive text
      const text = responseText;
      
      // Try to extract item name (usually mentioned early in the response)
      const lines = text.split('\n');
      const firstSentence = lines[0] || text.substring(0, 200);
      
      // Extract item name from first sentence
      let itemName = "Unknown Item";
      if (firstSentence.toLowerCase().includes('nike')) {
        const nikeMatch = firstSentence.match(/nike[^.!?]*/i);
        if (nikeMatch) itemName = nikeMatch[0].trim();
      } else if (firstSentence.toLowerCase().includes('air force')) {
        const afMatch = firstSentence.match(/air force[^.!?]*/i);
        if (afMatch) itemName = `Nike ${afMatch[0].trim()}`;
      } else {
        // Extract first reasonable item description
        const itemMatch = firstSentence.match(/(?:is|are)\s+(?:a|an)\s+([^.!?]+)/i);
        if (itemMatch) itemName = itemMatch[1].trim();
      }
      
      // Create structured response
      parsedData = {
        itemName: itemName,
        itemDescription: text.length > 500 ? text.substring(0, 500) + "..." : text,
        estimatedValue: "Value assessment included in description",
        valuationRationale: "Based on visual analysis and market research using Google Search. See full description for details."
      };
      
      console.log('Created structured response:', parsedData);
    }
    
    // Validate required fields
    const requiredFields = ['itemName', 'itemDescription', 'estimatedValue', 'valuationRationale'];
    for (const field of requiredFields) {
      if (!parsedData[field]) {
        parsedData[field] = `Information not available`;
      }
    }

    // Include grounding information in the response if available
    const responseData: any = {
      success: true,
      data: parsedData
    };

    // Add grounding metadata if present (for potential future use)
    if (geminiData.candidates[0].groundingMetadata) {
      responseData.groundingMetadata = geminiData.candidates[0].groundingMetadata;
    }

    return new Response(JSON.stringify(responseData), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (error) {
    console.error("Detailed error in web-analyze-gemini function:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace available');
    
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred with Gemini API.';
    console.error("Returning error message:", errorMessage);
    
    return new Response(JSON.stringify({
      success: false,
      message: errorMessage
    }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});
