#!/usr/bin/env pwsh
# PowerShell script to deploy OpenLens to Railway

Write-Host "🚂 Deploying OpenLens API to Railway..." -ForegroundColor Green

# Check if we're in the right directory
if (!(Test-Path "src/main.py")) {
    Write-Error "Please run this script from the openlens-app directory"
    exit 1
}

# Check if Railway CLI is installed
$railwayVersion = railway --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Railway CLI not found. Installing..." -ForegroundColor Yellow
    Write-Host "Please install Railway CLI from: https://docs.railway.app/develop/cli" -ForegroundColor Cyan
    Write-Host "Or run: npm install -g @railway/cli" -ForegroundColor Cyan
    exit 1
}

Write-Host "✅ Railway CLI found: $railwayVersion" -ForegroundColor Green

# Login to Railway (if not already logged in)
Write-Host "🔐 Checking Railway authentication..." -ForegroundColor Blue
$loginStatus = railway whoami 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Please login to Railway first:" -ForegroundColor Yellow
    Write-Host "railway login" -ForegroundColor Cyan
    exit 1
}

Write-Host "✅ Logged in as: $loginStatus" -ForegroundColor Green

# Initialize Railway project (if not already initialized)
if (!(Test-Path ".railway")) {
    Write-Host "🏗️ Initializing Railway project..." -ForegroundColor Blue
    railway init
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to initialize Railway project"
        exit 1
    }
}

# Set environment variables
Write-Host "🔧 Setting up environment variables..." -ForegroundColor Blue
Write-Host "Please enter your OpenAI API key (will be hidden):" -ForegroundColor Yellow
$OPENAI_API_KEY = Read-Host -AsSecureString
$OPENAI_API_KEY_PLAIN = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($OPENAI_API_KEY))

railway variables set OPENAI_API_KEY=$OPENAI_API_KEY_PLAIN
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ OpenAI API key set" -ForegroundColor Green
} else {
    Write-Error "Failed to set OpenAI API key"
    exit 1
}

# Deploy to Railway
Write-Host "🚀 Deploying to Railway..." -ForegroundColor Blue
railway up

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Deployment successful!" -ForegroundColor Green
    
    # Get the deployment URL
    $deploymentUrl = railway status --json | ConvertFrom-Json | Select-Object -ExpandProperty deployments | Select-Object -First 1 | Select-Object -ExpandProperty url
    
    if ($deploymentUrl) {
        Write-Host "🌐 Your OpenLens API is now available at:" -ForegroundColor Cyan
        Write-Host "   $deploymentUrl" -ForegroundColor White
        Write-Host ""
        Write-Host "📝 Next steps:" -ForegroundColor Yellow
        Write-Host "   1. Test the API: $deploymentUrl/" -ForegroundColor White
        Write-Host "   2. Update your Supabase Edge Function with the new URL" -ForegroundColor White
        Write-Host "   3. Test both endpoints:" -ForegroundColor White
        Write-Host "      - $deploymentUrl/analyze (base64)" -ForegroundColor Gray
        Write-Host "      - $deploymentUrl/analyze-url (image URL)" -ForegroundColor Gray
    }
} else {
    Write-Error "Deployment failed"
    exit 1
}

Write-Host ""
Write-Host "🎉 Railway deployment complete!" -ForegroundColor Green
