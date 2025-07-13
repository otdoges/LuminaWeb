import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  Globe, 
  Zap, 
  Settings, 
  Eye, 
  Download, 
  Code, 
  Palette,
  Smartphone,
  Gauge,
  Shield,
  Search,
  CheckCircle,
  ArrowRight,
  Loader2,
  AlertCircle,
  Sparkles,
  Monitor,
  Tablet
} from 'lucide-react';
import { enhanceSite, type EnhancementOptions } from '../../lib/siteEnhancement';
import { storeSiteAnalysis } from '../../lib/analyticsDetection';

const stepVariants = {
  hidden: { opacity: 0, x: 50, scale: 0.95 },
  visible: { 
    opacity: 1, 
    x: 0, 
    scale: 1,
    transition: { 
      type: "spring", 
      stiffness: 100, 
      damping: 20 
    }
  },
  exit: { 
    opacity: 0, 
    x: -50, 
    scale: 0.95,
    transition: { duration: 0.3 }
  }
};

const progressVariants = {
  initial: { width: 0 },
  animate: (progress: number) => ({
    width: `${progress}%`,
    transition: { duration: 0.8, ease: "easeInOut" }
  })
};

interface EnhancementWizardProps {
  onComplete?: (result: any) => void;
  onClose?: () => void;
}

export function EnhancementWizard({ onComplete, onClose }: EnhancementWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [isValidUrl, setIsValidUrl] = useState(false);
  const [enhancementOptions, setEnhancementOptions] = useState<EnhancementOptions>({
    improvePerformance: true,
    enhanceAccessibility: true,
    optimizeSeo: true,
    modernizeDesign: true,
    mobileOptimize: true
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuth();

  useEffect(() => {
    const urlRegex = /^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$/;
    setIsValidUrl(urlRegex.test(websiteUrl));
  }, [websiteUrl]);

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleEnhance = async () => {
    if (!websiteUrl || !user) return;

    setIsProcessing(true);
    setError(null);

    try {
      const result = await enhanceSite(websiteUrl, enhancementOptions);
      
      if (result) {
        setResults(result);
        
        // Store the analysis
        await storeSiteAnalysis(
          user.id,
          websiteUrl,
          {
            performanceScore: result.performanceScore,
            accessibilityScore: result.accessibilityScore,
            seoScore: result.seoScore,
            improvements: result.improvements,
            enhancementOptions
          },
          false
        );
        
        setCurrentStep(totalSteps);
        onComplete?.(result);
      } else {
        throw new Error('Failed to enhance website');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderStep1 = () => (
    <motion.div
      key=\"step1\"
      variants={stepVariants}
      initial=\"hidden\"
      animate=\"visible\"
      exit=\"exit\"
      className=\"space-y-6\"
    >
      <div className=\"text-center space-y-4\">
        <div className=\"w-16 h-16 mx-auto bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center\">
          <Globe className=\"h-8 w-8 text-white\" />
        </div>
        <h2 className=\"text-2xl font-bold text-primary-900 dark:text-primary-100\">
          Enter Website URL
        </h2>
        <p className=\"text-primary-600 dark:text-primary-400\">
          Let's start by analyzing your website and identifying improvement opportunities.
        </p>
      </div>

      <div className=\"space-y-4\">
        <div className=\"space-y-2\">
          <label className=\"text-sm font-medium text-primary-700 dark:text-primary-300\">
            Website URL
          </label>
          <div className=\"relative\">
            <Globe className=\"absolute left-3 top-3 h-4 w-4 text-primary-400\" />
            <Input
              type=\"url\"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder=\"https://your-website.com\"
              className=\"pl-10 h-12\"
            />
            {websiteUrl && (
              <div className=\"absolute right-3 top-3\">
                {isValidUrl ? (
                  <CheckCircle className=\"h-4 w-4 text-success-500\" />
                ) : (
                  <AlertCircle className=\"h-4 w-4 text-warning-500\" />
                )}
              </div>
            )}
          </div>
          {websiteUrl && !isValidUrl && (
            <p className=\"text-sm text-warning-600 dark:text-warning-400\">
              Please enter a valid URL starting with http:// or https://
            </p>
          )}
        </div>

        <div className=\"grid grid-cols-3 gap-4 mt-6\">
          {[
            { icon: Gauge, label: \"Performance\", desc: \"Speed & loading\" },
            { icon: Shield, label: \"Security\", desc: \"Safety & privacy\" },
            { icon: Search, label: \"SEO\", desc: \"Search visibility\" }
          ].map((item, index) => (
            <motion.div
              key={item.label}
              className=\"text-center p-4 rounded-lg bg-primary-50 dark:bg-primary-800/50 border border-primary-200 dark:border-primary-700\"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <item.icon className=\"h-6 w-6 mx-auto mb-2 text-primary-600 dark:text-primary-400\" />
              <h3 className=\"font-medium text-primary-900 dark:text-primary-100 text-sm\">
                {item.label}
              </h3>
              <p className=\"text-xs text-primary-600 dark:text-primary-400\">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      <div className=\"flex justify-end\">
        <Button
          onClick={handleNext}
          disabled={!isValidUrl}
          className=\"bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700\"
        >
          Analyze Website
          <ArrowRight className=\"h-4 w-4 ml-2\" />
        </Button>
      </div>
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div
      key=\"step2\"
      variants={stepVariants}
      initial=\"hidden\"
      animate=\"visible\"
      exit=\"exit\"
      className=\"space-y-6\"
    >
      <div className=\"text-center space-y-4\">
        <div className=\"w-16 h-16 mx-auto bg-gradient-to-br from-accent-500 to-success-500 rounded-full flex items-center justify-center\">
          <Settings className=\"h-8 w-8 text-white\" />
        </div>
        <h2 className=\"text-2xl font-bold text-primary-900 dark:text-primary-100\">
          Enhancement Options
        </h2>
        <p className=\"text-primary-600 dark:text-primary-400\">
          Choose which areas you'd like to improve on your website.
        </p>
      </div>

      <div className=\"space-y-4\">
        {[
          {
            key: 'improvePerformance',
            icon: Gauge,
            title: 'Performance Optimization',
            description: 'Optimize loading speed, images, and scripts',
            color: 'text-blue-500'
          },
          {
            key: 'enhanceAccessibility',
            icon: Shield,
            title: 'Accessibility Enhancement',
            description: 'Improve accessibility for all users',
            color: 'text-green-500'
          },
          {
            key: 'optimizeSeo',
            icon: Search,
            title: 'SEO Optimization',
            description: 'Enhance search engine visibility',
            color: 'text-purple-500'
          },
          {
            key: 'modernizeDesign',
            icon: Palette,
            title: 'Design Modernization',
            description: 'Apply modern CSS and layout techniques',
            color: 'text-pink-500'
          },
          {
            key: 'mobileOptimize',
            icon: Smartphone,
            title: 'Mobile Optimization',
            description: 'Improve mobile responsiveness',
            color: 'text-orange-500'
          }
        ].map((option, index) => {
          const isEnabled = enhancementOptions[option.key as keyof EnhancementOptions];
          return (
            <motion.div
              key={option.key}
              className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                isEnabled
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-800/50'
                  : 'border-primary-200 dark:border-primary-700 bg-white dark:bg-primary-900/50'
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setEnhancementOptions(prev => ({
                ...prev,
                [option.key]: !prev[option.key as keyof EnhancementOptions]
              }))}
            >
              <div className=\"flex items-center justify-between\">
                <div className=\"flex items-center gap-3\">
                  <div className={`p-2 rounded-lg bg-white dark:bg-primary-800 ${option.color}`}>
                    <option.icon className=\"h-5 w-5\" />
                  </div>
                  <div>
                    <h3 className=\"font-medium text-primary-900 dark:text-primary-100\">
                      {option.title}
                    </h3>
                    <p className=\"text-sm text-primary-600 dark:text-primary-400\">
                      {option.description}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={isEnabled}
                  onCheckedChange={(checked) => setEnhancementOptions(prev => ({
                    ...prev,
                    [option.key]: checked
                  }))}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className=\"flex justify-between\">
        <Button variant=\"outline\" onClick={handleBack}>
          Back
        </Button>
        <Button
          onClick={handleNext}
          className=\"bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700\"
        >
          Continue
          <ArrowRight className=\"h-4 w-4 ml-2\" />
        </Button>
      </div>
    </motion.div>
  );

  const renderStep3 = () => (
    <motion.div
      key=\"step3\"
      variants={stepVariants}
      initial=\"hidden\"
      animate=\"visible\"
      exit=\"exit\"
      className=\"space-y-6\"
    >
      <div className=\"text-center space-y-4\">
        <div className=\"w-16 h-16 mx-auto bg-gradient-to-br from-success-500 to-primary-500 rounded-full flex items-center justify-center\">
          <Sparkles className=\"h-8 w-8 text-white\" />
        </div>
        <h2 className=\"text-2xl font-bold text-primary-900 dark:text-primary-100\">
          Ready to Enhance
        </h2>
        <p className=\"text-primary-600 dark:text-primary-400\">
          Review your settings and start the enhancement process.
        </p>
      </div>

      <div className=\"space-y-6\">
        {/* Website Preview */}
        <div className=\"p-4 rounded-lg bg-primary-50 dark:bg-primary-800/50 border border-primary-200 dark:border-primary-700\">
          <h3 className=\"font-medium text-primary-900 dark:text-primary-100 mb-2\">
            Website URL
          </h3>
          <div className=\"flex items-center gap-2 text-primary-600 dark:text-primary-400\">
            <Globe className=\"h-4 w-4\" />
            <span className=\"font-mono text-sm\">{websiteUrl}</span>
          </div>
        </div>

        {/* Selected Options */}
        <div className=\"space-y-3\">
          <h3 className=\"font-medium text-primary-900 dark:text-primary-100\">
            Selected Enhancements
          </h3>
          <div className=\"flex flex-wrap gap-2\">
            {Object.entries(enhancementOptions)
              .filter(([_, enabled]) => enabled)
              .map(([key, _]) => {
                const labels = {
                  improvePerformance: 'Performance',
                  enhanceAccessibility: 'Accessibility',
                  optimizeSeo: 'SEO',
                  modernizeDesign: 'Design',
                  mobileOptimize: 'Mobile'
                };
                return (
                  <Badge key={key} variant=\"default\" className=\"flex items-center gap-1\">
                    <CheckCircle className=\"h-3 w-3\" />
                    {labels[key as keyof typeof labels]}
                  </Badge>
                );
              })}
          </div>
        </div>

        {/* Processing Steps Preview */}
        <div className=\"space-y-3\">
          <h3 className=\"font-medium text-primary-900 dark:text-primary-100\">
            Enhancement Process
          </h3>
          <div className=\"space-y-2\">
            {[
              { icon: Globe, text: \"Analyze current website\" },
              { icon: Code, text: \"Generate improvements\" },
              { icon: Palette, text: \"Apply enhancements\" },
              { icon: Download, text: \"Generate enhanced version\" }
            ].map((step, index) => (
              <div key={index} className=\"flex items-center gap-3 text-sm text-primary-600 dark:text-primary-400\">
                <step.icon className=\"h-4 w-4\" />
                <span>{step.text}</span>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className=\"p-4 rounded-lg bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-700\">
            <div className=\"flex items-center gap-2 text-red-700 dark:text-red-300\">
              <AlertCircle className=\"h-4 w-4\" />
              <span className=\"font-medium\">Error</span>
            </div>
            <p className=\"text-sm text-red-600 dark:text-red-400 mt-1\">{error}</p>
          </div>
        )}
      </div>

      <div className=\"flex justify-between\">
        <Button variant=\"outline\" onClick={handleBack} disabled={isProcessing}>
          Back
        </Button>
        <Button
          onClick={handleEnhance}
          disabled={isProcessing}
          className=\"bg-gradient-to-r from-success-600 to-primary-600 hover:from-success-700 hover:to-primary-700\"
        >
          {isProcessing ? (
            <>
              <Loader2 className=\"h-4 w-4 mr-2 animate-spin\" />
              Enhancing...
            </>
          ) : (
            <>
              Start Enhancement
              <Sparkles className=\"h-4 w-4 ml-2\" />
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );

  const renderResults = () => (
    <motion.div
      key=\"results\"
      variants={stepVariants}
      initial=\"hidden\"
      animate=\"visible\"
      exit=\"exit\"
      className=\"space-y-6\"
    >
      <div className=\"text-center space-y-4\">
        <motion.div
          className=\"w-16 h-16 mx-auto bg-gradient-to-br from-success-500 to-accent-500 rounded-full flex items-center justify-center\"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: \"spring\", stiffness: 200, delay: 0.2 }}
        >
          <CheckCircle className=\"h-8 w-8 text-white\" />
        </motion.div>
        <h2 className=\"text-2xl font-bold text-primary-900 dark:text-primary-100\">
          Enhancement Complete!
        </h2>
        <p className=\"text-primary-600 dark:text-primary-400\">
          Your website has been successfully enhanced with modern optimizations.
        </p>
      </div>

      {results && (
        <div className=\"space-y-6\">
          {/* Score Improvements */}
          <div className=\"grid grid-cols-3 gap-4\">
            {[
              { label: \"Performance\", score: results.performanceScore, color: \"text-blue-500\" },
              { label: \"Accessibility\", score: results.accessibilityScore, color: \"text-green-500\" },
              { label: \"SEO\", score: results.seoScore, color: \"text-purple-500\" }
            ].map((metric, index) => (
              <motion.div
                key={metric.label}
                className=\"text-center p-4 rounded-lg bg-primary-50 dark:bg-primary-800/50 border border-primary-200 dark:border-primary-700\"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <div className={`text-2xl font-bold ${metric.color} mb-1`}>
                  {metric.score}
                </div>
                <div className=\"text-sm text-primary-600 dark:text-primary-400\">
                  {metric.label}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Improvements List */}
          <div className=\"space-y-3\">
            <h3 className=\"font-medium text-primary-900 dark:text-primary-100\">
              Applied Improvements
            </h3>
            <div className=\"space-y-2\">
              {results.improvements.map((improvement: string, index: number) => (
                <motion.div
                  key={index}
                  className=\"flex items-center gap-2 p-2 rounded bg-success-50 dark:bg-success-900/20 text-success-700 dark:text-success-300\"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                >
                  <CheckCircle className=\"h-4 w-4\" />
                  <span className=\"text-sm\">{improvement}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className=\"flex justify-between\">
        <Button variant=\"outline\" onClick={onClose}>
          Close
        </Button>
        <div className=\"flex gap-2\">
          <Button variant=\"outline\">
            <Eye className=\"h-4 w-4 mr-2\" />
            Preview
          </Button>
          <Button className=\"bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700\">
            <Download className=\"h-4 w-4 mr-2\" />
            Download
          </Button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className=\"fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4\">
      <motion.div
        className=\"w-full max-w-2xl bg-white dark:bg-primary-900 rounded-2xl shadow-2xl border border-primary-200 dark:border-primary-700 overflow-hidden\"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: \"spring\", stiffness: 300, damping: 30 }}
      >
        {/* Progress Bar */}
        <div className=\"h-2 bg-primary-100 dark:bg-primary-800\">
          <motion.div
            className=\"h-full bg-gradient-to-r from-primary-500 to-accent-500\"
            variants={progressVariants}
            initial=\"initial\"
            animate=\"animate\"
            custom={progress}
          />
        </div>

        {/* Content */}
        <div className=\"p-8\">
          <div className=\"mb-6\">
            <div className=\"flex items-center justify-between mb-2\">
              <span className=\"text-sm text-primary-600 dark:text-primary-400\">
                Step {currentStep} of {totalSteps}
              </span>
              <button
                onClick={onClose}
                className=\"text-primary-400 hover:text-primary-600 dark:hover:text-primary-300\"
              >
                ×
              </button>
            </div>
          </div>

          <AnimatePresence mode=\"wait\">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderResults()}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}