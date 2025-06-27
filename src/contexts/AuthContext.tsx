import { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { supabase } from '../services/supabaseClient';
import type { User, Session } from '@supabase/supabase-js';
import { AuthContextType } from '../types';
import { logEnvironmentStatus } from '../utils/connectionDebug';
import { ToastContext } from './ToastContext';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const toastContext = useContext(ToastContext);

  // Test Supabase connection on mount
  useEffect(() => {
    const testConnection = async () => {
      try {
        // Log environment status first
        logEnvironmentStatus();
        
        console.log('Testing Supabase connection...');
        const startTime = Date.now();
        const { data, error } = await supabase.from('profiles').select('count').limit(1);
        const endTime = Date.now();
        console.log(`Supabase connection test: ${endTime - startTime}ms`, { data, error });
        
        if (error) {
          console.error('❌ Supabase connection failed:', error);
        } else {
          console.log('✅ Supabase connection successful');
        }
      } catch (error) {
        console.error('❌ Supabase connection test failed:', error);
      }
    };

    testConnection();
  }, []);

  useEffect(() => {
    let loadingTimeout: NodeJS.Timeout;
    let warningTimeout: NodeJS.Timeout;
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        // Set an early warning at 8 seconds
        warningTimeout = setTimeout(() => {
          if (isMounted && toastContext) {
            toastContext.showToast('info', 'Loading...', 'Authentication is taking longer than usual. Please wait...');
          }
        }, 8000);

        // Set a timeout to prevent infinite loading (increased to 15 seconds)
        loadingTimeout = setTimeout(() => {
          if (isMounted) {
            console.warn('Auth loading timeout reached after 15s, setting loading to false');
            if (toastContext) {
              toastContext.showToast('warning', 'Slow Connection', 'Authentication is taking longer than expected. You may have connectivity issues.');
            }
            setIsLoading(false);
          }
        }, 15000);

        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        // Clear timeouts on successful response
        clearTimeout(warningTimeout);
        clearTimeout(loadingTimeout);
        
        if (error) {
          console.error('Error getting session:', error);
          setIsLoading(false);
          return;
        }
        
        setSession(session);
        if (session?.user) {
          await loadUserProfile(session.user);
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error in initializeAuth:', error);
          clearTimeout(warningTimeout);
          clearTimeout(loadingTimeout);
          setIsLoading(false);
        }
      }
    };

    // Initialize auth
    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;
      
      console.log('Auth state changed:', event, session?.user?.id);
      setSession(session);
      
      if (session?.user) {
        await loadUserProfile(session.user);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
      }
      if (warningTimeout) {
        clearTimeout(warningTimeout);
      }
      subscription.unsubscribe();
    };
  }, []);

  const loadUserProfile = async (user: User) => {
    try {
      console.log('Loading user profile for:', user.id);
      
      // Add a timeout for the profile loading operation
      const profileTimeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Profile loading timeout')), 10000)
      );

      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      const { data: profile, error } = await Promise.race([profilePromise, profileTimeout]) as any;

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading user profile:', error);
        // Still set loading to false even if profile fails to load
        setIsLoading(false);
        return;
      }

      if (profile) {
        console.log('Profile loaded:', profile);
        setUser(profile);
      } else {
        console.log('Profile not found, creating new profile');
        // Profile not found, let's create it.
        const name = user.user_metadata.name || user.email?.split('@')[0] || 'New User';
        
        try {
          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              name: name,
              email: user.email,
            })
            .select()
            .single();
          
          if (insertError) {
            console.log('Insert error, trying to fetch existing profile:', insertError);
            // It's possible another session created the profile in the meantime.
            // Let's try fetching it again.
            const { data: existingProfile, error: fetchError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .single();

            if (fetchError) {
              console.error('Error creating or fetching profile:', insertError, fetchError);
              // Even if profile creation fails, we can still authenticate the user
              // Create a minimal user object from auth data
              setUser({
                id: user.id,
                name: user.user_metadata.name || user.email?.split('@')[0] || 'User',
                email: user.email || '',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });
            } else {
              console.log('Existing profile found:', existingProfile);
              setUser(existingProfile);
            }
          } else {
            console.log('New profile created:', newProfile);
            setUser(newProfile);
          }
        } catch (profileError) {
          console.error('Error in profile creation process:', profileError);
          // Fallback: create user object from auth data
          setUser({
            id: user.id,
            name: user.user_metadata.name || user.email?.split('@')[0] || 'User',
            email: user.email || '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        }
      }
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
      // Even if profile loading completely fails, we can still set a basic user
      setUser({
        id: user.id,
        name: user.user_metadata.name || user.email?.split('@')[0] || 'User',
        email: user.email || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw new Error(error.message);
      }

      // User profile will be loaded by the auth state change listener
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          }
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      // User profile will be created by the database trigger
      // and loaded by the auth state change listener
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
      }
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        signIn,
        signUp,
        signOut,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}