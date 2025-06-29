import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Github, Eye, EyeOff } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/Input';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

interface EnhancedLoginFormProps {
  onSwitchToSignup: () => void;
}

export function EnhancedLoginForm({ onSwitchToSignup }: EnhancedLoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const { signIn, signInWithGitHub, isLoading } = useAuth();
  const { currentTheme } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await signIn(email, password);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleGitHubSignIn = async () => {
    setError('');
    try {
      await signInWithGitHub();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const inputVariants = {
    focus: { scale: 1.02, transition: { duration: 0.2 } },
    blur: { scale: 1, transition: { duration: 0.2 } }
  };

  return (
    <div className="space-y-6">
      <motion.form 
        onSubmit={handleSubmit} 
        className="space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary-400" />
            <motion.div variants={inputVariants} whileFocus="focus" initial="blur">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-12 h-12 bg-white/50 dark:bg-primary-700/50 border-primary-300 dark:border-primary-600 focus:ring-2 theme-transition"
                style={{
                  focusRingColor: currentTheme.accent,
                  borderColor: `${currentTheme.accent}30`
                }}
                required
              />
            </motion.div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary-400" />
            <motion.div variants={inputVariants} whileFocus="focus" initial="blur">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-12 pr-12 h-12 bg-white/50 dark:bg-primary-700/50 border-primary-300 dark:border-primary-600 focus:ring-2 theme-transition"
                style={{
                  focusRingColor: currentTheme.accent,
                  borderColor: `${currentTheme.accent}30`
                }}
                required
              />
            </motion.div>
            <motion.button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary-400 hover:text-primary-600"
              onClick={() => setShowPassword(!showPassword)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </motion.button>
          </div>
        </motion.div>

        <motion.div 
          className="flex items-center justify-between"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <motion.label 
            className="flex items-center cursor-pointer"
            whileHover={{ scale: 1.02 }}
          >
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 bg-white border-primary-300 rounded focus:ring-2 theme-transition"
              style={{
                accentColor: currentTheme.accent,
                focusRingColor: currentTheme.accent
              }}
            />
            <span className="ml-2 text-sm text-primary-600 dark:text-primary-400">
              Remember me
            </span>
          </motion.label>
          <motion.button
            type="button"
            className="text-sm font-medium theme-transition"
            style={{ color: currentTheme.accent }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Forgot password?
          </motion.button>
        </motion.div>

        {error && (
          <motion.div 
            className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {error}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Button
            type="submit"
            className="w-full h-12 text-lg font-medium text-white relative overflow-hidden group theme-transition"
            style={{ backgroundColor: currentTheme.accent }}
            disabled={isLoading}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              initial={{ x: '-100%' }}
              whileHover={{ x: '100%' }}
              transition={{ duration: 0.6 }}
            />
            <span className="relative z-10">
              {isLoading ? (
                <motion.div
                  className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              ) : (
                'Sign In'
              )}
            </span>
          </Button>
        </motion.div>
      </motion.form>

      <motion.div 
        className="relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-primary-300 dark:border-primary-600"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white/90 dark:bg-primary-800/90 text-primary-500">
            Or continue with
          </span>
        </div>
      </motion.div>

      <motion.div 
        className="w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button 
            type="button"
            variant="outline" 
            onClick={handleGitHubSignIn}
            disabled={isLoading}
            className="w-full h-12 bg-white/50 dark:bg-primary-700/50 border-primary-300 dark:border-primary-600 hover:bg-primary-50 dark:hover:bg-primary-600 theme-transition"
            style={{
              borderColor: `${currentTheme.accent}30`,
              color: currentTheme.accent
            }}
          >
            <Github className="w-5 h-5 mr-2" />
            Continue with GitHub
          </Button>
        </motion.div>
      </motion.div>

      <motion.div 
        className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.9 }}
      >
        <span className="text-primary-600 dark:text-primary-400">
          Don't have an account?{' '}
        </span>
        <motion.button
          onClick={onSwitchToSignup}
          className="font-medium theme-transition"
          style={{ color: currentTheme.accent }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Sign up
        </motion.button>
      </motion.div>
    </div>
  );
}