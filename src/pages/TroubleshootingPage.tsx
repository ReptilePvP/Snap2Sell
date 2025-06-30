import React, { useState, useEffect } from 'react';
import { testOpenLensConnection, testOpenLensWithImage, getTestImage } from '../utils/openLensDebug';
import { getOpenLensUrl, isOpenLensConfigured } from '../utils/providerAvailability';
import Layout from '../components/Layout';

const TroubleshootingPage: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<any>(null);
  const [imageTestStatus, setImageTestStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isImageTesting, setIsImageTesting] = useState(false);
  const [envVariables, setEnvVariables] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Check environment variables
    const env = {
      'VITE_SUPABASE_URL': !!(import.meta as any).env?.VITE_SUPABASE_URL,
      'VITE_SUPABASE_ANON_KEY': !!(import.meta as any).env?.VITE_SUPABASE_ANON_KEY,
      'VITE_GEMINI_API_KEY': !!(import.meta as any).env?.VITE_GEMINI_API_KEY,
      'VITE_SERPAPI_API_KEY': !!(import.meta as any).env?.VITE_SERPAPI_API_KEY,
      'VITE_SEARCHAPI_API_KEY': !!(import.meta as any).env?.VITE_SEARCHAPI_API_KEY,
      'VITE_OPENLENS_API_URL': !!(import.meta as any).env?.VITE_OPENLENS_API_URL,
    };
    setEnvVariables(env);
  }, []);

  const handleTestConnection = async () => {
    setIsLoading(true);
    try {
      const result = await testOpenLensConnection();
      setConnectionStatus(result);
    } catch (error) {
      setConnectionStatus({
        success: false,
        errorMessage: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestImageAnalysis = async () => {
    setIsImageTesting(true);
    try {
      const testImage = getTestImage();
      const result = await testOpenLensWithImage(testImage);
      setImageTestStatus(result);
    } catch (error) {
      setImageTestStatus({
        success: false,
        errorMessage: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setIsImageTesting(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">OpenLens Troubleshooting</h1>
        
        <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(envVariables).map(([key, value]) => (
              <div key={key} className="flex items-center">
                <span className="font-mono text-sm">{key}:</span>
                <span className={`ml-2 px-2 py-1 rounded text-xs ${value ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                  {value ? 'Set' : 'Not Set'}
                </span>
              </div>
            ))}
          </div>
          
          <div className="mt-4">
            <p className="text-sm">
              OpenLens API URL: <span className="font-mono">{getOpenLensUrl()}</span>
            </p>
            <p className="text-sm mt-2">
              {isOpenLensConfigured() 
                ? '✅ Using production OpenLens API URL' 
                : '⚠️ Using local development OpenLens API URL'}
            </p>
          </div>
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Connection Test</h2>
          <button
            onClick={handleTestConnection}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Testing...' : 'Test OpenLens Connection'}
          </button>
          
          {connectionStatus && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h3 className="font-semibold mb-2">Results:</h3>
              <div className="space-y-2">
                <p>
                  Status: 
                  <span className={`ml-2 px-2 py-1 rounded ${connectionStatus.success ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                    {connectionStatus.success ? 'Connected' : 'Failed'}
                  </span>
                </p>
                <p>URL: <span className="font-mono text-sm">{connectionStatus.url}</span></p>
                <p>Response Time: {connectionStatus.responseTime}ms</p>
                {connectionStatus.statusCode && <p>Status Code: {connectionStatus.statusCode}</p>}
                {connectionStatus.errorMessage && (
                  <div>
                    <p className="font-semibold text-red-600 dark:text-red-400">Error:</p>
                    <pre className="bg-gray-100 dark:bg-gray-900 p-2 rounded overflow-x-auto text-sm">
                      {connectionStatus.errorMessage}
                    </pre>
                  </div>
                )}
                {connectionStatus.responseData && (
                  <div>
                    <p className="font-semibold">Response:</p>
                    <pre className="bg-gray-100 dark:bg-gray-900 p-2 rounded overflow-x-auto text-sm">
                      {typeof connectionStatus.responseData === 'string' 
                        ? connectionStatus.responseData 
                        : JSON.stringify(connectionStatus.responseData, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Image Analysis Test</h2>
          <button
            onClick={handleTestImageAnalysis}
            disabled={isImageTesting}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isImageTesting ? 'Testing...' : 'Test Image Analysis'}
          </button>
          
          {imageTestStatus && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h3 className="font-semibold mb-2">Results:</h3>
              <div className="space-y-2">
                <p>
                  Status: 
                  <span className={`ml-2 px-2 py-1 rounded ${imageTestStatus.success ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                    {imageTestStatus.success ? 'Success' : 'Failed'}
                  </span>
                </p>
                <p>URL: <span className="font-mono text-sm">{imageTestStatus.url}/analyze</span></p>
                <p>Response Time: {imageTestStatus.responseTime}ms</p>
                {imageTestStatus.statusCode && <p>Status Code: {imageTestStatus.statusCode}</p>}
                {imageTestStatus.scraped_content_length !== undefined && (
                  <p>
                    Scraped Content Length: 
                    <span className={`ml-2 ${imageTestStatus.scraped_content_length > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {imageTestStatus.scraped_content_length} characters
                    </span>
                  </p>
                )}
                {imageTestStatus.errorMessage && (
                  <div>
                    <p className="font-semibold text-red-600 dark:text-red-400">Error:</p>
                    <pre className="bg-gray-100 dark:bg-gray-900 p-2 rounded overflow-x-auto text-sm">
                      {imageTestStatus.errorMessage}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Troubleshooting Steps</h2>
          <ol className="list-decimal pl-5 space-y-3">
            <li>
              <strong>Check OpenLens API URL:</strong> Ensure the <code>VITE_OPENLENS_API_URL</code> environment variable 
              is correctly set in your Netlify deployment settings.
            </li>
            <li>
              <strong>Verify OpenAI API Key:</strong> The OpenLens service requires a valid OpenAI API key. 
              Check that <code>OPENAI_API_KEY</code> is set in your Cloud Run service.
            </li>
            <li>
              <strong>Check Cloud Run Service:</strong> Verify that your OpenLens Cloud Run service is running 
              and accessible. Check the logs in Google Cloud Console.
            </li>
            <li>
              <strong>Google Lens Anti-Bot Measures:</strong> Google Lens may be blocking the scraper. 
              Try updating the Selenium configuration in <code>selenium_lens_scraper.py</code> with 
              additional anti-detection measures.
            </li>
            <li>
              <strong>Cloud Run Resources:</strong> Ensure your Cloud Run service has sufficient memory 
              and CPU resources to run a headless Chrome browser.
            </li>
          </ol>
        </div>
      </div>
    </Layout>
  );
};

export default TroubleshootingPage;
