import { AnalysisResult, ApiProvider } from '../types';
import { analyzeImageWithSerpAPI } from './apiService';
import { formatAnalysisForDisplay } from './analysisUtils';

/**
 * Web-specific SerpAPI analysis service
 * Provides a standardized interface for SerpAPI analysis in the web app
 */
export const analyzeImageWithSerp = async (
  imageUrl: string
): Promise<AnalysisResult> => {
  try {
    const result = await analyzeImageWithSerpAPI(imageUrl);

    // Ensure the result has the correct structure for web display
    return formatAnalysisForDisplay({
      ...result,
      apiProvider: ApiProvider.SERPAPI,
    });
  } catch (error) {
    console.error('Error during SerpAPI analysis:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred while analyzing with SerpAPI.';
    throw new Error(`SerpAPI Error: ${errorMessage}`);
  }
};
