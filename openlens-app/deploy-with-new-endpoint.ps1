# Deploy OpenLens API to Google Cloud Run with new URL endpoint support
# Run this script from the openlens-app directory

Write-Host "Starting deployment of OpenLens API with new URL endpoint..." -ForegroundColor Green

# Set variables
$PROJECT_ID = "gen-lang-client-0815551598"
$SERVICE_NAME = "snap2sell-openlens"
$REGION = "us-central1"
$IMAGE_NAME = "gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

# Check if we're in the right directory
if (!(Test-Path "src/main.py")) {
    Write-Error "Please run this script from the openlens-app directory"
    exit 1
}

# Build the Docker image
Write-Host "Building Docker image: $IMAGE_NAME..." -ForegroundColor Yellow
docker build -t $IMAGE_NAME .

if ($LASTEXITCODE -ne 0) {
    Write-Error "Docker build failed"
    exit 1
}

# Push to Google Container Registry
Write-Host "Pushing image to Google Container Registry..." -ForegroundColor Yellow
docker push $IMAGE_NAME

if ($LASTEXITCODE -ne 0) {
    Write-Error "Docker push failed"
    exit 1
}

# Deploy to Cloud Run
Write-Host "Deploying to Cloud Run..." -ForegroundColor Yellow
gcloud run deploy $SERVICE_NAME `
    --image $IMAGE_NAME `
    --platform managed `
    --region $REGION `
    --allow-unauthenticated `
    --memory 2Gi `
    --cpu 1 `
    --timeout 300 `
    --max-instances 10 `
    --min-instances 0 `
    --set-secrets="OPENAI_API_KEY=openai-api-key:latest"

if ($LASTEXITCODE -ne 0) {
    Write-Error "Cloud Run deployment failed"
    exit 1
}

# Get the service URL
$SERVICE_URL = gcloud run services describe $SERVICE_NAME --platform=managed --region=$REGION --format="value(status.url)"

Write-Host "Deployment completed successfully!" -ForegroundColor Green
Write-Host "Service URL: $SERVICE_URL" -ForegroundColor Cyan
Write-Host ""
Write-Host "New endpoints available:" -ForegroundColor Yellow
Write-Host "  - $SERVICE_URL/analyze (base64 image)" -ForegroundColor Cyan
Write-Host "  - $SERVICE_URL/analyze-url (image URL)" -ForegroundColor Cyan
Write-Host ""
Write-Host "Make sure to update your Supabase Edge Function if the URL changed!" -ForegroundColor Red
