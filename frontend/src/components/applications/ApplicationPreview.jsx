import React, { useState, useEffect } from 'react';
import { FileCheck2, MapPin } from 'lucide-react';

export default function ApplicationPreview({ formData, recipientObj, printableRef, serialNumber }) {
  const currentDate = new Date().toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const resize = () => {
      if (window.innerWidth < 768) {
        setScale((window.innerWidth - 24) / 794);
      } else {
        setScale(1);
      }
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  return (
    <div className="flex flex-col items-center w-full overflow-x-hidden">
      
      {/* Top Action Controls */}
      <div className="mb-4 flex w-full max-w-[210mm] items-center justify-between rounded-md border border-[#dce5ef] bg-white/90 p-3 shadow-sm">
        <div className="flex items-center gap-2">
          <FileCheck2 className="h-4 w-4 text-[#0e7490]" />
          <span className="text-xs font-semibold text-[#52647b]">Official A4 preview</span>
        </div>
        <span className="text-[10px] font-semibold uppercase text-[#8290a3]">A4 · Portrait</span>
      </div>

      {/* ================= A4 DOCUMENT WRAPPER CONTAINER ================= */}
      <div 
        className="w-full flex justify-center items-start overflow-hidden"
        style={{
          height: scale < 1 ? `${297 * 3.7795275591 * scale}px` : 'auto'
        }}
      >
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'top center'
          }}
          className="transition-transform duration-200"
        >
          <div
            ref={printableRef}
            className="relative w-[210mm] min-h-[297mm] h-[297mm] bg-white text-slate-900 pt-[10mm] pr-[20mm] pb-[10mm] pl-[20mm] shadow-2xl flex flex-col shrink-0 box-border text-left"
            style={{ fontFamily: "'Times New Roman', Times, serif" }}
          >
            {/* WATERMARK LOGO */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.06] select-none">
              <img 
                src="/dcs-logo.png" 
                alt="DCS Watermark" 
                className="w-[420px] h-[420px] object-contain"
              />
            </div>

            {/* TOP SECTION: HEADER LOGOS & TITLE */}
            <div>
              <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4 mb-6">
                {/* Left Logo */}
                <div className="w-16 h-16 flex items-center justify-center">
                  <img 
                    src="/uaf-logo.png" 
                    alt="UAF Logo" 
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Center Text */}
                <div className="text-center">
                  <h1 className="text-lg font-bold tracking-wide uppercase text-slate-900">
                    Department of Computer Science
                  </h1>
                  <h2 className="text-sm font-semibold text-slate-700">
                    University of Agriculture Faisalabad (PARS Campus)
                  </h2>
                  <p className="text-[11px] italic text-slate-600 mt-0.5">
                     Official Departmental Student Application
                  </p>
                </div>

                {/* Right Logo */}
                <div className="w-16 h-16 flex items-center justify-center">
                  <img 
                    src="/dcs-logo.png" 
                    alt="Department Logo" 
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              {/* DATE */}
              <div className="text-right text-xs font-semibold text-slate-800 mb-6">
                Date: <span className="underline">{currentDate}</span>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-600">Application No: <span data-application-serial>{serialNumber || 'Issued after generation'}</span></p>
              </div>

              {/* RECIPIENT */}
              <div className="text-xs font-bold leading-relaxed text-slate-900 mb-6">
                <p>To,</p>
                <p>{recipientObj?.title || 'The Coordinator'},</p>
                <p>{recipientObj?.dept || 'Department of Computer Science'},</p>
                <p>{recipientObj?.inst || 'University of Agriculture, Faisalabad'}.</p>
              </div>

              {/* SUBJECT */}
              <div className="text-xs font-extrabold uppercase tracking-wide mb-6 py-1.5 px-3 bg-slate-100 border-l-4 border-slate-900 text-slate-900">
                Subject: <span className="underline">{formData.subject || 'APPLICATION SUBJECT HERE'}</span>
              </div>

              {/* BODY TEXT */}
              <div className="text-xs text-slate-900 leading-relaxed whitespace-pre-wrap break-words mb-6 text-justify">
                {formData.body || 'Application body text will appear here as you type...'}
              </div>

              {/* DYNAMIC FIELDS DISPLAY IN BODY */}
              {Object.keys(formData.dynamicData || {}).length > 0 && (
                <div className="my-4 p-3 bg-slate-50 border border-slate-200 rounded text-xs space-y-1">
                  <p className="font-bold text-slate-800 mb-1">Additional Application Details:</p>
                  {Object.entries(formData.dynamicData).map(([key, value]) => (
                    <p key={key} className="text-slate-700 capitalize">
                      <span className="font-semibold">{key.replace(/([A-Z])/g, ' $1')}:</span> {value}
                    </p>
                  ))}
                </div>
              )}
            </div>

            {/* Yours sincerely & Student Info Box */}
            <div className="text-xs leading-relaxed text-slate-800 pt-3 mt-6">
              <p className="font-bold mb-3">Yours sincerely,</p>
              <p><span className="font-bold">Applicant Name:</span> <span className="font-normal text-slate-950">{formData.studentName || '_____________'}</span></p>
              <p><span className="font-bold">Registration No:</span> <span className="font-normal text-slate-950">{formData.studentRegNo || '_____________'}</span></p>
              <p><span className="font-bold">Semester / Section:</span> <span className="font-normal text-slate-950">{formData.semester || '___'} ({formData.section || '___'})</span></p>
              <p><span className="font-bold">Contact No:</span> <span className="font-normal text-slate-950">{formData.contactNo || '_____________'}</span></p>
            </div>

            {/* Student Signature */}
            <div className="flex items-end text-xs font-bold mt-10">
              <div className="text-center w-48">
                <div className="border-b-2 border-slate-900 mb-1 w-full h-1"></div>
                <p className="uppercase">Student Signature</p>
              </div>
            </div>

            {/* Official Signature */}
            <div
              className="absolute text-center w-48 text-xs font-bold"
              style={{
                bottom: '60mm',
                right: '20mm',
              }}
            >
              <div className="border-b-2 border-slate-900 mb-1 w-full h-1"></div>
              <p className="uppercase">Official Sanction / Signature</p>
            </div>

            {/* Professional Footer */}
            <div className="mt-auto pt-4 text-slate-800">
              <div className="border-t-2 border-slate-900"></div>
              <div className="border-t border-slate-900 mt-[2px] mb-2"></div>

              <div className="flex items-center justify-center gap-1.5 text-[9.5px] font-semibold">
                <MapPin className="h-3 w-3" /> Department of Computer Science · UAF, PARS Campus
              </div>

              <div className="border-t border-slate-900 mt-2"></div>
              <div className="border-t-2 border-slate-900 mt-[2px]"></div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}