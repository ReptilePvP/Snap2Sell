# Google Cloud Deployment for OpenLens FastAPI Service

This guide will help you deploy the OpenLens service to Google Cloud Run.

## Prerequisites

1. **Google Cloud Account** with billing enabled
2. **Google Cloud CLI** installed ([Install Guide](https://cloud.google.com/sdk/docs/install))
3. **Docker** installed on your machine
4. **OpenAI API Key** for the analysis service

## Setup Steps

### 1. Enable Required APIs

```bash
# Enable necessary Google Cloud APIs
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable secretmanager.googleapis.com
```

### 2. Set Your Project ID

```bash
# Replace with your actual GCP project ID
export PROJECT_ID="your-gcp-project-id"
gcloud config set project $PROJECT_ID
```

### 3. Create OpenAI Secret

```bash
# Store your OpenAI API key securely
echo -n "your-actual-openai-api-key" | gcloud secrets create openai-api-key --data-file=-
```

### 4. Build and Deploy

```bash
# Make the deploy script executable
chmod +x deploy-gcp.sh

# Edit the script to set your PROJECT_ID
# Then run:
./deploy-gcp.sh
```

## Manual Deployment (Alternative)

If you prefer manual steps:

### 1. Build Docker Image

```bash
# Build the image
docker build -t gcr.io/your-project-id/snap2sell-openlens .

# Push to Google Container Registry
docker push gcr.io/your-project-id/snap2sell-openlens
```

### 2. Deploy to Cloud Run

```bash
gcloud run deploy snap2sell-openlens \
  --image gcr.io/your-project-id/snap2sell-openlens \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 1 \
  --timeout 300s \
  --set-secrets "OPENAI_API_KEY=openai-api-key:latest"
```

## Configuration

### Environment Variables

The service uses these environment variables:
- `OPENAI_API_KEY` - Your OpenAI API key (stored as secret)
- `PORT` - Port to run on (automatically set by Cloud Run to 8080)

### Resource Limits

- **Memory**: 2GB (needed for Chrome browser)
- **CPU**: 1 vCPU
- **Timeout**: 5 minutes (for complex analysis)
- **Max Instances**: 10 (adjust based on expected load)

## Update Netlify Configuration

After deployment, you'll get a URL like:
```
https://snap2sell-openlens-xxxxx-uc.a.run.app
```

Add this to your Netlify environment variables:
```
VITE_OPENLENS_API_URL=https://your-cloud-run-url
```

## Monitoring and Logs

### View Logs
```bash
gcloud run services logs read snap2sell-openlens --region=us-central1
```

### Monitor Performance
- Go to [Google Cloud Console](https://console.cloud.google.com)
- Navigate to Cloud Run > snap2sell-openlens
- Check metrics and logs

## Cost Optimization

Cloud Run charges based on:
- **CPU/Memory usage** during request processing
- **Number of requests**
- **Egress bandwidth**

The service scales to zero when not in use, so you only pay for actual usage.

**Estimated costs** (with moderate usage):
- ~$5-20/month for typical usage
- Free tier includes 2 million requests/month

## Troubleshooting

### Chrome/Selenium Issues
- The Dockerfile includes all necessary Chrome dependencies
- Runs in headless mode suitable for Cloud Run

### Memory Issues
- Increase memory allocation if needed:
  ```bash
  gcloud run services update snap2sell-openlens --memory 4Gi --region us-central1
  ```

### Timeout Issues
- Increase timeout if analysis takes longer:
  ```bash
  gcloud run services update snap2sell-openlens --timeout 600s --region us-central1
  ```

## Security

- OpenAI API key is stored in Google Secret Manager
- Service allows unauthenticated access (suitable for your frontend)
- CORS is configured to allow all origins

## Updates

To update the service:
1. Make changes to your code
2. Run `./deploy-gcp.sh` again
3. Cloud Run will deploy the new version with zero downtime
