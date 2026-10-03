import React, { useState, useEffect } from 'react';
import { Printer, Download, Sparkles, Mail, Phone, Globe, MapPin } from 'lucide-react';
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';

export default function ApplicationPreview({ formData, recipientObj, printableRef }) {
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

  // FIXED Export to PDF Logic (Mobile Pixel Squash Fix)
  // Export to PDF Logic (Guaranteed Mobile Fix via Off-Screen Cloning)
  const handleDownloadPDF = async () => {
    const element = printableRef.current;
    if (!element) return;

    // 1. Off-screen desktop container banayein
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '794px'; // Fixed A4 width

    // 2. Original element ka clone banayein
    const clone = element.cloneNode(true);
    
    // 3. Clone par absolute/desktop scale styles set karein
    clone.style.transform = 'none';
    clone.style.width = '794px';
    clone.style.minWidth = '794px';
    clone.style.height = '1123px'; // A4 Height in px (297mm)
    clone.style.boxSizing = 'border-box';

    container.appendChild(clone);
    document.body.appendChild(container);

    try {
      // 4. Capture Canvas from cloned Desktop view
      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: 794,
        height: 1123
      });

      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${formData.studentRegNo || 'UAF'}_Application.pdf`);
    } catch (err) {
      console.error("PDF generation error:", err);
    } finally {
      // 5. Cleanup off-screen container
      document.body.removeChild(container);
    }
  };
  return (
    <div className="flex flex-col items-center w-full overflow-x-hidden">
      
      {/* Top Action Controls */}
      <div className="mb-4 flex w-full max-w-[210mm] items-center justify-between rounded-md border border-[#dce5ef] bg-white/90 p-3 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          <span className="text-xs font-semibold text-[#52647b]">Live A4 Paper Preview</span>
        </div>
        <button
          onClick={handleDownloadPDF}
          className="flex items-center gap-2 rounded-md bg-[#1e3a8a] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[#172e6e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0e7490]"
        >
          <Download className="w-4 h-4" /> Download PDF
        </button>
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

              <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-[9.5px] font-semibold">
                <span className="flex items-center gap-1">
                  <Mail className="w-3 h-3" /> example@university.edu
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3" /> +92-300-1234567
                </span>
                <span className="flex items-center gap-1">
                  <Globe className="w-3 h-3" /> www.example.edu.pk
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full border border-slate-800 flex items-center justify-center text-[7px] font-black leading-none">f</span> facebook.com/example
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full border border-slate-800 flex items-center justify-center text-[7px] font-black leading-none">IG</span> @example
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full border border-slate-800 flex items-center justify-center text-[7px] font-black leading-none">in</span> example
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> University Road, Faisalabad, Pakistan
                </span>
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