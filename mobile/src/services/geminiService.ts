import { AnalysisResult, ApiProvider } from '../types';
import { analyzeImageWithGeminiAPI } from './apiService';

export const analyzeImageWithGemini = async (
  imageUri: string,
  displayImageUrl: string
): Promise<AnalysisResult> => {
  try {
    const parsedData = await analyzeImageWithGeminiAPI(imageUri);

    return {
      id: `gemini-${Date.now()}`,
      title: parsedData.itemName,
      description: parsedData.itemDescription,
      value: parsedData.estimatedValue,
      aiExplanation: parsedData.valuationRationale,
      imageUrl: displayImageUrl,
      apiProvider: ApiProvider.GEMINI,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error('Error during Gemini analysis:', error);
    if (error instanceof Error) {
      throw new Error(`Gemini API Error: ${error.message}`);
    }
    throw new Error('An unknown error occurred while analyzing with Gemini.');
  }
};
