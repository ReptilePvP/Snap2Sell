# OpenLens Troubleshooting Guide

This guide provides solutions for common issues with the OpenLens service, particularly when deployed to Google Cloud Run.

## Common Error: "Unable to analyze content due to connection issues"

This error occurs when the OpenLens service is unable to scrape content from Google Lens search results. Here are the most common causes and solutions:

### 1. Google Anti-Bot Detection

**Problem:** Google Lens is detecting the automated browser as a bot and blocking access.

**Solutions:**
- Update the Selenium configuration in `selenium_lens_scraper.py` with additional anti-detection measures
- Enable a proxy in `config.py` by setting `PROXY = "http://your-proxy-url:port"`
- Try using a residential proxy service which is less likely to be detected
- Reduce the frequency of requests to avoid triggering rate limits

### 2. Cloud Run Configuration Issues

**Problem:** The Cloud Run service doesn't have the proper configuration to run Selenium and Chrome.

**Solutions:**
- Ensure your Dockerfile installs all required dependencies:
  ```dockerfile
  # Install Chrome and dependencies
  RUN apt-get update && apt-get install -y \
      wget \
      gnupg \
      ca-certificates \
      fonts-liberation \
      libasound2 \
      libatk-bridge2.0-0 \
      libatk1.0-0 \
      libatspi2.0-0 \
      libcups2 \
      libdbus-1-3 \
      libdrm2 \
      libgbm1 \
      libgtk-3-0 \
      libnspr4 \
      libnss3 \
      libwayland-client0 \
      libxcomposite1 \
      libxdamage1 \
      libxfixes3 \
      libxkbcommon0 \
      libxrandr2 \
      xdg-utils \
      --no-install-recommends
  
  # Install Chrome
  RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
      && echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list \
      && apt-get update \
      && apt-get install -y google-chrome-stable --no-install-recommends
  ```

- Increase memory allocation for your Cloud Run service (minimum 2GB recommended)
- Set the following environment variables in your Cloud Run service:
  ```
  PYTHONUNBUFFERED=1
  OPENAI_API_KEY=your_openai_api_key
  ```

### 3. OpenAI API Issues

**Problem:** The OpenAI API key is invalid, expired, or has reached its rate limit.

**Solutions:**
- Verify your OpenAI API key is valid and has sufficient quota
- Set the `OPENAI_API_KEY` environment variable in your Cloud Run service
- Check if you need to update your payment information in your OpenAI account
- Consider using a fallback model by setting `FALLBACK_MODEL` in `config.py`

### 4. Network Connectivity Issues

**Problem:** The Cloud Run service cannot connect to Google or OpenAI.

**Solutions:**
- Check if your Cloud Run service has outbound internet access
- Verify there are no firewall rules blocking access to Google or OpenAI
- Try using a VPC connector if you're running in a VPC
- Increase timeouts in `config.py` if connections are slow

## Debugging Steps

1. **Check Cloud Run Logs:**
   - Go to Google Cloud Console > Cloud Run > Your Service > Logs
   - Look for error messages related to Selenium, Chrome, or OpenAI

2. **Test OpenLens API Locally:**
   - Run the OpenLens service locally with `python src/main.py`
   - Use the troubleshooting page in the web app to test connectivity

3. **Verify Environment Variables:**
   - Ensure all required environment variables are set in your Cloud Run service
   - Check that `VITE_OPENLENS_API_URL` in your Netlify deployment points to the correct Cloud Run URL

4. **Test with a Simple Image:**
   - Use a very simple image (like a solid color) to test if the service works with minimal content
   - This can help determine if the issue is with Google Lens or with your service

## Updating the Deployment

After making changes to fix issues:

1. Rebuild your Docker image:
   ```bash
   docker build -t gcr.io/your-project-id/openlens-app:latest .
   ```

2. Push to Google Container Registry:
   ```bash
   docker push gcr.io/your-project-id/openlens-app:latest
   ```

3. Deploy to Cloud Run:
   ```bash
   gcloud run deploy openlens-app \
     --image gcr.io/your-project-id/openlens-app:latest \
     --platform managed \
     --region us-central1 \
     --memory 2Gi \
     --cpu 1 \
     --timeout 300 \
     --concurrency 10 \
     --set-env-vars="OPENAI_API_KEY=your_openai_api_key,PYTHONUNBUFFERED=1"
   ```

## Advanced Configuration

For persistent issues with Google Lens detection, consider these advanced options:

1. **Rotating User Agents:**
   - Modify `selenium_lens_scraper.py` to use a wider variety of user agents
   - Consider using a user agent rotation library

2. **Browser Fingerprint Randomization:**
   - Add more browser fingerprinting evasion techniques to the CDP script
   - Consider using a tool like Puppeteer Stealth as a reference

3. **Request Rate Limiting:**
   - Add delays between requests to avoid triggering rate limits
   - Implement exponential backoff for retries

4. **Alternative Scraping Methods:**
   - Consider using a different approach to access Google Lens data
   - Explore official API options if available