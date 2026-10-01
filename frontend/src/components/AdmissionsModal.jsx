import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Info, ExternalLink, GraduationCap } from 'lucide-react';

const dcsLogo = "/dcs-logo.png"; 
const uafLogo = "/uaf-logo.png"; 

const UAF_ADMISSION_URL = "https://web.uaf.edu.pk/Contents/admissions/un/adm_overview.html";

export default function AdmissionsModal({ isOpen, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[4px]">
          {/* Modal Box - Styled exactly like LoginPage */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-2xl text-slate-800"
          >
            {/* Close Button - Exact same style as LoginPage */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-5 right-5 text-slate-500 hover:text-slate-900 transition cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button>

            {/* 1. TOP SECTION: Dual Logos & Header */}
            <div className="flex flex-col items-center text-center mb-6">
              {/* Logos */}
              <div className="flex items-center justify-center gap-5 mb-3">
                <img
                  src={dcsLogo}
                  alt="DCS Logo"
                  style={{ height: '48px', width: 'auto', maxWidth: '90px', objectFit: 'contain' }}
                />
                <div className="h-6 w-[1px] bg-white/10" />
                <img
                  src={uafLogo}
                  alt="UAF Logo"
                  style={{ height: '48px', width: 'auto', maxWidth: '90px', objectFit: 'contain' }}
                />
              </div>

              {/* Admission Badge */}
              <div className="inline-flex items-center gap-1.5 text-cyan-700 text-[11px] font-bold tracking-wider uppercase mb-2">
                <GraduationCap className="w-3.5 h-3.5" />
                Admission Information
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold">
                Admissions at <span className="text-cyan-400">DCS Pars Campus</span>
              </h3>
            </div>

            {/* 2. MAIN INFORMATION TEXT */}
            <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed mb-5">
              <p>
                Admissions to the Department of Computer Science at <strong className="text-slate-800">DCS Pars Campus</strong> are conducted according to the official admission policies of the <strong className="text-slate-800">University of Agriculture Faisalabad (UAF)</strong>.
              </p>
              <p>
                Undergraduate admissions at UAF generally open each year during <strong className="text-slate-800">June & July</strong> based on the UAF entry test and merit guidelines.
              </p>
            </div>

            {/* 3. IMPORTANT NOTICE / HIGHLIGHT BOX */}
            <div className="p-3.5 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-start gap-3 mb-6">
              <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <p className="text-xs text-cyan-800 font-medium leading-relaxed">
                <strong className="text-cyan-900">Important:</strong> On the UAF admission portal, select the degree program offered specifically at the <strong className="text-slate-800">DCS Pars Campus</strong>.
              </p>
            </div>

            {/* 4. BOTTOM ACTION BUTTON */}
            <a
              href={UAF_ADMISSION_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#1e3a8a] hover:bg-[#172e6e] text-white text-sm font-bold shadow-md shadow-blue-900/20 hover:scale-[1.01] active:scale-[0.98] transition cursor-pointer"
            >
              View UAF Admission Information
              <ExternalLink className="w-4 h-4" />
            </a>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}