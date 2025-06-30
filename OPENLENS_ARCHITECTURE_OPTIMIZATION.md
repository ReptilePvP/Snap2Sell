# OpenLens Architecture Optimization Guide

## Overview

This guide documents the architectural changes made to optimize the OpenLens image analysis system to use Supabase storage consistently across all API providers.

## Previous Architecture Issues

- **Inconsistent image handling**: OpenLens used direct API calls while other providers used Supabase Edge Functions
- **Cloud storage conflicts**: Images were being uploaded to Google Cloud Storage instead of Supabase
- **Error handling**: Limited error logging and recovery mechanisms
- **Performance**: Redundant base64 conversions in the client

## New Optimized Architecture

### Frontend Changes
- **Unified API calls**: All providers now use Supabase Edge Functions
- **Consistent image upload**: All images go directly to Supabase storage
- **Simplified error handling**: Standardized error responses across all providers

### Backend Changes
- **New URL endpoint**: Added `/analyze-url` endpoint to accept Supabase image URLs
- **Improved error handling**: Better logging and timeout management
- **Resource optimization**: Images are fetched server-side with proper headers

### Edge Function Updates
- **Direct URL passing**: No more client-side base64 conversion
- **Better timeout handling**: 2-minute timeout for complex analyses
- **Enhanced error messages**: More descriptive error reporting

## Implementation Steps

### 1. Frontend Updates
```typescript
// Before: Direct API call with base64 conversion
import { analyzeImageWithOpenLens } from './openLensService';

// After: Unified Supabase Edge Function
import { analyzeImageWithOpenLensAPI } from './apiService';
```

### 2. Cloud Run API Updates
```python
# New endpoint for URL-based analysis
@app.post("/analyze-url")
async def process_image_url(request: ImageUrlRequest, background_tasks: BackgroundTasks):
    # Fetch image from Supabase URL
    # Convert to base64 server-side
    # Process with existing pipeline
```

### 3. Edge Function Updates
```typescript
// Before: Client-side base64 conversion
const base64Image = await imageUrlToBase64(imageUrl);

// After: Direct URL passing to Cloud Run
body: JSON.stringify({ imageUrl: imageUrl })
```

## Deployment Instructions

### 1. Deploy Cloud Run Service
```bash
cd openlens-app
./deploy-with-new-endpoint.ps1
```

### 2. Update Supabase Edge Function
- Use Supabase Dashboard
- Navigate to Edge Functions
- Update `web-analyze-openlens` function
- Deploy the changes

### 3. Test the Integration
```bash
cd openlens-app
python test-architecture.py
```

## Benefits

- **Reliability**: Consistent image handling across all providers
- **Performance**: Reduced client-side processing
- **Scalability**: Better error handling and timeout management
- **Maintainability**: Unified architecture patterns

## Monitoring

### Key Metrics to Watch
- Edge function execution time (should be < 2 minutes)
- Cloud Run response times
- Error rates in both Edge Function and Cloud Run
- Image upload success rates to Supabase

### Logs Locations
- **Supabase Edge Function**: Supabase Dashboard > Edge Functions > Logs
- **Cloud Run**: Google Cloud Console > Cloud Run > Logs
- **Frontend**: Browser Developer Tools > Console

## Troubleshooting

### Common Issues

1. **Timeout errors**: Increase Edge Function timeout or optimize image processing
2. **Image fetch failures**: Check Supabase storage permissions and URLs
3. **Cloud Run cold starts**: Consider minimum instances for production

### Debug Steps

1. Check image upload to Supabase storage
2. Verify Edge Function can access the image URL
3. Confirm Cloud Run service is responding
4. Review logs at each step of the pipeline

## Environment Variables

Update your environment configuration:

```env
# Remove direct OpenLens URL (now handled by Edge Function)
# VITE_OPENLENS_API_URL=https://your-cloud-run-url

# Ensure Supabase configuration is correct
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```
