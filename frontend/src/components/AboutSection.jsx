import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight, ArrowUpRight, BrainCircuit, Code2, Cpu, Database, ShieldCheck } from 'lucide-react';

const programs = [
  { name: 'BS Computer Science', icon: Code2 },
  { name: 'BS Software Engineering', icon: Cpu },
  { name: 'BS Information Technology', icon: Database },
  { name: 'BS Artificial Intelligence', icon: BrainCircuit },
  { name: 'BS Data Science', icon: ShieldCheck },
];

const aboutSlides = [
  {
    src: '/dept-building.png',
    alt: 'Department of Computer Science building at PARS Campus',
    title: 'Our home at PARS Campus',
    detail: 'Department of Computer Science · Faisalabad',
    fit: 'cover',
  },
  {
    src: '/dcs-logo.png',
    alt: 'Department of Computer Science logo',
    title: 'Department of Computer Science',
    detail: 'Learning, research, and practical computing',
    fit: 'contain',
  },
  {
    src: '/uaf-logo.png',
    alt: 'University of Agriculture Faisalabad logo',
    title: 'University of Agriculture Faisalabad',
    detail: 'A proud part of UAF · PARS Campus',
    fit: 'contain',
  },
];

export default function AboutSection() {
  const [activeSlide, setActiveSlide] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return undefined;

    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % aboutSlides.length);
    }, 4500);

    return () => window.clearInterval(timer);
  }, [prefersReducedMotion]);

  const changeSlide = (direction) => {
    setActiveSlide((current) => (current + direction + aboutSlides.length) % aboutSlides.length);
  };

  const activeAboutSlide = aboutSlides[activeSlide];

  return (
    <section id="about" className="relative overflow-hidden bg-[#f3f7fb] px-4 py-16 text-[#17243b] sm:px-8 sm:py-24">
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border border-[#dce7f1]" />
      <div className="relative mx-auto max-w-6xl">
        <div className="grid items-center gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.55 }}
            className="order-2 lg:order-1"
          >
            <p className="mb-4 inline-flex items-center gap-2 text-xs font-bold uppercase text-[#0e7490]">
              <span className="h-px w-7 bg-[#0e7490]" /> About our department
            </p>
            <h2 className="max-w-xl text-3xl font-extrabold leading-tight text-[#17243b] sm:text-5xl">
              Shaping the future through computing.
            </h2>
            <p className="mt-5 text-base leading-7 text-[#42536a] sm:text-lg">
              The Department of Computer Science at the University of Agriculture Faisalabad, PARS Campus, brings together modern computing education, research, and practical problem-solving.
            </p>
            <p className="mt-4 text-sm leading-7 text-[#69788d] sm:text-base">
              Students build a strong foundation in computer science while exploring fields such as software engineering, artificial intelligence, information technology, and data science. Our goal is to help each student develop the knowledge and confidence to contribute in a rapidly changing digital world.
            </p>

            <div className="mt-6 flex flex-wrap gap-2.5" aria-label="Department focus areas">
              {['Education', 'Research', 'Innovation'].map((focus) => (
                <span key={focus} className="inline-flex items-center gap-2 rounded-full border border-[#d5e1ec] bg-white/75 px-3 py-1.5 text-xs font-semibold text-[#40516a]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#0e7490]" /> {focus}
                </span>
              ))}
            </div>

            <a
              href="#programs"
              className="mt-7 inline-flex items-center gap-2 rounded-md bg-[#1e3a8a] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#172e6e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0e7490]"
            >
              Explore degree programs <ArrowUpRight className="h-4 w-4" />
            </a>
          </motion.div>

          <motion.figure
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="order-1 lg:order-2"
          >
            <div className="relative aspect-[1.2] overflow-hidden rounded-xl border border-white/80 bg-white shadow-[0_24px_70px_-38px_rgba(23,36,59,0.4)] sm:aspect-[1.38]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeAboutSlide.src}
                  initial={{ opacity: 0, scale: 1.015 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.55 }}
                  className={`absolute inset-0 flex items-center justify-center ${activeAboutSlide.fit === 'contain' ? 'bg-white p-10 sm:p-16' : 'bg-[#dbe5ed]'}`}
                >
                  <img
                    src={activeAboutSlide.src}
                    alt={activeAboutSlide.alt}
                    className={`shrink-0 ${activeAboutSlide.fit === 'contain' ? 'h-[70%] w-[70%] object-contain' : 'h-full w-full object-cover object-center'}`}
                    loading="lazy"
                  />
                  {activeAboutSlide.fit === 'cover' && (
                    <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#101d32]/70 to-transparent" />
                  )}
                </motion.div>
              </AnimatePresence>

              <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-4 p-4 sm:p-5">
                <div className={activeAboutSlide.fit === 'contain' ? 'text-[#17243b]' : 'text-white'}>
                  <p className="text-sm font-bold sm:text-base">{activeAboutSlide.title}</p>
                  <p className={`mt-1 text-xs ${activeAboutSlide.fit === 'contain' ? 'text-[#69788d]' : 'text-white/80'}`}>
                    {activeAboutSlide.detail}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => changeSlide(-1)}
                    aria-label="Previous About image"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[#dce5ef] bg-white/95 text-[#1e3a8a] shadow-sm transition hover:bg-[#1e3a8a] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0e7490]"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => changeSlide(1)}
                    aria-label="Next About image"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[#dce5ef] bg-white/95 text-[#1e3a8a] shadow-sm transition hover:bg-[#1e3a8a] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0e7490]"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2" role="group" aria-label="Choose About image">
                {aboutSlides.map((slide, index) => (
                  <button
                    key={slide.src}
                    type="button"
                    onClick={() => setActiveSlide(index)}
                    aria-label={`Show image ${index + 1}: ${slide.title}`}
                    aria-current={activeSlide === index ? 'true' : undefined}
                    className={`h-2 rounded-full transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0e7490] ${activeSlide === index ? 'w-8 bg-[#1e3a8a]' : 'w-2 bg-[#b8c7d7] hover:bg-[#0e7490]'}`}
                  />
                ))}
              </div>
              <p className="text-xs font-semibold text-[#69788d]">UAF · PARS Campus</p>
            </div>
          </motion.figure>
        </div>

        <div id="programs" className="mt-16 border-t border-[#d5e1ec] pt-8 sm:mt-20 sm:pt-10">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-[#0e7490]">Study with us</p>
              <h3 className="mt-1 text-2xl font-extrabold text-[#17243b]">Degree programs</h3>
            </div>
            <p className="text-sm text-[#69788d]">Find your direction in computing.</p>
          </div>

          <div className="grid grid-cols-1 divide-y divide-[#d5e1ec] sm:grid-cols-2 sm:gap-x-10 sm:divide-y-0 lg:grid-cols-5">
            {programs.map((program, index) => {
              const Icon = program.icon;
              return (
                <motion.div
                  key={program.name}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ delay: index * 0.06, duration: 0.35 }}
                  className="flex min-h-20 items-center gap-3 py-4 lg:border-l lg:border-[#d5e1ec] lg:pl-4 lg:first:border-l-0 lg:first:pl-0"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#edf4f8] text-[#1e3a8a]">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="mb-1 block text-[10px] font-bold uppercase text-[#0e7490]">Program 0{index + 1}</span>
                    <span className="block text-sm font-bold leading-snug text-[#25354d]">{program.name}</span>
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}