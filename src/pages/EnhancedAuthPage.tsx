import React, { useState } from 'react';
import { EnhancedAuthLayout } from '../components/auth/EnhancedAuthLayout';
import { EnhancedLoginForm } from '../components/auth/EnhancedLoginForm';
import { EnhancedSignupForm } from '../components/auth/EnhancedSignupForm';

export function EnhancedAuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <EnhancedAuthLayout
      title={isLogin ? 'Welcome back' : 'Create your account'}
      subtitle={isLogin ? 'Sign in to your account to continue' : 'Join thousands of developers optimizing their websites'}
    >
      {isLogin ? (
        <EnhancedLoginForm onSwitchToSignup={() => setIsLogin(false)} />
      ) : (
        <EnhancedSignupForm onSwitchToLogin={() => setIsLogin(true)} />
      )}
    </EnhancedAuthLayout>
  );
}