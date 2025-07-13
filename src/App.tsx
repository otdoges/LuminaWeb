import { useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider, NotificationContainer } from './components/ui/notification';
import { LoadingOverlay } from './components/ui/LoadingSpinner';
import { EnvDebug } from './components/debug/EnvDebug';

// Lazy load all page components for better performance
const LandingPage = lazy(() => import('./pages/LandingPage').then(module => ({ default: module.LandingPage })));
const ModernAuthPage = lazy(() => import('./pages/ModernAuthPage').then(module => ({ default: module.ModernAuthPage })));
const Dashboard = lazy(() => import('./pages/Dashboard').then(module => ({ default: module.Dashboard })));
const AnalysisPage = lazy(() => import('./pages/AnalysisPage').then(module => ({ default: module.AnalysisPage })));
const ChatPage = lazy(() => import('./pages/ChatPage').then(module => ({ default: module.ChatPage })));
const UIShowcase = lazy(() => import('./components/demo/UIShowcase').then(module => ({ default: module.UIShowcase })));
const MotionPlayground = lazy(() => import('./pages/MotionPlayground').then(module => ({ default: module.MotionPlayground })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(module => ({ default: module.SettingsPage })));

// Enhanced loading component with better UX
function RouteLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 mx-auto">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
        </div>
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const [showLanding, setShowLanding] = useState(true);

  // Show loading overlay during initial auth check
  if (isLoading) {
    return <LoadingOverlay>Loading LuminaWeb...</LoadingOverlay>;
  }

  const handleGetStarted = () => {
    if (isAuthenticated) {
      // User is authenticated, go to dashboard
      setShowLanding(false);
    } else {
      // User is not authenticated, go to auth page
      setShowLanding(false);
    }
  };

  return (
    <Router>
      <Suspense fallback={<RouteLoader />}>
        <Routes>
          <Route 
            path="/auth" 
            element={isAuthenticated ? <Navigate to="/" replace /> : <ModernAuthPage />} 
          />
          <Route 
            path="/dashboard" 
            element={isAuthenticated ? <Dashboard /> : <Navigate to="/auth" replace />} 
          />
          <Route 
            path="/analysis" 
            element={isAuthenticated ? <AnalysisPage /> : <Navigate to="/auth" replace />} 
          />
          <Route 
            path="/chat" 
            element={isAuthenticated ? <ChatPage /> : <Navigate to="/auth" replace />} 
          />
          <Route 
            path="/demo" 
            element={isAuthenticated ? <UIShowcase /> : <Navigate to="/auth" replace />} 
          />
          <Route 
            path="/playground" 
            element={isAuthenticated ? <MotionPlayground /> : <Navigate to="/auth" replace />} 
          />
          <Route 
            path="/settings" 
            element={isAuthenticated ? <SettingsPage /> : <Navigate to="/auth" replace />} 
          />
          <Route 
            path="/" 
            element={
              showLanding ? (
                <LandingPage onGetStarted={handleGetStarted} />
              ) : isAuthenticated ? (
                <Dashboard />
              ) : (
                <Navigate to="/auth" replace />
              )
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <NotificationContainer />
      <EnvDebug />
    </Router>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <AppContent />
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;