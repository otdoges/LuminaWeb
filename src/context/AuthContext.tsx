import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { authGuard } from '../middleware/authGuard';
import type { User, Session, AuthError } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signInWithGitHub: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, !!session);
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);

      // Handle successful sign in - redirect to intended page
      if (event === 'SIGNED_IN' && session?.user) {
        // Create user profile in database if it doesn't exist
        try {
          const { error } = await supabase
            .from('users')
            .upsert({
              id: session.user.id,
              email: session.user.email!,
              name: session.user.user_metadata?.full_name || 
                    session.user.user_metadata?.name || 
                    session.user.user_metadata?.user_name ||
                    session.user.email!.split('@')[0],
              avatar_url: session.user.user_metadata?.avatar_url,
            }, { onConflict: 'id' });

          if (error) {
            console.error('Error creating user profile:', error);
          }
        } catch (error) {
          console.error('Error in user profile creation:', error);
        }

        // Redirect to dashboard after successful authentication
        if (window.location.pathname === '/auth') {
          window.location.href = '/';
        }
      }

      // Handle sign out - redirect if on protected route
      if (event === 'SIGNED_OUT') {
        const pathname = window.location.pathname;
        if (authGuard.isProtectedRoute(pathname)) {
          setTimeout(() => {
            window.location.href = '/auth';
          }, 100);
        }
      }

      // Handle token refresh errors
      if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed successfully');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (error) {
      throw new Error((error as AuthError).message || 'Sign in failed');
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            full_name: name,
          },
        },
      });
      if (error) throw error;
    } catch (error) {
      throw new Error((error as AuthError).message || 'Sign up failed');
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGitHub = async () => {
    setIsLoading(true);
    try {
      // Get the current URL for better redirect handling
      const currentUrl = window.location.origin;
      const redirectTo = `${currentUrl}/`;
      
      console.log('Initiating GitHub OAuth with redirect:', redirectTo);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error('GitHub OAuth error:', error);
        throw error;
      }

      console.log('GitHub OAuth initiated successfully:', data);
      
      // Note: The redirect will happen automatically, so we don't need to do anything else here
    } catch (error) {
      console.error('GitHub sign in error:', error);
      throw new Error((error as AuthError).message || 'GitHub sign in failed. Please check your internet connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      throw new Error((error as AuthError).message || 'Sign out failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated: !!user,
        isLoading,
        signIn,
        signUp,
        signInWithGitHub,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}