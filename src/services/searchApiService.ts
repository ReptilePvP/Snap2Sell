import { AnalysisResult, ApiProvider } from '../types';
import { analyzeImageWithSearchAPI } from './apiService';
import { formatAnalysisForDisplay } from './analysisUtils';

/**
 * Web-specific SearchAPI analysis service
 * Provides a standardized interface for SearchAPI analysis in the web app
 */
export const analyzeImageWithSearch = async (
  imageUrl: string
): Promise<AnalysisResult> => {
  try {
    const result = await analyzeImageWithSearchAPI(imageUrl);

    // Ensure the result has the correct structure for web display
    return formatAnalysisForDisplay({
      ...result,
      apiProvider: ApiProvider.SEARCHAPI,
    });
  } catch (error) {
    console.error('Error during SearchAPI analysis:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred while analyzing with SearchAPI.';
    throw new Error(`SearchAPI Error: ${errorMessage}`);
  }
};
