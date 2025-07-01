/**
 * Utility to check OpenLens availability and manage provider configuration
 */

import { ApiProvider } from '../types';

/**
 * Check if OpenLens is available (either local development or production server)
 */
export async function isOpenLensAvailable(): Promise<boolean> {
  try {
    const openLensUrl = (import.meta as any).env?.VITE_OPENLENS_API_URL || 'http://127.0.0.1:8000';
    
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    try {
      // Try to ping the OpenLens server
      const response = await fetch(`${openLensUrl}/`, {
        method: 'GET',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch (fetchError) {
      clearTimeout(timeoutId);
      throw fetchError;
    }
  } catch (error) {
    console.log('OpenLens server not available:', error);
    return false;
  }
}

/**
 * Get available providers based on environment and server availability
 */
export async function getAvailableProviders(): Promise<ApiProvider[]> {
  const allProviders = [
    ApiProvider.GEMINI,
    ApiProvider.SERPAPI, 
    ApiProvider.SEARCHAPI,
  ];
  
  // TODO: OpenLens temporarily disabled - working on improvements
  // Check if OpenLens is available
  // const openLensAvailable = await isOpenLensAvailable();
  // if (openLensAvailable) {
  //   allProviders.push(ApiProvider.OPENLENS);
  // }
  
  return allProviders;
}

/**
 * Get OpenLens API URL for the current environment
 */
export function getOpenLensUrl(): string {
  return (import.meta as any).env?.VITE_OPENLENS_API_URL || 'http://127.0.0.1:8000';
}

/**
 * Check if we're in development mode
 */
export function isDevelopment(): boolean {
  return (import.meta as any).env?.MODE === 'development';
}

/**
 * Check if OpenLens URL is configured for production
 */
export function isOpenLensConfigured(): boolean {
  const url = (import.meta as any).env?.VITE_OPENLENS_API_URL;
  return !!url && !url.includes('localhost') && !url.includes('127.0.0.1');
}
