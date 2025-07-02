#!/bin/bash

# Google Cloud Run Deployment Script for OpenLens
# Make sure you have gcloud CLI installed and authenticated

set -e

# Configuration
PROJECT_ID="gen-lang-client-0815551598"  # Your GCP project ID
SERVICE_NAME="snapalyze-openlens"
REGION="us-central1"  # Change to your preferred region
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

echo "🚀 Deploying OpenLens to Google Cloud Run..."

# Step 1: Build and push Docker image
echo "📦 Building Docker image..."
docker build -t ${IMAGE_NAME}:latest .

echo "🔄 Pushing image to Google Container Registry..."
docker push ${IMAGE_NAME}:latest

# Step 2: Create/Update secret for OpenAI API key
echo "🔐 Creating/updating secret for OpenAI API key..."
echo "Please enter your OpenAI API key when prompted (it will be hidden):"
read -s OPENAI_API_KEY

# Create or update the secret
echo -n "$OPENAI_API_KEY" | gcloud secrets create openai-api-key --data-file=- --project=${PROJECT_ID} 2>/dev/null || \
echo -n "$OPENAI_API_KEY" | gcloud secrets versions add openai-api-key --data-file=- --project=${PROJECT_ID}

echo "✅ Secret updated successfully"

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
