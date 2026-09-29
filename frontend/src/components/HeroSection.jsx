import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Award, GraduationCap, Cpu, Play, ArrowRight } from 'lucide-react';


const containerVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.9,
      ease: [0.16, 1, 0.3, 1],
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

const rotatingSentences = [
  "Code, AI & Innovation",
  "Building Future Technology Leaders",
  "Inspiring Innovation Through Computing",
  "Empowering Tomorrow's Digital Professionals"
];

export default function HeroSection({ isLoading, contentReady }) {
  const [textIndex, setTextIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // Don't start the typing effect until Navbar's own entrance animation
    // has finished (controlled by contentReady from App.jsx)
    if (!contentReady) return;

    const currentSentence = rotatingSentences[textIndex];
    let timer;

    if (!isDeleting && displayText !== currentSentence) {
      // Typing mode
      timer = setTimeout(() => {
        setDisplayText(currentSentence.substring(0, displayText.length + 1));
      }, 70);
    } else if (!isDeleting && displayText === currentSentence) {
      // Pause at full sentence before deleting
      timer = setTimeout(() => {
        setIsDeleting(true);
      }, 2000);
    } else if (isDeleting && displayText !== '') {
      // Deleting mode
      timer = setTimeout(() => {
        setDisplayText(currentSentence.substring(0, displayText.length - 1));
      }, 35);
    } else if (isDeleting && displayText === '') {
      // Move to next sentence
      setIsDeleting(false);
      setTextIndex((prev) => (prev + 1) % rotatingSentences.length);
    }

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, textIndex, contentReady]);

  return (
    <>
    <style>{`
      @keyframes floatY4 { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
      @keyframes floatY5 { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
      @keyframes floatY6 { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
      @keyframes cursorBlink { 0% { opacity: 1; } 100% { opacity: 0; } }
    `}</style>
    <motion.div 
      initial="hidden"
      animate={isLoading ? "hidden" : "visible"}
      variants={containerVariants}
      className="relative min-h-0 h-auto lg:min-h-screen lg:h-screen bg-[#0b0f19] text-slate-100 overflow-hidden flex flex-col justify-between select-none pb-8 lg:pb-0"
    >
      {/* 1. Background Layers (Consistent with Academic Programs styling) */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden bg-[#0b0f19]">
        
       <div 
          className="absolute top-0 right-0 w-full md:w-[70%] h-full opacity-70"
          style={{
            maskImage: 'linear-gradient(to right, transparent 0%, black 32%)',
            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 32%)'
          }}
        >
          <img 
  src="/dept-building.png" 
  alt="Department Building" 
  loading="eager"
  fetchPriority="high"
  decoding="async"
  className="w-full h-full object-cover object-bottom saturate-110"
/>
          <div className="absolute inset-0 bg-gradient-to-t from-gray-100 via-gray-100/10 to-gray-100/40" />
        </div>

        <div className="absolute left-6 top-8 opacity-[0.09] font-mono text-[11px] text-cyan-400 hidden md:block leading-relaxed select-none pointer-events-none">
          <pre>{`
  // PARS CS Core Module
  import { Department } from '@pars/cs';

  export function FutureEngineers() {
    const skills = ['AI', 'CyberSecurity', 'SoftwareEngineering', 'IT'];
    return (
      <Innovation labs={14} placementRate="96%">
        {skills.map(skill => <Master key={skill} name={skill} />)}
      </Innovation>
    );
  }
          `}</pre>
        </div>

        {/* Academic Programs style matching central glow & vignette */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] md:w-[600px] md:h-[600px] bg-cyan-500/10 rounded-full blur-[80px] md:blur-[150px] pointer-events-none" />
        <div className="absolute top-0 right-0 w-60 h-60 md:w-96 md:h-96 bg-purple-600/10 rounded-full blur-[70px] md:blur-[140px] pointer-events-none" />
      </div>

      {/* 2. Spacer for Top Floating Navbar */}
      <div className="h-16 w-full" />

      {/* 3. Hero Content */}
      <main className="relative z-10 container mx-auto px-6 my-auto pt-6 pb-2 lg:py-2 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Main Hero Text Content */}
        <motion.div variants={itemVariants} className="hero-copy lg:col-span-7 space-y-4 text-left w-full">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-cyan-500/30 text-cyan-400 text-[11px] font-medium shadow-inner backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
            Admissions Open — Fall 2026 (CS, SE, AI, IT)
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] xl:text-5xl font-semibold text-slate-900 tracking-normal leading-[1.12]">
            <span className="block">Shaping the Future</span>
            <span className="block">through</span>
            <span className="text-[#1e3a8a] block min-h-[1.2em]">
              {displayText}
              {contentReady && (
                <span 
                  style={{ animation: 'cursorBlink 0.6s ease-in-out infinite' }}
                  className="inline-block w-[3px] h-[0.8em] bg-cyan-400 ml-1 translate-y-[0.1em] rounded-full"
                />
              )}
            </span>
          </h1>

          <p className="text-slate-700 text-sm sm:text-base max-w-xl leading-relaxed">
            Empowering Next-Gen Software Engineers | AI Researchers | Cybersecurity Experts | Data Scientists at PARS.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <a 
              href="#programs" 
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('programs')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#1e3a8a] hover:bg-[#172e6e] text-white font-semibold text-sm shadow-lg shadow-blue-900/20 hover:scale-[1.02] active:scale-95 transition cursor-pointer"
            >
              Explore Programs <ArrowRight className="w-3.5 h-3.5" />
            </a>
            
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900/80 hover:bg-slate-800/80 border border-slate-700/80 text-slate-200 font-semibold text-xs backdrop-blur-md transition cursor-pointer">
              <Play className="w-3.5 h-3.5 fill-current text-cyan-400" /> Watch Department Tour
            </button>
          </div>
        </motion.div>
       {/* Floating Badges Container (Hidden on Mobile & Tablet <1024px, Visible on Desktop) */}
        <motion.div variants={itemVariants} className="lg:col-span-5 relative h-[400px] w-full hidden lg:block pointer-events-auto">
          <div 
            style={{ animation: contentReady ? 'floatY4 3.5s ease-in-out infinite' : 'none' }}
            className="absolute top-[4%] left-[1%] sm:top-[8%] sm:left-[8%] z-20 scale-90 sm:scale-100 origin-top-left"
          >
            <div className="relative flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl bg-slate-950/90 border border-amber-500/40 backdrop-blur-md shadow-lg">
              <div className="p-1 rounded-lg bg-amber-500/20 text-amber-400">
                <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </div>
              <div>
                <p className="text-[7px] sm:text-[8px] text-slate-400 uppercase tracking-wide">Est.</p>
                <p className="text-[10px] sm:text-[11px] font-bold text-slate-800">2023</p>
              </div>
              <div className="absolute -bottom-1 left-3 sm:left-4 w-2 h-2 bg-slate-950/90 border-r border-b border-amber-500/40 rotate-45"></div>
            </div>
          </div>

          <div 
            style={{ animation: contentReady ? 'floatY5 4s ease-in-out 0.3s infinite' : 'none' }}
            className="absolute top-[4%] right-[1%] sm:top-[2%] sm:right-[2%] z-20 scale-90 sm:scale-100 origin-top-right"
          >
            <div className="relative flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-slate-950/90 border border-cyan-500/40 backdrop-blur-md shadow-lg">
              <div className="p-1 rounded-lg bg-cyan-500/20 text-cyan-400">
                <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </div>
              <div>
                <p className="text-[8px] sm:text-[10px] font-semibold text-slate-200">Jhang Road, Near Airport Chowk</p>
                <p className="text-[7px] sm:text-[9px] text-slate-400">Faisalabad</p>
              </div>
              <div className="absolute -bottom-1 right-4 sm:right-6 w-2 h-2 bg-slate-950/90 border-r border-b border-cyan-500/40 rotate-45"></div>
            </div>
          </div>

          <div 
            style={{ animation: contentReady ? 'floatY5 4.2s ease-in-out 0.6s infinite' : 'none' }}
            className="absolute top-[40%] left-[1%] sm:top-[48%] sm:left-[2%] z-20 scale-90 sm:scale-100 origin-left"
          >
            <div className="relative flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-slate-950/90 border border-emerald-500/40 backdrop-blur-md shadow-lg">
              <div className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400">
                <Award className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </div>
              <p className="text-[8px] sm:text-[10px] font-semibold text-emerald-300">NCEAC Accredited</p>
              <div className="absolute -bottom-1 left-4 sm:left-5 w-2 h-2 bg-slate-950/90 border-r border-b border-emerald-500/40 rotate-45"></div>
            </div>
          </div>

          <div 
            style={{ animation: contentReady ? 'floatY5 4.5s ease-in-out 1.2s infinite' : 'none' }}
            className="absolute top-[40%] right-[1%] sm:top-[48%] sm:right-[0%] z-20 scale-90 sm:scale-100 origin-right"
          >
            <div className="relative flex items-center gap-1.5 sm:gap-2.5 px-2 sm:px-3 py-1 sm:py-2 rounded-xl bg-slate-950/90 border border-blue-500/40 backdrop-blur-md shadow-lg">
              <div className="p-1 sm:p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
                <GraduationCap className="w-3 h-3 sm:w-4 sm:h-4" />
              </div>
              <div>
                <p className="text-[9px] sm:text-[11px] font-bold text-slate-800">BS Computer Science</p>
                <p className="text-[7px] sm:text-[9px] text-blue-800">5 Specializations: CS, SE, IT, AI, DS</p>
              </div>
              <div className="absolute -bottom-1 right-4 sm:right-10 w-2 h-2 bg-slate-950/90 border-r border-b border-blue-500/40 rotate-45"></div>
            </div>
          </div>

          <div 
            style={{ animation: contentReady ? 'floatY6 3.8s ease-in-out 0.9s infinite' : 'none' }}
            className="absolute bottom-[4%] right-[2%] sm:bottom-[4%] sm:right-[4%] z-20 scale-90 sm:scale-100 origin-bottom-right"
          >
            <div className="relative flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-slate-950/90 border border-purple-500/40 backdrop-blur-md shadow-lg">
              <div className="p-1 rounded-lg bg-purple-500/20 text-purple-400">
                <Cpu className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </div>
              <div>
                <p className="text-[8px] sm:text-[10px] font-bold text-slate-800">Research Hub</p>
                <p className="text-[7px] sm:text-[9px] text-purple-800">AI & Quantum Computing Lab</p>
              </div>
              <div className="absolute -bottom-1 right-4 sm:right-8 w-2 h-2 bg-slate-950/90 border-r border-b border-purple-500/40 rotate-45"></div>
            </div>
          </div>
        </motion.div>
      </main>
    </motion.div>
    </>
  );
}