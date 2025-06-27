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

    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Gemini API key not configured.'
      }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    // Fetch the image and convert to base64
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image from URL: ${imageResponse.statusText}`);
    }
    
    const imageBuffer = await imageResponse.arrayBuffer();
    const base64Data = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));
    const mimeType = imageResponse.headers.get('content-type') || 'image/jpeg';

    const prompt = `Analyze the item in the provided image.
Your goal is to provide information for a resale value estimation app.
Please respond strictly with a JSON object. Do not include any text outside of this JSON object, and do not use markdown fences (like \`\`\`json) around the JSON.
The JSON object must have the following keys:
1.  "itemName": A concise and descriptive name for the item (string).
2.  "itemDescription": A detailed description of the item, suitable for display to a user. Include characteristics like type, material, potential brand, condition (as observable from the image), and any notable features. This should be formatted as a Markdown string.
3.  "estimatedValue": An estimated resale value range for the item (e.g., "$50 - $75", "Around $100"). Base this on the item's visual characteristics and common knowledge of similar items. (string).
4.  "valuationRationale": An explanation of how the estimatedValue was derived. Mention factors considered, such as perceived condition, rarity, brand (if identifiable), and general market perception for such items. This should be formatted as a Markdown string.

Example for "itemDescription": "A vintage-style ceramic teapot with a floral pattern. Appears to be in good condition with no visible chips or cracks. The lid is present. Unknown brand."
Example for "valuationRationale": "The teapot's vintage aesthetic and good apparent condition suggest a moderate resale value. Floral ceramic teapots are popular among collectors. Without brand identification or a view of maker's marks, the estimate is based on general market prices for similar unbranded items."
Focus on visual analysis. Do not ask for more images or information. Provide the best possible analysis based on the single image provided.`;

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
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.5
      }
    };

    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!geminiResponse.ok) {
      throw new Error(`Gemini API returned status ${geminiResponse.status}`);
    }

    const geminiData = await geminiResponse.json();
    
    if (!geminiData.candidates || !geminiData.candidates[0] || !geminiData.candidates[0].content) {
      throw new Error('Invalid response from Gemini API');
    }

    const responseText = geminiData.candidates[0].content.parts[0].text;
    if (!responseText) {
      throw new Error("Received an empty response from Gemini.");
    }

    // Clean up the response text and parse JSON
    let jsonStr = responseText.trim();
    const fenceRegex = /^```(?:json)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[1]) {
      jsonStr = match[1].trim();
    }
    
    const parsedData = JSON.parse(jsonStr);

    return new Response(JSON.stringify({
      success: true,
      data: parsedData
    }), { headers: { 'Content-Type': 'application/json' } });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: error instanceof Error ? error.message : 'An unknown error occurred with Gemini API.'
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
});
