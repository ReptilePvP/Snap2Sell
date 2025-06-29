import { AnalysisResult, ApiProvider } from '../types';
import { analyzeImageWithGemini } from './geminiService';
import { analyzeImageWithSerp } from './serpApiService';
import { analyzeImageWithSearch } from './searchApiService';
import { analyzeImageWithOpenLens } from './openLensService';
import { getProviderDisplayName } from './analysisUtils';

/**
 * Unified analysis service for the web app
 * Provides a single interface for all analysis providers
 */
export class WebAnalysisService {
  /**
   * Analyze an image with the specified provider
   */
  static async analyzeImage(
    imageUrl: string,
    provider: ApiProvider
  ): Promise<AnalysisResult> {
    switch (provider) {
      case ApiProvider.GEMINI:
        return analyzeImageWithGemini(imageUrl);
      case ApiProvider.SERPAPI:
        return analyzeImageWithSerp(imageUrl);
      case ApiProvider.SEARCHAPI:
        return analyzeImageWithSearch(imageUrl);
      case ApiProvider.OPENLENS:
        return analyzeImageWithOpenLens(imageUrl);
      default:
        throw new Error(`Unsupported analysis provider: ${provider}`);
    }
  }

  /**
   * Get available providers
   */
  static getAvailableProviders(): ApiProvider[] {
    return [ApiProvider.GEMINI, ApiProvider.SERPAPI, ApiProvider.SEARCHAPI, ApiProvider.OPENLENS];
  }

  /**
   * Get provider display information
   */
  static getProviderInfo(provider: ApiProvider) {
    const displayName = getProviderDisplayName(provider);
    
    switch (provider) {
      case ApiProvider.GEMINI:
        return {
          name: displayName,
          description: 'Advanced AI analysis with detailed valuation and insights',
          icon: 'sparkles',
          color: 'blue',
          capabilities: ['Item identification', 'Detailed description', 'Value estimation', 'AI explanation'],
        };
      case ApiProvider.SERPAPI:
        return {
          name: displayName,
          description: 'Google Lens technology for comprehensive web search',
          icon: 'cloud',
          color: 'green',
          capabilities: ['Visual matching', 'Web search', 'Product listings', 'Price comparison'],
        };
      case ApiProvider.SEARCHAPI:
        return {
          name: displayName,
          description: 'Visual search for comparable listings and market data',
          icon: 'magnifying-glass',
          color: 'purple',
          capabilities: ['Visual search', 'Product matching', 'Market analysis', 'Price insights'],
        };
      case ApiProvider.OPENLENS:
        return {
          name: displayName,
          description: 'Google Lens + AI analysis with comprehensive web scraping',
          icon: 'eye',
          color: 'orange',
          capabilities: ['Google Lens search', 'Web content scraping', 'AI analysis', 'Comprehensive insights'],
        };
      default:
        return {
          name: displayName,
          description: 'AI-powered image analysis',
          icon: 'photo',
          color: 'gray',
          capabilities: ['Image analysis'],
        };
    }
  }

  /**
   * Validate if a provider is supported
   */
  static isProviderSupported(provider: string): provider is ApiProvider {
    return Object.values(ApiProvider).includes(provider as ApiProvider);
  }
}

// Export individual functions for direct use
export {
  analyzeImageWithGemini,
  analyzeImageWithSerp,
  analyzeImageWithSearch,
  analyzeImageWithOpenLens,
};
