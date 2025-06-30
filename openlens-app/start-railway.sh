#!/bin/bash
# Railway startup script for OpenLens API

# Default port if Railway doesn't set it
PORT=${PORT:-8000}

echo "🚂 Starting OpenLens API on Railway..."
echo "Port: $PORT"
echo "Python Path: $PYTHONPATH"

# Start Xvfb for headless Chrome (if needed)
if [ "$DISPLAY" = ":99" ]; then
    echo "Starting Xvfb for headless Chrome..."
    Xvfb :99 -screen 0 1024x768x24 > /dev/null 2>&1 &
fi

# Start the FastAPI application
echo "Starting uvicorn server..."
exec uvicorn src.main:app --host 0.0.0.0 --port $PORT
