import { useState } from 'react';
import { debugConnection, logEnvironmentStatus } from '../utils/connectionDebug';

const TroubleshootingPage = () => {
  const [debugResults, setDebugResults] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostics = async () => {
    setIsRunning(true);
    try {
      const results = await debugConnection();
      setDebugResults(results);
    } catch (error) {
      console.error('Error running diagnostics:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const checkEnvironment = () => {
    logEnvironmentStatus();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Connection Troubleshooting
          </h1>
          
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Quick Diagnostics
              </h2>
              <div className="flex gap-3">
                <button
                  onClick={runDiagnostics}
                  disabled={isRunning}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isRunning ? 'Running...' : 'Run Connection Test'}
                </button>
                <button
                  onClick={checkEnvironment}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Check Environment
                </button>
              </div>
            </div>

            {/* Common Issues */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Common Issues & Solutions
              </h2>
              <div className="space-y-4">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-3">
                  <h3 className="font-medium text-yellow-800 dark:text-yellow-200">Slow Authentication</h3>
                  <ul className="mt-2 text-sm text-yellow-700 dark:text-yellow-300 list-disc list-inside">
                    <li>Check your internet connection</li>
                    <li>Verify Supabase environment variables are set correctly</li>
                    <li>Clear browser cache and cookies</li>
                    <li>Try refreshing the page</li>
                  </ul>
                </div>
                
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
                  <h3 className="font-medium text-red-800 dark:text-red-200">Authentication Timeout</h3>
                  <ul className="mt-2 text-sm text-red-700 dark:text-red-300 list-disc list-inside">
                    <li>Check if VITE_SUPABASE_URL is correctly set</li>
                    <li>Verify VITE_SUPABASE_ANON_KEY is valid</li>
                    <li>Ensure Supabase project is active and accessible</li>
                    <li>Check network connectivity</li>
                  </ul>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3">
                  <h3 className="font-medium text-blue-800 dark:text-blue-200">Environment Setup</h3>
                  <ul className="mt-2 text-sm text-blue-700 dark:text-blue-300 list-disc list-inside">
                    <li>Create a <code>.env</code> file in your project root</li>
                    <li>Copy values from <code>.env.example</code></li>
                    <li>Restart the development server after adding environment variables</li>
                    <li>Check browser developer console for specific error messages</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Debug Results */}
            {debugResults && (
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Debug Results
                </h2>
                <div className="bg-gray-100 dark:bg-gray-900 rounded-md p-3 overflow-auto">
                  <pre className="text-sm text-gray-800 dark:text-gray-200">
                    {JSON.stringify(debugResults, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Manual Steps
              </h2>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>Open browser developer tools (F12)</li>
                <li>Go to Console tab</li>
                <li>Look for error messages in red</li>
                <li>Check Network tab for failed requests</li>
                <li>Verify environment variables are loaded correctly</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TroubleshootingPage;
