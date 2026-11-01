import React, { useState, useRef, useEffect} from 'react';
import { motion } from 'framer-motion';
import ApplicationForm from './ApplicationForm';
import ApplicationPreview from './ApplicationPreview';
import appTemplates from '../../data/applicationTemplates.json';
import API from '../../api/axios';
import downloadApplicationPDF from './downloadApplicationPDF';

const createSubmissionKey = () => window.crypto?.randomUUID?.()
  || `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;

export default function ApplicationGenerator({ onBack }) {
  const printableRef = useRef(null);
  const submissionKeyRef = useRef(createSubmissionKey());
  const generationInProgressRef = useRef(false);
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
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedApplication, setGeneratedApplication] = useState(null);

  const recipientObj = appTemplates.recipients.find(r => r.id === formData.recipientId);

  const handleFormDataChange = (update) => {
    setGeneratedApplication(null);
    submissionKeyRef.current = createSubmissionKey();
    setFormData(update);
  };

  const handleGenerateClick = async (savedApplication) => {
    if (generationInProgressRef.current) return null;
    generationInProgressRef.current = true;
    setIsGenerating(true);
    try {
      let application = savedApplication;
      if (!application) {
        const { data } = await API.post('/applications', {
          ...formData,
          recipientTitle: recipientObj?.title,
          submissionKey: submissionKeyRef.current,
        });
        application = data.data;
        setGeneratedApplication(application);
      }

      if (window.innerWidth < 1024 && printableRef.current) {
        printableRef.current.scrollIntoView({ behavior: 'smooth' });
      }

      let pdfError = null;
      try {
        await downloadApplicationPDF(printableRef.current, formData.studentRegNo, application.serialNumber);
      } catch (error) {
        pdfError = error;
        console.error('Application was saved, but its PDF could not be downloaded:', error);
      }

      return { application, pdfError };
    } finally {
      setIsGenerating(false);
      generationInProgressRef.current = false;
    }
  };

  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="relative min-h-screen overflow-hidden bg-[#f3f7fb] px-4 pb-16 pt-24 text-[#17243b] sm:px-8 sm:pt-28"
    >
      <div className="relative z-10 mx-auto mb-9 flex max-w-7xl flex-col gap-5 border-b border-[#d5e1ec] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 flex items-center gap-2 text-[10px] font-extrabold uppercase text-[#0e7490]">
            <span className="h-px w-7 bg-[#0e7490]" /> Student services · PARS Campus
          </p>
          <h1 className="text-3xl font-extrabold leading-tight text-[#17243b] sm:text-4xl">Application <span className="text-[#0e7490]">studio</span></h1>
          <p className="mt-2 text-sm text-[#69788d]">Department of Computer Science · University of Agriculture Faisalabad</p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-md border border-[#cbd8e6] bg-white px-3.5 text-xs font-bold text-[#1e3a8a] transition hover:border-[#0e7490] hover:text-[#0e7490] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0e7490] sm:self-auto"
        >
          <span aria-hidden="true">←</span> Home
        </button>
      </div>

      {/* TWO COLUMN RESPONSIVE GRID */}
      <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-8">
        
        {/* Left Column: Form Controls (5 Cols) */}
        <div className="lg:col-span-5 w-full">
          <ApplicationForm 
            formData={formData} 
            setFormData={handleFormDataChange}
            onGenerate={handleGenerateClick}
            isGenerating={isGenerating}
            generatedApplication={generatedApplication}
          />
        </div>

        {/* Right Column: Live A4 Printable Preview (7 Cols) */}
        <div className="lg:col-span-7 w-full sticky top-24">
          <ApplicationPreview 
            formData={formData} 
            recipientObj={recipientObj} 
            printableRef={printableRef}
            serialNumber={generatedApplication?.serialNumber}
          />
        </div>

      </div>

   </motion.section>
  );
}