import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SupabaseAuthProvider } from './components/SupabaseAuthProvider';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import BeforeAfter from './components/BeforeAfter';
import Features from './components/Features';
import Testimonials from './components/Testimonials';
import FinalCTA from './components/FinalCTA';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';
import Auth from './components/Auth';
import TermsOfService from './components/TermsOfService';
import PrivacyPolicy from './components/PrivacyPolicy';

function App() {
  return (
    <SupabaseAuthProvider>
      <Router>
        <Routes>
          <Route path="/dashboard/*" element={<Dashboard />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/" element={
            <div className="min-h-screen bg-gradient-to-b from-gray-900 via-indigo-900 to-purple-800 text-white">
              <Navbar />
              <main>
                <Hero />
                <HowItWorks />
                <BeforeAfter />
                <Features />
                <Testimonials />
                <FinalCTA />
              </main>
              <Footer />
            </div>
          } />
        </Routes>
      </Router>
    </SupabaseAuthProvider>
  );
}

export default App;