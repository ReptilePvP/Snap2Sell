import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  SparklesIcon, 
  CloudIcon, 
  MagnifyingGlassIcon,
  ChartBarIcon,
  EyeIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { getAvailableProviders, isOpenLensConfigured, isDevelopment } from '../utils/providerAvailability';
import { ApiProvider } from '../types';

const AnalysisSelectionPage: React.FC = () => {
  const [availableProviders, setAvailableProviders] = useState<ApiProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkProviders = async () => {
      try {
        const providers = await getAvailableProviders();
        setAvailableProviders(providers);
      } catch (error) {
        console.error('Error checking available providers:', error);
        // Fallback to basic providers if check fails
        setAvailableProviders([ApiProvider.GEMINI, ApiProvider.SERPAPI, ApiProvider.SEARCHAPI]);
      } finally {
        setIsLoading(false);
      }
    };

    checkProviders();
  }, []);

  const allAnalysisOptions = [
    {
      provider: ApiProvider.GEMINI,
      name: 'Gemini AI Analysis',
      description: 'Advanced AI-powered image analysis with detailed insights and valuation',
      icon: SparklesIcon,
      href: '/analyze/gemini',
      color: 'bg-purple-500',
      features: ['Item identification', 'Detailed description', 'Value estimation', 'AI explanation'],
    },
    {
      provider: ApiProvider.SERPAPI,
      name: 'SerpAPI Google Lens',
      description: 'Search engine powered visual analysis to find similar items',
      icon: CloudIcon,
      href: '/analyze/serpapi',
      color: 'bg-blue-500',
      features: ['Visual matches', 'Web search results', 'Product listings', 'Price comparisons'],
    },
    {
      provider: ApiProvider.SEARCHAPI,
      name: 'SearchAPI Google Lens',
      description: 'Alternative Google Lens provider for comprehensive visual search',
      icon: MagnifyingGlassIcon,
      href: '/analyze/searchapi',
      color: 'bg-green-500',
      features: ['Visual recognition', 'Similar products', 'Market pricing', 'Source links'],
    },
    {
      provider: ApiProvider.OPENLENS,
      name: 'OpenLens Analysis',
      description: 'Google Lens + AI analysis with comprehensive web scraping and insights',
      icon: EyeIcon,
      href: '/analyze/openlens',
      color: 'bg-orange-500',
      features: ['Google Lens search', 'Web content scraping', 'AI analysis', 'Comprehensive insights'],
    },
  ];

  // Filter options based on available providers
  const analysisOptions = allAnalysisOptions.filter(option => 
    availableProviders.includes(option.provider)
  );

  const openLensNotAvailable = !availableProviders.includes(ApiProvider.OPENLENS);
  const showOpenLensWarning = openLensNotAvailable && !isDevelopment() && !isOpenLensConfigured();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.3),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_40%,rgba(120,119,198,0.2),transparent_50%)]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <ChartBarIcon className="mx-auto h-12 w-12 text-blue-300 mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">
            Choose Analysis Type
          </h1>
          <p className="text-lg text-white/70">
            Select an AI provider to analyze your images and get detailed insights
          </p>
        </div>

      {/* Loading state */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Checking available providers...</p>
        </div>
      )}

      {/* OpenLens warning */}
      {!isLoading && showOpenLensWarning && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <ExclamationTriangleIcon className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">
                OpenLens Not Available
              </h3>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                OpenLens analysis is not available in production. Deploy the OpenLens server to Google Cloud Run to enable this feature.
              </p>
            </div>
          </div>
        </div>
      )}

      {!isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {analysisOptions.map((option) => (
            <Link
              key={option.name}
              to={option.href}
              className="group bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-lg transition-all"
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className={`${option.color} p-3 rounded-lg`}>
                  <option.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  {option.name}
                </h3>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {option.description}
              </p>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  Features:
                </h4>
                <ul className="space-y-1">
                  {option.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <span className="text-blue-600 dark:text-blue-400 text-sm font-medium group-hover:text-blue-700 dark:group-hover:text-blue-300">
                  Start Analysis →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-2">
          💡 Pro Tip
        </h3>
        <p className="text-blue-200">
          For the most comprehensive analysis, try different providers with the same image. 
          Each AI service has unique strengths and may provide different insights about your item.
        </p>
      </div>
      </div>
    </div>
  );
};

export default AnalysisSelectionPage;