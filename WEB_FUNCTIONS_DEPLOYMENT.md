# Web-Specific Edge Functions Deployment Guide

## Overview
I've created separate Edge Functions specifically for the web app to ensure complete isolation from the mobile app functions. This prevents any interference between platforms.

## New Edge Functions Created

### Web Functions (No JWT verification, includes CORS)
- `web-analyze-gemini` - Web-specific Gemini AI analysis
- `web-analyze-searchapi` - Web-specific SearchAPI analysis  
- `web-analyze-serpapi` - Web-specific SerpAPI analysis

### Mobile Functions (Original - unchanged)
- `analyze-geminiapi` - Mobile-specific Gemini analysis
- `analyze-searchapi` - Mobile-specific SearchAPI analysis
- `analyze-serpapi` - Mobile-specific SerpAPI analysis

## Key Differences

### Web Functions Features:
✅ **No JWT Authentication Required** - `verify_jwt = false`  
✅ **CORS Headers Included** - Proper web browser support  
✅ **OPTIONS Request Handling** - Handles preflight requests  
✅ **Web-Optimized Error Messages** - Better debugging for web  
✅ **Unique IDs** - Uses `web_` prefix to avoid conflicts  

### Mobile Functions Features:
✅ **JWT Authentication Required** - `verify_jwt = true`  
✅ **No CORS Headers** - Not needed for mobile apps  
✅ **Mobile-Optimized** - Designed for React Native environment  

## Deployment Steps

### 1. Deploy the New Functions
```bash
# Navigate to your project directory
cd "c:\Users\nickd\Downloads\bolt-snap\project"

# Deploy all functions (or specific ones)
supabase functions deploy

# Or deploy individual functions:
supabase functions deploy web-analyze-gemini
supabase functions deploy web-analyze-searchapi
supabase functions deploy web-analyze-serpapi
```

### 2. Set Environment Variables
Make sure these environment variables are set in your Supabase project:

```bash
# In Supabase Dashboard > Edge Functions > Settings
GEMINI_API_KEY=your_gemini_api_key
SEARCH_API_KEY=your_searchapi_key  
SERPAPI_API_KEY=your_serpapi_key
```

### 3. Test the Functions
The web app has been updated to use the new functions automatically. Test by:

1. Upload an image in the web app
2. Try each analysis provider
3. Check browser console for detailed logs
4. Verify no CORS errors occur

## Function Endpoints

### Web Functions (for web app)
- `https://[your-project].supabase.co/functions/v1/web-analyze-gemini`
- `https://[your-project].supabase.co/functions/v1/web-analyze-searchapi`
- `https://[your-project].supabase.co/functions/v1/web-analyze-serpapi`

### Mobile Functions (for mobile app)
- `https://[your-project].supabase.co/functions/v1/analyze-geminiapi`
- `https://[your-project].supabase.co/functions/v1/analyze-searchapi`
- `https://[your-project].supabase.co/functions/v1/analyze-serpapi`

## Updated Files

### New Edge Function Files:
- `/supabase/functions/web-analyze-gemini/index.ts`
- `/supabase/functions/web-analyze-gemini/deno.json`
- `/supabase/functions/web-analyze-searchapi/index.ts`
- `/supabase/functions/web-analyze-searchapi/deno.json`
- `/supabase/functions/web-analyze-serpapi/index.ts`
- `/supabase/functions/web-analyze-serpapi/deno.json`

### Modified Files:
- `/supabase/config.toml` - Added web function configurations
- `/src/services/apiService.ts` - Updated to use web functions

## Benefits

### ✅ **Complete Platform Separation**
- Web and mobile use completely different functions
- No risk of breaking changes affecting both platforms
- Independent deployment and testing

### ✅ **Web-Optimized**
- Proper CORS handling for browsers
- No authentication barriers for public analysis
- Better error messages and debugging

### ✅ **Mobile Unchanged**
- Original mobile functions remain exactly the same
- Mobile app continues to work without any changes
- No risk of regression

### ✅ **Scalable Architecture**
- Easy to add platform-specific features
- Clear separation of concerns
- Future-proof design

## Troubleshooting

### Common Issues:

1. **CORS Errors**: Should be resolved with new web functions
2. **Authentication Errors**: Web functions don't require auth
3. **Function Not Found**: Make sure functions are deployed
4. **API Key Errors**: Verify environment variables are set

### Debug Commands:
```bash
# Check function logs
supabase functions logs web-analyze-gemini

# Test function locally
supabase functions serve web-analyze-gemini

# Verify deployment
supabase functions list
```

## Next Steps

1. Deploy the new functions to Supabase
2. Test each analysis provider in the web app
3. Verify mobile app still works with original functions
4. Monitor function logs for any issues

The web app should now work perfectly without any interference with the mobile version!
