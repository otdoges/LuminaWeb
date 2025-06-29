import React from 'react';
import { Monitor, Sparkles } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-primary-900 dark:via-primary-800 dark:to-primary-900">
      <div className="min-h-screen flex">
        {/* Left side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-accent-600 to-accent-800"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.1%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
          
          <div className="relative z-10 flex flex-col justify-center px-12 text-white">
            <div className="animate-fade-in">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <Monitor className="w-8 h-8" />
                </div>
                <h1 className="text-3xl font-bold">LuminaWeb</h1>
              </div>
              
              <h2 className="text-4xl font-bold mb-4 leading-tight">
                Optimize Your Web
                <br />
                <span className="text-accent-200">Performance</span>
              </h2>
              
              <p className="text-xl text-accent-100 mb-8 leading-relaxed">
                Get comprehensive insights, performance metrics, and optimization recommendations for your websites.
              </p>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-accent-100">
                  <Sparkles className="w-5 h-5" />
                  <span>Real-time Analytics</span>
                </div>
                <div className="flex items-center gap-2 text-accent-100">
                  <Sparkles className="w-5 h-5" />
                  <span>AI-Powered Insights</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Auth Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="text-center mb-8 lg:hidden">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="p-2 bg-accent-100 rounded-lg">
                  <Monitor className="w-6 h-6 text-accent-600" />
                </div>
                <h1 className="text-2xl font-bold text-primary-900 dark:text-primary-100">LuminaWeb</h1>
              </div>
            </div>

            <div className="animate-slide-up">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-primary-900 dark:text-primary-100 mb-2">
                  {title}
                </h2>
                <p className="text-primary-600 dark:text-primary-400">
                  {subtitle}
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm dark:bg-primary-800/80 rounded-2xl shadow-xl border border-white/20 dark:border-primary-700/20 p-8">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}