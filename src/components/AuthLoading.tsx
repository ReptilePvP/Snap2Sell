import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';

interface AuthLoadingProps {
  onTroubleshooting?: () => void;
}

const AuthLoading: React.FC<AuthLoadingProps> = ({ onTroubleshooting }) => {
  const [message, setMessage] = useState('Initializing authentication...');
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const messages = [
      'Initializing authentication...',
      'Connecting to Supabase...',
      'Loading your profile...',
      'Almost ready...',
    ];

    const intervals: NodeJS.Timeout[] = [];

    // Update messages progressively
    messages.forEach((msg, index) => {
      const timeout = setTimeout(() => {
        setMessage(msg);
      }, index * 2000);
      intervals.push(timeout);
    });

    // Show troubleshooting after 8 seconds
    const troubleshootingTimeout = setTimeout(() => {
      setShowTroubleshooting(true);
    }, 8000);
    intervals.push(troubleshootingTimeout);

    return () => {
      intervals.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center p-8 max-w-md">
        <div className="mb-6">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Loading Snap2Sell
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {message}
          </p>
        </div>

        {showTroubleshooting && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-left">
            <h3 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
              Taking longer than usual?
            </h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
              This might be due to a slow connection or configuration issue.
            </p>
            <div className="space-y-2">
              <button
                onClick={() => window.location.reload()}
                className="w-full px-3 py-2 text-sm bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
              >
                Refresh Page
              </button>
              {onTroubleshooting ? (
                <button
                  onClick={onTroubleshooting}
                  className="w-full px-3 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Troubleshooting Guide
                </button>
              ) : (
                <button
                  onClick={() => navigate('/troubleshooting')}
                  className="w-full px-3 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Troubleshooting Guide
                </button>
              )}
            </div>
          </div>
        )}

        <div className="mt-6 text-xs text-gray-500 dark:text-gray-500">
          <p>Check the console (F12) for detailed information</p>
        </div>
      </div>
    </div>
  );
};

export default AuthLoading;
