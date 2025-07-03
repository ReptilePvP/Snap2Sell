import { useCallback, useRef, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export interface NavigationGestureConfig {
  swipeThreshold?: number;
  enableSwipeNavigation?: boolean;
  enableEdgeSwipe?: boolean;
  edgeThreshold?: number;
  animationDuration?: number;
}

export const useNavigationGestures = (config: NavigationGestureConfig = {}) => {
  const {
    swipeThreshold = 100,
    enableSwipeNavigation = true,
    enableEdgeSwipe = true,
    edgeThreshold = 20,
    animationDuration = 300
  } = config;

  const navigate = useNavigate();
  const location = useLocation();
  const [isNavigating, setIsNavigating] = useState(false);
  const [swipeProgress, setSwipeProgress] = useState(0);
  const startX = useRef<number | null>(null);
  const currentX = useRef<number | null>(null);
  const navigationHistory = useRef<string[]>([]);

  // Track navigation history
  const trackNavigation = useCallback((path: string) => {
    navigationHistory.current = [...navigationHistory.current, path].slice(-10); // Keep last 10
  }, []);

  // Check if we can go back
  const canGoBack = useCallback(() => {
    return navigationHistory.current.length > 1;
  }, []);

  // Handle swipe back navigation
  const handleSwipeBack = useCallback(async () => {
    if (!canGoBack() || isNavigating) return;

    setIsNavigating(true);
    
    try {
      // Add page transition animation
      document.body.style.transition = `transform ${animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
      document.body.style.transform = 'translateX(100%)';
      
      await new Promise(resolve => setTimeout(resolve, animationDuration / 2));
      
      navigate(-1);
      
      await new Promise(resolve => setTimeout(resolve, animationDuration / 2));
      
      document.body.style.transform = 'translateX(0)';
      await new Promise(resolve => setTimeout(resolve, animationDuration));
      
    } finally {
      document.body.style.transition = '';
      document.body.style.transform = '';
      setIsNavigating(false);
      setSwipeProgress(0);
    }
  }, [canGoBack, isNavigating, navigate, animationDuration]);

  // Touch event handlers for swipe navigation
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!enableSwipeNavigation) return;

    const touch = e.touches[0];
    startX.current = touch.clientX;
    currentX.current = touch.clientX;

    // Check if starting from edge (for edge swipe)
    if (enableEdgeSwipe && touch.clientX > edgeThreshold) {
      startX.current = null; // Cancel if not starting from edge
    }
  }, [enableSwipeNavigation, enableEdgeSwipe, edgeThreshold]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!enableSwipeNavigation || startX.current === null) return;

    const touch = e.touches[0];
    currentX.current = touch.clientX;
    const deltaX = touch.clientX - startX.current;

    // Only handle right swipe (back navigation)
    if (deltaX > 0) {
      const progress = Math.min(deltaX / swipeThreshold, 1);
      setSwipeProgress(progress);

      // Add visual feedback
      if (progress > 0.1) {
        e.preventDefault();
        document.body.style.transform = `translateX(${deltaX * 0.3}px)`;
        document.body.style.transition = 'none';
      }
    }
  }, [enableSwipeNavigation, swipeThreshold]);

  const handleTouchEnd = useCallback(() => {
    if (!enableSwipeNavigation || startX.current === null) return;

    const deltaX = (currentX.current || 0) - startX.current;
    const progress = deltaX / swipeThreshold;

    // Reset styles
    document.body.style.transform = '';
    document.body.style.transition = '';

    if (progress >= 0.5 && canGoBack()) {
      handleSwipeBack();
    } else {
      setSwipeProgress(0);
    }

    startX.current = null;
    currentX.current = null;
  }, [enableSwipeNavigation, swipeThreshold, canGoBack, handleSwipeBack]);

  // Enhanced navigation functions
  const navigateWithGesture = useCallback((to: string, options?: { replace?: boolean; state?: any }) => {
    if (isNavigating) return;

    const currentPath = location.pathname;
    trackNavigation(currentPath);

    if (options?.replace) {
      navigate(to, { replace: true, state: options.state });
    } else {
      navigate(to, { state: options?.state });
    }
  }, [navigate, location.pathname, trackNavigation, isNavigating]);

  const goBackWithGesture = useCallback(() => {
    if (canGoBack() && !isNavigating) {
      handleSwipeBack();
    }
  }, [canGoBack, isNavigating, handleSwipeBack]);

  // Navigation shortcuts for common patterns
  const navigationShortcuts = {
    home: () => navigateWithGesture('/'),
    camera: () => navigateWithGesture('/camera'),
    analyze: () => navigateWithGesture('/analyze'),
    history: () => navigateWithGesture('/history'),
    saved: () => navigateWithGesture('/saved'),
    profile: () => navigateWithGesture('/profile'),
    back: goBackWithGesture,
  };

  return {
    // Navigation functions
    navigate: navigateWithGesture,
    goBack: goBackWithGesture,
    shortcuts: navigationShortcuts,
    
    // State
    isNavigating,
    swipeProgress,
    canGoBack: canGoBack(),
    
    // Touch handlers
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    
    // History
    navigationHistory: navigationHistory.current,
    trackNavigation,
  };
};

// Hook for route transitions
export const useRouteTransitions = () => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState<'forward' | 'backward'>('forward');

  const startTransition = useCallback((direction: 'forward' | 'backward' = 'forward') => {
    setIsTransitioning(true);
    setTransitionDirection(direction);
  }, []);

  const endTransition = useCallback(() => {
    setIsTransitioning(false);
  }, []);

  return {
    isTransitioning,
    transitionDirection,
    startTransition,
    endTransition,
  };
};

// Hook for page visibility and focus management
export const usePageFocus = () => {
  const [isPageVisible, setIsPageVisible] = useState(!document.hidden);
  const [isPageFocused, setIsPageFocused] = useState(document.hasFocus());

  // Handle visibility change
  const handleVisibilityChange = useCallback(() => {
    setIsPageVisible(!document.hidden);
  }, []);

  // Handle focus change
  const handleFocusChange = useCallback(() => {
    setIsPageFocused(document.hasFocus());
  }, []);

  // Set up event listeners
  useEffect(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocusChange);
    window.addEventListener('blur', handleFocusChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocusChange);
      window.removeEventListener('blur', handleFocusChange);
    };
  }, [handleVisibilityChange, handleFocusChange]);

  return {
    isPageVisible,
    isPageFocused,
    isActive: isPageVisible && isPageFocused,
  };
};
