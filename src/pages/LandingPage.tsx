import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  Monitor, 
  Zap, 
  BarChart3, 
  Shield, 
  ArrowRight, 
  CheckCircle, 
  Star,
  Users,
  Globe,
  TrendingUp,
  Camera,
  Settings
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { ThemeSwitcher } from '../components/ui/ThemeSwitcher';
import { AnimatedSection } from '../components/ui/AnimatedSection';
import { LoadingProgress } from '../components/ui/LoadingProgress';
import { useTheme } from '../context/ThemeContext';
import { useSEO, structuredDataTemplates } from '../hooks/useSEO';

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const { currentTheme } = useTheme();
  const { scrollY } = useScroll();

  // SEO optimization for landing page
  useSEO({
    structuredData: structuredDataTemplates.website
  });

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const features = [
    {
      icon: BarChart3,
      title: 'Performance Analytics',
      description: 'Get comprehensive insights into your website\'s performance with detailed metrics and recommendations.',
    },
    {
      icon: Camera,
      title: 'Visual Screenshots',
      description: 'Capture and compare visual snapshots of your websites across different devices and screen sizes.',
    },
    {
      icon: Zap,
      title: 'Instant Optimization',
      description: 'Receive AI-powered optimization suggestions to improve your website\'s speed and user experience.',
    },
    {
      icon: Shield,
      title: 'Security Monitoring',
      description: 'Monitor your website\'s security status and get alerts about potential vulnerabilities.',
    },
    {
      icon: TrendingUp,
      title: 'Trend Analysis',
      description: 'Track performance trends over time and identify patterns in your website\'s behavior.',
    },
    {
      icon: Settings,
      title: 'Custom Reports',
      description: 'Generate detailed reports tailored to your specific needs and share them with your team.',
    },
  ];

  const stats = [
    { number: '10K+', label: 'Websites Analyzed' },
    { number: '99.9%', label: 'Uptime Guarantee' },
    { number: '50ms', label: 'Average Response Time' },
    { number: '24/7', label: 'Support Available' },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Frontend Developer',
      company: 'TechCorp',
      content: 'LuminaWeb helped us identify performance bottlenecks we never knew existed. Our site speed improved by 40%!',
      rating: 5,
    },
    {
      name: 'Michael Chen',
      role: 'CTO',
      company: 'StartupXYZ',
      content: 'The visual comparison tools are incredible. We can now track our optimization progress with clear before/after shots.',
      rating: 5,
    },
    {
      name: 'Emily Rodriguez',
      role: 'Web Designer',
      company: 'Creative Agency',
      content: 'The AI-powered recommendations are spot-on. It\'s like having a performance expert on our team.',
      rating: 5,
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-primary-900 dark:via-primary-800 dark:to-primary-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div 
            className="flex items-center gap-3 mb-6 justify-center"
            animate={{ 
              scale: [1, 1.05, 1],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div 
              className="p-3 rounded-xl"
              style={{ backgroundColor: `${currentTheme.accent}20` }}
            >
              <Monitor className="w-8 h-8" style={{ color: currentTheme.accent }} />
            </div>
            <h1 className="text-3xl font-bold text-primary-900 dark:text-primary-100">
              LuminaWeb
            </h1>
          </motion.div>
          <LoadingProgress 
            duration={1500} 
            onComplete={() => setIsLoading(false)}
            className="w-64 mx-auto"
          />
          <motion.p 
            className="text-primary-600 dark:text-primary-400 mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Loading your optimization experience...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-primary-900 dark:via-primary-800 dark:to-primary-900 theme-transition">
      {/* Navigation */}
      <motion.nav 
        className="fixed top-0 w-full z-50 bg-white/90 dark:bg-primary-900/90 backdrop-blur-lg border-b border-primary-200 dark:border-primary-700 theme-transition shadow-sm"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div 
              className="flex items-center gap-3"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div 
                className="p-2 rounded-lg bg-accent/10 theme-transition"
                whileHover={{ rotate: 5, scale: 1.1 }}
                transition={{ duration: 0.3 }}
              >
                <Monitor className="w-6 h-6 text-accent" />
              </motion.div>
              <h1 className="text-xl font-bold text-foreground theme-transition">
                LuminaWeb
              </h1>
            </motion.div>
            
            <div className="flex items-center gap-3">
              <ThemeSwitcher />
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  onClick={onGetStarted} 
                  className="group theme-transition"
                  size="sm"
                >
                  Get Started
                  <motion.div
                    className="ml-2"
                    animate={{ x: [0, 3, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </motion.div>
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <AnimatedSection direction="up" delay={0.2}>
            <motion.h1 
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight theme-transition tracking-tight"
            >
              Optimize Your Web
              <br />
              <motion.span 
                className="text-accent theme-transition bg-gradient-to-r from-accent to-accent/80 bg-clip-text"
              >
                Performance
              </motion.span>
            </motion.h1>
          </AnimatedSection>

          <AnimatedSection direction="up" delay={0.4}>
            <p className="text-xl text-primary-600 dark:text-primary-400 mb-8 max-w-3xl mx-auto leading-relaxed theme-transition">
              Get comprehensive insights, performance metrics, and AI-powered optimization recommendations 
              to make your websites faster, more accessible, and user-friendly.
            </p>
          </AnimatedSection>

          <AnimatedSection direction="up" delay={0.6}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 max-w-md sm:max-w-none mx-auto">
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto"
              >
                <Button 
                  size="lg" 
                  onClick={onGetStarted} 
                  className="w-full sm:w-auto group relative overflow-hidden theme-transition text-white"
                  style={{ backgroundColor: currentTheme.accent }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.6 }}
                  />
                  <span className="relative z-10">Start Free Analysis</span>
                  <motion.div
                    className="ml-2 relative z-10"
                    animate={{ x: [0, 3, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="w-5 h-5" />
                  </motion.div>
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto"
              >
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full sm:w-auto theme-transition"
                >
                  Watch Demo
                </Button>
              </motion.div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Stats Section */}
      <AnimatedSection>
        <section className="py-16 bg-white/50 dark:bg-primary-800/50 backdrop-blur-sm theme-transition">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05 }}
                >
                  <motion.div 
                    className="text-3xl md:text-4xl font-bold mb-2 theme-transition"
                    style={{ color: currentTheme.accent }}
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 + 0.2, type: 'spring' }}
                    viewport={{ once: true }}
                  >
                    {stat.number}
                  </motion.div>
                  <div className="text-primary-600 dark:text-primary-400 theme-transition">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection direction="up">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-primary-900 dark:text-primary-100 mb-4 theme-transition">
                Powerful Features for Web Optimization
              </h2>
              <p className="text-xl text-primary-600 dark:text-primary-400 max-w-3xl mx-auto theme-transition">
                Everything you need to analyze, optimize, and monitor your website's performance
              </p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <AnimatedSection key={feature.title} delay={index * 0.1}>
                <motion.div
                  whileHover={{ 
                    scale: 1.02, 
                    y: -5,
                    transition: { duration: 0.3 }
                  }}
                >
                  <Card className="h-full hover:shadow-xl transition-all duration-500 bg-white/80 dark:bg-primary-800/80 backdrop-blur-sm border-primary-200 dark:border-primary-700 theme-transition group">
                    <CardHeader>
                      <motion.div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 theme-transition group-hover:scale-110"
                        style={{ backgroundColor: `${currentTheme.accent}20` }}
                        transition={{ duration: 0.3 }}
                      >
                        <feature.icon className="w-6 h-6 theme-transition" style={{ color: currentTheme.accent }} />
                      </motion.div>
                      <CardTitle className="text-primary-900 dark:text-primary-100 theme-transition">
                        {feature.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-primary-600 dark:text-primary-400 theme-transition">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <AnimatedSection>
        <section 
          className="py-20 theme-transition"
          style={{ 
            background: `linear-gradient(135deg, ${currentTheme.accent}10, ${currentTheme.primary}05)` 
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection direction="up">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-primary-900 dark:text-primary-100 mb-4 theme-transition">
                  Trusted by Developers Worldwide
                </h2>
                <p className="text-xl text-primary-600 dark:text-primary-400 theme-transition">
                  See what our users have to say about LuminaWeb
                </p>
              </div>
            </AnimatedSection>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <AnimatedSection key={testimonial.name} delay={index * 0.2}>
                  <motion.div
                    whileHover={{ 
                      scale: 1.02, 
                      y: -5,
                      transition: { duration: 0.3 }
                    }}
                  >
                    <Card className="h-full bg-white/80 dark:bg-primary-800/80 backdrop-blur-sm theme-transition hover:shadow-xl transition-all duration-500">
                      <CardContent className="p-6">
                        <motion.div 
                          className="flex mb-4"
                          initial={{ opacity: 0 }}
                          whileInView={{ opacity: 1 }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          viewport={{ once: true }}
                        >
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <motion.div
                              key={i}
                              initial={{ scale: 0, rotate: -180 }}
                              whileInView={{ scale: 1, rotate: 0 }}
                              transition={{ 
                                duration: 0.3, 
                                delay: index * 0.1 + i * 0.05,
                                type: 'spring'
                              }}
                              viewport={{ once: true }}
                            >
                              <Star className="w-5 h-5 text-yellow-400 fill-current" />
                            </motion.div>
                          ))}
                        </motion.div>
                        <p className="text-primary-700 dark:text-primary-300 mb-4 italic theme-transition">
                          "{testimonial.content}"
                        </p>
                        <div>
                          <div className="font-semibold text-primary-900 dark:text-primary-100 theme-transition">
                            {testimonial.name}
                          </div>
                          <div className="text-sm text-primary-600 dark:text-primary-400 theme-transition">
                            {testimonial.role} at {testimonial.company}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* CTA Section */}
      <AnimatedSection>
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              whileInView={{ scale: [0.95, 1.02, 1] }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-primary-900 dark:text-primary-100 mb-4 theme-transition">
                Ready to Optimize Your Website?
              </h2>
              <p className="text-xl text-primary-600 dark:text-primary-400 mb-8 theme-transition">
                Join thousands of developers who trust LuminaWeb for their website optimization needs.
              </p>
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  size="lg" 
                  onClick={onGetStarted} 
                  className="group text-lg px-8 py-4 theme-transition relative overflow-hidden"
                  style={{ backgroundColor: currentTheme.accent }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.6 }}
                  />
                  <span className="relative z-10">Get Started for Free</span>
                  <motion.div
                    className="ml-2 relative z-10"
                    animate={{ x: [0, 3, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="w-5 h-5" />
                  </motion.div>
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </AnimatedSection>

      {/* Footer */}
      <motion.footer 
        className="py-12 theme-transition"
        style={{ backgroundColor: currentTheme.primary }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <motion.div 
              className="flex items-center gap-3 mb-4 md:mb-0"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <div 
                className="p-2 rounded-lg"
                style={{ backgroundColor: currentTheme.accent }}
              >
                <Monitor className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">LuminaWeb</h1>
            </motion.div>
            <div className="text-white/70">
              © 2025 LuminaWeb. All rights reserved.
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}