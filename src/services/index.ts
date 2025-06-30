// Web App Analysis Services
// Centralized exports for all analysis providers

// Base API functions (low-level Supabase function calls)
export {
  uploadImageDirectly,
  analyzeImageWithGeminiAPI,
  analyzeImageWithSerpAPI,
  analyzeImageWithSearchAPI,
  analyzeImageWithOpenLensAPI,
} from './apiService';

// High-level analysis services (web-specific wrappers)
export { analyzeImageWithGemini } from './geminiService';
export { analyzeImageWithSerp } from './serpApiService';
export { analyzeImageWithSearch } from './searchApiService';
// Note: OpenLens now uses the unified API service (analyzeImageWithOpenLensAPI)

// Unified analysis service
export { WebAnalysisService } from './webAnalysisService';

// Analysis utilities
export * from './analysisUtils';

// Supabase client
export { supabase } from './supabaseClient';

// Scan service for database operations
export { scanService } from './scanService';
