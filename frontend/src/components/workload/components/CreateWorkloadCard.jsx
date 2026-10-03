import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarRange, X, Check } from 'lucide-react';
import axios from 'axios';
import ReusableComboBox from './ReusableComboBox';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const currentYear = new Date().getFullYear();
const yearSuggestions = [String(currentYear), String(currentYear + 1), String(currentYear - 1)];
const semesterSuggestions = ['Spring', 'Winter', 'Summer'];

export default function CreateWorkloadCard({ onClose, onCreated }) {
  const [year, setYear] = useState(String(currentYear));
  const [semester, setSemester] = useState('Spring');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!year || !semester) {
      setError('Please select both year and semester.');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const { data } = await axios.post(
        `${API_URL}/api/v1/workload`,
        { year, semester },
        { withCredentials: true }
      );

      if (data.success) {
        onCreated?.(data.workload);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Something went wrong while creating the workload.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-[#10203d]/50 p-3 backdrop-blur-sm sm:p-5"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[calc(100dvh-1.5rem)] w-full max-w-md overflow-y-auto rounded-xl border border-[#dce5ef] bg-white p-5 text-[#25354d] shadow-2xl sm:max-h-[calc(100dvh-2.5rem)] sm:p-6"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close workload creation"
          className="absolute right-4 top-4 rounded-md p-2 text-[#69788d] transition hover:bg-[#f3f7fb] hover:text-[#17243b] sm:right-5 sm:top-5"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6 flex items-center gap-3.5 border-b border-[#e3eaf1] pb-4">
          <div className="shrink-0 rounded-lg border border-[#dce5ef] bg-[#f7fafc] p-2.5 text-[#1e3a8a]">
            <CalendarRange className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold tracking-tight text-[#17243b]">
              Create New Workload
            </h3>
            <p className="mt-0.5 text-xs text-[#69788d]">
              Start a new semester workload session.
            </p>
          </div>
        </div>

        {/* Form Inputs with Strict Light/White Theme Dropdown Override */}
        <div className="mb-6 grid grid-cols-2 gap-4 [&_ul]:!bg-white [&_ul]:!border-gray-200 [&_ul]:!shadow-xl [&_li]:!text-gray-800 [&_li:hover]:!bg-blue-50 [&_li:hover]:!text-[#1e3a8a] [&_div[role='listbox']]:!bg-white [&_div[role='listbox']]:!border-gray-200">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-2">
              Year
            </label>
            <div className="[&_input]:!bg-gray-50 [&_input]:!text-gray-800 [&_input]:!border-gray-200 [&_button]:!bg-gray-50 [&_button]:!text-gray-800 [&_button]:!border-gray-200 [&_div]:!bg-gray-50 [&_div]:!text-gray-800 [&_div]:!border-gray-200 rounded-xl">
              <ReusableComboBox
                value={year}
                onChange={setYear}
                options={yearSuggestions}
                placeholder="Select year..."
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-2">
              Semester
            </label>
            <div className="[&_input]:!bg-gray-50 [&_input]:!text-gray-800 [&_input]:!border-gray-200 [&_button]:!bg-gray-50 [&_button]:!text-gray-800 [&_button]:!border-gray-200 [&_div]:!bg-gray-50 [&_div]:!text-gray-800 [&_div]:!border-gray-200 rounded-xl">
              <ReusableComboBox
                value={semester}
                onChange={setSemester}
                options={semesterSuggestions}
                placeholder="Select semester..."
              />
            </div>
          </div>
        </div>

        {error && (
          <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2 mb-4">
            {error}
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 border-t border-[#e3eaf1] pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCreate}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#1e3a8a] hover:bg-[#172e6e] text-xs font-bold text-white shadow-md transition cursor-pointer disabled:opacity-60 disabled:pointer-events-none"
          >
            <Check className="w-4 h-4" />
            {isSaving ? 'Creating...' : 'Create & Continue'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}