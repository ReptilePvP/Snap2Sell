import React, { forwardRef, useRef, useImperativeHandle } from 'react';
import { useTouchRipple, useHapticFeedback } from '../hooks/useMobileTouch';

export interface MobileButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  hapticFeedback?: 'light' | 'medium' | 'strong' | 'none';
  rippleEffect?: boolean;
  touchFeedback?: boolean;
}

const MobileButton = forwardRef<HTMLButtonElement, MobileButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      loading = false,
      leftIcon,
      rightIcon,
      hapticFeedback = 'light',
      rippleEffect = true,
      touchFeedback = true,
      children,
      className = '',
      onTouchStart,
      onMouseDown,
      onClick,
      disabled,
      ...props
    },
    ref
  ) => {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const { ripples, addRipple } = useTouchRipple();
    const { lightTap, mediumTap, strongTap } = useHapticFeedback();

    useImperativeHandle(ref, () => buttonRef.current!);

    const getVariantClasses = () => {
      switch (variant) {
        case 'primary':
          return 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-sm';
        case 'secondary':
          return 'bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 dark:active:bg-gray-500 dark:text-white';
        case 'outline':
          return 'border-2 border-gray-300 hover:border-gray-400 active:border-gray-500 text-gray-700 dark:border-gray-600 dark:hover:border-gray-500 dark:text-gray-300 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800';
        case 'ghost':
          return 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700';
        case 'danger':
          return 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white shadow-sm';
        default:
          return '';
      }
    };

    const getSizeClasses = () => {
      switch (size) {
        case 'sm':
          return 'min-h-[40px] px-4 py-2 text-sm';
        case 'md':
          return 'min-h-[48px] px-6 py-3 text-base';
        case 'lg':
          return 'min-h-[56px] px-8 py-4 text-lg';
        case 'xl':
          return 'min-h-[64px] px-10 py-5 text-xl';
        default:
          return '';
      }
    };

    const handleTouch = (event: React.TouchEvent<HTMLButtonElement>) => {
      if (disabled || loading) return;

      if (rippleEffect) {
        addRipple(event);
      }

      if (hapticFeedback !== 'none') {
        switch (hapticFeedback) {
          case 'light':
            lightTap();
            break;
          case 'medium':
            mediumTap();
            break;
          case 'strong':
            strongTap();
            break;
        }
      }

      onTouchStart?.(event);
    };

    const handleMouseDown = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || loading) return;

      if (rippleEffect) {
        addRipple(event);
      }

      onMouseDown?.(event);
    };

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || loading) return;
      onClick?.(event);
    };

    const baseClasses = [
      'relative',
      'inline-flex',
      'items-center',
      'justify-center',
      'font-semibold',
      'rounded-xl',
      'overflow-hidden',
      'transition-all',
      'duration-200',
      'ease-out',
      'focus:outline-none',
      'focus-visible:ring-2',
      'focus-visible:ring-blue-500',
      'focus-visible:ring-offset-2',
      'disabled:opacity-60',
      'disabled:cursor-not-allowed',
      'disabled:transform-none',
      touchFeedback && !disabled && !loading && 'active:scale-95',
      touchFeedback && !disabled && !loading && 'transform-gpu',
      fullWidth && 'w-full',
    ]
      .filter(Boolean)
      .join(' ');

    const variantClasses = getVariantClasses();
    const sizeClasses = getSizeClasses();

    return (
      <button
        ref={buttonRef}
        className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
        onTouchStart={handleTouch}
        onMouseDown={handleMouseDown}
        onClick={handleClick}
        disabled={disabled || loading}
        {...props}
      >
        {/* Ripple effect */}
        {rippleEffect && (
          <div className="absolute inset-0 overflow-hidden">
            {ripples.map((ripple) => (
              <div
                key={ripple.id}
                className="absolute pointer-events-none animate-ping"
                style={{
                  left: ripple.x - 10,
                  top: ripple.y - 10,
                  width: 20,
                  height: 20,
                }}
              >
                <div className="w-full h-full bg-white/30 rounded-full animate-pulse" />
              </div>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="relative flex items-center justify-center space-x-2">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          
          <div className={`flex items-center space-x-2 ${loading ? 'invisible' : ''}`}>
            {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
            {children && <span>{children}</span>}
            {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
          </div>
        </div>
      </button>
    );
  }
);

MobileButton.displayName = 'MobileButton';

export default MobileButton;
