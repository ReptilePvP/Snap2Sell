#!/bin/bash

# Google Cloud Run Deployment Script for OpenLens
# Make sure you have gcloud CLI installed and authenticated

set -e

# Configuration
PROJECT_ID="your-gcp-project-id"  # Replace with your GCP project ID
SERVICE_NAME="snap2sell-openlens"
REGION="us-central1"  # Change to your preferred region
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

echo "🚀 Deploying OpenLens to Google Cloud Run..."

# Step 1: Build and push Docker image
echo "📦 Building Docker image..."
docker build -t ${IMAGE_NAME}:latest .

echo "🔄 Pushing image to Google Container Registry..."
docker push ${IMAGE_NAME}:latest

# Step 2: Create secret for OpenAI API key (if not exists)
echo "🔐 Creating secret for OpenAI API key..."
echo -n "your-openai-api-key-here" | gcloud secrets create openai-api-key --data-file=- --project=${PROJECT_ID} || echo "Secret already exists"

# Step 3: Deploy to Cloud Run
echo "🌐 Deploying to Cloud Run..."
gcloud run deploy ${SERVICE_NAME} \
  --image ${IMAGE_NAME}:latest \
  --platform managed \
  --region ${REGION} \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 1 \
  --timeout 300s \
  --max-instances 10 \
  --set-env-vars "PORT=8080" \
  --set-secrets "OPENAI_API_KEY=openai-api-key:latest" \
  --project ${PROJECT_ID}

echo "✅ Deployment complete!"
echo "🔗 Your OpenLens API is now available at:"
gcloud run services describe ${SERVICE_NAME} --region=${REGION} --project=${PROJECT_ID} --format="value(status.url)"

echo ""
echo "📝 Next steps:"
echo "1. Copy the URL above"
echo "2. Add it as VITE_OPENLENS_API_URL in your Netlify environment variables"
echo "3. Redeploy your Netlify site"
