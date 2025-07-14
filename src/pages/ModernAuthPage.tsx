import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Switch } from '../components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { 
  Github, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Zap, 
  Globe, 
  BarChart3,
  ArrowRight,
  CheckCircle,
  Moon,
  Sun,
  Loader2
} from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

const floatingVariants = {
  animate: {
    y: [-10, 10, -10],
    rotate: [0, 5, -5, 0],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export function ModernAuthPage() {
  const [activeTab, setActiveTab] = useState('signin');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  const { signInWithEmail, signUpWithEmail, signInWithGitHub, user } = useAuth();
  const { currentTheme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (activeTab === 'signin') {
        await signInWithEmail(email, password);
      } else {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        await signUpWithEmail(email, password, fullName);
      }
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGitHubAuth = async () => {
    setIsLoading(true);
    try {
      await signInWithGitHub();
    } catch (error) {
      console.error('GitHub auth error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: BarChart3,
      title: "Real-time Analytics",
      description: "Track performance metrics instantly"
    },
    {
      icon: Zap,
      title: "AI-Powered Insights",
      description: "Get intelligent optimization suggestions"
    },
    {
      icon: Globe,
      title: "Global Monitoring",
      description: "Monitor websites from multiple locations"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-primary-950 dark:via-primary-900 dark:to-accent-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary-400/20 to-accent-400/20 rounded-full blur-3xl"
          variants={floatingVariants}
          animate="animate"
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-accent-400/20 to-success-400/20 rounded-full blur-3xl"
          variants={{
            animate: {
              y: [10, -10, 10],
              rotate: [0, -5, 5, 0],
              transition: {
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2
              }
            }
          }}
          animate="animate"
        />
        <motion.div
          className="absolute top-1/2 left-1/4 w-32 h-32 bg-gradient-to-br from-primary-300/10 to-accent-300/10 rounded-full blur-2xl"
          variants={{
            animate: {
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
              transition: {
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }
          }}
          animate="animate"
        />
      </div>

      <motion.div
        className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Left Side - Branding and Features */}
        <motion.div
          className="space-y-8 text-center lg:text-left"
          variants={itemVariants}
        >
          {/* Logo and Title */}
          <div className="space-y-4">
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary-100 to-accent-100 dark:from-primary-800 dark:to-accent-800 border border-primary-200 dark:border-primary-700"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Sparkles className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                LuminaWeb Analytics
              </span>
            </motion.div>
            
            <motion.h1
              className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-primary-900 via-primary-700 to-accent-600 dark:from-primary-100 dark:via-primary-300 dark:to-accent-400 bg-clip-text text-transparent leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              Optimize Your
              <br />
              <span className="relative">
                Website
                <motion.div
                  className="absolute -bottom-2 left-0 right-0 h-3 bg-gradient-to-r from-accent-400/40 to-primary-400/40 rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 1.2, duration: 0.8 }}
                />
              </span>
            </motion.h1>
            
            <motion.p
              className="text-xl text-primary-600 dark:text-primary-400 max-w-md mx-auto lg:mx-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.8 }}
            >
              Advanced website analytics and AI-powered optimization insights for modern developers.
            </motion.p>
          </div>

          {/* Features */}
          <motion.div
            className="space-y-4"
            variants={containerVariants}
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="flex items-center gap-4 p-4 rounded-lg bg-white/50 dark:bg-primary-800/50 backdrop-blur-sm border border-primary-200/50 dark:border-primary-700/50"
                variants={itemVariants}
                whileHover={{ scale: 1.02, x: 10 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-primary-900 dark:text-primary-100">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-primary-600 dark:text-primary-400">
                    {feature.description}
                  </p>
                </div>
                <CheckCircle className="h-5 w-5 text-success-500 ml-auto" />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right Side - Authentication Form */}
        <motion.div
          className="w-full max-w-md mx-auto"
          variants={itemVariants}
        >
          <motion.div
            className="bg-white/80 dark:bg-primary-900/80 backdrop-blur-xl border border-primary-200/50 dark:border-primary-700/50 rounded-2xl shadow-2xl p-8 relative overflow-hidden"
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-accent-500/5 rounded-2xl" />
            
            {/* Theme toggle */}
            <div className="absolute top-4 right-4 z-10">
              <motion.button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-primary-100 dark:bg-primary-800 hover:bg-primary-200 dark:hover:bg-primary-700 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {currentTheme === 'dark' ? (
                  <Sun className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                ) : (
                  <Moon className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                )}
              </motion.button>
            </div>

            <div className="relative z-10">
              {/* Header */}
              <div className="text-center mb-8">
                <motion.h2
                  className="text-2xl font-bold text-primary-900 dark:text-primary-100 mb-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {activeTab === 'signin' ? 'Welcome Back' : 'Create Account'}
                </motion.h2>
                <motion.p
                  className="text-primary-600 dark:text-primary-400"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {activeTab === 'signin' 
                    ? 'Sign in to access your analytics dashboard'
                    : 'Join thousands of developers optimizing their websites'
                  }
                </motion.p>
              </div>

              {/* GitHub Sign In */}
              <motion.div
                className="mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Button
                  onClick={handleGitHubAuth}
                  disabled={isLoading}
                  className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white border-0 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-3"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Github className="h-5 w-5" />
                      Continue with GitHub
                      <ArrowRight className="h-4 w-4 ml-auto" />
                    </>
                  )}
                </Button>
              </motion.div>

              {/* Divider */}
              <motion.div
                className="relative mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-primary-200 dark:border-primary-700" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white dark:bg-primary-900 text-primary-500 dark:text-primary-400">
                    or continue with email
                  </span>
                </div>
              </motion.div>

              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                <AnimatePresence mode="wait">
                  <TabsContent value="signin">
                    <motion.form
                      onSubmit={handleEmailAuth}
                      className="space-y-4"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-primary-700 dark:text-primary-300">
                          Email
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-primary-400" />
                          <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your@email.com"
                            className="pl-10 h-12"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-primary-700 dark:text-primary-300">
                          Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-primary-400" />
                          <Input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="pl-10 pr-10 h-12"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3 text-primary-400 hover:text-primary-600"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="remember"
                            checked={rememberMe}
                            onCheckedChange={setRememberMe}
                          />
                          <label htmlFor="remember" className="text-sm text-primary-600 dark:text-primary-400">
                            Remember me
                          </label>
                        </div>
                        <button
                          type="button"
                          className="text-sm text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-200"
                        >
                          Forgot password?
                        </button>
                      </div>

                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-12 bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 text-white border-0 rounded-lg font-medium transition-all duration-200"
                      >
                        {isLoading ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <>Sign In<ArrowRight className="h-4 w-4 ml-2" /></>
                        )}
                      </Button>
                    </motion.form>
                  </TabsContent>

                  <TabsContent value="signup">
                    <motion.form
                      onSubmit={handleEmailAuth}
                      className="space-y-4"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-primary-700 dark:text-primary-300">
                          Full Name
                        </label>
                        <Input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="John Doe"
                          className="h-12"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-primary-700 dark:text-primary-300">
                          Email
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-primary-400" />
                          <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your@email.com"
                            className="pl-10 h-12"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-primary-700 dark:text-primary-300">
                          Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-primary-400" />
                          <Input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="pl-10 pr-10 h-12"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3 text-primary-400 hover:text-primary-600"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-primary-700 dark:text-primary-300">
                          Confirm Password
                        </label>
                        <Input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="h-12"
                          required
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-12 bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 text-white border-0 rounded-lg font-medium transition-all duration-200"
                      >
                        {isLoading ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <>Create Account<ArrowRight className="h-4 w-4 ml-2" /></>
                        )}
                      </Button>
                    </motion.form>
                  </TabsContent>
                </AnimatePresence>
              </Tabs>

              {/* Footer */}
              <motion.p
                className="text-center text-sm text-primary-500 dark:text-primary-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                By continuing, you agree to our Terms of Service and Privacy Policy.
              </motion.p>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}