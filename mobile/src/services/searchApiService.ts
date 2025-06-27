import { supabase } from './supabaseClient';

export const analyzeImageWithSearchAPI = async (imageUrl: string): Promise<any> => {
  const { data, error } = await supabase.functions.invoke('analyze-searchapi', {
    body: { imageUrl },
  });

  if (error || !data || !data.success) {
    throw new Error(data?.message || error?.message || 'SearchAPI analysis failed');
  }

  return data.data;
};
