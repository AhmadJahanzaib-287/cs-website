import React, { useState, useRef } from 'react';
import {
  X,
  FileSpreadsheet,
  UploadCloud,
  Download,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Layers,
  ArrowRight,
  Trash2,
  GraduationCap,
  Info,
} from 'lucide-react';
import { downloadSampleTemplate, parseExcelFile } from './excelHelpers';
import API from '../../api/axios';

const DEGREES = [
  'BS Computer Science',
  'BS Software Engineering',
  'BS Artificial Intelligence',
  'BS Information Technology',
  'BS Data Science',
  'MS Computer Science',
];

const SEMESTERS = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];
const SESSIONS = ['Morning', 'Evening'];
const SECTIONS = ['A', 'B', 'C', 'D'];
const BATCHES = ['2021-2025', '2022-2026', '2023-2027', '2024-2028', '2025-2029', '2026-2030'];

const BulkExcelUploadModal = ({ isOpen, onClose, onSuccess, initialClass = {} }) => {
  const [classDefaults, setClassDefaults] = useState({
    degree: initialClass.degree || 'BS Computer Science',
    semester: initialClass.semester || '1st',
    session: initialClass.session || 'Morning',
    section: initialClass.section || 'A',
    academicSession: initialClass.academicSession || '2023-2027',
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [duplicateAction, setDuplicateAction] = useState('skip'); // 'skip' | 'update'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [importSummary, setImportSummary] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleClassChange = (e) => {
    const { name, value } = e.target;
    setClassDefaults((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = async (file) => {
    if (!file) return;

    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const hasValidExt = validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));
    if (!hasValidExt) {
      setError('Please upload a valid Excel file (.xlsx, .xls) or CSV file');
      return;
    }

    setSelectedFile(file);
    setError(null);
    setParsing(true);
    setParsedData(null);
    setImportSummary(null);

    try {
      const result = await parseExcelFile(file, classDefaults);
      if (result.students.length === 0) {
        setError('No valid student rows found in the sheet. Please verify headers.');
      } else {
        setParsedData(result);
      }
    } catch (err) {
      console.error('Error parsing excel:', err);
      setError(err.message || 'Failed to read Excel file. Please use the provided template.');
    } finally {
      setParsing(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setParsedData(null);
    setError(null);
    setImportSummary(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDownloadTemplate = async () => {
    try {
      await downloadSampleTemplate(classDefaults);
    } catch (err) {
      console.error('Template download error:', err);
      setError('Failed to generate sample template');
    }
  };

  const handleConfirmImport = async () => {
    if (!parsedData || parsedData.students.length === 0) {
      setError('No student records to import');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await API.post('/students/bulk', {
        students: parsedData.students,
        duplicateAction,
        defaultClassInfo: classDefaults,
      });

      if (response.data.success) {
        setImportSummary(response.data.summary);
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }
    } catch (err) {
      console.error('Bulk import error:', err);
      setError(err.response?.data?.message || 'Bulk import failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#10203d]/60 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-xl border border-[#dce5ef] bg-white shadow-2xl transition-all"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e3eaf1] bg-[#f8fafc] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0e7490] text-white">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#17243b]">Import Entire Class via Excel Sheet</h2>
              <p className="text-xs text-[#69788d]">Bulk enroll 40-70+ students in one click with spreadsheet mapping</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-md p-1.5 text-[#69788d] transition hover:bg-[#edf2f7] hover:text-[#17243b] disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="flex items-center gap-2.5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-800">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Success summary */}
          {importSummary && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-5">
              <div className="flex items-center gap-2.5 text-emerald-800 font-bold text-sm">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <span>Class Import Successful!</span>
              </div>
              <p className="mt-1 text-xs text-emerald-700">
                The students have been saved into the database and are now enrolled in the department directory.
              </p>
              <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-lg bg-white p-3 border border-emerald-200 shadow-xs">
                  <p className="text-xs font-semibold text-[#64748b]">Newly Inserted</p>
                  <p className="mt-1 text-xl font-extrabold text-emerald-700">{importSummary.inserted}</p>
                </div>
                <div className="rounded-lg bg-white p-3 border border-emerald-200 shadow-xs">
                  <p className="text-xs font-semibold text-[#64748b]">Updated</p>
                  <p className="mt-1 text-xl font-extrabold text-blue-700">{importSummary.updated}</p>
                </div>
                <div className="rounded-lg bg-white p-3 border border-emerald-200 shadow-xs">
                  <p className="text-xs font-semibold text-[#64748b]">Skipped (Duplicates)</p>
                  <p className="mt-1 text-xl font-extrabold text-amber-600">{importSummary.skipped}</p>
                </div>
              </div>
            </div>
          )}

          {/* 1. Target Class Selection */}
          <div className="rounded-xl border border-[#cbd5e1] bg-[#f8fafc] p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-3 border-b border-[#e2e8f0] pb-2.5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase text-[#172e6e]">
                <GraduationCap className="h-4 w-4 text-[#0e7490]" />
                <span>1. Select Target Class Defaults</span>
              </div>
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="inline-flex items-center gap-1.5 rounded-md border border-[#0e7490]/30 bg-white px-3 py-1.5 text-xs font-bold text-[#0e7490] shadow-xs transition hover:bg-[#0e7490] hover:text-white"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download Sample Excel Template</span>
              </button>
            </div>
            <p className="text-[11px] text-[#64748b] mb-3">
              Students without explicit class fields in your sheet will automatically be assigned to this target class:
            </p>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              <div>
                <label className="mb-1 block text-[11px] font-semibold text-[#475569]">Degree / Program</label>
                <select
                  name="degree"
                  value={classDefaults.degree}
                  onChange={handleClassChange}
                  className="w-full rounded-md border border-[#cbd5e1] bg-white px-2.5 py-1.5 text-xs font-medium text-[#1e293b] outline-none"
                >
                  {DEGREES.map((deg) => (
                    <option key={deg} value={deg}>{deg}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-semibold text-[#475569]">Semester</label>
                <select
                  name="semester"
                  value={classDefaults.semester}
                  onChange={handleClassChange}
                  className="w-full rounded-md border border-[#cbd5e1] bg-white px-2.5 py-1.5 text-xs font-medium text-[#1e293b] outline-none"
                >
                  {SEMESTERS.map((sem) => (
                    <option key={sem} value={sem}>{sem} Semester</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-semibold text-[#475569]">Shift / Session</label>
                <select
                  name="session"
                  value={classDefaults.session}
                  onChange={handleClassChange}
                  className="w-full rounded-md border border-[#cbd5e1] bg-white px-2.5 py-1.5 text-xs font-medium text-[#1e293b] outline-none"
                >
                  {SESSIONS.map((sess) => (
                    <option key={sess} value={sess}>{sess}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-semibold text-[#475569]">Section</label>
                <select
                  name="section"
                  value={classDefaults.section}
                  onChange={handleClassChange}
                  className="w-full rounded-md border border-[#cbd5e1] bg-white px-2.5 py-1.5 text-xs font-medium text-[#1e293b] outline-none"
                >
                  {SECTIONS.map((sec) => (
                    <option key={sec} value={sec}>Section {sec}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-semibold text-[#475569]">Batch / Session</label>
                <select
                  name="academicSession"
                  value={classDefaults.academicSession}
                  onChange={handleClassChange}
                  className="w-full rounded-md border border-[#cbd5e1] bg-white px-2.5 py-1.5 text-xs font-medium text-[#1e293b] outline-none"
                >
                  {BATCHES.map((batch) => (
                    <option key={batch} value={batch}>{batch}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 2. Drag & Drop Upload Zone */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-[#172e6e]">2. Upload Class Excel / CSV File</span>
              {selectedFile && (
                <button
                  type="button"
                  onClick={handleClearFile}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Remove file</span>
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={(e) => handleFileSelect(e.target.files?.[0])}
              className="hidden"
            />

            {!selectedFile ? (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
                className="group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#94a3b8]/60 bg-[#f8fafc] px-6 py-10 text-center transition hover:border-[#0e7490] hover:bg-[#e6f4f6]/40"
              >
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#e8f5f6] text-[#0e7490] transition group-hover:scale-110">
                  <UploadCloud className="h-7 w-7" />
                </div>
                <p className="text-sm font-bold text-[#1e293b]">
                  Click to select or drag and drop your Class Excel Sheet
                </p>
                <p className="mt-1 text-xs text-[#64748b]">
                  Supports Excel (.xlsx, .xls) and CSV spreadsheets
                </p>
                <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[11px] font-bold text-[#1e3a8a] shadow-xs border border-[#cbd5e1]">
                  Requires columns: Roll / Reg No, Student Name
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-between rounded-lg border border-[#cbd5e1] bg-white p-4 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                    <FileSpreadsheet className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#1e293b]">{selectedFile.name}</p>
                    <p className="text-[11px] text-[#64748b]">
                      {(selectedFile.size / 1024).toFixed(1)} KB · {parsedData ? `${parsedData.totalParsed} students detected` : 'Parsing...'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-md border border-[#cbd5e1] bg-white px-3 py-1.5 text-xs font-semibold text-[#475569] hover:bg-[#f1f5f9]"
                >
                  Change file
                </button>
              </div>
            )}
          </div>

          {/* Parsing Spinner */}
          {parsing && (
            <div className="flex items-center justify-center gap-2 py-6 text-xs font-semibold text-[#0e7490]">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Analyzing spreadsheet columns and rows...</span>
            </div>
          )}

          {/* 3. Preview Parsed Table */}
          {parsedData && parsedData.students.length > 0 && (
            <div className="space-y-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase text-[#172e6e]">3. Parsed Class Preview</span>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                    {parsedData.totalParsed} Students Ready
                  </span>
                  {parsedData.errorCount > 0 && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800">
                      {parsedData.errorCount} Invalid Rows Skipped
                    </span>
                  )}
                </div>

                {/* Duplicate strategy */}
                <div className="flex items-center gap-3 text-xs">
                  <span className="font-semibold text-[#475569]">Duplicate Reg Nos:</span>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="dupAction"
                      value="skip"
                      checked={duplicateAction === 'skip'}
                      onChange={() => setDuplicateAction('skip')}
                      className="accent-[#1e3a8a]"
                    />
                    <span>Skip</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="dupAction"
                      value="update"
                      checked={duplicateAction === 'update'}
                      onChange={() => setDuplicateAction('update')}
                      className="accent-[#1e3a8a]"
                    />
                    <span>Update Info</span>
                  </label>
                </div>
              </div>

              {/* Table preview (first 10 rows) */}
              <div className="max-h-56 overflow-auto rounded-lg border border-[#cbd5e1] bg-white text-left text-xs">
                <table className="w-full min-w-[600px]">
                  <thead className="sticky top-0 bg-[#f1f5f9] text-[11px] font-bold text-[#475569]">
                    <tr>
                      <th className="p-2">#</th>
                      <th className="p-2">Roll / Reg No</th>
                      <th className="p-2">Full Name</th>
                      <th className="p-2">Father Name</th>
                      <th className="p-2">Assigned Class</th>
                      <th className="p-2">Phone</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2e8f0]">
                    {parsedData.students.slice(0, 15).map((stu, idx) => (
                      <tr key={stu.regNo + idx} className="hover:bg-[#f8fafc]">
                        <td className="p-2 text-[#94a3b8] font-mono text-[10px]">{idx + 1}</td>
                        <td className="p-2 font-mono font-bold text-[#1e3a8a]">{stu.regNo}</td>
                        <td className="p-2 font-semibold text-[#1e293b]">{stu.name}</td>
                        <td className="p-2 text-[#64748b]">{stu.fatherName || '—'}</td>
                        <td className="p-2 text-[11px] text-[#0e7490]">
                          {stu.degree} · Sem {stu.semester} ({stu.session[0]}-{stu.section})
                        </td>
                        <td className="p-2 text-[#64748b]">{stu.phone || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsedData.students.length > 15 && (
                <p className="text-right text-[11px] italic text-[#94a3b8]">
                  Showing first 15 of {parsedData.students.length} students...
                </p>
              )}
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-[#e2e8f0] pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-md border border-[#cbd5e1] bg-white px-4 py-2 text-xs font-semibold text-[#475569] transition hover:bg-[#f1f5f9] disabled:opacity-50"
            >
              {importSummary ? 'Close' : 'Cancel'}
            </button>

            {!importSummary && (
              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={loading || !parsedData || parsedData.students.length === 0}
                className="inline-flex items-center gap-2 rounded-md bg-[#0e7490] px-5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#0c627a] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Importing Class Students...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="h-4 w-4" />
                    <span>Import {parsedData ? `${parsedData.students.length} Students` : 'Class'}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkExcelUploadModal;

