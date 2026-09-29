import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Building, GraduationCap, ChevronRight, Pencil } from 'lucide-react';
import facultyImageUrl from './facultyImageUrl';

/**
 * FacultyCard Component
 * * A reusable, modular glassmorphism card designed to display individual faculty profile info.
 * Designed for mobile, tablet, laptop, and desktop layouts.
 * * @param {Object} member - The faculty member object containing details.
 * @param {Function} onViewProfile - Callback function triggered when "View Full Profile" is clicked.
 */
export default function FacultyCard({ member, onViewProfile, onEdit }) {
  if (!member) return null;

  const {
    name = 'Faculty Member',
    designation = 'Lecturer',
    qualification = 'Degree Info',
    specializations = [],
    specialization = [],
    email = '',
    office = '',
    avatar,
  } = member;
  const specializationList = specializations.length ? specializations : specialization;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="bg-slate-900/90 border border-slate-800/80 rounded-3xl p-6 backdrop-blur-2xl shadow-xl hover:border-cyan-500/40 transition-all duration-300 group flex flex-col justify-between relative overflow-hidden h-full text-slate-100"
    >
      {/* Top Gradient Accent Line (reveals on hover) */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div>
        {/* Avatar Image Container */}
        <div className="relative w-28 h-28 mx-auto mb-5 rounded-2xl overflow-hidden border border-slate-800 shadow-md group-hover:scale-105 transition-transform duration-300 bg-slate-950">
          <img
            src={facultyImageUrl(avatar)}
            alt={name}
            className="w-full h-full object-cover object-center"
            loading="lazy"
          />
        </div>

        {/* Primary Info */}
        <div className="text-center space-y-1.5 mb-4">
          <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-1">
            {name}
          </h3>
          <p className="text-xs font-semibold text-cyan-400/90 line-clamp-1">
            {designation}
          </p>
          <p className="text-xs text-slate-400 flex items-center justify-center gap-1 line-clamp-1">
            <GraduationCap className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>{qualification}</span>
          </p>
        </div>

        {/* Specialization Tags */}
        {specializationList.length > 0 && (
          <div className="flex flex-wrap justify-center gap-1.5 mb-6">
            {specializationList.slice(0, 3).map((spec, index) => (
              <span
                key={index}
                className="px-2.5 py-1 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[10px] font-medium text-slate-300"
              >
                {spec}
              </span>
            ))}
            {specializationList.length > 3 && (
              <span className="px-2 py-1 rounded-xl bg-slate-950/50 border border-slate-800/50 text-[10px] font-medium text-slate-500">
                +{specializationList.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer Info & Action */}
      <div className="pt-4 border-t border-slate-800/80 space-y-3">
        <div className="space-y-1.5 text-xs text-slate-400">
          {email && (
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
              <span className="truncate">{email}</span>
            </div>
          )}
          {office && (
            <div className="flex items-center gap-2">
              <Building className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="truncate">{office}</span>
            </div>
          )}
        </div>

        {/* View Details Action Button */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onViewProfile && onViewProfile(member)}
            className="flex-1 mt-2 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/60 hover:bg-gradient-to-r hover:from-cyan-500 hover:to-blue-600 text-xs font-semibold text-slate-200 hover:text-white transition-all duration-200 cursor-pointer"
          >
            <span>View Full Profile</span>
            <ChevronRight className="w-4 h-4" />
          </button>
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(member)}
              className="mt-2 p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
              title="Edit faculty member"
              aria-label={`Edit ${name}`}
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}