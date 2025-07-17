import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Mail, Lock, User, AlertCircle } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAuth } from './SupabaseAuthProvider';

const Auth = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const isSignUp = location.hash === '#sign-up';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error: authError } = isSignUp 
        ? await signUp(email, password)
        : await signIn(email, password);

      if (authError) {
        setError(authError.message);
      } else {
        // Redirect to dashboard on success
        navigate('/dashboard');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-indigo-900 to-purple-800 flex items-center justify-center p-4">
      <div className="w-full max-w-[480px]">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <Zap className="h-8 w-8 text-white" />
            <span className="text-2xl font-display font-bold text-gradient">LuminaWeb</span>
          </Link>
        </div>

        {/* Auth Card */}
        <div className="glassmorphism p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h1>
            <p className="text-gray-300">
              {isSignUp ? 'Sign up to get started' : 'Sign in to your account'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter your password"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <span className="text-red-300 text-sm">{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl transition-all focus:ring-2 focus:ring-purple-500"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  {isSignUp ? 'Creating Account...' : 'Signing In...'}
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <User className="h-5 w-5" />
                  {isSignUp ? 'Create Account' : 'Sign In'}
                </div>
              )}
            </button>

            {/* Toggle Auth Mode */}
            <div className="text-center pt-4">
              <p className="text-gray-300 text-sm">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                <Link 
                  to={isSignUp ? "#sign-in" : "#sign-up"} 
                  className="ml-1 text-purple-400 hover:text-purple-300 font-medium"
                >
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Footer Links */}
        <div className="mt-8 text-center text-sm text-gray-400">
          <Link to="/terms" className="hover:text-white">Terms of Service</Link>
          <span className="mx-2">•</span>
          <Link to="/privacy" className="hover:text-white">Privacy Policy</Link>
        </div>
      </div>
    </div>
  );
};

export default Auth;