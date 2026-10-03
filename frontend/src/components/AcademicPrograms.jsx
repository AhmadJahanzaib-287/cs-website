import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, 
  SunMoon, 
  ArrowUpRight,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { programsData } from '../data/programData';

export default function AcademicPrograms() {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [mobileIndex, setMobileIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const navigate = useNavigate();

  const goNext = () => {
    setDirection(1);
    setMobileIndex((prev) => (prev + 1) % programsData.length);
  };

  const goPrev = () => {
    setDirection(-1);
    setMobileIndex((prev) => (prev - 1 + programsData.length) % programsData.length);
  };

  const activeProg = programsData[mobileIndex];
  const ActiveIcon = activeProg.icon;

  // Slide + scale variants for the mobile carousel card swap
  const cardVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 80 : -80,
      opacity: 0,
      scale: 0.75,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (dir) => ({
      x: dir > 0 ? -80 : 80,
      opacity: 0,
      scale: 0.75,
    }),
  };

  return (
    <section id="programs" className="relative py-24 px-4 sm:px-8 bg-[#f3f7fb] text-slate-100 overflow-hidden min-h-[90vh] flex flex-col items-center justify-center select-none">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-8 relative z-20">
        <span className="text-xs font-extrabold tracking-widest text-cyan-400 uppercase bg-cyan-500/10 px-4 py-1.5 rounded-full border border-cyan-500/30 backdrop-blur-md shadow-lg shadow-cyan-500/10 inline-block mb-3">
          Undergraduate Degree Offerings
        </span>
        <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
          Our Offered Programs
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm mt-2">
          4-Year Degree Programs • Morning & Evening Shifts • HEC Recognized
        </p>
      </div>

      {/* ================= DESKTOP / LAPTOP (lg and up): ORIGINAL FAN DECK — UNTOUCHED ================= */}
      <div className="relative w-full max-w-6xl h-[330px] hidden lg:flex items-center justify-center z-10">
        {programsData.map((prog) => {
          const Icon = prog.icon;
          const isHovered = hoveredCard === prog.id;

          return (
           <motion.div
              key={prog.id}
              onMouseEnter={() => setHoveredCard(prog.id)}
              onMouseLeave={() => setHoveredCard(null)}
              initial={{ opacity: 0, y: 100, x: prog.xOffset, rotate: prog.rotate }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              animate={{
                x: isHovered ? prog.xOffset * 0.85 : prog.xOffset,
                rotate: isHovered ? 0 : prog.rotate,
                y: isHovered ? prog.yOffset - 12 : prog.yOffset,
                scale: isHovered ? 1.15 : 1,
                zIndex: isHovered ? 99 : 10
              }}
              transition={{ 
                type: "spring", 
                stiffness: 260, 
                damping: 22 
              }}
              style={{
                transformOrigin: "bottom center",
                boxShadow: isHovered 
                  ? `0 30px 60px -15px ${prog.glowColor}` 
                  : '0 15px 35px -10px rgba(0, 0, 0, 0.7)'
              }}
              onClick={() => navigate(`/program-details/${prog.id}`)}
              className={`absolute w-[185px] sm:w-[200px] h-[290px] p-4 rounded-2xl bg-slate-950/90 border ${prog.borderColor} backdrop-blur-2xl shadow-2xl flex flex-col justify-between cursor-pointer group overflow-hidden transition-colors duration-300`}
            
            
            >
              {/* Card Hover Ambient Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${prog.color} opacity-20 group-hover:opacity-60 transition-opacity duration-300 pointer-events-none`} />

              {/* Card Top */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-cyan-400 shadow-md">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-slate-300 px-2 py-0.5 rounded-md bg-slate-900/80 border border-slate-800">
                  {prog.shortCode}
                </span>
              </div>

              {/* Card Center */}
              <div className="relative z-10 my-auto">
                <h3 className="text-base font-black text-white leading-snug mb-2 group-hover:text-cyan-300 transition-colors">
                  {prog.degree}
                </h3>
                <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-3">
                  {prog.overview}
                </p>
              </div>

              {/* Card Bottom */}
              <div className="relative z-10 pt-3 border-t border-slate-800/80 flex flex-col gap-2">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span className="flex items-center gap-1 font-medium">
                    <Clock className="w-3 h-3 text-cyan-400" /> 4 Years
                  </span>
                  <span className="flex items-center gap-1 font-medium">
                    <SunMoon className="w-3 h-3 text-amber-400" /> Morn / Eve
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] font-bold text-cyan-400 pt-1 group-hover:text-white transition-colors">
                  <span>View Details</span>
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>

            </motion.div>
          );
        })}
      </div>

      {/* ================= MOBILE / TABLET (below lg): ONE-CARD CAROUSEL WITH ARROWS ================= */}
      <div className="lg:hidden relative z-10 w-full max-w-sm flex items-center justify-center gap-3">
        
        {/* Prev Arrow */}
        <button
          onClick={goPrev}
          aria-label="Previous program"
          className="shrink-0 w-9 h-9 rounded-full bg-slate-900/90 border border-slate-700 flex items-center justify-center text-cyan-400 active:scale-90 transition-transform cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Card Stage */}
        <div className="relative w-full h-[300px] flex items-center justify-center overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={activeProg.id}
              custom={direction}
              variants={cardVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => navigate(`/program-details/${activeProg.id}`)}
              className={`absolute w-[220px] h-[290px] p-4 rounded-2xl bg-slate-950/90 border ${activeProg.borderColor} backdrop-blur-2xl shadow-2xl flex flex-col justify-between cursor-pointer overflow-hidden`}
            >
              {/* Card Ambient Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${activeProg.color} opacity-25 pointer-events-none`} />

              {/* Card Top */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-cyan-400 shadow-md">
                  <ActiveIcon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-slate-300 px-2 py-0.5 rounded-md bg-slate-900/80 border border-slate-800">
                  {activeProg.shortCode}
                </span>
              </div>

              {/* Card Center - FULL data, no truncation */}
              <div className="relative z-10 my-auto">
                <h3 className="text-base font-black text-white leading-snug mb-2">
                  {activeProg.degree}
                </h3>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {activeProg.overview}
                </p>
              </div>

              {/* Card Bottom */}
              <div className="relative z-10 pt-3 border-t border-slate-800/80 flex flex-col gap-2">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span className="flex items-center gap-1 font-medium">
                    <Clock className="w-3 h-3 text-cyan-400" /> 4 Years
                  </span>
                  <span className="flex items-center gap-1 font-medium">
                    <SunMoon className="w-3 h-3 text-amber-400" /> Morn / Eve
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] font-bold text-cyan-400 pt-1">
                  <span>View Details</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </div>

            </motion.div>
          </AnimatePresence>
        </div>

        {/* Next Arrow */}
        <button
          onClick={goNext}
          aria-label="Next program"
          className="shrink-0 w-9 h-9 rounded-full bg-slate-900/90 border border-slate-700 flex items-center justify-center text-cyan-400 active:scale-90 transition-transform cursor-pointer"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Dots indicator - mobile only */}
      <div className="lg:hidden flex items-center justify-center gap-1.5 mt-4 relative z-10">
        {programsData.map((prog, i) => (
          <button
            key={prog.id}
            onClick={() => { setDirection(i > mobileIndex ? 1 : -1); setMobileIndex(i); }}
            aria-label={`Go to ${prog.degree}`}
            className={`h-1.5 rounded-full transition-all ${i === mobileIndex ? 'w-5 bg-cyan-400' : 'w-1.5 bg-slate-700'}`}
          />
        ))}
      </div>

    </section>
  );
}