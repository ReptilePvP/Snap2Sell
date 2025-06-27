import { supabase } from './supabaseClient';

export const analyzeImageWithGeminiAPI = async (imageUrl: string): Promise<any> => {
  const { data, error } = await supabase.functions.invoke('analyze-gemini', {
    body: { imageUrl },
  });

  if (error || !data || !data.success) {
    throw new Error(data?.message || error?.message || 'Gemini analysis failed');
  }

  return data.data;
};
