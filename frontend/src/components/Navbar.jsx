import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ChevronDown, 
  Download, 
  Users, 
  Sparkles, 
  ArrowRight,
  Printer,
  UserCheck,
  LogOut,
  Menu,
  X
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import LoginPage from './LoginPage'; // Fix: Import missing fix
import AdmissionsModal from './AdmissionsModal'; // Adjust path if needed

const mainNavItems = [
  { name: 'Home', href: '/' },
  { name: 'Programs', href: '#programs' },
  { name: 'Faculty', href: '/faculty' },
  { name: 'Contact', href: '#contact' },
];

const moreMenuCategories = [
  {
  title: 'Downloads',
  description: 'Access course outlines, timetables, and academic forms.',
  icon: Download,
  href: '/downloads',
  badge: 'Updated',
  isDownloadsTrigger: true   
},
  {
    title: 'Applications',
    description: 'Generate & print official department applications easily.',
    icon: Printer,
    href: '/applications',
    badge: 'Official',
    isApplicationTrigger: true
  },
  {
    title: 'Campus Life & Events',
    description: 'Explore student societies, tech galas, and sports events.',
    icon: Sparkles,
    href: '#events'
  },
  {
    title: 'About Us',
    description: 'Learn about our history, mission, and leadership at PARS.',
    icon: Users,
    href: '#about'
  }
];

const StaggeredRollText = ({ text }) => {
  return (
    <motion.span
      initial="initial"
      whileHover="hovered"
      className="relative inline-flex overflow-hidden font-medium text-xs tracking-wide cursor-pointer py-1 select-none"
    >
      {text.split('').map((char, index) => (
        <span key={index} className="relative inline-block overflow-hidden h-[16px]">
          <motion.span
            className="flex flex-col"
            variants={{
              initial: { y: "0%" },
              hovered: { y: "-50%" },
            }}
            transition={{
              duration: 0.3,
              ease: [0.33, 1, 0.68, 1],
              delay: index * 0.025,
            }}
          >
            <span className="block text-slate-300 h-[16px] leading-[16px]">
              {char === ' ' ? '\u00A0' : char}
            </span>
            <span className="block text-white font-semibold h-[16px] leading-[16px]">
              {char === ' ' ? '\u00A0' : char}
            </span>
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
};

export default function Navbar({ variants, initial, animate, onOpenLogin }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdmissionOpen, setIsAdmissionOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const pendingScrollRef = useRef(null);
  const { user, logoutUser } = useAuth();

  // If we navigated to "/" specifically to reach an in-page section
  // (e.g. clicking "Programs" from another page), scroll to it once the
  // home page's content has actually rendered.
  useEffect(() => {
    if (pendingScrollRef.current && location.pathname === '/') {
      const targetId = pendingScrollRef.current;
      pendingScrollRef.current = null;
      setTimeout(() => {
        document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    }
  }, [location.pathname]);

  const handleNavClick = (e, item) => {
  e.preventDefault();
  setIsMobileMenuOpen(false);

  if (item.name === 'Home') {
    if (location.pathname === '/') {
      // Agar pehle se home page par hain, smoothly scroll to top/hero
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Agar kisi doosre page par hain, home par navigate karein
      navigate('/');
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
    return;
  }

  if (item.name === 'Faculty') {
    navigate('/faculty');
    return;
  }

  // Anything else with a "#section" href (Programs, Contact, etc.)
  if (item.href.startsWith('#')) {
    const targetId = item.href.slice(1);
    if (location.pathname === '/') {
      document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      pendingScrollRef.current = targetId;
      navigate('/');
    }
    return;
  }

  navigate(item.href);
};
  const handleApplicationsClick = (e, cat) => {
    if (cat.isApplicationTrigger || cat.href === '/applications') {
      e.preventDefault();
      setIsMoreOpen(false);
      navigate('/applications');
    } else if (cat.isDownloadsTrigger || cat.href === '/downloads') {
      e.preventDefault();
      setIsMoreOpen(false);
      navigate('/downloads');
    }
  };

  const handleOpenLoginModal = () => {
    if (onOpenLogin) {
      onOpenLogin();
    } else {
      setIsLoginOpen(true);
    }
  };

  return (
    <>
      <motion.div 
        variants={variants} 
        initial={initial}
        animate={animate}
        className="fixed top-0 left-0 right-0 z-50 pt-4 px-4 sm:px-8 pointer-events-none"
      >
      
        <header className="max-w-5xl mx-auto px-4 py-2 rounded-full border border-slate-800/80 bg-slate-950/80 backdrop-blur-xl shadow-2xl flex items-center justify-between pointer-events-auto">
          
          {/* Brand / Logo */}
          <div 
  onClick={() => {
    setIsMobileMenuOpen(false);
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
  }} 
  className="flex items-center gap-2.5 px-2 py-1 rounded-full hover:bg-slate-800/40 transition duration-200 cursor-pointer"
>
            <img 
              src="/dcs-logo.png" 
              alt="DCS Logo" 
              width={28}
              height={28}
              decoding="sync"
              loading="eager"
              className="w-7 h-7 object-contain aspect-square shrink-0" 
            />
            <span className="text-sm font-bold tracking-tight text-white">
              DCS @ PARS
            </span>
          </div>
          {/* Navigation Items */}
          <nav 
            className="hidden md:flex items-center gap-1 relative"
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {mainNavItems.map((item, index) => (
  <a
    key={item.name}
    href={item.href}
    onMouseEnter={() => setHoveredIndex(index)}
    onClick={(e) => {
      setHoveredIndex(null); // Click par effect immediately remove hoga
      handleNavClick(e, item);
    }}
    className="relative px-3.5 py-1.5 rounded-full cursor-pointer flex items-center justify-center"
  >
    {hoveredIndex === index && (
      <motion.div
        layoutId="hoverPill"
        className="absolute inset-0 bg-slate-800/70 rounded-full"
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      />
    )}
    <span className="relative z-10">
      <StaggeredRollText text={item.name} />
    </span>
  </a>
))}

            {/* MORE DROPDOWN */}
            
<div 
  className="relative"
  onMouseEnter={() => {
    setIsMoreOpen(true);
    setHoveredIndex(null); // Clear previous active tab highlight
  }}
  onMouseLeave={() => setIsMoreOpen(false)}
>
              <button
                onClick={() => setIsMoreOpen(!isMoreOpen)}
                className={`relative px-3.5 py-1.5 rounded-full flex items-center gap-1 cursor-pointer transition-colors duration-200 ${
                  isMoreOpen ? 'bg-slate-800/80' : ''
                }`}
              >
                <span className="relative z-10">
                  <StaggeredRollText text="More" />
                </span>

                <motion.span
                  animate={{ rotate: isMoreOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="ml-0.5"
                >
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </motion.span>
              </button>

              {/* FLYOUT MEGA-MENU */}
              <AnimatePresence>
                {isMoreOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 12, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute -left-32 top-full pt-3 w-[560px] pointer-events-auto"
                  >
                    <div className="bg-slate-900/95 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-2xl p-4 grid grid-cols-12 gap-4 overflow-hidden">
                      <div className="col-span-4 bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400 block mb-1">
                            Portal Resources
                          </span>
                          <h4 className="text-sm font-bold text-white mb-2 leading-snug">
                            Quick Student Services
                          </h4>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            Access official templates, university notices, and departmental downloads in one place.
                          </p>
                        </div>

                        <a 
                          href="#all-services" 
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 mt-4 transition-colors"
                        >
                          View all resources <ArrowRight className="w-3 h-3" />
                        </a>
                      </div>

                      <div className="col-span-8 grid grid-cols-1 gap-1">
                        {moreMenuCategories.map((cat) => {
                          const Icon = cat.icon;
                          return (
                            <a
                              key={cat.title}
                              href={cat.href}
                              onClick={(e) => handleApplicationsClick(e, cat)}
                              className="group p-2.5 rounded-xl hover:bg-slate-800/60 transition-all duration-200 flex items-start gap-3 border border-transparent hover:border-slate-700/50 cursor-pointer"
                            >
                              <div className="p-2 rounded-lg bg-slate-800 group-hover:bg-cyan-500/10 text-slate-300 group-hover:text-cyan-400 transition-colors mt-0.5">
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <h5 className="text-xs font-semibold text-slate-100 group-hover:text-white transition-colors">
                                    {cat.title}
                                  </h5>
                                  {cat.badge && (
                                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                                      {cat.badge}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                                  {cat.description}
                                </p>
                              </div>
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>

          {/* ACTION BUTTONS (DESKTOP) */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-3 py-1 rounded-full flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5" />
                  {user.name}
                </span>
                <button
                  onClick={logoutUser}
                  title="Logout"
                  className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-full transition duration-200 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button 
  onClick={handleOpenLoginModal}
  className="px-3.5 py-1.5 rounded-full hover:bg-slate-800/60 transition duration-200 cursor-pointer flex items-center justify-center"
>
  <StaggeredRollText text="Log in" />
</button>
            )}

            <button 
  onClick={() => setIsAdmissionOpen(true)}
  className="px-4 py-1.5 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-200 rounded-full transition duration-200 shadow-sm cursor-pointer"
>
  Apply Now
</button>
          </div>

          {/* HAMBURGER BUTTON (MOBILE ONLY) */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-full transition duration-200 cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </header>
      </motion.div>

      {/* MOBILE GLASSMORPHISM MENU DRAWER */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 md:hidden pointer-events-auto">
            {/* Backdrop Blur Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm md:backdrop-blur-md"
            />

            {/* Glass Drawer */}
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.96 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-20 left-4 right-4 max-h-[calc(100vh-6rem)] overflow-y-auto bg-slate-950/80 border border-slate-800/80 rounded-3xl p-5 backdrop-blur-2xl shadow-2xl flex flex-col gap-5 text-slate-100"
            >
              {/* Main Links */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 px-3 mb-1">
                  Navigation
                </span>
                {mainNavItems.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item)}
                    className="px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-200 hover:text-white hover:bg-slate-800/50 transition duration-200"
                  >
                    {item.name}
                  </a>
                ))}
              </div>

              {/* More Categories / Resources */}
              <div className="flex flex-col gap-1 border-t border-slate-800/80 pt-4">
                <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400 px-3 mb-1">
                  Portal Resources
                </span>
                {moreMenuCategories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <a
                      key={cat.title}
                      href={cat.href}
                      onClick={(e) => {
                        setIsMobileMenuOpen(false);
                        handleApplicationsClick(e, cat);
                      }}
                      className="p-2.5 rounded-xl hover:bg-slate-800/50 transition-colors flex items-center gap-3"
                    >
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-cyan-400">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h5 className="text-xs font-semibold text-slate-100">
                            {cat.title}
                          </h5>
                          {cat.badge && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                              {cat.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                          {cat.description}
                        </p>
                      </div>
                    </a>
                  );
                })}
              </div>

              {/* Mobile Actions: Login & Apply */}
              <div className="flex flex-col gap-2 border-t border-slate-800/80 pt-4">
                <button 
  onClick={() => {
    setIsMobileMenuOpen(false);
    setIsAdmissionOpen(true);
  }}
  className="w-full py-2.5 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-200 rounded-xl transition duration-200 shadow-sm cursor-pointer"
>
  Apply Now
</button>

                {user ? (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-xs font-semibold text-cyan-400 flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4" />
                      {user.name}
                    </span>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        logoutUser();
                      }}
                      className="flex items-center gap-1 text-xs font-semibold text-red-400 hover:text-red-300 transition"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleOpenLoginModal();
                    }}
                    className="w-full py-2.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900/80 border border-slate-800 rounded-xl transition duration-200 cursor-pointer"
                  >
                    Log in
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Internal Modal fallback */}
      <AnimatePresence>
        {isLoginOpen && (
          <LoginPage onClose={() => setIsLoginOpen(false)} />
        )}
      </AnimatePresence>

      {/* Admissions Modal */}
      <AdmissionsModal 
        isOpen={isAdmissionOpen} 
        onClose={() => setIsAdmissionOpen(false)} 
      />
    </>
  );
}