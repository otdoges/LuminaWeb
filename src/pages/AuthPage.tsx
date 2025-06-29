import React, { useState } from 'react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { LoginForm } from '../components/auth/LoginForm';
import { SignupForm } from '../components/auth/SignupForm';

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <AuthLayout
      title={isLogin ? 'Welcome back' : 'Create your account'}
      subtitle={isLogin ? 'Sign in to your account to continue' : 'Join thousands of developers optimizing their websites'}
    >
      {isLogin ? (
        <LoginForm onSwitchToSignup={() => setIsLogin(false)} />
      ) : (
        <SignupForm onSwitchToLogin={() => setIsLogin(true)} />
      )}
    </AuthLayout>
  );
}