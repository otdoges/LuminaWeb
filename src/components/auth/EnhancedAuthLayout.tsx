import React from 'react';
import { motion } from 'framer-motion';
import { Monitor, Sparkles, Zap, BarChart3, Shield } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { ThemeSwitcher } from '../ui/ThemeSwitcher';

interface EnhancedAuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export function EnhancedAuthLayout({ children, title, subtitle }: EnhancedAuthLayoutProps) {
  const { currentTheme } = useTheme();

  const floatingIcons = [
    { Icon: Zap, delay: 0, x: 20, y: 30 },
    { Icon: BarChart3, delay: 0.5, x: -20, y: 50 },
    { Icon: Shield, delay: 1, x: 30, y: 70 },
    { Icon: Sparkles, delay: 1.5, x: -30, y: 20 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-primary-900 dark:via-primary-800 dark:to-primary-900 overflow-hidden theme-transition">
      {/* Theme Switcher */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeSwitcher />
      </div>

      <div className="min-h-screen flex relative">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full opacity-20"
              style={{
                backgroundColor: currentTheme.accent,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [-20, 20, -20],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* Left side - Enhanced Branding */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          <div 
            className="absolute inset-0"
            style={{ 
              background: `linear-gradient(135deg, ${currentTheme.accent}, ${currentTheme.primary})` 
            }}
          />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.1%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
          
          {/* Floating Icons */}
          {floatingIcons.map(({ Icon, delay, x, y }, index) => (
            <motion.div
              key={index}
              className="absolute w-16 h-16 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center"
              style={{ left: `${20 + x}%`, top: `${20 + y}%` }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                y: [-10, 10, -10],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                opacity: { duration: 0.5, delay },
                scale: { duration: 0.5, delay },
                y: { duration: 4, repeat: Infinity, delay },
                rotate: { duration: 6, repeat: Infinity, delay }
              }}
            >
              <Icon className="w-8 h-8 text-white/80" />
            </motion.div>
          ))}
          
          <div className="relative z-10 flex flex-col justify-center px-12 text-white">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <motion.div 
                className="flex items-center gap-3 mb-8"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div 
                  className="p-3 bg-white/20 backdrop-blur-sm rounded-xl"
                  animate={{ 
                    boxShadow: [
                      '0 0 20px rgba(255,255,255,0.2)',
                      '0 0 30px rgba(255,255,255,0.4)',
                      '0 0 20px rgba(255,255,255,0.2)'
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Monitor className="w-8 h-8" />
                </motion.div>
                <h1 className="text-3xl font-bold">LuminaWeb</h1>
              </motion.div>
              
              <motion.h2 
                className="text-4xl font-bold mb-4 leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Optimize Your Web
                <br />
                <motion.span 
                  className="text-white/80"
                  animate={{ 
                    textShadow: [
                      '0 0 10px rgba(255,255,255,0.5)',
                      '0 0 20px rgba(255,255,255,0.8)',
                      '0 0 10px rgba(255,255,255,0.5)'
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Performance
                </motion.span>
              </motion.h2>
              
              <motion.p 
                className="text-xl text-white/80 mb-8 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                Get comprehensive insights, performance metrics, and AI-powered optimization recommendations for your websites.
              </motion.p>
              
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                {[
                  { icon: Sparkles, text: 'Real-time Analytics' },
                  { icon: BarChart3, text: 'Performance Insights' },
                  { icon: Zap, text: 'AI-Powered Optimization' },
                  { icon: Shield, text: 'Security Monitoring' }
                ].map((item, index) => (
                  <motion.div
                    key={item.text}
                    className="flex items-center gap-3 text-white/90"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
                    whileHover={{ x: 5, transition: { duration: 0.2 } }}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.text}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>

          {/* Animated Gradient Overlay */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
            animate={{ x: [-100, window.innerWidth + 100] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
          />
        </div>

        {/* Right side - Enhanced Auth Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
          <div className="w-full max-w-md relative z-10">
            <div className="text-center mb-8 lg:hidden">
              <motion.div 
                className="flex items-center justify-center gap-2 mb-4"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div 
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: `${currentTheme.accent}20` }}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <Monitor className="w-6 h-6" style={{ color: currentTheme.accent }} />
                </motion.div>
                <h1 className="text-2xl font-bold text-primary-900 dark:text-primary-100">LuminaWeb</h1>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <motion.div 
                className="text-center mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <h2 className="text-2xl font-bold text-primary-900 dark:text-primary-100 mb-2">
                  {title}
                </h2>
                <p className="text-primary-600 dark:text-primary-400">
                  {subtitle}
                </p>
              </motion.div>

              <motion.div 
                className="bg-white/90 backdrop-blur-md dark:bg-primary-800/90 rounded-2xl shadow-2xl border border-white/20 dark:border-primary-700/20 p-8 relative overflow-hidden theme-transition"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                whileHover={{ 
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                  transition: { duration: 0.3 }
                }}
                style={{
                  borderColor: `${currentTheme.accent}20`
                }}
              >
                {/* Animated border */}
                <motion.div
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    background: `linear-gradient(45deg, transparent, ${currentTheme.accent}20, transparent)`,
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                />
                
                <div className="relative z-10">
                  {children}
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Background decoration */}
          <div 
            className="absolute top-1/4 right-10 w-32 h-32 rounded-full opacity-10 blur-3xl"
            style={{ backgroundColor: currentTheme.accent }}
          />
          <div 
            className="absolute bottom-1/4 left-10 w-24 h-24 rounded-full opacity-10 blur-2xl"
            style={{ backgroundColor: currentTheme.primary }}
          />
        </div>
      </div>
    </div>
  );
}