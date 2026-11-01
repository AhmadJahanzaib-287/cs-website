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
import API from './api/axios';

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
  const [portalSettings, setPortalSettings] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith('/admin');

  useEffect(() => {
    const applyUpdatedSettings = (event) => setPortalSettings(event.detail);
    window.addEventListener('portal-settings-updated', applyUpdatedSettings);
    API.get('/settings')
      .then(({ data }) => {
        if (data.success) setPortalSettings(data.data);
      })
      .catch((error) => console.error('Could not load public portal settings:', error));

    return () => window.removeEventListener('portal-settings-updated', applyUpdatedSettings);
  }, []);

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

  if (!isAdminRoute && portalSettings?.maintenanceMode && !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f3f7fb] px-5 py-16 text-center text-[#17243b]">
        <div className="max-w-lg">
          <p className="text-xs font-bold uppercase tracking-wider text-[#0e7490]">{portalSettings.departmentName}</p>
          <h1 className="mt-4 text-3xl font-extrabold">Portal maintenance</h1>
          <p className="mt-3 text-sm leading-6 text-[#64748b]">
            The public portal is temporarily unavailable while we complete system updates. Please check back shortly.
          </p>
          <button
            type="button"
            onClick={() => setIsLoginOpen(true)}
            className="mt-6 rounded-md bg-[#1e3a8a] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#172e6e]"
          >
            Admin sign in
          </button>
        </div>
        {isLoginOpen && <LoginPage onClose={() => setIsLoginOpen(false)} />}
      </main>
    );
  }

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
          admissionPortalOpen={portalSettings?.admissionPortalOpen !== false}
          admissionDeadline={portalSettings?.admissionDeadline}
          academicSession={portalSettings?.currentAcademicSession}
        />
      )}

      {!isAdminRoute && portalSettings?.emergencyNoticeActive && portalSettings.emergencyNoticeText && (
        <div role="status" className="relative z-30 bg-amber-500 px-4 py-2 text-center text-xs font-semibold text-[#17243b]">
          {portalSettings.emergencyNoticeText}
        </div>
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
      <HeroSection
        isLoading={isLoading}
        contentReady={contentReady}
        admissionPortalOpen={portalSettings?.admissionPortalOpen !== false}
        academicSession={portalSettings?.currentAcademicSession}
      />
      <StatsVisionSection />
      <AcademicPrograms />
      <AboutSection />
      <ContactSection settings={portalSettings} />
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
              <ApplicationGenerator onBack={() => navigate('/')} />
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