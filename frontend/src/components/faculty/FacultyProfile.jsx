import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Phone,
  Building,
  GraduationCap,
  BookOpen,
  Award,
  ExternalLink,
  ArrowLeft,
  Briefcase,
  FileText,
  User,
  Globe,
  CheckCircle2,
} from 'lucide-react';
import facultyImageUrl from './facultyImageUrl';

/**
 * FacultyProfile Component
 *
 * An independent, production-ready full profile view component for a faculty member.
 * Designed with a premium glassmorphic UI matching the admin dashboard aesthetic.
 * Fully responsive across Mobile, Tablet, Laptop, and Desktop screens.
 *
 * @param {Object} member - Faculty member object containing all detailed academic data.
 * @param {Function} onBack - Navigation callback to return to the main faculty list.
 */
export default function FacultyProfile({ member, onBack }) {
  const [activeTab, setActiveTab] = useState('overview');

  // Fallback default structure if member prop is missing or partial
  if (!member) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-slate-400 mb-4">
          <User className="w-10 h-10" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">No Faculty Profile Loaded</h3>
        <p className="text-xs text-slate-400 max-w-sm mb-6">
          Please select a valid faculty member from the directory to view their complete profile details.
        </p>
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Directory
          </button>
        )}
      </div>
    );
  }

  const {
    name = 'Faculty Member',
    designation = 'Department Educator',
    qualification = 'Higher Degree',
    category = 'Professors',
    email = '',
    phone = '',
    office = 'Department Office',
    experience = '5+ Years',
    publicationsCount = 0,
    specializations = [],
    specialization = [],
    bio = 'Dedicated faculty member contributing to academic excellence, innovative research, and student mentorship in computer science.',
    publications = [],
    courses = [],
    avatar,
    website = '',
  } = member;

  const combinedSpecializations = specializations.length > 0 ? specializations : specialization;

  const tabs = [
    { id: 'overview', label: 'Overview & Bio' },
    { id: 'publications', label: `Publications (${publications.length || publicationsCount})` },
    { id: 'courses', label: `Teaching & Courses (${courses.length})` },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Ambient Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[250px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10 space-y-8">
        {/* TOP BAR / BACK ACTION */}
        {onBack && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center justify-between"
          >
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800/80 transition shadow-lg backdrop-blur-xl cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-cyan-400" />
              <span>Back to Directory</span>
            </button>
            <span className="text-xs font-semibold text-slate-400 bg-slate-900/60 border border-slate-800/60 px-3 py-1.5 rounded-xl backdrop-blur-xl">
              {category}
            </span>
          </motion.div>
        )}

        {/* HERO HEADER CARD */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-slate-900/90 border border-slate-800/80 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl relative overflow-hidden"
        >
          {/* Header Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500" />

          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 lg:gap-8">
            {/* Avatar Image */}
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-3xl overflow-hidden border-2 border-slate-800 bg-slate-950 shadow-2xl shrink-0">
              <img
                src={facultyImageUrl(avatar)}
                alt={name}
                className="w-full h-full object-cover object-center"
              />
            </div>

            {/* Profile Overview Details */}
            <div className="flex-1 text-center md:text-left space-y-4 w-full">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                  {name}
                </h1>
                <p className="text-sm sm:text-base font-bold text-cyan-400 mt-1">
                  {designation}
                </p>
                <p className="text-xs sm:text-sm text-slate-400 flex items-center justify-center md:justify-start gap-1.5 mt-2">
                  <GraduationCap className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>{qualification}</span>
                </p>
              </div>

              {/* Specialization Tags */}
              {combinedSpecializations.length > 0 && (
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1">
                  {combinedSpecializations.map((spec, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[11px] font-medium text-slate-300"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              )}

              {/* Quick Contact Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-4 border-t border-slate-800/80 text-xs text-slate-300">
                {email && (
                  <div className="flex items-center justify-center md:justify-start gap-2 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/50">
                    <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span className="truncate">{email}</span>
                  </div>
                )}
                {phone && (
                  <div className="flex items-center justify-center md:justify-start gap-2 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/50">
                    <Phone className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span className="truncate">{phone}</span>
                  </div>
                )}
                {office && (
                  <div className="flex items-center justify-center md:justify-start gap-2 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/50">
                    <Building className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span className="truncate">{office}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* METRICS HIGHLIGHTS GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-900/80 border border-slate-800/80 p-4 rounded-2xl backdrop-blur-xl text-center space-y-1">
            <Briefcase className="w-5 h-5 text-cyan-400 mx-auto" />
            <p className="text-[10px] uppercase font-bold text-slate-400">Experience</p>
            <p className="text-base font-extrabold text-white">{experience}</p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/80 p-4 rounded-2xl backdrop-blur-xl text-center space-y-1">
            <BookOpen className="w-5 h-5 text-indigo-400 mx-auto" />
            <p className="text-[10px] uppercase font-bold text-slate-400">Publications</p>
            <p className="text-base font-extrabold text-white">{publications.length || publicationsCount}</p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/80 p-4 rounded-2xl backdrop-blur-xl text-center space-y-1">
            <Award className="w-5 h-5 text-cyan-400 mx-auto" />
            <p className="text-[10px] uppercase font-bold text-slate-400">Department</p>
            <p className="text-base font-extrabold text-white">Computer Science</p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/80 p-4 rounded-2xl backdrop-blur-xl text-center space-y-1">
            <Globe className="w-5 h-5 text-blue-400 mx-auto" />
            <p className="text-[10px] uppercase font-bold text-slate-400">Personal Link</p>
            {website ? (
              <a
                href={website}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-cyan-400 hover:underline flex items-center justify-center gap-1"
              >
                Website <ExternalLink className="w-3 h-3" />
              </a>
            ) : (
              <p className="text-base font-extrabold text-white">N/A</p>
            )}
          </div>
        </div>

        {/* TABBED NAVIGATION & CONTENT */}
        <div className="space-y-6">
          {/* Tab Selector */}
          <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3 overflow-x-auto scrollbar-none">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white shadow-lg shadow-cyan-500/20'
                    : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800/60 border border-slate-800/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Panels */}
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="bg-slate-900/80 border border-slate-800/80 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-xl space-y-6"
              >
                <div>
                  <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-cyan-400" /> Biography & Academic Summary
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                    {bio}
                  </p>
                </div>

                <div className="pt-6 border-t border-slate-800/80">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-indigo-400" /> Key Research Interests
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {combinedSpecializations.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/60"
                      >
                        <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span className="text-xs font-semibold text-slate-200">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'publications' && (
              <motion.div
                key="publications"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="bg-slate-900/80 border border-slate-800/80 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-xl space-y-4"
              >
                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-cyan-400" /> Scholarly Publications & Research Papers
                </h3>

                {publications && publications.length > 0 ? (
                  <div className="space-y-3">
                    {publications.map((pub, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/60 space-y-2 hover:border-cyan-500/30 transition"
                      >
                        <div className="flex justify-between items-start gap-4">
                          <h4 className="text-xs sm:text-sm font-bold text-white">{pub.title}</h4>
                          {pub.year && (
                            <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-bold text-cyan-400 shrink-0">
                              {pub.year}
                            </span>
                          )}
                        </div>
                        {pub.journal && (
                          <p className="text-xs text-slate-400 italic">{pub.journal}</p>
                        )}
                        {pub.link && (
                          <a
                            href={pub.link}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-400 hover:underline pt-1"
                          >
                            Read Paper <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl bg-slate-950/40 border border-slate-800/40 text-center space-y-2">
                    <BookOpen className="w-8 h-8 text-slate-600 mx-auto" />
                    <p className="text-xs font-semibold text-slate-400">
                      Total Published Papers Tracked: {publicationsCount}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Detailed paper links and citations will be loaded from the department repository API.
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'courses' && (
              <motion.div
                key="courses"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="bg-slate-900/80 border border-slate-800/80 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-xl space-y-4"
              >
                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-indigo-400" /> Allocated Semester Courses
                </h3>

                {courses && courses.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {courses.map((course, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/60 space-y-2"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/20">
                            {course.code || 'CS-101'}
                          </span>
                          <span className="text-xs text-slate-400">{course.creditHours || '3'} Credit Hours</span>
                        </div>
                        <h4 className="text-xs sm:text-sm font-bold text-white">{course.name}</h4>
                        {course.program && (
                          <p className="text-[11px] text-slate-400">{course.program}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl bg-slate-950/40 border border-slate-800/40 text-center space-y-2">
                    <GraduationCap className="w-8 h-8 text-slate-600 mx-auto" />
                    <p className="text-xs text-slate-400">
                      No active course allocations assigned for the current semester.
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}