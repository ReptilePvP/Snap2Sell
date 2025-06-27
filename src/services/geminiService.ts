import { AnalysisResult, ApiProvider } from '../types';
import { analyzeImageWithGeminiAPI } from './apiService';
import { formatAnalysisForDisplay } from './analysisUtils';

/**
 * Web-specific Gemini analysis service
 * Provides a standardized interface for Gemini AI analysis in the web app
 */
export const analyzeImageWithGemini = async (
  imageUrl: string
): Promise<AnalysisResult> => {
  try {
    const result = await analyzeImageWithGeminiAPI(imageUrl);

    // Ensure the result has the correct structure for web display
    return formatAnalysisForDisplay({
      ...result,
      apiProvider: ApiProvider.GEMINI,
    });
  } catch (error) {
    console.error('Error during Gemini analysis:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred while analyzing with Gemini.';
    throw new Error(`Gemini API Error: ${errorMessage}`);
  }
};
