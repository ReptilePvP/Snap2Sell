# Environment Variables Setup Guide

This document explains where to set each environment variable for your Snap2Sell deployment.

## 🌐 **Netlify Environment Variables** (Frontend)

Set these in your **Netlify Dashboard** → **Site Settings** → **Environment Variables**:

### Required for Snap2Sell Web App:
```bash
# Supabase Configuration (Required)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# OpenLens API URL (After Google Cloud deployment)
VITE_OPENLENS_API_URL=https://snap2sell-openlens-xxxxx-uc.a.run.app

# Optional API Keys (only if using these providers in frontend)
VITE_GEMINI_API_KEY=your-gemini-key
VITE_SERPAPI_API_KEY=your-serpapi-key
VITE_SEARCHAPI_API_KEY=your-searchapi-key
```

### Security Settings:
- **Secret**: Set to `No` for all VITE_ variables (they're public by design)
- **Scopes**: `All scopes` or just `Builds`
- **Values**: `Same value for all deploy contexts`

---

## ☁️ **Google Cloud Secret Manager** (Backend)

Set these in **Google Cloud Console** → **Secret Manager**:

### Required for OpenLens Python Service:
```bash
# OpenAI API Key for OpenLens service
openai-api-key = sk-proj-WmzOQT...  # Your new OpenAI API key
```

### How to Set:
```bash
# Method 1: Using the deployment script (recommended)
./deploy-gcp.sh
# Will prompt you to enter the API key securely

# Method 2: Manual creation
echo -n "sk-proj-WmzOQT..." | gcloud secrets create openai-api-key --data-file=-

# Method 3: Update existing secret
echo -n "sk-proj-WmzOQT..." | gcloud secrets versions add openai-api-key --data-file=-
```

---

## 🔒 **Security Best Practices**

### ✅ **DO:**
- Use Google Cloud Secret Manager for sensitive backend keys
- Use Netlify environment variables for frontend configuration
- Never commit API keys to your repository
- Revoke and regenerate exposed API keys immediately

### ❌ **DON'T:**
- Put API keys in your code files
- Commit `.env` files with real keys to Git
- Share API keys in plain text
- Use the same key for multiple services unnecessarily

---

## 🚀 **Deployment Workflow**

### 1. **Local Development:**
```bash
# Create .env file locally (never commit this!)
cp .env.example .env
# Edit .env with your local development keys
```

### 2. **Deploy OpenLens to Google Cloud:**
```bash
cd openlens-app
# Edit deploy-gcp.sh to set your PROJECT_ID
./deploy-gcp.sh
# Enter your OpenAI API key when prompted
```

### 3. **Configure Netlify:**
- Add the Google Cloud Run URL to `VITE_OPENLENS_API_URL`
- Add your Supabase credentials
- Netlify will auto-deploy when you push to GitHub

### 4. **Verify Deployment:**
- Check that OpenLens appears in your analysis options
- Test all 4 analysis providers work correctly

---

## 🎯 **Architecture Summary**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Netlify       │    │  Google Cloud   │    │   Supabase      │
│   (Frontend)    │    │   (OpenLens)    │    │  (Database)     │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ VITE_SUPABASE_* │────│                 │────│ Your Project    │
│ VITE_OPENLENS_* │────│ OPENAI_API_KEY  │    │                 │
│ VITE_GEMINI_*   │    │ (Secret Mgr)    │    │                 │
│ VITE_SERPAPI_*  │    │                 │    │                 │
│ VITE_SEARCHAPI_*│    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

This architecture ensures:
- **Frontend keys** are properly scoped and managed by Netlify
- **Backend secrets** are securely stored in Google Cloud
- **No sensitive data** is ever committed to your repository
