import React from 'react';
import { Link } from 'react-router-dom';
import { 
  SparklesIcon, 
  CloudIcon, 
  MagnifyingGlassIcon,
  ChartBarIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

const AnalysisSelectionPage: React.FC = () => {
  const analysisOptions = [
    {
      name: 'Gemini AI Analysis',
      description: 'Advanced AI-powered image analysis with detailed insights and valuation',
      icon: SparklesIcon,
      href: '/analyze/gemini',
      color: 'bg-purple-500',
      features: ['Item identification', 'Detailed description', 'Value estimation', 'AI explanation'],
    },
    {
      name: 'SerpAPI Google Lens',
      description: 'Search engine powered visual analysis to find similar items',
      icon: CloudIcon,
      href: '/analyze/serpapi',
      color: 'bg-blue-500',
      features: ['Visual matches', 'Web search results', 'Product listings', 'Price comparisons'],
    },
    {
      name: 'SearchAPI Google Lens',
      description: 'Alternative Google Lens provider for comprehensive visual search',
      icon: MagnifyingGlassIcon,
      href: '/analyze/searchapi',
      color: 'bg-green-500',
      features: ['Visual recognition', 'Similar products', 'Market pricing', 'Source links'],
    },
    {
      name: 'OpenLens Analysis',
      description: 'Google Lens + AI analysis with comprehensive web scraping and insights',
      icon: EyeIcon,
      href: '/analyze/openlens',
      color: 'bg-orange-500',
      features: ['Google Lens search', 'Web content scraping', 'AI analysis', 'Comprehensive insights'],
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center">
        <ChartBarIcon className="mx-auto h-12 w-12 text-blue-600 mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Choose Analysis Type
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Select an AI provider to analyze your images and get detailed insights
        </p>
      </div>

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

      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-2">
          💡 Pro Tip
        </h3>
        <p className="text-blue-800 dark:text-blue-200">
          For the most comprehensive analysis, try different providers with the same image. 
          Each AI service has unique strengths and may provide different insights about your item.
        </p>
      </div>
    </div>
  );
};

export default AnalysisSelectionPage;