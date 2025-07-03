import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabaseClient';
import LoadingSpinner from '../../components/LoadingSpinner';

const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          navigate('/signin?error=auth_callback_failed');
          return;
        }

        if (data?.session) {
          // Successfully authenticated, redirect to home
          navigate('/');
        } else {
          // No session found, redirect to sign in
          navigate('/signin');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        navigate('/signin?error=auth_callback_failed');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <LoadingSpinner size="lg" />
        <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
          Completing Sign In
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Please wait while we complete your authentication...
        </p>
      </div>
    </div>
  );
};

export default AuthCallbackPage;
