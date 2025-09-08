import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useLoading } from '@/contexts/LoadingContext';

export const RouteChangeLoader = () => {
  const location = useLocation();
  const { startLoading, finishLoading } = useLoading();
  const previousLocation = useRef(location.pathname);
  const loadingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Only trigger loading if the route actually changed
    if (previousLocation.current !== location.pathname) {
      // Clear any existing timeout
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }

      // Start loading animation
      startLoading();

      // Simulate loading time based on route complexity
      const loadingDuration = getLoadingDuration(location.pathname);
      
      loadingTimeoutRef.current = setTimeout(() => {
        finishLoading();
      }, loadingDuration);

      // Update previous location
      previousLocation.current = location.pathname;
    }

    // Cleanup timeout on unmount
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [location.pathname, startLoading, finishLoading]);

  return null; // This component doesn't render anything
};

// Helper function to determine loading duration based on route
const getLoadingDuration = (pathname: string): number => {
  // Different routes might have different loading times
  const routeLoadingTimes: { [key: string]: number } = {
    '/': 800,              // Dashboard - moderate loading
    '/analytics': 1200,    // Analytics - longer loading (charts, data)
    '/products': 1000,     // Products - moderate loading
    '/orders': 1000,       // Orders - moderate loading
    '/customers': 900,     // Customers - quick loading
    '/providers': 900,     // Providers - quick loading
    '/settings': 600,      // Settings - quick loading
    '/languages': 500,     // Languages - very quick
    '/categories': 700,    // Categories - quick loading
  };

  // Check for dynamic routes
  if (pathname.includes('/products/')) {
    return 1100; // Product details/edit
  }
  if (pathname.includes('/providers/')) {
    return 1000; // Provider details/edit
  }
  if (pathname.includes('/posts/')) {
    return 900; // Post details/edit
  }

  // Return specific duration or default
  return routeLoadingTimes[pathname] || 800;
};
