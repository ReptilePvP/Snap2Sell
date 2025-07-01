import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface LoadingOverlayProps {
  title: string;
  subtitle?: string;
  progress?: number;
  showProgress?: boolean;
  variant?: 'spinner' | 'dots' | 'pulse' | 'ring';
  className?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  title,
  subtitle,
  progress,
  showProgress = false,
  variant = 'ring',
  className = ''
}) => {
  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${className}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-sm mx-4 text-center shadow-2xl">
        <div className="mb-6">
          <LoadingSpinner size="xl" variant={variant} className="mx-auto" />
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {title}
        </h3>
        
        {subtitle && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {subtitle}
          </p>
        )}

        {showProgress && progress !== undefined && (
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${Math.min(progress, 100)}%` }}
            ></div>
          </div>
        )}

        <div className="flex items-center justify-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
          <div className="w-1 h-1 bg-blue-600 rounded-full animate-pulse"></div>
          <div className="w-1 h-1 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-1 h-1 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
