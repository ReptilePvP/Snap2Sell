import { supabase } from './supabaseClient';

// Simple test function to check database connectivity and table access
export const testDatabaseAccess = async () => {
  console.log('=== Testing Database Access ===');
  
  try {
    // Test 1: Check auth status
    const { data: authData, error: authError } = await supabase.auth.getUser();
    console.log('Auth test:', { 
      userId: authData?.user?.id, 
      email: authData?.user?.email,
      error: authError?.message 
    });
    
    // Test 2: Try a simple select on scans table (let RLS handle filtering)
    console.log('Testing scans table access...');
    const { data: scanData, error: scanError } = await supabase
      .from('scans')
      .select('id')
      .limit(1);
    
    console.log('Scans table test result:', { 
      data: scanData, 
      error: scanError?.message || scanError,
      errorCode: scanError?.code,
      errorDetails: scanError?.details 
    });
    
    // Test 3: Try to access profiles table (for comparison)
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    console.log('Profiles table test:', { 
      data: profileData, 
      error: profileError?.message || profileError 
    });
    
  } catch (error) {
    console.error('Database test failed:', error);
  }
  
  console.log('=== End Database Test ===');
};
