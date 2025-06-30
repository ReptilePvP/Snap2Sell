import os
from openai import OpenAI
import logging
import argparse
from config import Config

# Setup logging
logger = logging.getLogger(__name__)

def get_llm_analysis(content, system_prompt=None, base_url=None, model=None, temperature=None, api_key=None):
    """Process the text content through OpenAI API with robust error handling and fallbacks"""
    # Use default system prompt if not provided
    if system_prompt is None:
        system_prompt = Config.SYSTEM_PROMPT
    # Use default base URL if not provided
    if base_url is None:
        base_url = Config.BASE_URL
    # Use default model if not provided
    if model is None:
        model = Config.MODEL
    # Use default temperature if not provided
    if temperature is None:
        temperature = Config.TEMPERATURE
    
    # Get API key with multiple fallback options
    if api_key is None:
        # Try environment variable first
        api_key = os.getenv('OPENAI_API_KEY')
        
        # If not found, try secret_key.py for local development
        if not api_key:
            try:
                from secret_key import API_KEY
                api_key = API_KEY
                logger.info("Using API key from secret_key.py (local development)")
            except ImportError:
                logger.error("No OpenAI API key found! Set OPENAI_API_KEY environment variable or create secret_key.py")
                raise ValueError("OpenAI API key not configured")
        else:
            logger.info("Using API key from environment variable")
    
    # Check if content is empty
    if not content or len(content.strip()) == 0:
        logger.error("No content to analyze! Returning error message.")
        return "Unable to analyze content: No text was scraped from Google Lens search results. This may be due to Google's anti-bot measures or network connectivity issues."
    
    # Initialize variables for retry logic
    max_retries = 3
    retry_count = 0
    last_error = None
    
    while retry_count < max_retries:
        try:
            # Initialize the OpenAI client with Cloud Run optimized settings
            import httpx
            
            # Create custom HTTP client with longer timeouts and retries
            http_client = httpx.Client(
                timeout=httpx.Timeout(Config.API_TIMEOUT, connect=30.0, read=Config.API_TIMEOUT, write=30.0),
                limits=httpx.Limits(max_keepalive_connections=5, max_connections=10),
                retries=3
            )
            
            client = OpenAI(
                base_url=base_url,
                api_key=api_key,
                http_client=http_client
            )
            
            # Determine which model to use based on retry count
            current_model = model if retry_count == 0 else Config.FALLBACK_MODEL
            
            # Create the completion with robust settings
            logger.info(f"Attempt {retry_count + 1}: Sending {len(content)} chars to OpenAI API")
            logger.info(f"Using model: {current_model}")
            logger.info(f"Base URL: {base_url}")
            
            # Truncate content if needed
            truncated_content = content[:min(len(content), 20000)]
            
            response = client.chat.completions.create(
                model=current_model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": truncated_content}
                ],
                temperature=temperature,
                max_tokens=Config.MAX_TOKENS,
                timeout=Config.API_TIMEOUT
            )
            
            # Extract the response text
            result = response.choices[0].message.content
            
            logger.info(f"Received {len(result)} chars response from OpenAI")
            logger.info(f"OpenAI response preview: {result[:100]}...")
            return result
            
        except Exception as e:
            last_error = e
            retry_count += 1
            logger.error(f"Error (attempt {retry_count}/{max_retries}) processing content with OpenAI: {e}")
            logger.error(f"Error type: {type(e).__name__}")
            
            # Wait before retrying
            if retry_count < max_retries:
                logger.info(f"Retrying in {Config.RETRY_DELAY} seconds...")
                time.sleep(Config.RETRY_DELAY)
                
                # If this was the first attempt with the primary model, switch to fallback model
                if retry_count == 1 and model == Config.MODEL:
                    logger.info(f"Switching to fallback model: {Config.FALLBACK_MODEL}")
    
    # If we get here, all retries failed
    logger.error(f"All {max_retries} attempts failed")
    logger.error(f"Content length: {len(content)} chars")
    logger.error(f"API key available: {'Yes' if api_key else 'No'}")
    logger.error(f"Base URL: {base_url}")
    logger.error(f"Last error: {last_error}")
    
    # Return a detailed fallback response with useful diagnostic info
    if len(content.strip()) == 0:
        fallback_response = "Unable to analyze content: No text was scraped from Google Lens search results. This may be due to Google's anti-bot measures or network connectivity issues."
    else:
        fallback_response = f"Unable to analyze content due to connection issues. Content summary: {len(content)} characters of scraped text from Google Lens search results."
    
    return fallback_response

# Module can be run independently
if __name__ == "__main__":
    # Setup basic logging for standalone use
    logging.basicConfig(level=logging.INFO, 
                       format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    
    # Create argument parser
    parser = argparse.ArgumentParser(description="Process content with OpenAI LLM")
    parser.add_argument("--txt", "-t", required=True, help="Path to text file with content to analyze")
    parser.add_argument("--output", "-o", help="Output file for the analysis")
    parser.add_argument("--system-prompt", "-s", help="Custom system prompt")
    
    # Parse arguments
    args = parser.parse_args()
    
    # Read content from file
    try:
        with open(args.txt, 'r', encoding='utf-8') as f:
            content = f.read()
            logger.info(f"Read {len(content)} chars from {args.txt}")
    except Exception as e:
        logger.error(f"Error reading file {args.txt}: {e}")
        exit(1)
    
    # Get analysis
    analysis = get_llm_analysis(content, args.system_prompt)
    
    # Output result
    if args.output:
        with open(args.output, 'w', encoding='utf-8') as f:
            f.write(analysis)
        logger.info(f"Analysis saved to {args.output}")
    else:
        print("\n" + "="*50)
        print("ANALYSIS RESULT:")
        print("="*50)
        print(analysis)
        print("="*50)