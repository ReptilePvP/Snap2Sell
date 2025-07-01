import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  variant?: 'spinner' | 'dots' | 'pulse' | 'ring';
  color?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className = '', 
  variant = 'spinner',
  color = 'blue-600'
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  };

  if (variant === 'dots') {
    return (
      <div className={`flex space-x-1 ${className}`}>
        <div className={`${sizeClasses[size]} bg-${color} rounded-full animate-bounce`} style={{ animationDelay: '0ms' }}></div>
        <div className={`${sizeClasses[size]} bg-${color} rounded-full animate-bounce`} style={{ animationDelay: '150ms' }}></div>
        <div className={`${sizeClasses[size]} bg-${color} rounded-full animate-bounce`} style={{ animationDelay: '300ms' }}></div>
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className={`${sizeClasses[size]} bg-${color} rounded-full animate-pulse ${className}`}></div>
    );
  }

  if (variant === 'ring') {
    return (
      <div className={`relative ${sizeClasses[size]} ${className}`}>
        <div className={`absolute inset-0 rounded-full border-2 border-gray-200`}></div>
        <div className={`absolute inset-0 rounded-full border-2 border-transparent border-t-${color} animate-spin`}></div>
        <div className={`absolute inset-1 rounded-full border-2 border-transparent border-r-${color} animate-spin`} style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
      </div>
    );
  }

  // Default spinner variant
  return (
    <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-${color} ${sizeClasses[size]} ${className}`} />
  );
};

export default LoadingSpinner;