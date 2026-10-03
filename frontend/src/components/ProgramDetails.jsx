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
    <div className="min-h-screen overflow-hidden bg-[#f3f7fb] px-4 pb-20 pt-20 text-[#17243b] sm:px-8 sm:pt-24">
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
        className="relative z-10 mx-auto max-w-6xl"
      >
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 rounded-md border border-[#d5e1ec] bg-white/80 px-3.5 py-2.5 text-sm font-semibold text-[#40516a] transition hover:border-[#1e3a8a]/30 hover:text-[#1e3a8a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0e7490]"
          >
            <ArrowLeft className="h-4 w-4" /> Back to programs
          </button>
        </div>

        <header className="mb-10 grid items-center gap-6 border-b border-[#d5e1ec] pb-9 sm:mb-12 sm:pb-11 lg:grid-cols-[1fr_auto]">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase text-[#0e7490]">
              <span className="h-px w-7 bg-[#0e7490]" /> {program.shortCode} <span className="text-[#9aa9ba]">/</span> Academic program
            </p>
            <h1 className="max-w-4xl text-3xl font-extrabold leading-tight text-[#17243b] sm:text-5xl">
              {program.detailsDegree || program.degree}
            </h1>
            <p className="mt-3 text-base font-semibold text-[#1e3a8a] sm:text-xl">
              {program.subHeading}
            </p>
            <p className="mt-5 max-w-3xl text-sm leading-7 text-[#58677d] sm:text-base">
              {program.description}
            </p>
          </div>
          <div className="hidden h-28 w-28 items-center justify-center rounded-xl border border-[#dce5ef] bg-white text-[#1e3a8a] shadow-sm lg:flex">
            <Icon className="h-14 w-14" strokeWidth={1.4} />
          </div>
        </header>

        <section aria-label="Program facts" className="mb-12 grid grid-cols-1 divide-y divide-[#d5e1ec] border-y border-[#d5e1ec] sm:grid-cols-3 sm:divide-y-0">
          <div className="flex items-center gap-3 py-4 sm:py-5 sm:pr-5">
            <Clock className="h-5 w-5 shrink-0 text-[#0e7490]" />
            <div>
              <p className="text-xs font-bold uppercase text-[#69788d]">Duration</p>
              <p className="mt-1 text-sm font-semibold text-[#25354d]">{program.duration}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 py-4 sm:border-l sm:border-[#d5e1ec] sm:px-5 sm:py-5">
            <SunMoon className="h-5 w-5 shrink-0 text-[#b7791f]" />
            <div>
              <p className="text-xs font-bold uppercase text-[#69788d]">Shifts offered</p>
              <p className="mt-1 text-sm font-semibold text-[#25354d]">{program.shift}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 py-4 sm:border-l sm:border-[#d5e1ec] sm:pl-5 sm:py-5">
            <Award className="h-5 w-5 shrink-0 text-[#0e7490]" />
            <div>
              <p className="text-xs font-bold uppercase text-[#69788d]">Total credits</p>
              <p className="mt-1 text-sm font-semibold text-[#25354d]">{program.totalCredits}</p>
            </div>
          </div>
        </section>

        <div className="grid items-start gap-12 lg:grid-cols-[1fr_340px] lg:gap-16">
          <div className="space-y-10">
            <section>
              <div className="mb-5 flex items-end justify-between gap-4 border-b border-[#d5e1ec] pb-3">
                <div>
                  <p className="text-xs font-bold uppercase text-[#0e7490]">What you&apos;ll study</p>
                  <h2 className="mt-1 text-xl font-extrabold text-[#17243b] sm:text-2xl">Core focus & curriculum</h2>
                </div>
                <span className="hidden text-xs font-semibold text-[#69788d] sm:block">Key subject areas</span>
              </div>
              <ul className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
                {program.keyCourses.map((course, idx) => (
                  <li key={course} className="flex min-h-14 items-center gap-3 border-b border-[#e0e8f0] py-3 text-sm font-medium text-[#40516a]">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white text-[10px] font-bold text-[#0e7490] ring-1 ring-[#dce5ef]">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span>{course}</span>
                    <CheckCircle className="ml-auto h-4 w-4 shrink-0 text-[#0e7490]/70" />
                  </li>
                ))}
              </ul>
            </section>

            <section className="border-t border-[#d5e1ec] pt-6">
              <p className="text-xs font-bold uppercase text-[#0e7490]">Program overview</p>
              <h2 className="mt-1 text-xl font-extrabold text-[#17243b]">A foundation for what&apos;s next</h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-[#58677d] sm:text-base">
                {program.description}
              </p>
            </section>
          </div>

          <aside className="rounded-xl border border-[#dce5ef] bg-white p-5 shadow-[0_18px_50px_-38px_rgba(23,36,59,0.45)] sm:p-6">
            <p className="text-xs font-bold uppercase text-[#0e7490]">Next steps</p>
            <h2 className="mt-1 text-xl font-extrabold text-[#17243b]">Explore this program</h2>
            <p className="mt-2 text-sm leading-6 text-[#69788d]">
              Review the course plan and official admission information.
            </p>

            <a
              href={program.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#1e3a8a] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#172e6e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0e7490]"
            >
              <FileText className="h-4 w-4" /> Scheme of studies
              <ExternalLink className="ml-auto h-3.5 w-3.5" />
            </a>

            <div className="my-5 border-t border-[#e3eaf1]" />
            <div className="flex items-start gap-3">
              <GraduationCap className="mt-0.5 h-5 w-5 shrink-0 text-[#1e3a8a]" />
              <div>
                <h3 className="text-sm font-bold text-[#25354d]">Admission information</h3>
                <p className="mt-1 text-xs leading-5 text-[#69788d]">
                  Admissions follow the official University of Agriculture Faisalabad undergraduate process.
                </p>
              </div>
            </div>
            <a
              href="https://web.uaf.edu.pk/Contents/admissions/un/adm_overview.html"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#1e3a8a] transition hover:text-[#0e7490]"
            >
              UAF admission criteria <ExternalLink className="h-4 w-4" />
            </a>
          </aside>
        </div>
      </motion.div>
    </div>
  );
}