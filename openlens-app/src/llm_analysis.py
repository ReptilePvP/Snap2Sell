import os
from openai import OpenAI
import logging
import argparse
from config import Config

# Setup logging
logger = logging.getLogger(__name__)

def get_llm_analysis(content, system_prompt=None, base_url=None, model=None, temperature=None, api_key=None):
    """Process the text content through OpenAI API"""
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
    # Use API key from environment variable or fallback
    if api_key is None:
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            # Try to import from secret_key.py as fallback for local development
            try:
                from secret_key import API_KEY
                api_key = API_KEY
                logger.info("Using API key from secret_key.py (local development)")
            except ImportError:
                logger.error("No OpenAI API key found! Set OPENAI_API_KEY environment variable or create secret_key.py")
                raise ValueError("OpenAI API key not configured")
        else:
            logger.info("Using API key from environment variable")
        
    try:
        # Initialize the OpenAI client
        client = OpenAI(
            base_url=base_url,
            api_key=api_key,
        )
        
        # Create the completion
        logger.info("Sending request to OpenAI API")
        logger.info(f"Using model: {model}")
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": content}
            ],
            temperature=temperature
        )
        
        # Extract the response text
        result = response.choices[0].message.content
        
        logger.info(f"Received {len(result)} chars response from OpenAI")
        return result
        
    except Exception as e:
        logger.error(f"Error processing content with OpenAI: {e}")
        return f"Error processing with OpenAI: {str(e)}"

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