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
      className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/50 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md mx-auto bg-white border border-gray-100 rounded-3xl p-6 shadow-2xl relative text-gray-800"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-6">
          <div className="p-3 rounded-2xl bg-blue-50 border border-blue-100 text-[#1e3a8a] shrink-0">
            <CalendarRange className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800 tracking-tight">
              Create New Workload
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Start a new semester workload session.
            </p>
          </div>
        </div>

        {/* Form Inputs with Strict Light/White Theme Dropdown Override */}
        <div className="grid grid-cols-2 gap-4 mb-6 [&_ul]:!bg-white [&_ul]:!border-gray-200 [&_ul]:!shadow-xl [&_li]:!text-gray-800 [&_li:hover]:!bg-blue-50 [&_li:hover]:!text-[#1e3a8a] [&_div[role='listbox']]:!bg-white [&_div[role='listbox']]:!border-gray-200">
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
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
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