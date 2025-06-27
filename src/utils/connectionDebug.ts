import { supabase } from '../services/supabaseClient';

/**
 * Utility functions for debugging connection issues
 */
export const debugConnection = async () => {
  const results = {
    timestamp: new Date().toISOString(),
    supabaseUrl: !!(import.meta as any).env.VITE_SUPABASE_URL,
    supabaseKey: !!(import.meta as any).env.VITE_SUPABASE_ANON_KEY,
    connectionTest: null as any,
    authStatus: null as any,
    profilesTable: null as any,
  };

  try {
    // Test basic connection
    console.log('🔍 Testing Supabase connection...');
    const startTime = Date.now();
    
    // Test a simple query
    const { data: connectionData, error: connectionError } = await Promise.race([
      supabase.from('profiles').select('count').limit(1),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), 5000))
    ]) as any;
    
    const endTime = Date.now();
    
    results.connectionTest = {
      success: !connectionError,
      responseTime: `${endTime - startTime}ms`,
      error: connectionError?.message,
      data: connectionData
    };

    // Test auth status
    console.log('🔍 Testing auth status...');
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    results.authStatus = {
      hasSession: !!session,
      userId: session?.user?.id,
      error: authError?.message
    };

    // Test profiles table access
    if (session?.user) {
      console.log('🔍 Testing profiles table access...');
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .limit(1);
        
      results.profilesTable = {
        accessible: !profileError,
        error: profileError?.message,
        hasProfile: !!profileData?.length
      };
    }

  } catch (error) {
    console.error('Debug connection error:', error);
    results.connectionTest = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }

  console.log('🔍 Connection Debug Results:', results);
  return results;
};

export const logEnvironmentStatus = () => {
  const envStatus = {
    supabaseUrl: !!(import.meta as any).env.VITE_SUPABASE_URL,
    supabaseKey: !!(import.meta as any).env.VITE_SUPABASE_ANON_KEY,
    geminiKey: !!(import.meta as any).env.VITE_GEMINI_API_KEY,
    serpApiKey: !!(import.meta as any).env.VITE_SERPAPI_API_KEY,
    searchApiKey: !!(import.meta as any).env.VITE_SEARCHAPI_API_KEY,
  };
  
  console.log('🔍 Environment Variables Status:', envStatus);
  
  if (!envStatus.supabaseUrl || !envStatus.supabaseKey) {
    console.error('❌ Missing required Supabase environment variables!');
    console.log('Please check your .env file and ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.');
  }
  
  return envStatus;
};
