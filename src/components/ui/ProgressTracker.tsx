import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Clock, AlertCircle, Loader2, ChevronDown, ChevronRight } from 'lucide-react';

export interface ProgressStep {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'error' | 'warning';
  startTime?: number;
  completedTime?: number;
  duration?: number;
  progress?: number; // 0-100 for in-progress steps
  details?: string[];
  errorMessage?: string;
  warnings?: string[];
}

interface ProgressTrackerProps {
  steps: ProgressStep[];
  title?: string;
  onCancel?: () => void;
  showDetails?: boolean;
  compact?: boolean;
  showEstimatedTime?: boolean;
  onStepClick?: (stepId: string) => void;
}

export function ProgressTracker({
  steps,
  title = 'Analysis Progress',
  onCancel,
  showDetails = true,
  compact = false,
  showEstimatedTime = true,
  onStepClick
}: ProgressTrackerProps) {
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());
  const [overallProgress, setOverallProgress] = useState(0);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState<number | null>(null);

  // Calculate overall progress
  useEffect(() => {
    const completedSteps = steps.filter(step => step.status === 'completed').length;
    const inProgressStep = steps.find(step => step.status === 'in-progress');
    
    let progress = (completedSteps / steps.length) * 100;
    
    // Add partial progress for in-progress step
    if (inProgressStep && inProgressStep.progress) {
      progress += (inProgressStep.progress / 100) * (1 / steps.length) * 100;
    }
    
    setOverallProgress(Math.min(100, progress));
  }, [steps]);

  // Calculate estimated time remaining
  useEffect(() => {
    if (!showEstimatedTime) return;

    const now = Date.now();
    const completedSteps = steps.filter(step => step.status === 'completed' && step.startTime && step.completedTime);
    
    if (completedSteps.length === 0) {
      setEstimatedTimeRemaining(null);
      return;
    }

    // Calculate average completion time
    const totalDuration = completedSteps.reduce((sum, step) => {
      return sum + (step.completedTime! - step.startTime!);
    }, 0);
    
    const averageDuration = totalDuration / completedSteps.length;
    const remainingSteps = steps.filter(step => ['pending', 'in-progress'].includes(step.status)).length;
    
    // Account for current step progress
    const inProgressStep = steps.find(step => step.status === 'in-progress');
    let adjustedRemainingSteps = remainingSteps;
    
    if (inProgressStep && inProgressStep.progress) {
      adjustedRemainingSteps = remainingSteps - 1 + ((100 - inProgressStep.progress) / 100);
    }
    
    setEstimatedTimeRemaining(Math.ceil(averageDuration * adjustedRemainingSteps / 1000));
  }, [steps, showEstimatedTime]);

  const toggleStepExpansion = (stepId: string) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId);
    } else {
      newExpanded.add(stepId);
    }
    setExpandedSteps(newExpanded);
  };

  const getStatusIcon = (status: ProgressStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in-progress':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: ProgressStep['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'in-progress':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'error':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'warning':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ${seconds % 60}s`;
  };

  const formatTimeRemaining = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ${seconds % 60}s`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
  };

  const isAnyStepActive = steps.some(step => ['in-progress', 'error'].includes(step.status));
  const hasErrors = steps.some(step => step.status === 'error');
  const hasWarnings = steps.some(step => step.status === 'warning');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`
        bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700
        ${compact ? 'p-4' : 'p-6'}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h3>
          {showEstimatedTime && estimatedTimeRemaining && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Estimated time remaining: {formatTimeRemaining(estimatedTimeRemaining)}
            </p>
          )}
        </div>
        
        {onCancel && isAnyStepActive && (
          <button
            onClick={onCancel}
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Overall Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Overall Progress
          </span>
          <span className="text-sm text-gray-500">
            {Math.round(overallProgress)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <motion.div
            className={`h-2 rounded-full transition-colors duration-300 ${
              hasErrors ? 'bg-red-500' : hasWarnings ? 'bg-yellow-500' : 'bg-blue-500'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${overallProgress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Steps List */}
      <div className="space-y-3">
        {steps.map((step, index) => {
          const isExpanded = expandedSteps.has(step.id);
          const hasSubContent = step.details?.length || step.errorMessage || step.warnings?.length;

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`
                border rounded-lg p-4 transition-all duration-200
                ${getStatusColor(step.status)}
                ${onStepClick ? 'cursor-pointer hover:shadow-md' : ''}
              `}
              onClick={() => onStepClick?.(step.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  {getStatusIcon(step.status)}
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">
                        {step.title}
                      </h4>
                      {step.duration && (
                        <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                          {formatDuration(step.duration)}
                        </span>
                      )}
                    </div>
                    
                    {step.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {step.description}
                      </p>
                    )}
                    
                    {/* Progress bar for in-progress steps */}
                    {step.status === 'in-progress' && step.progress !== undefined && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                          <motion.div
                            className="bg-blue-500 h-1.5 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${step.progress}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Processing...</span>
                          <span>{step.progress}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Expand/Collapse Button */}
                {showDetails && hasSubContent && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleStepExpansion(step.id);
                    }}
                    className="ml-2 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>

              {/* Expanded Details */}
              <AnimatePresence>
                {showDetails && isExpanded && hasSubContent && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-3 pl-8 border-l-2 border-gray-300 dark:border-gray-600"
                  >
                    {/* Error Message */}
                    {step.errorMessage && (
                      <div className="mb-2">
                        <p className="text-sm font-medium text-red-700 dark:text-red-400 mb-1">
                          Error:
                        </p>
                        <p className="text-sm text-red-600 dark:text-red-300">
                          {step.errorMessage}
                        </p>
                      </div>
                    )}

                    {/* Warnings */}
                    {step.warnings && step.warnings.length > 0 && (
                      <div className="mb-2">
                        <p className="text-sm font-medium text-yellow-700 dark:text-yellow-400 mb-1">
                          Warnings:
                        </p>
                        <ul className="text-sm text-yellow-600 dark:text-yellow-300 space-y-1">
                          {step.warnings.map((warning, idx) => (
                            <li key={idx} className="flex items-start space-x-1">
                              <span>•</span>
                              <span>{warning}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Details */}
                    {step.details && step.details.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Details:
                        </p>
                        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                          {step.details.map((detail, idx) => (
                            <li key={idx} className="flex items-start space-x-1">
                              <span>•</span>
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Summary Stats */}
      {!compact && (
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-green-600">
                {steps.filter(s => s.status === 'completed').length}
              </div>
              <div className="text-xs text-gray-500">Completed</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-blue-600">
                {steps.filter(s => s.status === 'in-progress').length}
              </div>
              <div className="text-xs text-gray-500">In Progress</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-red-600">
                {steps.filter(s => s.status === 'error').length}
              </div>
              <div className="text-xs text-gray-500">Errors</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-600">
                {steps.filter(s => s.status === 'pending').length}
              </div>
              <div className="text-xs text-gray-500">Pending</div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
} 