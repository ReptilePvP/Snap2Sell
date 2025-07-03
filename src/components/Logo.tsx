import React from 'react';

interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'white' | 'glass';
  className?: string;
  showText?: boolean;
  textSize?: 'sm' | 'md' | 'lg' | 'xl';
}

const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  variant = 'default',
  className = '',
  showText = true,
  textSize = 'lg'
}) => {
  const sizeClasses = {
    xs: 'h-4 w-4',
    sm: 'h-6 w-6', 
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-20 w-20'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-xl', 
    xl: 'text-2xl'
  };

  const getLogoStyles = () => {
    switch (variant) {
      case 'white':
        return {
          filter: 'brightness(0) invert(1)'
        };
      case 'glass':
        return {};
      default:
        return {};
    }
  };

  const getContainerClasses = () => {
    if (variant === 'glass') {
      return `${sizeClasses.xl} rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 flex items-center justify-center animate-float`;
    }
    return '';
  };

  const getImageClasses = () => {
    if (variant === 'glass') {
      return sizeClasses.lg; // Smaller image inside glass container
    }
    return sizeClasses[size];
  };

  if (variant === 'glass') {
    return (
      <div className="flex items-center space-x-2">
        <div className={`relative ${className}`}>
          <div className={getContainerClasses()}>
            <img 
              src="/logo-full-removebg.png" 
              alt="Snapalyze" 
              className={getImageClasses()}
              style={{
                filter: 'brightness(0) invert(1)',
              }}
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl blur-xl opacity-30 animate-pulse"></div>
        </div>
        {showText && (
          <span className={`${textSizeClasses[textSize]} font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent`}>
            Snapalyze
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <img 
        src="/logo-full-removebg.png" 
        alt="Snapalyze Logo" 
        className={sizeClasses[size]}
        style={getLogoStyles()}
      />
      {showText && (
        <span className={`${textSizeClasses[textSize]} font-bold text-gray-900 dark:text-white`}>
          Snapalyze
        </span>
      )}
    </div>
  );
};

export default Logo;
