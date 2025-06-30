# OPTIONAL: API Key for local development only
# For production/Cloud Run, use the OPENAI_API_KEY environment variable instead

# Uncomment and set your API key for local development:
# API_KEY = "your-openai-api-key-here"

# IMPORTANT: This file is ignored by git (.gitignore) to prevent accidental exposure
# For production deployment, set the OPENAI_API_KEY environment variable

# Example for local development:
# API_KEY = "sk-proj-..."

# Leave this commented out to force using environment variables:
API_KEY = None

# Alternative: If you want to use a local LLM with Ollama, you can modify config.py
# to point to your local Ollama instance instead
