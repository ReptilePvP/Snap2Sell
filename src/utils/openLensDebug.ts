/**
 * OpenLens API debugging utility
 */

/**
 * Test the OpenLens API connection and return detailed diagnostics
 */
export async function testOpenLensConnection(): Promise<{
  success: boolean;
  url: string;
  statusCode?: number;
  responseTime: number;
  errorMessage?: string;
  responseData?: any;
}> {
  try {
    const openLensUrl = (import.meta as any).env?.VITE_OPENLENS_API_URL || 'http://127.0.0.1:8000';
    console.log(`Testing OpenLens connection to: ${openLensUrl}`);
    
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const startTime = Date.now();
    
    try {
      // Try to ping the OpenLens server
      const response = await fetch(`${openLensUrl}/`, {
        method: 'GET',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      const endTime = Date.now();
      
      // Get response data
      let responseData;
      try {
        responseData = await response.json();
      } catch (e) {
        responseData = await response.text();
      }
      
      return {
        success: response.ok,
        url: openLensUrl,
        statusCode: response.status,
        responseTime: endTime - startTime,
        responseData
      };
    } catch (fetchError) {
      clearTimeout(timeoutId);
      const endTime = Date.now();
      
      return {
        success: false,
        url: openLensUrl,
        responseTime: endTime - startTime,
        errorMessage: fetchError instanceof Error ? fetchError.message : String(fetchError)
      };
    }
  } catch (error) {
    return {
      success: false,
      url: 'Unknown',
      responseTime: 0,
      errorMessage: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Test the OpenLens API with a small image to diagnose issues
 */
export async function testOpenLensWithImage(imageBase64: string): Promise<{
  success: boolean;
  url: string;
  statusCode?: number;
  responseTime: number;
  errorMessage?: string;
  responseData?: any;
  scraped_content_length?: number;
}> {
  try {
    const openLensUrl = (import.meta as any).env?.VITE_OPENLENS_API_URL || 'http://127.0.0.1:8000';
    console.log(`Testing OpenLens image analysis to: ${openLensUrl}/analyze`);
    
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout for image analysis
    
    const startTime = Date.now();
    
    try {
      // Try to analyze a small image
      const response = await fetch(`${openLensUrl}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageBase64
        }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      const endTime = Date.now();
      
      // Get response data
      let responseData;
      try {
        responseData = await response.json();
      } catch (e) {
        responseData = await response.text();
      }
      
      return {
        success: response.ok,
        url: openLensUrl,
        statusCode: response.status,
        responseTime: endTime - startTime,
        responseData,
        scraped_content_length: responseData?.scraped_content_length || 0
      };
    } catch (fetchError) {
      clearTimeout(timeoutId);
      const endTime = Date.now();
      
      return {
        success: false,
        url: openLensUrl,
        responseTime: endTime - startTime,
        errorMessage: fetchError instanceof Error ? fetchError.message : String(fetchError)
      };
    }
  } catch (error) {
    return {
      success: false,
      url: 'Unknown',
      responseTime: 0,
      errorMessage: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Create a small 1x1 pixel transparent PNG image for testing
 * This minimizes data transfer while still testing the API
 */
export function getTestImage(): string {
  // This is a base64-encoded 1x1 transparent PNG
  return 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
}