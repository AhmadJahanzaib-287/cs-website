import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, GraduationCap, Cpu, Database, ShieldCheck, BrainCircuit, Code2 } from 'lucide-react';

// TODO: swap these sample images for real department/UAF photos later —
// just replace the paths below, nothing else needs to change.
const carouselImages = [
  { src: '/dept-building.png', caption: 'DCS @ PARS Campus, Faisalabad' },
  { src: '/dcs-logo.png', caption: 'Department of Computer Science' },
  { src: '/uaf-logo.png', caption: 'University of Agriculture Faisalabad' },
];

const programs = [
  { name: 'BS Computer Science', icon: Code2 },
  { name: 'BS Software Engineering', icon: Cpu },
  { name: 'BS Information Technology', icon: Database },
  { name: 'BS Artificial Intelligence', icon: BrainCircuit },
  { name: 'BS Data Science', icon: ShieldCheck },
];

export default function AboutSection() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % carouselImages.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  return (
    <section
      id="about"
      className="relative py-10 sm:py-14 px-4 sm:px-8 bg-[#0b0f19] text-slate-100 overflow-hidden"
    >
      <div className="max-w-6xl mx-auto relative z-10 space-y-12">
        {/* Text (left) + Carousel (right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* LEFT: Header + Praise Text */}
          <div className="space-y-6 text-center lg:text-left">
            <motion.span
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-extrabold uppercase tracking-widest"
            >
              <Building2 className="w-3.5 h-3.5" /> About Our Department
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-4xl font-black text-white tracking-tight"
            >
              Department of Computer Science
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-slate-400 text-sm sm:text-base leading-relaxed"
            >
              A constituent department of the{' '}
              <span className="text-cyan-400 font-semibold">
                University of Agriculture Faisalabad (PARS Campus)
              </span>
              , dedicated to producing industry-ready graduates through modern,
              research-driven computing education.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-3"
            >
              <p className="text-slate-300 text-sm sm:text-[15px] leading-relaxed">
                Since its establishment, the Department of Computer Science has grown into one of
                the region's most trusted destinations for computing education — combining a
                rigorous, industry-aligned curriculum with hands-on research in artificial
                intelligence, software engineering, and emerging technologies. Our faculty of
                PhD scholars and experienced practitioners work closely with students to build
                not just technical skill, but the critical thinking and problem-solving mindset
                needed to lead in a fast-changing digital world.
              </p>
              <p className="text-slate-300 text-sm sm:text-[15px] leading-relaxed">
                With state-of-the-art labs, active research collaborations, and a strong track
                record of graduate placement, DCS @ PARS continues to shape the next generation
                of engineers, researchers, and innovators who carry the department's reputation
                for excellence into industry and academia alike.
              </p>
            </motion.div>
          </div>

          {/* RIGHT: Image Carousel Window */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950"
          >
            <div className="relative w-full h-[280px] sm:h-[340px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSlide}
                  initial={{ opacity: 0, scale: 1.02 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950"
                >
                  <img
                    src={carouselImages[activeSlide].src}
                    alt={carouselImages[activeSlide].caption}
                    className="max-w-[60%] max-h-[60%] object-contain drop-shadow-2xl"
                  />
                </motion.div>
              </AnimatePresence>

              {/* Caption */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950/90 to-transparent px-5 pt-10 pb-4">
                <p className="text-xs sm:text-sm font-semibold text-slate-200 text-center">
                  {carouselImages[activeSlide].caption}
                </p>
              </div>
            </div>

            {/* Dot Indicators */}
            <div className="flex items-center justify-center gap-2 py-4 bg-slate-950">
              {carouselImages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveSlide(i)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    activeSlide === i ? 'w-6 bg-cyan-400' : 'w-1.5 bg-slate-700 hover:bg-slate-600'
                  }`}
                  aria-label={`Show slide ${i + 1}`}
                />
              ))}
            </div>
          </motion.div>
        </div>

        {/* Programs Offered (full width, below) */}
        <div>
          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center text-sm font-extrabold uppercase tracking-widest text-slate-400 mb-6 flex items-center justify-center gap-2"
          >
            <GraduationCap className="w-4 h-4 text-cyan-400" /> 5 Degree Programs Offered
          </motion.h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {programs.map((program, i) => {
              const Icon = program.icon;
              return (
                <motion.div
                  key={program.name}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ y: -3 }}
                  className="flex flex-col items-center text-center gap-2.5 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 backdrop-blur-xl shadow-lg transition-colors"
                >
                  <div className="p-2.5 rounded-xl bg-blue-950 border border-blue-800/60 text-blue-400 shadow-lg">
                    <Icon className="w-4 h-4" />
                  </div>
                  <p className="text-[11px] font-bold text-slate-200 leading-snug">{program.name}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}