import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, FileText, FileType2, Loader2, X } from 'lucide-react';
import axios from 'axios';
import ReusableComboBox from './ReusableComboBox';
import WorkloadReportPrintable from './WorkloadReportPrintable';
import { exportElementToPdf } from '../utils/exportToPdf';
import { exportReportToWord } from '../utils/exportToWord';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const reportTypeOptions = [
  { value: 'class-wise', label: 'Class-wise' },
  { value: 'teacher-wise', label: 'Teacher-wise' },
  { value: 'course-wise', label: 'Course-wise' },
];

const ordinal = (n) => {
  const num = Number(n);
  const s = ['th', 'st', 'nd', 'rd'];
  const v = num % 100;
  return num + (s[(v - 20) % 10] || s[v] || s[0]);
};

const getClassLabel = (c) =>
  `${ordinal(c.semesterNumber)} Semester ${c.degree}${c.section ? ` Sec ${c.section}` : ''} (${c.session})`;

export default function DownloadStep({ workload, onBack }) {
  const [reportType, setReportType] = useState('class-wise');
  const [filterOptions, setFilterOptions] = useState([]); // [{id, label}]
  const [filterLabel, setFilterLabel] = useState('All');
  const [format, setFormat] = useState('pdf');
  const [report, setReport] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const printableRef = useRef(null);

  // Load filter options whenever report type changes
  useEffect(() => {
    setFilterLabel('All');
    const loadFilters = async () => {
      try {
        if (reportType === 'class-wise') {
          const { data } = await axios.get(`${API_URL}/api/v1/workload/${workload._id}/classes`, {
            withCredentials: true,
          });
          if (data.success) {
            setFilterOptions(
              data.workloadClasses.map((wc) => ({ id: wc._id, label: getClassLabel(wc.classId) }))
            );
          }
        } else if (reportType === 'teacher-wise') {
          const { data } = await axios.get(`${API_URL}/api/v1/workload/${workload._id}/teachers`, {
            withCredentials: true,
          });
          if (data.success) {
            setFilterOptions(
              data.workloadTeachers.map((wt) => ({
                id: wt.teacherId._id,
                label: `${wt.teacherId.designation || ''} ${wt.teacherId.name}`.trim(),
              }))
            );
          }
        } else {
          const { data } = await axios.get(
            `${API_URL}/api/v1/workload/${workload._id}/report/course-wise`,
            { withCredentials: true }
          );
          if (data.success) {
            setFilterOptions(data.report.map((g) => ({ id: g.courseId, label: g.label })));
          }
        }
      } catch (err) {
        console.error('[Load Filters Error]:', err.message);
      }
    };
    loadFilters();
  }, [reportType, workload._id]);

  const resolveFilterId = () => {
    if (filterLabel === 'All') return null;
    const match = filterOptions.find((o) => o.label === filterLabel);
    return match ? match.id : null;
  };

  const fetchReport = async () => {
    const filterId = resolveFilterId();
    const params = {};
    if (filterId) {
      if (reportType === 'class-wise') params.classId = filterId;
      if (reportType === 'teacher-wise') params.teacherId = filterId;
      if (reportType === 'course-wise') params.courseId = filterId;
    }
    const { data } = await axios.get(
      `${API_URL}/api/v1/workload/${workload._id}/report/${reportType}`,
      { params, withCredentials: true }
    );
    return data.success ? data.report : [];
  };

  const handleDownload = async () => {
    setError('');
    setIsGenerating(true);
    try {
      const reportData = await fetchReport();
      setReport(reportData);

      await new Promise((resolve) => setTimeout(resolve, 150));

      const safeTitle = workload.title.replace(/\s+/g, '_');
      const fileBaseName = `${safeTitle}_${reportType}`;

      if (format === 'pdf') {
        await exportElementToPdf(printableRef.current, `${fileBaseName}.pdf`);
      } else {
        await exportReportToWord({
          workloadTitle: workload.title,
          reportType,
          report: reportData,
          fileName: `${fileBaseName}.docx`,
        });
      }
    } catch (err) {
      console.error('[Download Error]:', err.message);
      setError('Something went wrong while generating the file.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-5xl bg-white border border-gray-100 rounded-3xl shadow-2xl overflow-hidden text-gray-800 flex flex-col relative"
      >
        {/* Loading Overlay Window */}
        <AnimatePresence>
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-white border border-gray-100 p-6 rounded-2xl shadow-xl flex flex-col items-center max-w-xs w-full"
              >
                <div className="p-3 rounded-full bg-blue-50 text-[#1e3a8a] mb-3 border border-blue-100">
                  <Loader2 className="w-7 h-7 animate-spin" />
                </div>
                <h4 className="text-base font-bold text-gray-900 mb-1">Generating Report</h4>
                <p className="text-xs text-gray-500 font-medium">
                  Preparing your {format.toUpperCase()} document...
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-blue-50 border border-blue-100 text-[#1e3a8a]">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 tracking-tight">Download</h3>
              <p className="text-[11px] text-gray-500 font-medium">
                Generate the final workload report.
              </p>
            </div>
          </div>
          {onBack && (
            <button
              onClick={onBack}
              className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-600 mb-1.5">
              Report Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {reportTypeOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setReportType(opt.value)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                    reportType === opt.value
                      ? 'bg-blue-50 text-[#1e3a8a] border-blue-200 shadow-xs'
                      : 'bg-white text-gray-500 border-gray-200 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-600 mb-1.5">
              Filter
            </label>
            <ReusableComboBox
              value={filterLabel}
              onChange={setFilterLabel}
              options={['All', ...filterOptions.map((o) => o.label)]}
              placeholder="All"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-600 mb-1.5">
              File Format
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => setFormat('pdf')}
                className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                  format === 'pdf'
                    ? 'bg-blue-50 text-[#1e3a8a] border-blue-200 shadow-xs'
                    : 'bg-white text-gray-500 border-gray-200 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <FileText className="w-4 h-4" /> PDF
              </button>
              <button
                onClick={() => setFormat('word')}
                className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                  format === 'word'
                    ? 'bg-blue-50 text-[#1e3a8a] border-blue-200 shadow-xs'
                    : 'bg-white text-gray-500 border-gray-200 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <FileType2 className="w-4 h-4" /> Word
              </button>
            </div>
          </div>

          {error && (
            <p className="text-[11px] font-semibold text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-1.5">
              {error}
            </p>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-gray-50/50 border-t border-gray-100 shrink-0">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-100 transition cursor-pointer"
          >
            ← Previous
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={isGenerating}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#1e3a8a] hover:bg-[#1b337a] text-xs font-bold text-white shadow-md transition cursor-pointer disabled:opacity-60 disabled:pointer-events-none"
          >
            {isGenerating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <>
                <Download className="w-3.5 h-3.5" /> Download
              </>
            )}
          </button>
        </div>
      </motion.div>

      {/* Hidden printable template used for PDF capture */}
      <div style={{ position: 'absolute', top: '-99999px', left: '-99999px' }}>
        <WorkloadReportPrintable
          innerRef={printableRef}
          workloadTitle={workload.title}
          reportType={reportType}
          report={report}
        />
      </div>
    </div>
  );
}