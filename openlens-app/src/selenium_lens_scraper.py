import sys
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
import time
import random
from selenium.webdriver.common.action_chains import ActionChains
import csv
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import os
import logging
import argparse
from config import Config

# Setup logging
logger = logging.getLogger(__name__)

def setup_anti_detection_driver():
    """Create a Chrome driver with anti-detection measures"""
    options = webdriver.ChromeOptions()
    
    # Randomize user agent from a list of modern browsers
    user_agents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 Edg/123.0.0.0',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0'
    ]
    user_agent = random.choice(user_agents)
    options.add_argument(f'user-agent={user_agent}')
    logger.info(f"Using user agent: {user_agent}")
    
    # Enhanced anti-detection settings
    options.add_argument('--disable-blink-features=AutomationControlled')
    options.add_experimental_option('excludeSwitches', ['enable-automation'])
    options.add_experimental_option('useAutomationExtension', False)
    
    # Add window size randomization for more human-like behavior
    window_sizes = [(1366, 768), (1440, 900), (1536, 864), (1920, 1080)]
    window_size = random.choice(window_sizes)
    options.add_argument(f'--window-size={window_size[0]},{window_size[1]}')
    
    # Additional stability and anti-detection options
    options.add_argument('--disable-extensions')
    options.add_argument('--disable-notifications')
    options.add_argument('--disable-popup-blocking')
    options.add_argument('--disable-infobars')
    options.add_argument('--disable-save-password-bubble')
    options.add_argument('--disable-translate')
    options.add_argument('--disable-web-security')
    options.add_argument('--allow-running-insecure-content')
    
    # Required for running in Docker container
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    
    # Headless mode - configurable
    if Config.HEADLESS_MODE:
        # Use headless=new for better compatibility
        options.add_argument('--headless=new')
    
    # Set page load strategy to EAGER for faster loading
    options.page_load_strategy = 'eager'
    
    # Add proxy if configured
    if hasattr(Config, 'PROXY') and Config.PROXY:
        options.add_argument(f'--proxy-server={Config.PROXY}')
        logger.info(f"Using proxy: {Config.PROXY}")
    
    # Driver setup
    try:
        # can be done like this also :
        # webdriver_service = Service("/usr/bin/chromedriver")
        # driver = webdriver.Chrome(service=webdriver_service, options=options)
        driver = webdriver.Chrome(options=options)
    except Exception as e:
        logger.warning(f"Local chromedriver failed: {e}, trying ChromeDriverManager")
        try:
            # Fall back to ChromeDriverManager
            webdriver_service = Service(ChromeDriverManager().install())
            driver = webdriver.Chrome(service=webdriver_service, options=options)
        except Exception as e:
            logger.error(f"Error with Chrome: {e}")
            raise
    
    # Enhanced anti-detection script with more comprehensive evasions
    driver.execute_cdp_cmd('Page.addScriptToEvaluateOnNewDocument', {
        'source': '''
            // Hide webdriver property
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined
            });
            
            // Randomize language settings
            const languages = ['en-US', 'en-GB', 'en', 'en-CA'];
            Object.defineProperty(navigator, 'language', {
                get: () => languages[0]
            });
            Object.defineProperty(navigator, 'languages', {
                get: () => languages
            });
            
            // Override permissions
            const originalQuery = window.navigator.permissions.query;
            window.navigator.permissions.query = (parameters) => (
                parameters.name === 'notifications' || parameters.name === 'clipboard-read' ?
                Promise.resolve({ state: Notification.permission }) :
                originalQuery(parameters)
            );
            
            // Add fake plugins and mime types
            Object.defineProperty(navigator, 'plugins', {
                get: () => {
                    return [
                        {
                            0: {type: "application/pdf", suffixes: "pdf", description: "Portable Document Format"},
                            name: "PDF Viewer",
                            description: "Portable Document Format",
                            filename: "internal-pdf-viewer"
                        },
                        {
                            0: {type: "application/x-shockwave-flash", suffixes: "swf", description: "Shockwave Flash"},
                            name: "Shockwave Flash",
                            description: "Shockwave Flash",
                            filename: "internal-flash-player"
                        }
                    ];
                }
            });
            
            // Spoof hardware concurrency
            Object.defineProperty(navigator, 'hardwareConcurrency', {
                get: () => 8
            });
            
            // Spoof platform
            Object.defineProperty(navigator, 'platform', {
                get: () => "Win32"
            });
            
            // Spoof user agent
            Object.defineProperty(navigator, 'userAgent', {
                get: () => window.navigator.userAgent.replace("Headless", "")
            });
            
            // Spoof screen properties
            Object.defineProperty(screen, 'width', { get: () => 1920 });
            Object.defineProperty(screen, 'height', { get: () => 1080 });
            Object.defineProperty(screen, 'availWidth', { get: () => 1920 });
            Object.defineProperty(screen, 'availHeight', { get: () => 1040 });
            Object.defineProperty(screen, 'colorDepth', { get: () => 24 });
            Object.defineProperty(screen, 'pixelDepth', { get: () => 24 });
            
            // Spoof Chrome specific properties
            window.chrome = {
                app: {
                    isInstalled: false,
                },
                webstore: {
                    onInstallStageChanged: {},
                    onDownloadProgress: {},
                },
                runtime: {
                    PlatformOs: {
                        MAC: 'mac',
                        WIN: 'win',
                        ANDROID: 'android',
                        CROS: 'cros',
                        LINUX: 'linux',
                        OPENBSD: 'openbsd',
                    },
                    PlatformArch: {
                        ARM: 'arm',
                        X86_32: 'x86-32',
                        X86_64: 'x86-64',
                    },
                    PlatformNaclArch: {
                        ARM: 'arm',
                        X86_32: 'x86-32',
                        X86_64: 'x86-64',
                    },
                    RequestUpdateCheckStatus: {
                        THROTTLED: 'throttled',
                        NO_UPDATE: 'no_update',
                        UPDATE_AVAILABLE: 'update_available',
                    },
                    OnInstalledReason: {
                        INSTALL: 'install',
                        UPDATE: 'update',
                        CHROME_UPDATE: 'chrome_update',
                        SHARED_MODULE_UPDATE: 'shared_module_update',
                    },
                    OnRestartRequiredReason: {
                        APP_UPDATE: 'app_update',
                        OS_UPDATE: 'os_update',
                        PERIODIC: 'periodic',
                    },
                },
            };
        '''
    })
    
    # Add random delay to simulate human behavior
    time.sleep(random.uniform(0.5, 2.0))
    
    return driver

def handle_cookie_consent(driver):
    """Handle cookie consent dialog if present"""
    logger.info("Looking for cookie consent dialog...")
    try:
        # Wait for cookie dialog to appear (max 1 second)
        time.sleep(1)
        
        # Try multiple selector approaches to find accept button
        accept_buttons = driver.find_elements(By.XPATH, "//button[contains(., 'accept') or contains(., 'Accept') or .//span[contains(., 'accept') or contains(., 'Accept')]]")
        
        if not accept_buttons:
            accept_buttons = driver.find_elements(By.CSS_SELECTOR, "button[id*='consent' i], button[class*='consent' i]")
        
        if accept_buttons:
            logger.info("Cookie consent dialog found, clicking accept...")
            accept_buttons[0].click()
            time.sleep(0.5)  # Brief pause after clicking
        else:
            logger.info("No cookie consent dialog detected")
            
    except Exception as e:
        logger.error(f"Error handling cookie dialog: {e}")

def wait_for_page_load(driver, max_wait=10):
    """Wait for page to load - simplified and faster version"""
    logger.info("Waiting for page to load...")
    
    # First wait for document.readyState to be complete
    try:
        WebDriverWait(driver, max_wait).until(
            lambda d: d.execute_script("return document.readyState") == "complete"
        )
        logger.info("Page reached 'complete' state")
    except Exception as e:
        logger.warning(f"Page took too long to reach complete state: {e}")
    
    # Single scroll to trigger any lazy-loading elements
    driver.execute_script("window.scrollBy(0, 300);")
    
    # Brief pause for any final AJAX content
    time.sleep(1.5)
    
    # Check if jQuery is active (if present)
    jquery_ready = driver.execute_script("""
        return (typeof jQuery === 'undefined') || 
               (jQuery.active === 0 && jQuery.ready.state === 'complete');
    """)
    
    if not jquery_ready:
        logger.info("Waiting extra time for jQuery requests to complete")
        time.sleep(1)
    
    logger.info("Page load wait completed")

def click_lens_button(driver):
    """Find and click the Google Lens button using multiple strategies"""
    logger.info("Looking for Google Lens button...")
    
    # Try different selector strategies (in order of preference)
    selectors = [
        # Primary selector based on data-attribute
        "[data-base-lens-url='https://lens.google.com']",
        # Alternative selectors for Google Lens button
        "a[href*='lens.google.com']",
        "button[data-ved][jsname]",  # Google's button pattern
        "[data-tooltip*='Lens']",
        "[aria-label*='Lens']",
        "[title*='Lens']",
        "div[data-hveid] a[href*='lens']",
        # More generic patterns
        "a[href*='/search'][href*='tbm=isch']",  # Image search patterns
        "[data-ved*='CAE'] a",  # Common Google link pattern
    ]
    
    for selector in selectors:
        try:
            logger.info(f"Trying selector: {selector}")
            wait = WebDriverWait(driver, 5)
            lens_button = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, selector)))
            
            # Move mouse to button before clicking (more human-like)
            action = ActionChains(driver)
            action.move_to_element(lens_button).pause(0.3).perform()
            
            logger.info("Found Google Lens button, clicking...")
            lens_button.click()
            time.sleep(1)
            return True
        except Exception as e:
            logger.debug(f"Selector {selector} failed: {e}")
    
    # Try JavaScript-based search for Lens button
    try:
        logger.info("Trying JavaScript approach to find Lens button...")
        lens_buttons = driver.execute_script("""
            function findLensButton() {
                // Look for elements containing "lens" or similar
                let buttons = [];
                
                // Search all clickable elements
                document.querySelectorAll('a, button, [role="button"], [onclick]').forEach(el => {
                    let text = (el.textContent || '').toLowerCase();
                    let href = (el.href || '').toLowerCase();
                    let title = (el.title || '').toLowerCase();
                    let ariaLabel = (el.getAttribute('aria-label') || '').toLowerCase();
                    
                    if (text.includes('lens') || 
                        href.includes('lens') || 
                        title.includes('lens') || 
                        ariaLabel.includes('lens')) {
                        buttons.push(el);
                    }
                });
                
                return buttons;
            }
            
            return findLensButton();
        """)
        
        if lens_buttons and len(lens_buttons) > 0:
            logger.info(f"Found {len(lens_buttons)} potential Lens buttons via JavaScript")
            for button in lens_buttons:
                try:
                    # Try clicking each button
                    action = ActionChains(driver)
                    action.move_to_element(button).pause(0.2).perform()
                    button.click()
                    time.sleep(2)
                    
                    # Check if we're now on a Lens page or similar
                    current_url = driver.current_url
                    if 'lens' in current_url.lower():
                        logger.info("Successfully navigated to Lens via JavaScript button")
                        return True
                        
                except Exception as e:
                    logger.debug(f"JavaScript button click failed: {e}")
                    continue
                    
    except Exception as e:
        logger.error(f"JavaScript approach failed: {e}")
    
    # Last resort: try to navigate directly to Google Lens
    try:
        logger.info("Trying direct navigation to Google Lens...")
        driver.get("https://lens.google.com/")
        time.sleep(3)
        
        if 'lens.google.com' in driver.current_url:
            logger.info("Successfully navigated directly to Google Lens")
            return True
            
    except Exception as e:
        logger.error(f"Direct navigation failed: {e}")
    
    # If we get here, all selectors failed
    logger.error("Could not find Google Lens button")
    return False

def find_and_click_import_option(driver):
    """Find and click the import option in Google Lens"""
    logger.info("Looking for import option...")
    
    # Wait a moment for Lens page to load
    time.sleep(2)
    
    # Different selectors for the import button/link, ordered by specificity
    import_selectors = [  
        "//span[contains(text(), 'file')]",        # English  
        "//span[contains(text(), 'fichier')]",     # French  
        "//span[contains(text(), 'Datei')]",       # German  
        "//span[contains(text(), 'archivo')]",     # Spanish  
        "//span[contains(text(), 'ficheiro')]",    # Portuguese  
        "//span[contains(text(), 'bestand')]",     # Dutch
        "//span[contains(text(), 'αρχείο')]",      # Greek
        "//span[contains(text(), 'upload')]",      # Upload variations
        "//span[contains(text(), 'Upload')]",
        "//button[contains(., 'upload')]",
        "//button[contains(., 'Upload')]",
        "[data-tooltip*='upload']",
        "[aria-label*='upload']",
        "input[type='file']",                       # Direct file input
        "[accept*='image']",                        # Image file inputs
    ]
    
    # Try each selector
    for selector in import_selectors:
        try:
            logger.info(f"Trying import selector: {selector}")
            is_xpath = selector.startswith("//")
            by_method = By.XPATH if is_xpath else By.CSS_SELECTOR
            
            # If this is potentially a file input, it might be hidden
            if "input[type='file']" in selector or "[accept" in selector:
                try:
                    # Find even if not visible
                    import_element = driver.find_element(by_method, selector)
                    logger.info("Found file input element")
                    return import_element
                except Exception as e:
                    logger.debug(f"No direct file input found: {e}")
                    continue
                
            # For visible elements
            try:
                wait = WebDriverWait(driver, 3)  # Shorter timeout for faster checking
                import_element = wait.until(EC.element_to_be_clickable((by_method, selector)))
                
                logger.info(f"Found import button: '{import_element.text}', clicking...")
                
                # Move mouse to button before clicking (more human-like)
                action = ActionChains(driver)
                action.move_to_element(import_element).pause(0.2).perform()
                import_element.click()
                
                # Wait for file dialog to appear
                time.sleep(1)
                
                # Try to find the file input that might appear after clicking
                try:
                    file_input = driver.find_element(By.CSS_SELECTOR, "input[type='file']")
                    logger.info("Found file input after clicking button")
                    return file_input
                except:
                    # Return the clicked element
                    logger.info("No file input found after click, returning clicked element")
                    return import_element
            
            except Exception as e:
                logger.debug(f"Selector {selector} not clickable: {e}")
                continue
                
        except Exception as e:
            logger.debug(f"Import selector {selector} failed: {e}")
    
    # Special handling for last resort - try JavaScript click on any button with "import" or "file" text
    try:
        logger.info("Trying JavaScript approach to find import button...")
        buttons = driver.execute_script("""
            function containsFileOrImport(text) {
                if (!text) return false;
                text = text.toLowerCase();
                return text.includes('file') || 
                       text.includes('fichier') || 
                       text.includes('import') || 
                       text.includes('upload') ||
                       text.includes('datei') ||
                       text.includes('archivo') ||
                       text.includes('bestand');
            }
            
            // Find all potential buttons
            let potentialButtons = [];
            document.querySelectorAll('[role="button"], button, span, div[tabindex], a').forEach(el => {
                if (containsFileOrImport(el.textContent) || 
                    containsFileOrImport(el.getAttribute('aria-label')) ||
                    containsFileOrImport(el.getAttribute('title'))) {
                    potentialButtons.push(el);
                }
            });
            
            return potentialButtons;
        """)
        
        if buttons and len(buttons) > 0:
            logger.info(f"Found {len(buttons)} potential import buttons via JavaScript")
            # Try clicking the first one
            action = ActionChains(driver)
            action.move_to_element(buttons[0]).pause(0.2).perform()
            buttons[0].click()
            time.sleep(1)
            
            # Try to find file input after click
            try:
                file_input = driver.find_element(By.CSS_SELECTOR, "input[type='file']")
                return file_input
            except:
                return buttons[0]
    
    except Exception as e:
        logger.error(f"JavaScript approach failed: {e}")
    
    logger.error("Could not find import option")
    return None

def upload_image(driver, file_element, image_path):
    """Upload an image file using the provided element"""
    if file_element is None:
        logger.error("No file input element found")
        return False
        
    try:
        # Get absolute path to image
        abs_image_path = os.path.abspath(image_path)
        logger.info(f"Uploading image: {abs_image_path}")
        
        # If it's an input element, use send_keys
        if file_element.tag_name.lower() == 'input' and file_element.get_attribute('type') == 'file':
            file_element.send_keys(abs_image_path)
            logger.info("File upload initiated")
            return True
            
        # Otherwise try to trigger the file dialog and look for input
        else:
            logger.info("Element is not a file input, trying to find one after clicking")
            file_element.click()
            time.sleep(1)
            
            try:
                file_input = driver.find_element(By.CSS_SELECTOR, "input[type='file']")
                file_input.send_keys(abs_image_path)
                logger.info("File upload initiated after click")
                return True
            except Exception as e:
                logger.error(f"Failed to find file input after click: {e}")
                return False
                
    except Exception as e:
        logger.error(f"Error uploading image: {e}")
        return False
        
def extract_links_and_descriptions(driver, csv_path):
    """Extract all non-Google links and their descriptions from the page"""
    logger.info("Extracting links and descriptions...")
    
    # Use a raw string for the JavaScript to avoid Python escape sequence warnings
    links_with_desc = driver.execute_script(r"""
        let results = [];
        
        // Get all <a> tags on the page
        let elements = document.getElementsByTagName('a');
        for (let i = 0; i < elements.length; i++) {
            let link = elements[i];
            let href = link.getAttribute('href');
            
            if (href && href.startsWith('http')) {
                let description = '';
                
                // Try to get text directly from the link
                if (link.textContent && link.textContent.trim()) {
                    description = link.textContent.trim();
                }
                // Or from parent element if link has no text
                else if (link.parentElement && link.parentElement.textContent) {
                    description = link.parentElement.textContent.trim();
                }
                
                results.push({
                    url: href,
                    description: description
                });
            }
        }
        
        // Get links from elements that might be clickable but not <a> tags
        elements = document.querySelectorAll('[onclick], [data-url]');
        for (let i = 0; i < elements.length; i++) {
            let el = elements[i];
            let href = null;
            
            // Check onclick attribute
            if (el.hasAttribute('onclick')) {
                let onclick = el.getAttribute('onclick');
                if (onclick && onclick.includes('http')) {
                    let match = onclick.match(/(https?:\/\/[^'"\s]+)/g);
                    if (match) href = match[0];
                }
            }
            
            // Check data-url attribute
            if (!href && el.hasAttribute('data-url')) {
                let dataUrl = el.getAttribute('data-url');
                if (dataUrl && dataUrl.startsWith('http')) {
                    href = dataUrl;
                }
            }
            
            if (href) {
                // Get text from the element
                let description = el.textContent ? el.textContent.trim() : '';
                results.push({
                    url: href,
                    description: description
                });
            }
        }
        
        return results;
    """)
    
    # Filter out Google domains
    filtered_results = [
        item for item in links_with_desc 
        if not any(domain in item['url'] for domain in [
            'google.com', 'gstatic.com', 'googleapis.com', 'chrome.com',
            'google.co', 'googleusercontent.com'
        ])
    ]
    
    logger.info(f"Found {len(filtered_results)} unique external links")
    
    # Write results to CSV
    with open(csv_path, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow(['URL', 'Description'])  # Header with both columns
        for item in filtered_results:
            writer.writerow([item['url'], item['description']])
    
    logger.info(f"All links saved to {csv_path}")
    return filtered_results

def run_google_lens_search(image_path, csv_path):
    """Run a Google Lens search with the provided image and save results to CSV"""
    max_retries = 3
    retry_count = 0
    
    while retry_count < max_retries:
        driver = None
        try:
            logger.info(f"Attempt {retry_count + 1}/{max_retries} to run Google Lens search")
            driver = setup_anti_detection_driver()
            
            # Add random delay between actions to appear more human-like
            def human_delay():
                time.sleep(random.uniform(1.0, 3.0))
            
            # Start at Google.com
            url = "https://www.google.com"
            logger.info(f"Opening {url}...")
            driver.get(url)
            human_delay()
            
            # Handle cookie consent dialog
            handle_cookie_consent(driver)
            human_delay()
            
            # Wait for page to load completely
            wait_for_page_load(driver)
            
            # Try direct lens approach first
            try:
                logger.info("Trying direct navigation to Google Lens...")
                driver.get("https://lens.google.com/")
                human_delay()
                wait_for_page_load(driver)
            except Exception as e:
                logger.warning(f"Direct navigation failed: {e}, trying alternative method")
                # If direct navigation fails, go back to Google.com and try the button
                driver.get(url)
                human_delay()
                wait_for_page_load(driver)
                
                # Click on Google Lens button
                if not click_lens_button(driver):
                    logger.error("Failed to access Google Lens - trying alternative URL")
                    # Try another alternative URL
                    driver.get("https://www.google.com/imghp")
                    human_delay()
                    wait_for_page_load(driver)
                    
                    # Look for camera icon on Google Images
                    try:
                        camera_icon = driver.find_element(By.CSS_SELECTOR, "[aria-label*='camera' i], [title*='camera' i], [aria-label*='search by image' i]")
                        camera_icon.click()
                        human_delay()
                    except Exception as e:
                        logger.error(f"Failed to find camera icon: {e}")
                        raise
            
            # Wait for Google Lens interface to load
            wait_for_page_load(driver)
            human_delay()
            
            # Find and click import option
            file_input = find_and_click_import_option(driver)
            
            # Upload image file
            if not upload_image(driver, file_input, image_path):
                logger.error("Failed to upload image - aborting")
                retry_count += 1
                continue
            
            # Wait for search results to load with progressive waiting
            logger.info("Waiting for search results...")
            for i in range(3):  # Try multiple wait times
                time.sleep(3 + i*2)  # Increase wait time with each iteration
                wait_for_page_load(driver)
                
                # Check if we have any results
                links = driver.find_elements(By.TAG_NAME, "a")
                if len(links) > 10:  # Arbitrary threshold to determine if results loaded
                    logger.info(f"Found {len(links)} links, results appear to be loaded")
                    break
                logger.info(f"Only found {len(links)} links, waiting longer...")
            
            # Extract all links and descriptions
            results = extract_links_and_descriptions(driver, csv_path)
            
            # Verify we got some results
            if results and len(results) > 0:
                logger.info(f"Successfully extracted {len(results)} results")
                return True
            else:
                logger.warning("No results extracted, may need to retry")
                retry_count += 1
                continue
        
        except Exception as e:
            logger.error(f"Error in Google Lens search attempt {retry_count + 1}: {e}")
            retry_count += 1
            # Take screenshot of error state if possible
            try:
                if driver:
                    error_screenshot_path = f"{os.path.dirname(csv_path)}/error_screenshot_{retry_count}.png"
                    driver.save_screenshot(error_screenshot_path)
                    logger.info(f"Error screenshot saved to {error_screenshot_path}")
            except:
                pass
        finally:
            # Always close the driver
            if driver:
                logger.info("Closing browser...")
                try:
                    driver.quit()
                except:
                    pass
    
    # If we've exhausted all retries
    logger.error(f"Failed to complete Google Lens search after {max_retries} attempts")
    return False

# Module can be run independently
if __name__ == "__main__":
    # Setup basic logging for standalone use
    logging.basicConfig(level=logging.INFO, 
                       format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    
    # Create argument parser
    parser = argparse.ArgumentParser(description="Run Google Lens image search")
    parser.add_argument("--image", "-i", required=True, help="Path to image file")
    parser.add_argument("--output", "-o", help="Output CSV file path")
    
    # Parse arguments
    args = parser.parse_args()
    
    # Create output path if not provided
    if not args.output:
        # Make sure directory exists
        os.makedirs(Config.CSV_DIR, exist_ok=True)
        # Create output path
        args.output = f"{Config.CSV_DIR}/results_{os.path.basename(args.image)}.csv"
    
    # Run search
    logger.info(f"Running Google Lens search on {args.image}")
    success = run_google_lens_search(args.image, args.output)
    
    if success:
        logger.info(f"Success! Results saved to {args.output}")
    else:
        logger.error("Search failed")
        sys.exit(1)