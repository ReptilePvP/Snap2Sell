import { supabase } from './supabaseClient';
import { AnalysisResult, ApiProvider } from '../types';

export const uploadImageDirectly = async (file: File): Promise<string> => {
  const fileExtension = file.name.split('.').pop() || 'jpg';
  const fileName = `${Date.now()}.${fileExtension}`;

  const { data, error } = await supabase.storage
    .from('images')
    .upload(fileName, file, {
      contentType: file.type,
    });

  if (error) {
    console.error('Supabase Upload Error:', error);
    throw new Error('Failed to upload image to Supabase Storage.');
  }

  if (!data) {
    throw new Error('Upload succeeded but no data was returned.');
  }

  const { data: { publicUrl } } = supabase.storage
    .from('images')
    .getPublicUrl(fileName);

  if (!publicUrl) {
    throw new Error('Failed to get public URL for the uploaded image.');
  }

  return publicUrl;
};

export const analyzeImageWithSerpAPI = async (imageUrl: string): Promise<AnalysisResult> => {
  try {
    console.log('Calling web SerpAPI function with imageUrl:', imageUrl);
    
    const { data, error } = await supabase.functions.invoke('web-analyze-serpapi', {
      body: { imageUrl },
    });

    console.log('Web SerpAPI function response:', { data, error });

    if (error) {
      console.error('Web SerpAPI Supabase function error:', error);
      throw new Error(`Failed to send a request to the Edge Function: ${error.message}`);
    }

    if (!data || !data.success) {
      console.error('Web SerpAPI function returned unsuccessful response:', data);
      throw new Error(data?.message || 'SerpAPI analysis failed');
    }

    // The web function returns a pre-formatted AnalysisResult
    const result = data.data;
    
    return {
      id: result.id || `serpapi-${Date.now()}`,
      title: result.title || 'SerpAPI Analysis',
      description: result.description || `Found ${result.visualMatches?.length || 0} visual matches for your item.`,
      value: result.value || (result.visualMatches?.length > 0 ? 'See matches for pricing details' : 'No matches found'),
      aiExplanation: result.aiExplanation || 'SerpAPI analyzed your image using Google Lens technology to find similar items across the web.',
      visualMatches: result.visualMatches || [],
      imageUrl: imageUrl,
      apiProvider: ApiProvider.SERPAPI,
      timestamp: result.timestamp || Date.now(),
    };
  } catch (err) {
    console.error('Error in analyzeImageWithSerpAPI:', err);
    if (err instanceof Error) {
      throw err;
    }
    throw new Error('An unexpected error occurred during SerpAPI analysis');
  }
};

export const analyzeImageWithSearchAPI = async (imageUrl: string): Promise<AnalysisResult> => {
  try {
    console.log('Calling web SearchAPI function with imageUrl:', imageUrl);
    
    const { data, error } = await supabase.functions.invoke('web-analyze-searchapi', {
      body: { imageUrl },
    });

    console.log('Web SearchAPI function response:', { data, error });

    if (error) {
      console.error('Web SearchAPI Supabase function error:', error);
      throw new Error(`Failed to send a request to the Edge Function: ${error.message}`);
    }

    if (!data || !data.success) {
      console.error('Web SearchAPI function returned unsuccessful response:', data);
      throw new Error(data?.message || 'SearchAPI analysis failed');
    }

    console.log('Web SearchAPI analysis successful:', data.data);
    // The web SearchAPI function already returns a properly formatted AnalysisResult
    return data.data;
  } catch (err) {
    console.error('Error in analyzeImageWithSearchAPI:', err);
    if (err instanceof Error) {
      throw err;
    }
    throw new Error('An unexpected error occurred during SearchAPI analysis');
  }
};

export const analyzeImageWithGeminiAPI = async (imageUrl: string): Promise<AnalysisResult> => {
  try {
    console.log('Calling web Gemini function with imageUrl:', imageUrl);
    
    const { data, error } = await supabase.functions.invoke('web-analyze-gemini', {
      body: { imageUrl },
    });

    console.log('Web Gemini function response:', { data, error });

    if (error) {
      console.error('Web Gemini Supabase function error:', error);
      throw new Error(`Failed to send a request to the Edge Function: ${error.message}`);
    }

    if (!data || !data.success) {
      console.error('Web Gemini function returned unsuccessful response:', data);
      throw new Error(data?.message || 'Gemini analysis failed');
    }

    const geminiData = data.data;
    
    return {
      id: `gemini-${Date.now()}`,
      title: geminiData.itemName,
      description: geminiData.itemDescription,
      value: geminiData.estimatedValue,
      aiExplanation: geminiData.valuationRationale,
      imageUrl: imageUrl,
      apiProvider: ApiProvider.GEMINI,
      timestamp: Date.now(),
    };
  } catch (err) {
    console.error('Error in analyzeImageWithGeminiAPI:', err);
    if (err instanceof Error) {
      throw err;
    }
    throw new Error('An unexpected error occurred during Gemini analysis');
  }
};