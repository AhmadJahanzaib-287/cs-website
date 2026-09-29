import React, { useState, useRef, useEffect} from 'react';
import { motion } from 'framer-motion';
import ApplicationForm from './ApplicationForm';
import ApplicationPreview from './ApplicationPreview';
import appTemplates from '../../data/applicationTemplates.json';

export default function ApplicationGenerator() {
  const printableRef = useRef(null);
// Scroll to the top of the page on mount and on page refresh
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  const [formData, setFormData] = useState({
    recipientId: 'coordinator',
    applicationType: 'leave',
    subject: appTemplates.templates[0].defaultSubject,
    body: appTemplates.templates[0].defaultBody,
    studentName: '',
    studentRegNo: '',
    semester: '',
    section: '',
    contactNo: '',
    dynamicData: {}
  });

  const recipientObj = appTemplates.recipients.find(r => r.id === formData.recipientId);

  const handleGenerateClick = () => {
    // Auto-scroll to preview on mobile devices
    if (window.innerWidth < 1024 && printableRef.current) {
      printableRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="relative py-28 px-4 sm:px-8 bg-[#0b0f19] text-slate-100 overflow-hidden min-h-screen flex flex-col items-center"
    >

    
      
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-[700px] h-[220px] sm:h-[350px] bg-cyan-500/10 rounded-full blur-[120px] sm:blur-[160px] pointer-events-none" />

      {/* Page Title */}
      <div className="text-center max-w-3xl mx-auto mb-12 relative z-10">
        <span className="text-xs font-extrabold tracking-widest text-cyan-400 uppercase bg-cyan-500/10 px-4 py-1.5 rounded-full border border-cyan-500/30 backdrop-blur-md inline-block mb-3">
          University Official Portal
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Application Generator
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-2">
          Generate, preview, and print official Department of Computer Science applications formatted to DCS standards.
        </p>
      </div>

      {/* TWO COLUMN RESPONSIVE GRID */}
      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10 items-start">
        
        {/* Left Column: Form Controls (5 Cols) */}
        <div className="lg:col-span-5 w-full">
          <ApplicationForm 
            formData={formData} 
            setFormData={setFormData} 
            onGenerate={handleGenerateClick}
          />
        </div>

        {/* Right Column: Live A4 Printable Preview (7 Cols) */}
        <div className="lg:col-span-7 w-full sticky top-24">
          <ApplicationPreview 
            formData={formData} 
            recipientObj={recipientObj} 
            printableRef={printableRef}
          />
        </div>

      </div>

   </motion.section>
  );
}