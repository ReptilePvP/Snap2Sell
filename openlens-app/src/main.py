from fastapi import BackgroundTasks, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import base64
import os
import uuid
import requests
from selenium_lens_scraper import run_google_lens_search
from bs4_small_scraper import scrape_first_urls
from llm_analysis import get_llm_analysis
import logging
from config import Config

# Setup logging with more detailed format
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(funcName)s:%(lineno)d - %(message)s'
)
logger = logging.getLogger(__name__)

# Log startup information
logger.info("Starting OpenLens API server")
logger.info(f"Image directory: {Config.IMAGE_DIR}")
logger.info(f"CSV directory: {Config.CSV_DIR}")
logger.info(f"TXT directory: {Config.TXT_DIR}")
logger.info(f"Max URLs to scrape: {Config.MAX_URLS_TO_SCRAPE}")
logger.info(f"Max characters in summary: {Config.MAX_CHARACTERS_IN_SUMMARY}")

# Create necessary directories
Config.create_dirs()

app = FastAPI(title="Google Lens Scraper API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

class ImageRequest(BaseModel):
    image: str  # base64 encoded image
    
class ImageUrlRequest(BaseModel):
    imageUrl: str  # URL to fetch image from (e.g., Supabase storage)

def remove_files(request_id: str):
    if Config.REMOVE_IMAGES:
        image_path = f"{Config.IMAGE_DIR}/image_{request_id}.{Config.IMAGE_FILE_EXTENSION}"
        if os.path.exists(image_path):
            os.remove(image_path)
            logger.info(f"Removed image file: {image_path}")
    if Config.REMOVE_CSVS:
        csv_path = f"{Config.CSV_DIR}/results_{request_id}.csv"
        if os.path.exists(csv_path):
            os.remove(csv_path)
            logger.info(f"Removed CSV file: {csv_path}")
    if Config.REMOVE_TXT:
        txt_path = f"{Config.TXT_DIR}/content_{request_id}.txt"
        if os.path.exists(txt_path):
            os.remove(txt_path)
            logger.info(f"Removed text file: {txt_path}")


@app.get("/")
async def root():
    return {"message": "Google Lens Scraper API is running. Use /analyze endpoint with a base64 encoded image."}

@app.post("/analyze")
async def process_image(request: ImageRequest, background_tasks: BackgroundTasks):
    """Process image analysis with base64 encoded image"""
    return await _process_image_analysis(request.image, background_tasks)

@app.post("/analyze-url")
async def process_image_url(request: ImageUrlRequest, background_tasks: BackgroundTasks):
    """Process image analysis with image URL (e.g., from Supabase storage)"""
    try:
        logger.info(f"Received image URL analysis request: {request.imageUrl[:100]}...")
        
        # Fetch image from URL with proper headers and timeout
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
        logger.info(f"Fetching image from URL with timeout=30s")
        response = requests.get(request.imageUrl, headers=headers, timeout=30)
        response.raise_for_status()
        
        # Log response info
        logger.info(f"Image fetch successful - Status: {response.status_code}, Content-Type: {response.headers.get('content-type')}, Size: {len(response.content)} bytes")
        
        # Convert to base64
        image_base64 = base64.b64encode(response.content).decode('utf-8')
        logger.info(f"Successfully converted image URL to base64 (size: {len(image_base64)} chars)")
        
        return await _process_image_analysis(image_base64, background_tasks)
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Failed to fetch image from URL {request.imageUrl}: {e}")
        raise HTTPException(status_code=400, detail=f"Failed to fetch image from URL: {str(e)}")
    except Exception as e:
        logger.error(f"Error processing image URL: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing image URL: {str(e)}")

async def _process_image_analysis(image_base64: str, background_tasks: BackgroundTasks):
    """Core image analysis logic shared by both endpoints"""
    try:
        # Generate unique ID for this request
        request_id = str(uuid.uuid4())
        logger.info(f"Processing new request: {request_id}")
        
        # Decode and save base64 image
        image_path = f"{Config.IMAGE_DIR}/image_{request_id}.{Config.IMAGE_FILE_EXTENSION}"
        try:
            with open(image_path, "wb") as img_file:
                img_data = base64.b64decode(image_base64)
                img_file.write(img_data)
            logger.info(f"Image saved at {image_path}")
        except Exception as e:
            logger.error(f"Failed to decode base64 image: {e}")
            raise HTTPException(status_code=400, detail="Invalid base64 image")
        
        # Run Google Lens search
        csv_path = f"{Config.CSV_DIR}/results_{request_id}.csv"
        logger.info(f"Starting Google Lens search for image")
        result = run_google_lens_search(image_path, csv_path)
        if not result:
            raise HTTPException(status_code=500, detail="Google Lens search failed")
        logger.info(f"Google Lens results saved to {csv_path}")
        
        # Scrape content from URLs
        txt_path = f"{Config.TXT_DIR}/content_{request_id}.txt"
        logger.info(f"Scraping content from top URLs")
        scraped_content = scrape_first_urls(
            csv_path, 
            txt_path, 
            max_urls=Config.MAX_URLS_TO_SCRAPE, 
            char_limit=Config.MAX_CHARACTERS_IN_SUMMARY
        )
        logger.info(f"Scraped content saved to {txt_path}")
        
        # Get OpenAI analysis
        logger.info(f"Sending content to LLM for analysis")
        analysis = get_llm_analysis(scraped_content)
        logger.info(f"Analysis received from LLM")
        
        background_tasks.add_task(func=remove_files, request_id=request_id)
        return {
            "analysis": analysis,
            "request_id": request_id,
            "google_lens_links_found": result if isinstance(result, int) else "Success",
            "scraped_content_length": len(scraped_content),
            "csv_file": f"csv/results_{request_id}.csv",
            "content_file": f"txt/content_{request_id}.txt"
        }
        
    except Exception as e:
        logger.error(f"Error processing request: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")