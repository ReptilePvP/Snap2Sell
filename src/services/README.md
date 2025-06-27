# Web App Analysis Services

This directory contains all the analysis services for the Snap2Cash web application. These services provide a clean interface for interacting with various AI analysis providers while maintaining separation from the mobile app implementation.

## Architecture

The web app uses a layered approach:

```
┌─────────────────────────────────────────┐
│           Web UI Components             │
│        (Analysis Pages/Forms)           │
├─────────────────────────────────────────┤
│         High-Level Services             │
│   (geminiService, serpApiService,       │
│    searchApiService, webAnalysisService)│
├─────────────────────────────────────────┤
│          Base API Layer                 │
│        (apiService.ts)                  │
├─────────────────────────────────────────┤
│       Supabase Functions               │
│  (analyze-geminiapi, analyze-serpapi,   │
│   analyze-searchapi)                    │
└─────────────────────────────────────────┘
```

## Services Overview

### Core API Service (`apiService.ts`)
- Low-level functions that directly call Supabase Edge Functions
- Handles image upload to Supabase Storage
- Raw API communication with minimal transformation

### Provider-Specific Services
- **`geminiService.ts`**: Web-optimized Gemini AI analysis
- **`serpApiService.ts`**: Web-optimized SerpAPI analysis  
- **`searchApiService.ts`**: Web-optimized SearchAPI analysis

Each provider service:
- Wraps the core API functions
- Adds web-specific error handling
- Ensures consistent result formatting
- Provides typed interfaces

### Unified Analysis Service (`webAnalysisService.ts`)
- Single entry point for all analysis providers
- Provider metadata and capabilities
- Unified error handling
- Provider validation

### Utilities (`analysisUtils.ts`)
- Result formatting and validation
- Provider display names and descriptions
- Error result creation
- Common helper functions

## Usage Examples

### Basic Analysis
```typescript
import { analyzeImageWithGemini } from '../services/geminiService';

const result = await analyzeImageWithGemini(imageUrl);
```

### Unified Analysis
```typescript
import { WebAnalysisService } from '../services/webAnalysisService';

const result = await WebAnalysisService.analyzeImage(imageUrl, ApiProvider.GEMINI);
```

### Provider Information
```typescript
import { WebAnalysisService } from '../services/webAnalysisService';

const info = WebAnalysisService.getProviderInfo(ApiProvider.GEMINI);
// Returns: { name, description, icon, color, capabilities }
```

## Backend Integration

All analysis services use the same Supabase Edge Functions as the mobile app:

- **`analyze-geminiapi`**: Google Gemini AI analysis
- **`analyze-serpapi`**: SerpAPI Google Lens analysis  
- **`analyze-searchapi`**: SearchAPI Google Lens analysis

This ensures:
- Consistent API responses across platforms
- Shared backend infrastructure
- Unified error handling
- Same analysis capabilities

## Key Features

### ✅ Platform Separation
- Web and mobile services are completely separate
- No shared code that could cause conflicts
- Platform-specific optimizations

### ✅ Consistent Interface
- All providers implement the same `AnalysisResult` interface
- Unified error handling across providers
- Standardized response formatting

### ✅ Type Safety
- Full TypeScript support
- Typed provider interfaces
- Compile-time error detection

### ✅ Error Handling
- Provider-specific error messages
- Graceful fallback handling
- Detailed error logging

### ✅ Extensibility
- Easy to add new providers
- Modular service architecture
- Clean separation of concerns

## Environment Variables

The web app uses Vite environment variables:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

The actual API keys are stored in Supabase Edge Function environment variables and not exposed to the client.

## Testing

Each service can be tested independently:

```typescript
// Test individual provider
const geminiResult = await analyzeImageWithGemini(testImageUrl);

// Test unified service
const serpResult = await WebAnalysisService.analyzeImage(testImageUrl, ApiProvider.SERPAPI);

// Test error handling
try {
  await WebAnalysisService.analyzeImage(invalidUrl, ApiProvider.GEMINI);
} catch (error) {
  console.log(error.message); // "Gemini API Error: ..."
}
```
