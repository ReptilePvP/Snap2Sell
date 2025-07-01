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
    """Create a Chrome driver with comprehensive anti-detection measures"""
    options = webdriver.ChromeOptions()
    
    # Randomize user agent from a list of modern browsers
    user_agents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 Edg/123.0.0.0',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    ]
    user_agent = random.choice(user_agents)
    options.add_argument(f'user-agent={user_agent}')
    logger.info(f"Using user agent: {user_agent[:50]}...")
    
    # Enhanced anti-detection settings
    options.add_argument('--disable-blink-features=AutomationControlled')
    options.add_experimental_option('excludeSwitches', ['enable-automation'])
    options.add_experimental_option('useAutomationExtension', False)
    
    # Add window size randomization for more human-like behavior
    window_sizes = [(1366, 768), (1440, 900), (1536, 864), (1920, 1080), (1600, 900)]
    window_size = random.choice(window_sizes)
    options.add_argument(f'--window-size={window_size[0]},{window_size[1]}')
    
    # Additional stability and anti-detection options
    options.add_argument('--disable-extensions')
    options.add_argument('--disable-notifications')
    options.add_argument('--disable-popup-blocking')
    options.add_argument('--disable-infobars')
    options.add_argument('--disable-save-password-bubble')
    options.add_argument('--disable-translate')
    options.add_argument('--disable-features=VizDisplayCompositor')
    options.add_argument('--disable-features=TranslateUI')
    options.add_argument('--disable-ipc-flooding-protection')
    options.add_argument('--disable-hang-monitor')
    options.add_argument('--disable-client-side-phishing-detection')
    options.add_argument('--disable-sync')
    options.add_argument('--disable-web-security')
    options.add_argument('--allow-running-insecure-content')
    options.add_argument('--no-first-run')
    options.add_argument('--disable-default-apps')
    options.add_argument('--disable-background-timer-throttling')
    options.add_argument('--disable-backgrounding-occluded-windows')
    options.add_argument('--disable-renderer-backgrounding')
    
    # Required for running in containers
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    
    # Headless mode configuration
    if Config.HEADLESS_MODE:
        options.add_argument('--headless=new')
    
    # Set page load strategy for better performance
    options.page_load_strategy = 'eager'
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
        # Alternative data attributes
        "[data-ved*='lens']",
        "[data-name='lens']",
        # Button/div with lens in data attributes
        "[data-*='lens']",
        # Camera/lens icon buttons
        "div[role='button'][aria-label*='lens']",
        "div[role='button'][aria-label*='Lens']", 
        "div[role='button'][aria-label*='camera']",
        "div[role='button'][aria-label*='Camera']",
        # Specific lens button patterns
        "div[jsaction*='lens']",
        "div[data-ved][jsaction*='click']",
        # Camera icon SVG containers
        "div[role='button'] svg[viewBox*='0 0 24 24']",
        # Text-based fallbacks
        "div[role='button']:contains('lens')",
        "div[role='button']:contains('Lens')",
        # Generic button patterns near search box
        "div.nDcEnd div[role='button']",
        "div[class*='camera'] div[role='button']",
        # Last resort - any clickable element with lens attributes
        "*[data-*='lens'][role='button']",
        "*[aria-label*='lens']",
        "*[title*='lens']",
        "*[title*='Lens']"
    ]
    
    for selector in selectors:
        try:
            logger.info(f"Trying selector: {selector}")
            wait = WebDriverWait(driver, 3)  # Shorter timeout for faster checking
            
            # Special handling for :contains() selectors
            if ':contains(' in selector:
                elements = driver.execute_script(f"""
                    return Array.from(document.querySelectorAll('div[role="button"]')).filter(el => 
                        el.textContent && el.textContent.toLowerCase().includes('lens')
                    );
                """)
                if elements and len(elements) > 0:
                    lens_button = elements[0]
                else:
                    continue
            else:
                lens_button = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, selector)))
            
            # Move mouse to button before clicking (more human-like)
            action = ActionChains(driver)
            action.move_to_element(lens_button).pause(0.3).perform()
            
            logger.info(f"Found Google Lens button with selector '{selector}', clicking...")
            lens_button.click()
            time.sleep(2)  # Wait longer for lens interface to load
            return True
        except Exception as e:
            logger.debug(f"Selector {selector} failed: {e}")
    
    # JavaScript-based fallback approach
    try:
        logger.info("Trying JavaScript-based approach to find lens button...")
        lens_button = driver.execute_script("""
            // Look for buttons with lens-related attributes or content
            function findLensButton() {
                const selectors = [
                    'div[role="button"][data-base-lens-url]',
                    'div[role="button"][data-ved*="lens"]',
                    'div[role="button"][aria-label*="lens"]',
                    'div[role="button"][aria-label*="Lens"]',
                    'div[role="button"][aria-label*="camera"]',
                    'div[role="button"][aria-label*="Camera"]',
                    'div[jsaction*="lens"]',
                    'div[data-ved][jsaction*="click"]'
                ];
                
                for (let selector of selectors) {
                    const elements = document.querySelectorAll(selector);
                    if (elements.length > 0) {
                        return elements[0];
                    }
                }
                
                // Look for camera/lens icons in SVG
                const svgButtons = document.querySelectorAll('div[role="button"] svg');
                for (let svg of svgButtons) {
                    const paths = svg.querySelectorAll('path');
                    for (let path of paths) {
                        // Check if path looks like camera/lens icon (common patterns)
                        const d = path.getAttribute('d');
                        if (d && (d.includes('M9 2') || d.includes('M12 2') || d.includes('circle'))) {
                            return svg.closest('div[role="button"]');
                        }
                    }
                }
                
                // Look for buttons containing text about lens/camera
                const allButtons = document.querySelectorAll('div[role="button"]');
                for (let btn of allButtons) {
                    const text = btn.textContent || '';
                    if (text.toLowerCase().includes('lens') || 
                        text.toLowerCase().includes('camera') ||
                        btn.querySelector('svg')) {
                        return btn;
                    }
                }
                
                return null;
            }
            
            return findLensButton();
        """)
        
        if lens_button:
            logger.info("Found lens button via JavaScript, clicking...")
            action = ActionChains(driver)
            action.move_to_element(lens_button).pause(0.3).perform()
            lens_button.click()
            time.sleep(2)
            return True
    except Exception as e:
        logger.debug(f"JavaScript approach failed: {e}")
    
    # Final fallback - look for any button in the search area
    try:
        logger.info("Final fallback: looking for any button near search area...")
        search_buttons = driver.find_elements(By.CSS_SELECTOR, "div[role='button']")
        if search_buttons:
            # Try the first few buttons
            for i, button in enumerate(search_buttons[:5]):
                try:
                    logger.info(f"Trying button {i+1}: {button.get_attribute('aria-label') or 'No label'}")
                    action = ActionChains(driver)
                    action.move_to_element(button).pause(0.3).perform()
                    button.click()
                    time.sleep(2)
                    
                    # Check if we're now on a lens-like page
                    current_url = driver.current_url
                    if 'lens' in current_url.lower() or 'imgres' in current_url:
                        logger.info(f"Button {i+1} seems to have worked - URL changed to: {current_url}")
                        return True
                    else:
                        logger.debug(f"Button {i+1} didn't lead to lens page, trying next...")
                except Exception as e:
                    logger.debug(f"Button {i+1} failed: {e}")
                    
    except Exception as e:
        logger.debug(f"Final fallback failed: {e}")
    
    # If we get here, all selectors failed
    logger.error("Could not find Google Lens button with any strategy")
    return False

def find_and_click_import_option(driver):
    """Find and click the import option in Google Lens"""
    logger.info("Looking for import option...")
    
    # Wait a moment for Lens page to load
    time.sleep(3)
    
    # Different selectors for the import button/link, ordered by specificity
    import_selectors = [  
        # Text-based selectors in multiple languages
        "//span[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'file')]",
        "//span[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'upload')]",
        "//span[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'import')]",
        "//span[contains(text(), 'fichier')]",     # French  
        "//span[contains(text(), 'Datei')]",       # German  
        "//span[contains(text(), 'archivo')]",     # Spanish  
        "//span[contains(text(), 'ficheiro')]",    # Portuguese  
        "//span[contains(text(), 'bestand')]",     # Dutch
        "//span[contains(text(), 'αρχείο')]",      # Greek
        "//div[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'upload')]",
        "//div[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'file')]",
        # Attribute-based selectors
        "//div[@role='button' and contains(@aria-label, 'upload')]",
        "//div[@role='button' and contains(@aria-label, 'file')]",
        "//div[@role='button' and contains(@aria-label, 'import')]",
        # Input file selectors
        "input[type='file']",
        "input[accept*='image']",
        # Button patterns
        "div[role='button'][data-*='upload']",
        "div[role='button'][data-*='file']",
        "button[type='button']:contains('upload')",
        "button[type='button']:contains('file')",
    ]
    
    # Try each selector
    for selector in import_selectors:
        try:
            logger.info(f"Trying import selector: {selector}")
            is_xpath = selector.startswith("//")
            by_method = By.XPATH if is_xpath else By.CSS_SELECTOR
                
            # For visible elements
            try:
                wait = WebDriverWait(driver, 2)  # Shorter timeout for faster checking
                import_element = wait.until(EC.element_to_be_clickable((by_method, selector)))
                
                logger.info(f"Found import button: '{import_element.text[:50]}...', clicking...")
                
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
    
    # Enhanced JavaScript approach with multiple strategies
    try:
        logger.info("Trying enhanced JavaScript approach to find import button...")
        buttons = driver.execute_script("""
            function findImportElements() {
                const keywords = ['file', 'upload', 'import', 'fichier', 'datei', 'archivo'];
                const elements = [];
                
                // Strategy 1: Look for text content
                document.querySelectorAll('span, div, button').forEach(el => {
                    const text = (el.textContent || '').toLowerCase();
                    if (keywords.some(keyword => text.includes(keyword))) {
                        elements.push(el);
                    }
                });
                
                // Strategy 2: Look for aria-labels
                document.querySelectorAll('[aria-label]').forEach(el => {
                    const label = (el.getAttribute('aria-label') || '').toLowerCase();
                    if (keywords.some(keyword => label.includes(keyword))) {
                        elements.push(el);
                    }
                });
                
                // Strategy 3: Look for file inputs
                document.querySelectorAll('input[type="file"]').forEach(el => {
                    elements.push(el);
                });
                
                // Strategy 4: Look for buttons with upload-related data attributes
                document.querySelectorAll('[role="button"]').forEach(el => {
                    const attrs = Array.from(el.attributes);
                    if (attrs.some(attr => 
                        attr.name.includes('upload') || 
                        attr.name.includes('file') ||
                        attr.value.includes('upload') ||
                        attr.value.includes('file')
                    )) {
                        elements.push(el);
                    }
                });
                
                // Remove duplicates and return
                return [...new Set(elements)];
            }
            
            return findImportElements();
        """)
        
        if buttons and len(buttons) > 0:
            logger.info(f"Found {len(buttons)} potential import elements via JavaScript")
            
            # Try clicking each potential element
            for i, button in enumerate(buttons[:3]):  # Try first 3 to avoid infinite loops
                try:
                    logger.info(f"Trying JavaScript-found element {i+1}")
                    action = ActionChains(driver)
                    action.move_to_element(button).pause(0.2).perform()
                    button.click()
                    time.sleep(1)
                    
                    # Try to find file input after click
                    try:
                        file_input = driver.find_element(By.CSS_SELECTOR, "input[type='file']")
                        logger.info(f"Success! Element {i+1} opened file dialog")
                        return file_input
                    except:
                        logger.debug(f"Element {i+1} didn't open file dialog, trying next...")
                        continue
                        
                except Exception as e:
                    logger.debug(f"JavaScript element {i+1} failed: {e}")
                    continue
    
    except Exception as e:
        logger.error(f"JavaScript approach failed: {e}")
    
    # Final fallback - look for any clickable element that might be related to file upload
    try:
        logger.info("Final fallback: looking for any potential upload elements...")
        
        # Look for common upload patterns
        upload_patterns = [
            "div[role='button']",
            "button",
            "span[role='button']",
            "div[tabindex='0']"
        ]
        
        for pattern in upload_patterns:
            elements = driver.find_elements(By.CSS_SELECTOR, pattern)
            for element in elements[:5]:  # Try first 5 of each pattern
                try:
                    # Check if element text or attributes suggest it's for file upload
                    text = (element.text or '').lower()
                    aria_label = (element.get_attribute('aria-label') or '').lower()
                    
                    if any(keyword in text + ' ' + aria_label for keyword in 
                           ['file', 'upload', 'import', 'browse', 'choose', 'select']):
                        logger.info(f"Trying potential upload element: '{text[:30]}...'")
                        action = ActionChains(driver)
                        action.move_to_element(element).pause(0.2).perform()
                        element.click()
                        time.sleep(1)
                        
                        # Check if file input appeared
                        try:
                            file_input = driver.find_element(By.CSS_SELECTOR, "input[type='file']")
                            logger.info("Success! File dialog opened")
                            return file_input
                        except:
                            continue
                            
                except Exception as e:
                    logger.debug(f"Upload element failed: {e}")
                    continue
    
    except Exception as e:
        logger.debug(f"Final upload fallback failed: {e}")
    
    logger.error("Could not find import option with any strategy")
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
    driver = setup_anti_detection_driver()
    
    try:
        # Start at Google.com
        url = "https://www.google.com"
        logger.info(f"Opening {url}...")
        driver.get(url)
        
        # Handle cookie consent dialog
        handle_cookie_consent(driver)
        
        # Set window size
        driver.set_window_size(1366, 768)
        
        # Wait for page to load completely
        wait_for_page_load(driver)
        
        # Click on Google Lens button
        if not click_lens_button(driver):
            logger.error("Failed to access Google Lens - aborting")
            return False
            
        # Wait for Google Lens interface to load
        wait_for_page_load(driver)
        
        # Find and click import option
        file_input = find_and_click_import_option(driver)
        
        # Upload image file
        if not upload_image(driver, file_input, image_path):
            logger.error("Failed to upload image - aborting")
            return False
        
        # Wait for search results to load
        logger.info("Waiting for search results...")
        time.sleep(5)  # Initial wait
        wait_for_page_load(driver)
        
        # Extract all links and descriptions
        extract_links_and_descriptions(driver, csv_path)
        return True
        
    except Exception as e:
        logger.error(f"Error in Google Lens search: {e}")
        return False
    finally:
        # Always close the driver
        logger.info("Closing browser...")
        driver.quit()

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