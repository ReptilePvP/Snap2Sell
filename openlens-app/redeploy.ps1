#!/usr/bin/env pwsh
# PowerShell script to redeploy OpenLens to Google Cloud Run
# Run this script from the openlens-app directory

param(
    [switch]$Force,
    [string]$ProjectId = "gen-lang-client-0815551598",
    [string]$ServiceName = "snap2sell-openlens",
    [string]$Region = "us-central1"
)

Write-Host "🚀 Redeploying OpenLens to Google Cloud Run..." -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path "src/main.py")) {
    Write-Error "❌ Please run this script from the openlens-app directory"
    exit 1
}

# Build and tag image
$imageName = "gcr.io/$ProjectId/$ServiceName"
Write-Host "📦 Building Docker image: $imageName..." -ForegroundColor Blue

try {
    docker build -t "$imageName`:latest" .
    if ($LASTEXITCODE -ne 0) { throw "Docker build failed" }
    
    Write-Host "🔄 Pushing image to Google Container Registry..." -ForegroundColor Blue
    docker push "$imageName`:latest"
    if ($LASTEXITCODE -ne 0) { throw "Docker push failed" }
    
    Write-Host "☁️ Deploying to Cloud Run..." -ForegroundColor Blue
    
    # Deploy with the existing configuration
    gcloud run deploy $ServiceName `
        --image="$imageName`:latest" `
        --platform=managed `
        --region=$Region `
        --project=$ProjectId `
        --allow-unauthenticated `
        --set-secrets="OPENAI_API_KEY=openai-api-key:latest" `
        --memory=2Gi `
        --cpu=1 `
        --timeout=300 `
        --concurrency=10 `
        --max-instances=10
    
    if ($LASTEXITCODE -ne 0) { throw "Cloud Run deployment failed" }
    
    # Get the service URL
    $serviceUrl = gcloud run services describe $ServiceName --region=$Region --project=$ProjectId --format="value(status.url)" 2>$null
    
    Write-Host "✅ Deployment successful!" -ForegroundColor Green
    Write-Host "🌐 Service URL: $serviceUrl" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📝 The service now supports:" -ForegroundColor Cyan
    Write-Host "   • POST /analyze - for base64 image analysis (legacy)" -ForegroundColor White
    Write-Host "   • POST /analyze-url - for Supabase image URL analysis (new)" -ForegroundColor White
    Write-Host ""
    Write-Host "🔧 Next steps:" -ForegroundColor Cyan
    Write-Host "   1. Test the /analyze-url endpoint with a Supabase image URL" -ForegroundColor White
    Write-Host "   2. Verify logs in Cloud Run console for detailed debugging" -ForegroundColor White
    Write-Host "   3. Update your Supabase Edge Function if the service URL changed" -ForegroundColor White

} catch {
    Write-Error "❌ Deployment failed: $_"
    exit 1
}
