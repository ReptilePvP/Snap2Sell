import { AnalysisResult, ApiProvider } from '../types';

/**
 * Web-specific utilities for handling analysis results
 */

export const formatAnalysisForDisplay = (result: AnalysisResult): AnalysisResult => {
  return {
    ...result,
    timestamp: result.timestamp || Date.now(),
    id: result.id || `${result.apiProvider.toLowerCase()}-${Date.now()}`,
  };
};

export const getProviderDisplayName = (provider: ApiProvider): string => {
  switch (provider) {
    case ApiProvider.GEMINI:
      return 'Gemini AI';
    case ApiProvider.SERPAPI:
      return 'SerpAPI';
    case ApiProvider.SEARCHAPI:
      return 'SearchAPI';
    case ApiProvider.OPENLENS:
      return 'OpenLens';
    default:
      return provider;
  }
};

export const getProviderDescription = (provider: ApiProvider): string => {
  switch (provider) {
    case ApiProvider.GEMINI:
      return 'Advanced AI-powered analysis with detailed insights and valuation';
    case ApiProvider.SERPAPI:
      return 'Google Lens technology for finding similar items across the web';
    case ApiProvider.SEARCHAPI:
      return 'Visual search to gather comparable listings and market data';
    case ApiProvider.OPENLENS:
      return 'Google Lens + AI analysis with comprehensive web scraping and insights';
    default:
      return 'AI-powered image analysis';
  }
};

export const validateAnalysisResult = (result: any): result is AnalysisResult => {
  return (
    result &&
    typeof result === 'object' &&
    typeof result.title === 'string' &&
    typeof result.description === 'string' &&
    typeof result.apiProvider === 'string' &&
    Object.values(ApiProvider).includes(result.apiProvider)
  );
};

export const createErrorResult = (
  provider: ApiProvider,
  error: string
): AnalysisResult => {
  return {
    id: `error-${Date.now()}`,
    title: 'Analysis Failed',
    description: error,
    value: 'Unable to determine',
    aiExplanation: `An error occurred while analyzing with ${getProviderDisplayName(provider)}: ${error}`,
    apiProvider: provider,
    timestamp: Date.now(),
  };
};
