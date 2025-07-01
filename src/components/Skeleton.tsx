import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular' | 'rounded';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rectangular',
  width,
  height,
  lines = 1
}) => {
  const baseClasses = 'animate-pulse bg-gray-200 dark:bg-gray-700';
  
  const getVariantClasses = () => {
    switch (variant) {
      case 'text':
        return 'h-4 rounded';
      case 'circular':
        return 'rounded-full';
      case 'rounded':
        return 'rounded-lg';
      default:
        return 'rounded';
    }
  };

  const getStyleProps = () => {
    const style: React.CSSProperties = {};
    if (width) style.width = typeof width === 'number' ? `${width}px` : width;
    if (height) style.height = typeof height === 'number' ? `${height}px` : height;
    return style;
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className={className}>
        {Array.from({ length: lines }, (_, index) => (
          <div
            key={index}
            className={`${baseClasses} ${getVariantClasses()} ${
              index === lines - 1 ? 'w-3/4' : 'w-full'
            } ${index > 0 ? 'mt-2' : ''}`}
            style={getStyleProps()}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${baseClasses} ${getVariantClasses()} ${className}`}
      style={getStyleProps()}
    />
  );
};

// Predefined skeleton components for common use cases
export const CardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
    <div className="flex items-start space-x-4">
      <Skeleton variant="rectangular" width={80} height={80} className="flex-shrink-0" />
      <div className="flex-1 space-y-3">
        <Skeleton variant="text" width="60%" height={20} />
        <Skeleton variant="text" lines={2} />
        <div className="flex justify-between items-center">
          <Skeleton variant="text" width="30%" height={16} />
          <Skeleton variant="text" width="20%" height={16} />
        </div>
      </div>
    </div>
  </div>
);

export const ImageSkeleton: React.FC<{ className?: string; aspectRatio?: string }> = ({ 
  className = '', 
  aspectRatio = 'aspect-video' 
}) => (
  <div className={`${aspectRatio} bg-gray-200 dark:bg-gray-700 rounded-lg ${className} relative overflow-hidden`}>
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-shimmer"></div>
  </div>
);

export const ListSkeleton: React.FC<{ items?: number; className?: string }> = ({ 
  items = 3, 
  className = '' 
}) => (
  <div className={`space-y-4 ${className}`}>
    {Array.from({ length: items }, (_, index) => (
      <CardSkeleton key={index} />
    ))}
  </div>
);

export const StatsSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${className}`}>
    {Array.from({ length: 3 }, (_, index) => (
      <div key={index} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton variant="text" width="40%" height={16} />
            <Skeleton variant="text" width="60%" height={24} />
          </div>
          <Skeleton variant="circular" width={40} height={40} />
        </div>
      </div>
    ))}
  </div>
);

export default Skeleton;
