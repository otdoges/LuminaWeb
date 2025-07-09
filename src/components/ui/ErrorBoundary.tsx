import React, { Component, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home, Mail, Bug } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  errorId: string;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  showErrorDetails?: boolean;
  level?: 'page' | 'component' | 'critical';
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error for development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 React Error Boundary');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.groupEnd();
    }

    // In production, you might want to send errors to a logging service
    if (process.env.NODE_ENV === 'production') {
      this.logErrorToService(error, errorInfo);
    }
  }

  private logErrorToService = (error: Error, errorInfo: React.ErrorInfo) => {
    // Implement your error logging service here
    // Example: Sentry, LogRocket, etc.
    console.log('Logging error to service:', { error, errorInfo });
  };

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private copyErrorDetails = () => {
    const { error, errorInfo, errorId } = this.state;
    const errorDetails = {
      id: errorId,
      message: error?.message,
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2));
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { level = 'component' } = this.props;
      const { error, errorId } = this.state;

      return (
        <ErrorDisplay
          error={error}
          errorId={errorId}
          level={level}
          showErrorDetails={this.props.showErrorDetails}
          onRetry={this.handleRetry}
          onReload={this.handleReload}
          onGoHome={this.handleGoHome}
          onCopyDetails={this.copyErrorDetails}
        />
      );
    }

    return this.props.children;
  }
}

interface ErrorDisplayProps {
  error: Error | null;
  errorId: string;
  level: 'page' | 'component' | 'critical';
  showErrorDetails?: boolean;
  onRetry: () => void;
  onReload: () => void;
  onGoHome: () => void;
  onCopyDetails: () => void;
}

function ErrorDisplay({
  error,
  errorId,
  level,
  showErrorDetails = false,
  onRetry,
  onReload,
  onGoHome,
  onCopyDetails,
}: ErrorDisplayProps) {
  const getErrorConfig = () => {
    switch (level) {
      case 'critical':
        return {
          title: 'Critical Error',
          description: 'A critical error has occurred that prevents the application from functioning properly.',
          icon: AlertTriangle,
          containerClass: 'min-h-screen bg-destructive/5',
          actions: ['reload', 'home', 'details'],
        };
      case 'page':
        return {
          title: 'Page Error',
          description: 'An error occurred while loading this page.',
          icon: AlertTriangle,
          containerClass: 'min-h-[400px]',
          actions: ['retry', 'home', 'details'],
        };
      case 'component':
      default:
        return {
          title: 'Component Error',
          description: 'An error occurred in this component.',
          icon: Bug,
          containerClass: 'min-h-[200px]',
          actions: ['retry', 'details'],
        };
    }
  };

  const config = getErrorConfig();
  const IconComponent = config.icon;

  return (
    <div className={`flex items-center justify-center p-4 ${config.containerClass}`}>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4"
          >
            <IconComponent className="w-8 h-8 text-destructive" />
          </motion.div>
          <CardTitle className="text-xl font-semibold">{config.title}</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            {config.description}
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-3 bg-muted rounded-lg"
            >
              <p className="text-sm font-medium text-foreground">
                {error.message || 'An unexpected error occurred'}
              </p>
              {showErrorDetails && (
                <details className="mt-2">
                  <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                    Error Details
                  </summary>
                  <pre className="text-xs text-muted-foreground mt-2 whitespace-pre-wrap break-all">
                    {error.stack}
                  </pre>
                </details>
              )}
            </motion.div>
          )}

          <div className="text-xs text-muted-foreground text-center">
            Error ID: {errorId}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-2 justify-center"
          >
            {config.actions.includes('retry') && (
              <Button
                onClick={onRetry}
                variant="default"
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>
            )}
            
            {config.actions.includes('reload') && (
              <Button
                onClick={onReload}
                variant="default"
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Page
              </Button>
            )}
            
            {config.actions.includes('home') && (
              <Button
                onClick={onGoHome}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                Go Home
              </Button>
            )}
            
            {config.actions.includes('details') && (
              <Button
                onClick={onCopyDetails}
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                Copy Details
              </Button>
            )}
          </motion.div>

          {level === 'critical' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center text-xs text-muted-foreground"
            >
              If this problem persists, please contact support with the error ID above.
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Higher-order component for easy wrapping
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
}

// Hook for manual error triggering (useful for async errors)
export function useErrorHandler() {
  return React.useCallback((error: Error, errorInfo?: React.ErrorInfo) => {
    // Create a synthetic error boundary trigger
    const errorBoundary = new ErrorBoundary({} as ErrorBoundaryProps);
    errorBoundary.componentDidCatch(error, errorInfo || {} as React.ErrorInfo);
  }, []);
}

export default ErrorBoundary; 