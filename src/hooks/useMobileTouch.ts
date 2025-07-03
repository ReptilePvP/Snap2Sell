import { useCallback, useRef, useState, useEffect } from 'react';

export interface TouchGestureConfig {
  swipeThreshold?: number;
  tapTimeout?: number;
  longPressTimeout?: number;
  pinchThreshold?: number;
}

export interface TouchGestureHandlers {
  onTap?: (e: TouchEvent) => void;
  onLongPress?: (e: TouchEvent) => void;
  onSwipeLeft?: (e: TouchEvent) => void;
  onSwipeRight?: (e: TouchEvent) => void;
  onSwipeUp?: (e: TouchEvent) => void;
  onSwipeDown?: (e: TouchEvent) => void;
  onPinch?: (scale: number, e: TouchEvent) => void;
  onPinchStart?: (e: TouchEvent) => void;
  onPinchEnd?: (e: TouchEvent) => void;
}

export const useMobileTouch = (
  elementRef: React.RefObject<HTMLElement>,
  handlers: TouchGestureHandlers = {},
  config: TouchGestureConfig = {}
) => {
  const {
    swipeThreshold = 50,
    tapTimeout = 300,
    longPressTimeout = 500,
    pinchThreshold = 10
  } = config;

  const [isPressed, setIsPressed] = useState(false);
  const [startTouch, setStartTouch] = useState<{ x: number; y: number; time: number } | null>(null);
  const [initialDistance, setInitialDistance] = useState<number | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const tapTimer = useRef<NodeJS.Timeout | null>(null);

  const clearTimers = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    if (tapTimer.current) {
      clearTimeout(tapTimer.current);
      tapTimer.current = null;
    }
  }, []);

  const getDistance = useCallback((touch1: Touch, touch2: Touch) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    e.preventDefault();
    
    const touch = e.touches[0];
    const now = Date.now();
    
    setIsPressed(true);
    setStartTouch({ x: touch.clientX, y: touch.clientY, time: now });

    if (e.touches.length === 2) {
      // Pinch gesture start
      const distance = getDistance(e.touches[0], e.touches[1]);
      setInitialDistance(distance);
      handlers.onPinchStart?.(e);
      clearTimers();
    } else {
      // Single touch - start long press timer
      longPressTimer.current = setTimeout(() => {
        handlers.onLongPress?.(e);
        clearTimers();
      }, longPressTimeout);
    }
  }, [handlers, longPressTimeout, getDistance, clearTimers]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!startTouch) return;

    if (e.touches.length === 2 && initialDistance !== null) {
      // Handle pinch gesture
      const currentDistance = getDistance(e.touches[0], e.touches[1]);
      const scale = currentDistance / initialDistance;
      
      if (Math.abs(scale - 1) > pinchThreshold / 100) {
        handlers.onPinch?.(scale, e);
      }
    } else if (e.touches.length === 1) {
      // Handle swipe detection
      const touch = e.touches[0];
      const deltaX = touch.clientX - startTouch.x;
      const deltaY = touch.clientY - startTouch.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      // Clear long press if moving too much
      if (distance > 10) {
        clearTimers();
      }
    }
  }, [startTouch, initialDistance, getDistance, pinchThreshold, handlers, clearTimers]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!startTouch) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - startTouch.x;
    const deltaY = touch.clientY - startTouch.y;
    const deltaTime = Date.now() - startTouch.time;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    setIsPressed(false);
    clearTimers();

    if (e.touches.length === 0) {
      setInitialDistance(null);
      handlers.onPinchEnd?.(e);
    }

    // Determine gesture type
    if (distance < 10 && deltaTime < tapTimeout) {
      // Tap gesture
      handlers.onTap?.(e);
    } else if (distance > swipeThreshold) {
      // Swipe gesture
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);
      
      if (absX > absY) {
        // Horizontal swipe
        if (deltaX > 0) {
          handlers.onSwipeRight?.(e);
        } else {
          handlers.onSwipeLeft?.(e);
        }
      } else {
        // Vertical swipe
        if (deltaY > 0) {
          handlers.onSwipeDown?.(e);
        } else {
          handlers.onSwipeUp?.(e);
        }
      }
    }

    setStartTouch(null);
  }, [startTouch, swipeThreshold, tapTimeout, handlers, clearTimers]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Add passive: false to prevent default behaviors
    const options = { passive: false };

    element.addEventListener('touchstart', handleTouchStart, options);
    element.addEventListener('touchmove', handleTouchMove, options);
    element.addEventListener('touchend', handleTouchEnd, options);
    element.addEventListener('touchcancel', handleTouchEnd, options);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchcancel', handleTouchEnd);
      clearTimers();
    };
  }, [elementRef, handleTouchStart, handleTouchMove, handleTouchEnd, clearTimers]);

  return {
    isPressed,
    clearTimers
  };
};

// Hook for pull-to-refresh functionality
export const usePullToRefresh = (
  elementRef: React.RefObject<HTMLElement>,
  onRefresh: () => void | Promise<void>,
  threshold = 100
) => {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef<number | null>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY;
    }
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (startY.current === null || window.scrollY > 0) return;

    const currentY = e.touches[0].clientY;
    const deltaY = currentY - startY.current;

    if (deltaY > 0) {
      e.preventDefault();
      setIsPulling(true);
      setPullDistance(Math.min(deltaY, threshold * 1.5));
    }
  }, [threshold]);

  const handleTouchEnd = useCallback(async () => {
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    
    setIsPulling(false);
    setPullDistance(0);
    startY.current = null;
  }, [pullDistance, threshold, isRefreshing, onRefresh]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const options = { passive: false };

    element.addEventListener('touchstart', handleTouchStart, options);
    element.addEventListener('touchmove', handleTouchMove, options);
    element.addEventListener('touchend', handleTouchEnd, options);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [elementRef, handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    isPulling,
    pullDistance,
    isRefreshing,
    pullProgress: Math.min(pullDistance / threshold, 1)
  };
};

// Hook for haptic feedback
export const useHapticFeedback = () => {
  const vibrate = useCallback((pattern: number | number[] = 10) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }, []);

  const lightTap = useCallback(() => vibrate(10), [vibrate]);
  const mediumTap = useCallback(() => vibrate(20), [vibrate]);
  const strongTap = useCallback(() => vibrate(50), [vibrate]);
  const doubleTap = useCallback(() => vibrate([10, 10, 10]), [vibrate]);
  const errorFeedback = useCallback(() => vibrate([100, 50, 100]), [vibrate]);
  const successFeedback = useCallback(() => vibrate([50, 25, 50, 25, 50]), [vibrate]);

  return {
    vibrate,
    lightTap,
    mediumTap,
    strongTap,
    doubleTap,
    errorFeedback,
    successFeedback
  };
};

// Hook for touch ripple effect
export const useTouchRipple = () => {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);

  const addRipple = useCallback((event: React.TouchEvent | React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const id = Date.now();

    setRipples(prev => [...prev, { x, y, id }]);

    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== id));
    }, 600);
  }, []);

  const clearRipples = useCallback(() => {
    setRipples([]);
  }, []);

  return {
    ripples,
    addRipple,
    clearRipples
  };
};
