import React, { forwardRef } from 'react';
import { useTouchRipple } from '../hooks/useMobileTouch';

export interface MobileCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  interactive?: boolean;
  pressable?: boolean;
  rippleEffect?: boolean;
  radius?: 'sm' | 'md' | 'lg' | 'xl';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
}

const MobileCard = forwardRef<HTMLDivElement, MobileCardProps>(
  (
    {
      variant = 'default',
      interactive = false,
      pressable = false,
      rippleEffect = false,
      radius = 'lg',
      padding = 'md',
      children,
      className = '',
      onTouchStart,
      onMouseDown,
      onClick,
      ...props
    },
    ref
  ) => {
    const { ripples, addRipple } = useTouchRipple();

    const getVariantClasses = () => {
      switch (variant) {
        case 'elevated':
          return 'bg-white dark:bg-gray-800 shadow-lg dark:shadow-gray-900/20';
        case 'outlined':
          return 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm';
        case 'filled':
          return 'bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700';
        default:
          return 'bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700';
      }
    };

    const getRadiusClasses = () => {
      switch (radius) {
        case 'sm':
          return 'rounded-lg';
        case 'md':
          return 'rounded-xl';
        case 'lg':
          return 'rounded-2xl';
        case 'xl':
          return 'rounded-3xl';
        default:
          return 'rounded-xl';
      }
    };

    const getPaddingClasses = () => {
      switch (padding) {
        case 'none':
          return '';
        case 'sm':
          return 'p-3';
        case 'md':
          return 'p-4';
        case 'lg':
          return 'p-6';
        case 'xl':
          return 'p-8';
        default:
          return 'p-4';
      }
    };

    const handleTouch = (event: React.TouchEvent<HTMLDivElement>) => {
      if (rippleEffect && (interactive || pressable)) {
        addRipple(event);
      }
      onTouchStart?.(event);
    };

    const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
      if (rippleEffect && (interactive || pressable)) {
        addRipple(event);
      }
      onMouseDown?.(event);
    };

    const baseClasses = [
      'relative',
      'overflow-hidden',
      'transition-all',
      'duration-200',
      'ease-out',
      interactive && 'cursor-pointer',
      pressable && 'active:scale-[0.98]',
      (interactive || pressable) && 'hover:shadow-md',
      (interactive || pressable) && 'transform-gpu',
    ]
      .filter(Boolean)
      .join(' ');

    const variantClasses = getVariantClasses();
    const radiusClasses = getRadiusClasses();
    const paddingClasses = getPaddingClasses();

    const Component = interactive || pressable || onClick ? 'div' : 'div';

    return (
      <Component
        ref={ref}
        className={`${baseClasses} ${variantClasses} ${radiusClasses} ${paddingClasses} ${className}`}
        onTouchStart={handleTouch}
        onMouseDown={handleMouseDown}
        onClick={onClick}
        role={interactive || pressable ? 'button' : undefined}
        tabIndex={interactive || pressable ? 0 : undefined}
        {...props}
      >
        {/* Ripple effect */}
        {rippleEffect && (interactive || pressable) && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {ripples.map((ripple) => (
              <div
                key={ripple.id}
                className="absolute animate-ping"
                style={{
                  left: ripple.x - 20,
                  top: ripple.y - 20,
                  width: 40,
                  height: 40,
                }}
              >
                <div className="w-full h-full bg-gray-400/20 dark:bg-gray-600/20 rounded-full" />
              </div>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </Component>
    );
  }
);

MobileCard.displayName = 'MobileCard';

export default MobileCard;

// Predefined card components for common use cases
export const ActionCard = forwardRef<HTMLDivElement, Omit<MobileCardProps, 'interactive' | 'pressable' | 'rippleEffect'>>((props, ref) => (
  <MobileCard
    ref={ref}
    interactive
    pressable
    rippleEffect
    {...props}
  />
));

ActionCard.displayName = 'ActionCard';

export const ElevatedCard = forwardRef<HTMLDivElement, Omit<MobileCardProps, 'variant'>>((props, ref) => (
  <MobileCard
    ref={ref}
    variant="elevated"
    {...props}
  />
));

ElevatedCard.displayName = 'ElevatedCard';

export const OutlinedCard = forwardRef<HTMLDivElement, Omit<MobileCardProps, 'variant'>>((props, ref) => (
  <MobileCard
    ref={ref}
    variant="outlined"
    {...props}
  />
));

OutlinedCard.displayName = 'OutlinedCard';
