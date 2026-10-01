import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Exact components
import Navbar from './components/Navbar';
import Loader from './components/Loader';
import HeroSection from './components/HeroSection';
import StatsVisionSection from './components/StatsVisionSection';
import AcademicPrograms from './components/AcademicPrograms';
import AboutSection from './components/AboutSection';
import LoginPage from './components/LoginPage';
import AdminDashboard from './components/AdminDashboard';
import DownloadsPage from './components/downloads/DownloadsPage';
import Faculty from "./components/faculty/Faculty";
import ProgramDetails from './components/ProgramDetails';
//import ContactSection from './components/ContactSection';
import ContactSection from './components/ContactSection';
import PublicNoticePopup from "./components/notice/PublicNoticePopup";
import Footer from './components/Footer';
import ScrollToTopButton from './components/ScrollToTopButton'; 

// Application Generator component
import ApplicationGenerator from './components/applications/ApplicationGenerator';

import { useAuth } from './context/AuthContext';

// Restored Original Navbar Entrance Variants
const navbarVariants = {
  hidden: { 
    opacity: 0, 
    y: -12
  },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.65, 
      ease: [0.16, 1, 0.3, 1],
      delay: 0.05
    } 
  }
};

class AppErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error('Application failed to render:', error);
  }

  render() {
    if (this.state.hasError) {
      return <Loader isLoading />;
    }

    return this.props.children;
  }
}

function AppContent() {
  const { user } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [contentReady, setContentReady] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith('/admin');

  // Reset scroll on initial load
  useEffect(() => {
    window.history.scrollRestoration = 'manual';
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  // Reset scroll to top every time the route changes (e.g. Faculty, Downloads)
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [location.pathname]);

  // Loader Duration
  useEffect(() => {
    const timer = setTimeout(() => {
  requestAnimationFrame(() => {
    setIsLoading(false);
  });
}, 3200);

    return () => clearTimeout(timer);
  }, []);

  // Delay Hero's internal animations (typing text + floating badges) until
  // the Navbar's own entrance animation has finished (duration 0.8s + delay 0.1s)
  useEffect(() => {
    if (!isLoading) {
      const t = setTimeout(() => setContentReady(true), 700);
      return () => clearTimeout(t);
    } else {
      setContentReady(false);
    }
  }, [isLoading]);

  return (
    <div className={`relative min-h-screen overflow-hidden ${isAdminRoute ? 'bg-gray-100 text-gray-800' : 'public-light-theme bg-gray-100 text-gray-900'}`}>
      
      {/* Loader Component */}
      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div
            key="loader-screen"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ 
              opacity: 0,
              scale: 1.05,
              transition: { duration: 0.8, ease: 'easeInOut' } 
            }}
            className="fixed inset-0 z-50 bg-[#0b0f19]"
          >
            <Loader isLoading={isLoading} />
          </motion.div>
        )}
      </AnimatePresence>

      <ScrollToTopButton />
       {!isAdminRoute && contentReady && <PublicNoticePopup />}

      {/* Top Navbar: Keeps exact variants and timings, rendered immediately */}
      {!isAdminRoute && (
        <Navbar 
          variants={navbarVariants}
          initial="hidden"
          animate={isLoading ? "hidden" : "visible"}
          onOpenLogin={() => setIsLoginOpen(true)} 
        />
      )}

      {/* Glassy Login Modal Pop-up */}
      {isLoginOpen && (
        <LoginPage onClose={() => setIsLoginOpen(false)} />
      )}

      {/* Main Content Area: Synchronized entrance upon loader exit */}
      <motion.main
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: isLoading ? 0 : 1, y: isLoading ? 15 : 0 }}
        transition={{ duration: 0.65, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
        className="w-full flex flex-col pt-0"
      >
        <Routes>
          {/* Main Landing / Home Page */}
<Route 
  path="/" 
  element={
    <>
      <HeroSection isLoading={isLoading} contentReady={contentReady} onOpenLogin={() => setIsLoginOpen(true)} />
      <StatsVisionSection />
      <AcademicPrograms />
      <AboutSection />
      <ContactSection />
    </>
  } 
/>


          {/* Dynamic Shared Program Details Route */}
          <Route 
            path="/program-details/:programId?" 
            element={<ProgramDetails />} 
          />

          {/* Applications Route */}
          <Route 
            path="/applications" 
            element={
              <div className="w-full min-h-[85vh] relative pt-16">
                <div className="absolute top-20 left-6 z-20"> 
                  <button 
                    onClick={() => navigate('/')}
                    className="text-xs font-bold text-cyan-400 hover:text-cyan-300 bg-slate-900/90 px-4 py-2 rounded-xl border border-slate-800 transition-colors cursor-pointer shadow-lg backdrop-blur-md"
                  >
                    ← Back to Main Home
                  </button>
                </div>
                
                <ApplicationGenerator />
              </div>
            } 
          />

          {/* Public Downloads Page */}
          <Route 
            path="/downloads" 
            element={<DownloadsPage />} 
          />

          {/* Public Faculty Page */}
          <Route path="/faculty" element={<Faculty />} />

          {/* Protected Admin Dashboard Route */}
          <Route 
            path="/admin/dashboard" 
            element={user ? <AdminDashboard /> : <Navigate to="/" />} 
          />
        </Routes>
        {!isAdminRoute && <Footer />}
      </motion.main>
    </div>
  );
}

export default function App() {
  return (
    <AppErrorBoundary>
      <AppContent />
    </AppErrorBoundary>
  );
}