import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Globe, 
  Settings, 
  BarChart3, 
  Target, 
  ArrowRight, 
  ArrowLeft,
  Check,
  Plus,
  X
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { AnalysisSettings, AnalysisParameter } from '../../types/analysis';

interface AnalysisWizardProps {
  onComplete: (urls: string[], settings: AnalysisSettings) => void;
  onCancel: () => void;
}

const defaultUrls = [
  'acme-electronics.com',
  'acme-industrial.solutions',
  'acme-global-retail.net',
  'shop.acme-brands.com'
];

const analysisParameters: AnalysisParameter[] = [
  { id: 'seo', name: 'SEO Metrics', enabled: true, weight: 1 },
  { id: 'performance', name: 'Performance Analytics', enabled: true, weight: 1 },
  { id: 'engagement', name: 'User Engagement Statistics', enabled: true, weight: 1 },
  { id: 'competitor', name: 'Competitor Comparison', enabled: false, weight: 0.8 },
  { id: 'content', name: 'Content Quality Assessment', enabled: true, weight: 0.9 },
  { id: 'mobile', name: 'Mobile Responsiveness', enabled: true, weight: 1 },
  { id: 'security', name: 'Security Analysis', enabled: true, weight: 1 },
];

export function AnalysisWizard({ onComplete, onCancel }: AnalysisWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [urls, setUrls] = useState<string[]>(defaultUrls);
  const [newUrl, setNewUrl] = useState('');
  const [parameters, setParameters] = useState<AnalysisParameter[]>(analysisParameters);
  const [settings, setSettings] = useState<AnalysisSettings>({
    parameters: analysisParameters,
    trafficSources: ['organic', 'paid', 'social'],
    conversionTracking: true,
    customerJourney: true,
    heatmapVisualization: false,
    abTesting: false,
    customKPIs: [],
    reportFormat: 'pdf',
    scheduledReports: false,
    reportFrequency: 'weekly'
  });

  const steps = [
    { title: 'Website URLs', icon: Globe },
    { title: 'Analysis Parameters', icon: BarChart3 },
    { title: 'Detailed Settings', icon: Settings },
    { title: 'Review & Start', icon: Target }
  ];

  const addUrl = () => {
    if (newUrl && !urls.includes(newUrl)) {
      setUrls([...urls, newUrl]);
      setNewUrl('');
    }
  };

  const removeUrl = (index: number) => {
    setUrls(urls.filter((_, i) => i !== index));
  };

  const toggleParameter = (id: string) => {
    setParameters(params => 
      params.map(p => 
        p.id === id ? { ...p, enabled: !p.enabled } : p
      )
    );
  };

  const updateParameterWeight = (id: string, weight: number) => {
    setParameters(params => 
      params.map(p => 
        p.id === id ? { ...p, weight } : p
      )
    );
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(urls, { ...settings, parameters });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        <Card className="bg-white/95 dark:bg-primary-800/95 backdrop-blur-md">
          <CardHeader className="border-b border-primary-200 dark:border-primary-700">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold text-primary-900 dark:text-primary-100">
                Website Analysis Setup
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={onCancel}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Progress Steps */}
            <div className="flex items-center justify-between mt-6">
              {steps.map((step, index) => (
                <div key={step.title} className="flex items-center">
                  <motion.div
                    className={`
                      flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300
                      ${index <= currentStep 
                        ? 'bg-accent-600 border-accent-600 text-white' 
                        : 'border-primary-300 dark:border-primary-600 text-primary-400'
                      }
                    `}
                    whileHover={{ scale: 1.05 }}
                  >
                    {index < currentStep ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <step.icon className="w-5 h-5" />
                    )}
                  </motion.div>
                  <div className="ml-3 hidden sm:block">
                    <p className={`text-sm font-medium ${
                      index <= currentStep 
                        ? 'text-primary-900 dark:text-primary-100' 
                        : 'text-primary-500 dark:text-primary-400'
                    }`}>
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`
                      w-12 h-0.5 mx-4 transition-all duration-300
                      ${index < currentStep ? 'bg-accent-600' : 'bg-primary-300 dark:bg-primary-600'}
                    `} />
                  )}
                </div>
              ))}
            </div>
          </CardHeader>

          <CardContent className="p-6 max-h-[60vh] overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Step 1: Website URLs */}
                {currentStep === 0 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-primary-900 dark:text-primary-100 mb-2">
                        Enter Website URLs to Analyze
                      </h3>
                      <p className="text-primary-600 dark:text-primary-400 mb-4">
                        Add the websites you want to analyze. We've pre-populated some example sites.
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter website URL (e.g., example.com)"
                        value={newUrl}
                        onChange={(e) => setNewUrl(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addUrl()}
                        className="flex-1"
                      />
                      <Button onClick={addUrl} disabled={!newUrl}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {urls.map((url, index) => (
                        <motion.div
                          key={url}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-3 bg-primary-50 dark:bg-primary-700 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <Globe className="w-4 h-4 text-accent-600" />
                            <span className="text-primary-900 dark:text-primary-100">{url}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeUrl(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 2: Analysis Parameters */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-primary-900 dark:text-primary-100 mb-2">
                        Select Analysis Parameters
                      </h3>
                      <p className="text-primary-600 dark:text-primary-400 mb-4">
                        Choose which aspects of your websites you want to analyze and their importance.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {parameters.map((param, index) => (
                        <motion.div
                          key={param.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Card className={`
                            cursor-pointer transition-all duration-300 hover:shadow-md
                            ${param.enabled 
                              ? 'border-accent-500 bg-accent-50 dark:bg-accent-900/20' 
                              : 'border-primary-200 dark:border-primary-700'
                            }
                          `}>
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-3">
                                <label className="flex items-center gap-3 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={param.enabled}
                                    onChange={() => toggleParameter(param.id)}
                                    className="w-4 h-4 text-accent-600 bg-white border-primary-300 rounded focus:ring-accent-500"
                                  />
                                  <span className="font-medium text-primary-900 dark:text-primary-100">
                                    {param.name}
                                  </span>
                                </label>
                              </div>
                              {param.enabled && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  className="space-y-2"
                                >
                                  <label className="text-sm text-primary-600 dark:text-primary-400">
                                    Importance Weight: {param.weight}
                                  </label>
                                  <input
                                    type="range"
                                    min="0.1"
                                    max="1"
                                    step="0.1"
                                    value={param.weight}
                                    onChange={(e) => updateParameterWeight(param.id, parseFloat(e.target.value))}
                                    className="w-full h-2 bg-primary-200 rounded-lg appearance-none cursor-pointer"
                                  />
                                </motion.div>
                              )}
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 3: Detailed Settings */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-primary-900 dark:text-primary-100 mb-2">
                        Configure Detailed Settings
                      </h3>
                      <p className="text-primary-600 dark:text-primary-400 mb-4">
                        Customize advanced analysis options and reporting preferences.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Traffic Sources */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Traffic Sources</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {['organic', 'paid', 'social', 'direct', 'referral'].map(source => (
                            <label key={source} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={settings.trafficSources.includes(source)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSettings(s => ({ ...s, trafficSources: [...s.trafficSources, source] }));
                                  } else {
                                    setSettings(s => ({ ...s, trafficSources: s.trafficSources.filter(t => t !== source) }));
                                  }
                                }}
                                className="w-4 h-4 text-accent-600"
                              />
                              <span className="capitalize text-primary-900 dark:text-primary-100">{source}</span>
                            </label>
                          ))}
                        </CardContent>
                      </Card>

                      {/* Analysis Features */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Analysis Features</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {[
                            { key: 'conversionTracking', label: 'Conversion Tracking' },
                            { key: 'customerJourney', label: 'Customer Journey Mapping' },
                            { key: 'heatmapVisualization', label: 'Heat Map Visualization' },
                            { key: 'abTesting', label: 'A/B Testing Scenarios' }
                          ].map(feature => (
                            <label key={feature.key} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={settings[feature.key as keyof AnalysisSettings] as boolean}
                                onChange={(e) => setSettings(s => ({ ...s, [feature.key]: e.target.checked }))}
                                className="w-4 h-4 text-accent-600"
                              />
                              <span className="text-primary-900 dark:text-primary-100">{feature.label}</span>
                            </label>
                          ))}
                        </CardContent>
                      </Card>

                      {/* Report Settings */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Report Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">
                              Report Format
                            </label>
                            <select
                              value={settings.reportFormat}
                              onChange={(e) => setSettings(s => ({ ...s, reportFormat: e.target.value as any }))}
                              className="w-full p-2 border border-primary-300 dark:border-primary-600 rounded-lg bg-white dark:bg-primary-700"
                            >
                              <option value="pdf">PDF</option>
                              <option value="excel">Excel</option>
                              <option value="json">JSON</option>
                            </select>
                          </div>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={settings.scheduledReports}
                              onChange={(e) => setSettings(s => ({ ...s, scheduledReports: e.target.checked }))}
                              className="w-4 h-4 text-accent-600"
                            />
                            <span className="text-primary-900 dark:text-primary-100">Scheduled Reports</span>
                          </label>
                          {settings.scheduledReports && (
                            <div>
                              <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">
                                Frequency
                              </label>
                              <select
                                value={settings.reportFrequency}
                                onChange={(e) => setSettings(s => ({ ...s, reportFrequency: e.target.value as any }))}
                                className="w-full p-2 border border-primary-300 dark:border-primary-600 rounded-lg bg-white dark:bg-primary-700"
                              >
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                              </select>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}

                {/* Step 4: Review & Start */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-primary-900 dark:text-primary-100 mb-2">
                        Review Your Analysis Setup
                      </h3>
                      <p className="text-primary-600 dark:text-primary-400 mb-4">
                        Review your configuration before starting the analysis.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Websites ({urls.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {urls.map(url => (
                              <div key={url} className="flex items-center gap-2">
                                <Globe className="w-4 h-4 text-accent-600" />
                                <span className="text-sm text-primary-900 dark:text-primary-100">{url}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Analysis Parameters</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {parameters.filter(p => p.enabled).map(param => (
                              <div key={param.id} className="flex items-center justify-between">
                                <span className="text-sm text-primary-900 dark:text-primary-100">{param.name}</span>
                                <span className="text-xs text-accent-600 font-medium">Weight: {param.weight}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="bg-accent-50 dark:bg-accent-900/20 p-4 rounded-lg">
                      <p className="text-sm text-accent-800 dark:text-accent-200">
                        <strong>Estimated Analysis Time:</strong> 5-10 minutes per website
                        <br />
                        <strong>Total Websites:</strong> {urls.length}
                        <br />
                        <strong>Active Parameters:</strong> {parameters.filter(p => p.enabled).length}
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </CardContent>

          <div className="flex items-center justify-between p-6 border-t border-primary-200 dark:border-primary-700">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </Button>

            <div className="flex items-center gap-2">
              <span className="text-sm text-primary-600 dark:text-primary-400">
                Step {currentStep + 1} of {steps.length}
              </span>
            </div>

            <Button
              onClick={handleNext}
              disabled={currentStep === 0 && urls.length === 0}
              className="flex items-center gap-2"
            >
              {currentStep === steps.length - 1 ? 'Start Analysis' : 'Next'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}