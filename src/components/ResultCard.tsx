import React from 'react';
import { 
  TagIcon, 
  DocumentTextIcon, 
  CurrencyDollarIcon, 
  LightBulbIcon,
  PhotoIcon,
  ChevronRightIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';
import { AnalysisResult, VisualMatch } from '../types';
import ReactMarkdown from 'react-markdown';

interface ResultCardProps {
  result: AnalysisResult;
  className?: string;
}

const ResultCard: React.FC<ResultCardProps> = ({ result, className = '' }) => {
  const openLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden ${className}`}>
      {/* Image */}
      {result.imageUrl && (
        <div className="aspect-video w-full overflow-hidden">
          <img 
            src={result.imageUrl} 
            alt={result.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start space-x-3 mb-6">
          <TagIcon className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {result.title}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Analyzed by {result.apiProvider} • {new Date(result.timestamp).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-3">
            <DocumentTextIcon className="h-5 w-5 text-gray-500" />
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </h3>
          </div>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown>{result.description}</ReactMarkdown>
          </div>
        </div>

        {/* Estimated Value */}
        <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <CurrencyDollarIcon className="h-5 w-5 text-blue-600" />
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-300">
              Estimated Value
            </h3>
          </div>
          <p className="text-lg font-bold text-blue-900 dark:text-blue-300">
            {result.value}
          </p>
        </div>

        {/* AI Explanation */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-3">
            <LightBulbIcon className="h-5 w-5 text-gray-500" />
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              AI Analysis
            </h3>
          </div>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown>{result.aiExplanation}</ReactMarkdown>
          </div>
        </div>

        {/* Visual Matches */}
        {result.visualMatches && result.visualMatches.length > 0 && (
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <PhotoIcon className="h-5 w-5 text-gray-500" />
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Visual Matches ({result.visualMatches.length})
              </h3>
            </div>
            <div className="space-y-3">
              {result.visualMatches.slice(0, 5).map((match, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                  onClick={() => openLink(match.link)}
                >
                  {match.thumbnail && (
                    <img 
                      src={match.thumbnail} 
                      alt={match.title}
                      className="w-12 h-12 object-cover rounded"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {match.title}
                    </p>
                    {match.source && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {match.source}
                      </p>
                    )}
                    {match.price && (
                      <p className="text-sm font-medium text-green-600 dark:text-green-400">
                        {match.price}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {match.source_icon && (
                      <img 
                        src={match.source_icon} 
                        alt="Source"
                        className="w-4 h-4"
                      />
                    )}
                    <ArrowTopRightOnSquareIcon className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultCard;