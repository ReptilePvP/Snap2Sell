import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { usePullToRefresh } from '../hooks/useMobileTouch';

export interface PullToRefreshProps {
  onRefresh: () => void | Promise<void>;
  threshold?: number;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
  refreshingText?: string;
  pullText?: string;
  releaseText?: string;
}

export interface PullToRefreshRef {
  triggerRefresh: () => void;
}

const PullToRefresh = forwardRef<PullToRefreshRef, PullToRefreshProps>(
  (
    {
      onRefresh,
      threshold = 80,
      disabled = false,
      children,
      className = '',
      refreshingText = 'Refreshing...',
      pullText = 'Pull to refresh',
      releaseText = 'Release to refresh',
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    
    const {
      isPulling,
      pullDistance,
      isRefreshing,
      pullProgress
    } = usePullToRefresh(containerRef, onRefresh, threshold);

    useImperativeHandle(ref, () => ({
      triggerRefresh: onRefresh
    }));

    const getIndicatorText = () => {
      if (isRefreshing) return refreshingText;
      if (pullProgress >= 1) return releaseText;
      return pullText;
    };

    const getIndicatorOpacity = () => {
      if (disabled) return 0;
      return Math.min(pullProgress, 1);
    };

    const getSpinnerRotation = () => {
      if (isRefreshing) return 'animate-spin';
      return `rotate-${Math.floor(pullProgress * 360)}`;
    };

    return (
      <div
        ref={containerRef}
        className={`relative overflow-hidden ${className}`}
        style={{
          touchAction: disabled ? 'auto' : 'pan-x pan-down pinch-zoom'
        }}
      >
        {/* Pull to refresh indicator */}
        <div
          className="absolute top-0 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-200 ease-out"
          style={{
            transform: `translateX(-50%) translateY(${Math.min(pullDistance - threshold, 0)}px)`,
            opacity: getIndicatorOpacity(),
          }}
        >
          <div className="flex flex-col items-center justify-center bg-white dark:bg-gray-800 rounded-full shadow-lg px-4 py-3 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <ArrowPathIcon 
                className={`h-5 w-5 text-blue-600 dark:text-blue-400 transition-transform duration-200 ${getSpinnerRotation()}`}
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {getIndicatorText()}
              </span>
            </div>
            
            {/* Progress bar */}
            <div className="w-12 h-1 bg-gray-200 dark:bg-gray-600 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-blue-600 dark:bg-blue-400 rounded-full transition-all duration-200"
                style={{
                  width: `${Math.min(pullProgress * 100, 100)}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div
          className="relative transition-transform duration-200 ease-out"
          style={{
            transform: isPulling ? `translateY(${Math.min(pullDistance * 0.5, threshold * 0.5)}px)` : 'translateY(0)',
          }}
        >
          {children}
        </div>

        {/* Loading overlay */}
        {isRefreshing && (
          <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm z-40 pointer-events-none" />
        )}
      </div>
    );
  }
);

PullToRefresh.displayName = 'PullToRefresh';

export default PullToRefresh;
