# Railway Dockerfile - builds OpenLens API from openlens-app directory
# Use Python 3.11 slim image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies for Chrome and Selenium
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    unzip \
    curl \
    xvfb \
    && rm -rf /var/lib/apt/lists/*

# Install Google Chrome
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google.list \
    && apt-get update \
    && apt-get install -y google-chrome-stable \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY openlens-app/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code from openlens-app directory
COPY openlens-app/src/ ./src/

# Create necessary directories
RUN mkdir -p data/images data/csv data/txt

# Set environment variables for Chrome in headless mode
ENV DISPLAY=:99
ENV CHROME_ARGS="--headless --no-sandbox --disable-dev-shm-usage --disable-gpu --remote-debugging-port=9222"

# Set Python path to include src directory
ENV PYTHONPATH=/app/src

# Expose port (Railway uses PORT environment variable)
EXPOSE 8000

# Health check - Railway will use this
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/ || exit 1

# Start the application - Railway will inject PORT environment variable
CMD ["sh", "-c", "uvicorn src.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
