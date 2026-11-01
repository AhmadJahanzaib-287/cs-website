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
      className="group relative flex h-full flex-col justify-between overflow-hidden bg-white p-5 text-[#17243b] transition-colors hover:bg-[#fbfcfd] sm:p-6"
    >
      <div className="absolute inset-x-0 top-0 h-0.5 bg-[#0e7490] opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

      <div>
        {/* Avatar Image Container */}
        <div className="mb-5 flex items-start gap-4">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md border border-[#dce5ef] bg-[#f3f7fb] sm:h-24 sm:w-24">
          <img
            src={facultyImageUrl(avatar)}
            alt={name}
            className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          </div>
          <div className="min-w-0 pt-1">
          <p className="mb-1 text-[9px] font-bold uppercase tracking-wide text-[#0e7490]">{member.category || 'Faculty'}</p>
          <h3 className="line-clamp-2 text-base font-extrabold leading-snug text-[#17243b]">
            {name}
          </h3>
          <p className="mt-1 text-xs font-semibold text-[#1e3a8a] line-clamp-2">
            {designation}
          </p>
          </div>
        </div>
        <p className="flex items-center gap-1.5 text-xs text-[#69788d]"><GraduationCap className="h-3.5 w-3.5 shrink-0 text-[#0e7490]" /><span className="line-clamp-1">{qualification}</span></p>

        {/* Specialization Tags */}
        {specializationList.length > 0 && (
          <div className="mb-5 mt-4 flex flex-wrap gap-1.5">
            {specializationList.slice(0, 3).map((spec, index) => (
              <span
                key={index}
                className="rounded-sm border border-[#d5e1ec] bg-[#f3f7fb] px-2 py-1 text-[10px] font-semibold text-[#40516a]"
              >
                {spec}
              </span>
            ))}
            {specializationList.length > 3 && (
              <span className="rounded-sm border border-[#dce5ef] bg-white px-2 py-1 text-[10px] font-semibold text-[#69788d]">
                +{specializationList.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer Info & Action */}
      <div className="space-y-3 border-t border-[#e3eaf1] pt-4">
        <div className="space-y-1.5 text-xs text-[#69788d]">
          {email && (
            <div className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 shrink-0 text-[#0e7490]" />
              <span className="truncate">{email}</span>
            </div>
          )}
          {office && (
            <div className="flex items-center gap-2">
              <Building className="h-3.5 w-3.5 shrink-0 text-[#1e3a8a]" />
              <span className="truncate">{office}</span>
            </div>
          )}
        </div>

        {/* View Details Action Button */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onViewProfile && onViewProfile(member)}
            className="mt-1 inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-md bg-[#1e3a8a] px-3 text-xs font-bold text-white transition hover:bg-[#172e6e]"
          >
            <span>View Full Profile</span>
            <ChevronRight className="h-4 w-4" />
          </button>
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(member)}
              className="mt-1 rounded-md border border-[#dce5ef] bg-white p-2 text-[#52647b] transition hover:border-[#b9dce2] hover:bg-[#edf7f8] hover:text-[#0e7490]"
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