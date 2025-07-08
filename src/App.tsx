import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider, NotificationContainer } from './components/ui/notification';
import { LandingPage } from './pages/LandingPage';
import { EnhancedAuthPage } from './pages/EnhancedAuthPage';
import { Dashboard } from './pages/Dashboard';
import { AnalysisPage } from './pages/AnalysisPage';
import { ChatPage } from './pages/ChatPage';
import { LoadingOverlay } from './components/ui/LoadingSpinner';
import { UIShowcase } from './components/demo/UIShowcase';
import { MotionPlayground } from './pages/MotionPlayground';
import { SettingsPage } from './pages/SettingsPage';
import { EnvDebug } from './components/debug/EnvDebug';

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
      <Routes>
        <Route 
          path="/auth" 
          element={isAuthenticated ? <Navigate to="/" replace /> : <EnhancedAuthPage />} 
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