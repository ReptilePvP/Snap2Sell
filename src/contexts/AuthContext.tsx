import { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { supabase } from '../services/supabaseClient';
import type { User } from '@supabase/supabase-js';
import { AuthContextType, UserPermissions } from '../types';
import { logEnvironmentStatus } from '../utils/connectionDebug';
import { ToastContext } from './ToastContext';
import { RoleService } from '../services/roleService';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'guest' | 'user' | 'paid' | 'admin';
  subscription_end_date?: string;
  created_by_admin?: boolean;
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
  const toastContext = useContext(ToastContext);

  // Helper function to get user permissions
  const getUserPermissions = (): UserPermissions => {
    return RoleService.getPermissions(user);
  };

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
                role: 'user',
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
            role: 'user',
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
        role: 'user',
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

  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        throw new Error(error.message);
      }
      
      // OAuth sign-in will redirect, so we don't set loading to false here
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
      }
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const updateProfile = async (data: { name: string; email: string }) => {
    if (!user) throw new Error('User not authenticated');
    
    setIsLoading(true);
    try {
      // Update the profile in the database
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: data.name,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (profileError) {
        throw new Error(profileError.message);
      }

      // Update email in auth if it changed
      if (data.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: data.email
        });

        if (emailError) {
          throw new Error(emailError.message);
        }
      }

      // Update local user state
      setUser({
        ...user,
        name: data.name,
        email: data.email,
        updated_at: new Date().toISOString()
      });

    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePassword = async (newPassword: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        throw new Error(error.message);
      }

    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAccount = async () => {
    if (!user) throw new Error('User not authenticated');
    
    setIsLoading(true);
    try {
      // Delete user profile data first
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);

      if (profileError) {
        console.warn('Error deleting profile:', profileError);
      }

      // Delete scan history
      const { error: historyError } = await supabase
        .from('scan_history')
        .delete()
        .eq('user_id', user.id);

      if (historyError) {
        console.warn('Error deleting scan history:', historyError);
      }

      // Note: Supabase doesn't provide a direct way to delete the auth user from client side
      // In a real application, you'd need to:
      // 1. Call an edge function or API endpoint that uses the service role key
      // 2. Or implement account deletion via admin API
      
      // For now, we'll sign out the user and mark the account as deleted
      await signOut();
      
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      console.log('Attempting to reset password for email:', email);
      const redirectUrl = `${window.location.origin}/auth/reset-password`;
      console.log('Redirect URL:', redirectUrl);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl
      });

      if (error) {
        console.error('Supabase reset password error:', error);
        throw new Error(error.message);
      }

      console.log('Password reset email sent successfully');
    } catch (error) {
      console.error('Reset password function error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        permissions: getUserPermissions(),
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        updateProfile,
        updatePassword,
        deleteAccount,
        resetPassword,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}