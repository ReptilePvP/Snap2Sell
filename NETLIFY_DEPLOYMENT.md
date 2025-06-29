# Netlify Deployment Guide for Snap2Sell

This guide will help you deploy Snap2Sell to Netlify.

## Prerequisites

1. **GitHub Repository**: Your code should be pushed to a GitHub repository
2. **Supabase Project**: You need a Supabase project with the database set up
3. **Netlify Account**: Create an account at [netlify.com](https://netlify.com)

## Deployment Steps

### 1. Connect Your Repository

1. Log in to [Netlify](https://app.netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect to GitHub and select your Snap2Sell repository
4. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Node version**: `18`

### 2. Configure Environment Variables

In your Netlify site dashboard:

1. Go to **Site settings** → **Environment variables**
2. Add the following required variables:

```bash
# Required Supabase variables
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional API keys (only if using these providers)
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_SERPAPI_API_KEY=your_serpapi_key
VITE_SEARCHAPI_API_KEY=your_searchapi_key

# Optional configuration
VITE_DEBUG_MODE=false
```

### 3. Get Your Supabase Credentials

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **API**
4. Copy the **Project URL** and **anon public** key

### 4. Deploy

1. Click **Deploy site** in Netlify
2. Wait for the build to complete
3. Your site will be available at `https://[site-name].netlify.app`

## Build Configuration

The project includes a `netlify.toml` file with optimized settings:

- Build command: `npm run build`
- Publish directory: `dist`
- Node version: 18
- Security headers for production
- Asset caching optimization

## Troubleshooting

### Build Fails with Environment Variable Errors

**Solution**: Make sure all required environment variables are set in Netlify:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### TypeScript Compilation Errors

**Solution**: The project uses a production TypeScript config (`tsconfig.build.json`) that's more permissive than the development config.

### Large Bundle Size Warning

**Note**: The warning about chunk size is expected for this React application and doesn't affect functionality.

### Authentication Issues After Deployment

**Solution**: 
1. Verify Supabase environment variables are correct
2. Check that your Supabase project allows the Netlify domain in auth settings
3. Add your Netlify domain to Supabase's allowed origins

## Custom Domain (Optional)

To use a custom domain:

1. In Netlify dashboard, go to **Domain settings**
2. Click **Add custom domain**
3. Follow the DNS configuration instructions
4. Update your Supabase project's allowed origins to include your custom domain

## OpenLens Integration

**Note**: The OpenLens Python server is for local development only and won't be deployed to Netlify. If you want to use OpenLens in production, you'll need to deploy the Python server separately (e.g., to Heroku, Railway, or a VPS) and update the `VITE_OPENLENS_API_URL` environment variable.

## Automatic Deployments

Netlify automatically deploys when you push to your main branch. You can also configure branch deploys for staging environments.

## Support

If you encounter issues:

1. Check the Netlify build logs for detailed error messages
2. Verify all environment variables are set correctly
3. Test your build locally with `npm run build`
4. Check the [Netlify documentation](https://docs.netlify.com) for platform-specific issues
