import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Clock, 
  SunMoon, 
  Award, 
  CheckCircle, 
  ExternalLink, 
  FileText, 
  GraduationCap 
} from 'lucide-react';
import { programsData } from '../data/programData';

export default function ProgramDetails() {
  const { programId } = useParams();
  const navigate = useNavigate();

  const program = programsData.find((p) => p.id === programId) || programsData[0];
  const Icon = program.icon;

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [programId]);

  return (
    <div className="relative min-h-screen bg-[#0b0f19] text-slate-100 overflow-hidden pt-16 pb-24 px-4 sm:px-8 select-none">
      
      {/* Central Cyan Glow Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-cyan-500/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Main Container Page Motion Entrance */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
        className="max-w-5xl mx-auto relative z-10"
      >
        {/* Back Button (Preserved Exact Application Generator Placement) */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 bg-slate-900/90 px-4 py-2 rounded-xl border border-slate-800 transition-colors cursor-pointer shadow-lg backdrop-blur-md inline-flex items-center gap-2"
          >
            ← Back to Main Home
          </button>
        </div>

       {/* Header Header Info */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs font-extrabold tracking-widest text-cyan-400 uppercase bg-cyan-500/10 px-4 py-1.5 rounded-full border border-cyan-500/30 backdrop-blur-md shadow-lg shadow-cyan-500/10 inline-block">
              {program.shortCode} • Academic Program
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            {program.detailsDegree || program.degree}
          </h1>

          <p className="text-cyan-400 text-lg sm:text-2xl mt-1 flex items-center gap-2 font-bold tracking-tight">
            <GraduationCap className="w-6 h-6 text-cyan-400 shrink-0" />
            {program.subHeading}
          </p>
        </div>
        {/* Direct Layout Stream - Uncontained Typography Sections */}
        <div className="space-y-12 text-slate-200">
          
          {/* Overview */}
          <section className="space-y-3">
            <h2 className="text-xl font-extrabold text-white tracking-tight border-b border-slate-800/80 pb-2">
              Program Overview
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              {program.description}
            </p>
          </section>

          {/* Program Quick Specs */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3 backdrop-blur-md">
              <Clock className="w-5 h-5 text-cyan-400" />
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Duration</p>
                <p className="text-xs font-bold text-white">{program.duration}</p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3 backdrop-blur-md">
              <SunMoon className="w-5 h-5 text-amber-400" />
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Shifts Offered</p>
                <p className="text-xs font-bold text-white">{program.shift}</p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3 backdrop-blur-md">
              <Award className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Credits</p>
                <p className="text-xs font-bold text-white">{program.totalCredits}</p>
              </div>
            </div>
          </section>

          {/* Admission Information */}
          <section className="space-y-3">
            <h2 className="text-xl font-extrabold text-white tracking-tight border-b border-slate-800/80 pb-2">
              Admission Information
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Admissions to this degree program are conducted through the official University of Agriculture Faisalabad Undergraduate Admission Process.
            </p>
            <div>
              <a 
                href="https://web.uaf.edu.pk/Contents/admissions/un/adm_overview.html"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-bold text-blue-400 hover:text-blue-300 hover:underline transition-colors mt-1"
              >
                <span>Click here to view UAF Admission Criteria</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </section>

          {/* Scheme of Studies */}
          <section className="space-y-3">
            <h2 className="text-xl font-extrabold text-white tracking-tight border-b border-slate-800/80 pb-2">
              Scheme of Studies
            </h2>
            <div>
              <a 
                href={program.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-bold text-cyan-400 hover:text-cyan-300 hover:underline transition-colors"
              >
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>Click here to view Scheme of Studies (PDF)</span>
              </a>
            </div>
          </section>
          {/* Core Modules & Focus Areas */}
          <section className="space-y-4">
            <h2 className="text-xl font-extrabold text-white tracking-tight border-b border-slate-800/80 pb-2">
              Core Focus & Key Curriculum
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {program.keyCourses.map((course, idx) => (
                <div key={idx} className="flex items-center gap-2.5 p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 text-xs sm:text-sm text-slate-200 backdrop-blur-sm">
                  <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>{course}</span>
                </div>
              ))}
            </div>
          </section>

        </div>
      </motion.div>
    </div>
  );
}