import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LandingPage } from './pages/LandingPage';
import { EnhancedAuthPage } from './pages/EnhancedAuthPage';
import { Dashboard } from './pages/Dashboard';
import { AnalysisPage } from './pages/AnalysisPage';
import { ChatPage } from './pages/ChatPage';
import { LoadingOverlay } from './components/ui/LoadingSpinner';

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const [showLanding, setShowLanding] = useState(true);

  if (isLoading) {
    return <LoadingOverlay>Loading LuminaWeb...</LoadingOverlay>;
  }

  // Show landing page if not authenticated and landing is enabled
  if (!isAuthenticated && showLanding && window.location.pathname === '/') {
    return <LandingPage onGetStarted={() => setShowLanding(false)} />;
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/auth" 
          element={isAuthenticated ? <Navigate to="/" replace /> : <EnhancedAuthPage />} 
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
          path="/" 
          element={isAuthenticated ? <Dashboard /> : <Navigate to="/auth" replace />} 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;