import { supabase } from './supabaseClient';

/**
 * Debug utilities for troubleshooting Supabase Edge Function calls
 */

export const debugSupabaseConnection = async () => {
  console.log('=== Supabase Debug Information ===');
  
  // Check environment variables
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  console.log('Supabase URL:', supabaseUrl ? 'Set' : 'Missing');
  console.log('Supabase Anon Key:', supabaseAnonKey ? 'Set' : 'Missing');
  
  // Check authentication status
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log('Authentication Status:');
    console.log('- Session exists:', !!session);
    console.log('- User ID:', session?.user?.id || 'Not logged in');
    console.log('- Session error:', sessionError);
    
    if (session) {
      console.log('- Access token exists:', !!session.access_token);
      console.log('- Token expires at:', new Date(session.expires_at! * 1000));
    }
  } catch (error) {
    console.error('Error checking authentication:', error);
  }
  
  // Test basic Supabase connectivity
  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(0);
    console.log('Database connectivity test:', error ? 'Failed' : 'Success');
    if (error) console.log('Database error:', error);
  } catch (error) {
    console.error('Database connectivity error:', error);
  }
  
  console.log('=== End Debug Information ===');
};

export const testEdgeFunctionConnectivity = async (functionName: string) => {
  console.log(`=== Testing Edge Function: ${functionName} ===`);
  
  try {
    // Test with a minimal payload
    const { data, error } = await supabase.functions.invoke(functionName, {
      body: { test: true },
    });
    
    console.log(`${functionName} response:`, { data, error });
    
    if (error) {
      console.error(`${functionName} error details:`, {
        message: error.message,
        status: error.status,
        statusText: error.statusText,
      });
    }
    
    return { data, error };
  } catch (err) {
    console.error(`${functionName} connection error:`, err);
    return { data: null, error: err };
  }
};
