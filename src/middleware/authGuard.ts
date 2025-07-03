// Client-side authentication guard to prevent bypassing auth
import { supabase } from '../lib/supabase';

// Define protected routes
const protectedRoutes = [
  '/dashboard',
  '/analysis',
  '/chat'
];

// Define public routes
const publicRoutes = [
  '/',
  '/auth',
  '/login',
  '/signup'
];

export class AuthGuard {
  private static instance: AuthGuard;
  private isChecking = false;

  static getInstance(): AuthGuard {
    if (!AuthGuard.instance) {
      AuthGuard.instance = new AuthGuard();
    }
    return AuthGuard.instance;
  }

  async checkAuth(): Promise<boolean> {
    if (this.isChecking) return false;
    this.isChecking = true;

    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Auth check error:', error);
        this.isChecking = false;
        return false;
      }

      this.isChecking = false;
      return !!session?.user;
    } catch (error) {
      console.error('Auth guard error:', error);
      this.isChecking = false;
      return false;
    }
  }

  isProtectedRoute(pathname: string): boolean {
    return protectedRoutes.some(route => 
      pathname === route || pathname.startsWith(route + '/')
    );
  }

  isPublicRoute(pathname: string): boolean {
    return publicRoutes.includes(pathname) || pathname === '/';
  }

  async enforceAuth(): Promise<void> {
    const pathname = window.location.pathname;
    
    // Always allow access to public routes and static assets
    if (
      this.isPublicRoute(pathname) ||
      pathname.includes('.') ||
      pathname.startsWith('/api')
    ) {
      return;
    }

    // Only check auth for protected routes
    if (this.isProtectedRoute(pathname)) {
      try {
        const isAuthenticated = await this.checkAuth();
        
        if (!isAuthenticated) {
          console.log(`Unauthorized access attempt to ${pathname}, redirecting to /auth`);
          
          // Store the intended destination
          sessionStorage.setItem('redirectAfterAuth', pathname);
          
          // Redirect to auth page
          window.location.href = '/auth';
          return;
        }
      } catch (error) {
        console.error('Auth check failed, allowing access:', error);
        // On error, allow access to prevent blocking the app
        return;
      }
    }
  }

  // Method to redirect to intended page after successful auth
  redirectAfterAuth(): void {
    const redirectPath = sessionStorage.getItem('redirectAfterAuth');
    if (redirectPath && redirectPath !== '/auth') {
      sessionStorage.removeItem('redirectAfterAuth');
      window.location.href = redirectPath;
    } else {
      window.location.href = '/dashboard';
    }
  }

  // Initialize the auth guard
  async initialize(): Promise<void> {
    try {
      // Listen for auth state changes
      supabase.auth.onAuthStateChange((event, session) => {
        console.log('Auth state changed:', event, !!session);
        
        if (event === 'SIGNED_IN' && session) {
          // User just signed in, redirect to intended page
          setTimeout(() => {
            this.redirectAfterAuth();
          }, 100);
        } else if (event === 'SIGNED_OUT') {
          // User signed out, redirect to auth if on protected route
          const pathname = window.location.pathname;
          if (this.isProtectedRoute(pathname)) {
            window.location.href = '/auth';
          }
        }
      });

      // Only enforce auth if not already on auth page
      if (!this.isPublicRoute(window.location.pathname)) {
        await this.enforceAuth();
      }
    } catch (error) {
      console.error('Auth guard initialization failed:', error);
      // Continue without blocking the app
    }
  }
}

// Auto-initialize the auth guard
export const authGuard = AuthGuard.getInstance(); 