# 🚂 Railway Deployment Instructions - CLI Issue Fix

## ⚠️ Railway CLI Connection Problem

The Railway CLI is experiencing connection issues. Here's how to deploy using the web interface instead.

## 🌐 **Web Interface Deployment (Recommended)**

### Step 1: Prepare Files for Railway
✅ **Already Created:**
- `Dockerfile.railway` - Optimized for Railway
- `railway.toml` - Railway configuration  
- `.env.railway` - Environment template

### Step 2: Deploy via Railway Dashboard
```bash
railway login
```

### 3. **Deploy from this directory**
```bash
cd openlens-app
railway init
railway up
```

### 4. **Set Environment Variables**
In Railway dashboard or via CLI:
```bash
railway variables set OPENAI_API_KEY=your_openai_key_here
```

## Alternative: Web Dashboard Deployment

### 1. **Create Railway Account**
- Go to [railway.app](https://railway.app)
- Sign up with GitHub

### 2. **Connect Repository**
- Click "New Project" 
- Select "Deploy from GitHub repo"
- Choose your repository
- Select the `openlens-app` folder

### 3. **Configure Environment**
- Go to Variables tab
- Add: `OPENAI_API_KEY=your_key_here`
- Add: `PORT=8000` (optional, Railway auto-detects)

### 4. **Deploy**
- Railway will automatically build and deploy
- Uses the Dockerfile in this directory
- Provides a public URL

## Railway Configuration Files

- ✅ `railway.json` - Railway configuration
- ✅ `Dockerfile` - Updated for Railway
- ✅ `.env.railway` - Environment template

## Expected Benefits over Google Cloud Run

- 🚀 **Faster deployments** (usually < 2 minutes)
- 💰 **Simpler pricing** (pay for what you use)
- 🔧 **Easier environment management**
- 📊 **Better monitoring dashboard**
- 🔄 **Automatic deployments** on git push
- ⚡ **Faster cold starts**

## Post-Deployment

1. **Test your API**:
   ```bash
   curl https://your-railway-url.railway.app/
   ```

2. **Update Supabase Edge Function**:
   Replace the OPENLENS_API_URL with your new Railway URL

3. **Monitor**:
   Use Railway dashboard for logs and metrics

## Troubleshooting

- **Build fails**: Check Dockerfile and requirements.txt
- **Crashes on start**: Verify OPENAI_API_KEY is set
- **Timeout**: Railway has longer timeouts than Cloud Run by default
