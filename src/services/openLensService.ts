import { AnalysisResult, ApiProvider } from '../types';
import { formatAnalysisForDisplay } from './analysisUtils';

/**
 * OpenLens analysis service
 * Uses direct API calls to your local FastAPI OpenLens server
 * For development - bypasses Supabase edge functions
 */

interface OpenLensResponse {
  analysis: string;
  request_id: string;
  google_lens_links_found: number | string;
  scraped_content_length: number;
  csv_file: string;
  content_file: string;
}

export const analyzeImageWithOpenLens = async (
  imageUrl: string
): Promise<AnalysisResult> => {
  try {
    // Check if OpenLens is available (local development or production server)
    const openLensUrl = (import.meta as any).env?.VITE_OPENLENS_API_URL || 'http://127.0.0.1:8000';
    
    console.log('OpenLens: Converting image URL to base64...');
    
    // Convert image URL to base64
    const base64Image = await imageUrlToBase64(imageUrl);
    
    console.log(`OpenLens: Calling API server at ${openLensUrl}...`);
    
    // Call your OpenLens API server
    const response = await fetch(`${openLensUrl}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: base64Image
      })
    });

    if (!response.ok) {
      throw new Error(`OpenLens API error: ${response.status} ${response.statusText}`);
    }

    const data: OpenLensResponse = await response.json();
    console.log('OpenLens: Analysis completed successfully');

    // Parse the analysis to extract structured information
    const analysisResult = parseOpenLensAnalysis(data.analysis, data);

    // Format for display
    return formatAnalysisForDisplay({
      ...analysisResult,
      apiProvider: ApiProvider.OPENLENS,
      imageUrl,
    });
  } catch (error) {
    console.error('Error during OpenLens analysis:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred while analyzing with OpenLens.';
    throw new Error(`OpenLens API Error: ${errorMessage}`);
  }
};

/**
 * Convert image URL to base64 string
 */
async function imageUrlToBase64(imageUrl: string): Promise<string> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        // Remove the data:image/jpeg;base64, prefix
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw new Error('Failed to process image for OpenLens analysis');
  }
}

/**
 * Parse OpenLens analysis response into structured format
 */
function parseOpenLensAnalysis(analysis: string, metadata: OpenLensResponse): Omit<AnalysisResult, 'apiProvider'> {
  // Generate a unique ID
  const id = metadata.request_id || `openlens_${Date.now()}`;
  
  // Extract title and description from the analysis
  let title = 'OpenLens Analysis';
  let description = analysis;
  let aiExplanation = analysis;
  let value = 'Analysis Complete';

  // Try to parse structured analysis if it follows a pattern
  const lines = analysis.split('\n').filter(line => line.trim());
  
  // Look for title patterns like "**Image Description**:" or "1. **Image Description**:"
  const titleMatch = lines.find(line => 
    line.includes('Image Description') || 
    line.includes('Product') ||
    line.includes('Item')
  );
  
  if (titleMatch) {
    // Extract the content after the colon
    const colonIndex = titleMatch.indexOf(':');
    if (colonIndex !== -1) {
      title = titleMatch.substring(colonIndex + 1).trim()
        .replace(/^\*\*|\*\*$/g, '') // Remove markdown bold
        .substring(0, 100); // Limit length
    }
  }

  // Look for value/price information
  const priceMatch = analysis.match(/\$[\d,]+(?:\.\d{2})?|\$\d+(?:-\$\d+)?|price[:\s]*\$?[\d,]+/i);
  if (priceMatch) {
    value = priceMatch[0];
  }

  // Create a summary description (first 200 chars of analysis)
  description = analysis.length > 200 
    ? analysis.substring(0, 200) + '...'
    : analysis;

  return {
    id,
    title: title || 'OpenLens Analysis',
    description,
    value,
    aiExplanation,
    timestamp: Date.now(),
    imageUrl: undefined, // Will be set by formatAnalysisForDisplay
  };
}
