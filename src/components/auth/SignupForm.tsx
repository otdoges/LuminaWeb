import React, { useState } from 'react';
import { Mail, Lock, User, Chrome, Github } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/Input';
import { useAuth } from '../../context/AuthContext';

interface SignupFormProps {
  onSwitchToLogin: () => void;
}

export function SignupForm({ onSwitchToLogin }: SignupFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState('');
  const { signup, isLoading } = useAuth();

  const getPasswordStrength = (password: string) => {
    if (password.length < 6) return 'weak';
    if (password.length < 10) return 'medium';
    return 'strong';
  };

  const passwordStrength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (!acceptTerms) {
      setError('Please accept the terms and conditions');
      return;
    }
    
    try {
      await signup(email, password, name);
    } catch (err) {
      setError('Failed to create account. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="text"
          label="Full Name"
          placeholder="Enter your full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          icon={User}
          required
        />
        
        <Input
          type="email"
          label="Email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={Mail}
          required
        />
        
        <div>
          <Input
            type="password"
            label="Password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={Lock}
            showPasswordToggle
            required
          />
          {password && (
            <div className="mt-2">
              <div className="flex items-center gap-2 text-xs">
                <div className="flex-1 bg-primary-200 dark:bg-primary-700 rounded-full h-1">
                  <div
                    className={`h-1 rounded-full transition-all duration-300 ${
                      passwordStrength === 'weak' ? 'w-1/3 bg-red-500' :
                      passwordStrength === 'medium' ? 'w-2/3 bg-yellow-500' :
                      'w-full bg-green-500'
                    }`}
                  />
                </div>
                <span className={`font-medium ${
                  passwordStrength === 'weak' ? 'text-red-600' :
                  passwordStrength === 'medium' ? 'text-yellow-600' :
                  'text-green-600'
                }`}>
                  {passwordStrength}
                </span>
              </div>
            </div>
          )}
        </div>
        
        <Input
          type="password"
          label="Confirm Password"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          icon={Lock}
          showPasswordToggle
          required
        />

        <label className="flex items-start gap-2">
          <input
            type="checkbox"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            className="w-4 h-4 text-accent-600 bg-white border-primary-300 rounded focus:ring-accent-500 focus:ring-2 mt-0.5"
          />
          <span className="text-sm text-primary-600 dark:text-primary-400">
            I agree to the{' '}
            <a href="#" className="text-accent-600 hover:text-accent-700 font-medium">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-accent-600 hover:text-accent-700 font-medium">
              Privacy Policy
            </a>
          </span>
        </label>

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
          Create Account
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
          Already have an account?{' '}
        </span>
        <button
          onClick={onSwitchToLogin}
          className="text-accent-600 hover:text-accent-700 font-medium"
        >
          Sign in
        </button>
      </div>
    </div>
  );
}