import { supabase } from './supabaseClient';

export const analyzeImageWithSerpAPI = async (imageUrl: string): Promise<any> => {
  const { data, error } = await supabase.functions.invoke('analyze-serpapi', {
    body: { imageUrl },
  });

  if (error || !data || !data.success) {
    throw new Error(data?.message || error?.message || 'SerpAPI analysis failed');
  }

  return data.data;
};
