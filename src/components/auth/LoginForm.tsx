import React, { useState } from 'react';
import { Mail, Lock, Chrome, Github } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/Input';
import { useAuth } from '../../context/AuthContext';

interface LoginFormProps {
  onSwitchToSignup: () => void;
}

export function LoginForm({ onSwitchToSignup }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await login(email, password);
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="email"
          label="Email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={Mail}
          required
        />
        
        <Input
          type="password"
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={Lock}
          showPasswordToggle
          required
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 text-accent-600 bg-white border-primary-300 rounded focus:ring-accent-500 focus:ring-2"
            />
            <span className="ml-2 text-sm text-primary-600 dark:text-primary-400">
              Remember me
            </span>
          </label>
          <button
            type="button"
            className="text-sm text-accent-600 hover:text-accent-700 font-medium"
          >
            Forgot password?
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          loading={isLoading}
        >
          Sign In
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-primary-300 dark:border-primary-600"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white dark:bg-primary-800 text-primary-500">
            Or continue with
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" size="md" icon={Chrome} className="w-full">
          Google
        </Button>
        <Button variant="outline" size="md" icon={Github} className="w-full">
          GitHub
        </Button>
      </div>

      <div className="text-center">
        <span className="text-primary-600 dark:text-primary-400">
          Don't have an account?{' '}
        </span>
        <button
          onClick={onSwitchToSignup}
          className="text-accent-600 hover:text-accent-700 font-medium"
        >
          Sign up
        </button>
      </div>
    </div>
  );
}