import React, { useState } from 'react';
import { User, FileText, Send, Sparkles, CheckCircle2 } from 'lucide-react';
import appTemplates from '../../data/applicationTemplates.json';

export default function ApplicationForm({ formData, setFormData, onGenerate }) {
  const [selectedType, setSelectedType] = useState('leave');
  const [searchRecipient, setSearchRecipient] = useState('');
  const [isRecipientOpen, setIsRecipientOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [statusMessage, setStatusMessage] = useState(null);

  const handleValidateAndGenerate = () => {
    const newErrors = {};

    if (!formData.subject?.trim()) newErrors.subject = 'Subject is required.';
    if (!formData.body?.trim()) newErrors.body = 'Application body is required.';
    if (!formData.studentName?.trim()) newErrors.studentName = 'Student name is required.';
    if (!formData.studentRegNo?.trim()) newErrors.studentRegNo = 'Registration number is required.';
    if (!formData.semester?.trim()) newErrors.semester = 'Semester is required.';
    if (!formData.contactNo?.trim()) newErrors.contactNo = 'Contact number is required.';

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setStatusMessage({ type: 'error', text: 'Please fill in all required fields marked below.' });
      return;
    }

    setStatusMessage({ type: 'success', text: 'Application formatted and validated successfully.' });
    onGenerate();
  };
  // Recipient Select Handler
  const activeRecipient = appTemplates.recipients.find(r => r.id === formData.recipientId) || appTemplates.recipients[0];

  // Application Type Change Handler
  const handleTypeChange = (typeId) => {
    setSelectedType(typeId);
    const tmpl = appTemplates.templates.find(t => t.id === typeId);
    if (!tmpl) return;

    setFormData(prev => ({
      ...prev,
      applicationType: typeId,
      subject: tmpl.defaultSubject,
      body: tmpl.defaultBody,
      dynamicData: {}
    }));
  };

  // AI Prompt Subject/Body Generator for "Other"
  const handleAiPurposeGenerate = (purposeText) => {
    if (!purposeText) return;
    setFormData(prev => ({
      ...prev,
      subject: `Application Regarding ${purposeText}`,
      body: `Respected Sir,\n\nWith due respect, I am writing to formally request your approval regarding ${purposeText}.\n\nDue to genuine academic and personal requirement, I kindly request you to process this application as early as possible.\n\nI shall be highly obliged for your kind consideration.`,
      dynamicData: { ...prev.dynamicData, customPurpose: purposeText }
    }));
  };

  const currentTemplate = appTemplates.templates.find(t => t.id === selectedType);

  return (
    <div className="bg-slate-950/60 border border-slate-800/80 backdrop-blur-xl p-6 rounded-2xl shadow-2xl flex flex-col gap-6 text-slate-200">
      
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-cyan-400" /> Application Details Form
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Fill out student details to generate instant official application.
        </p>
      </div>

      {/* RECIPIENT SEARCHABLE COMBOBOX */}
      <div className="relative">
        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
          Select Recipient
        </label>
        <button
          type="button"
          onClick={() => setIsRecipientOpen(!isRecipientOpen)}
          className="w-full text-left bg-slate-900/90 border border-slate-800 focus:border-cyan-500 rounded-xl p-3 text-xs text-white flex justify-between items-center"
        >
          <span>{activeRecipient.title} — <span className="text-slate-400">{activeRecipient.dept}</span></span>
          <span className="text-xs text-cyan-400 font-bold">Change ▾</span>
        </button>

        {isRecipientOpen && (
          <div className="absolute z-30 w-full mt-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 max-h-52 overflow-y-auto">
            <input
              type="text"
              placeholder="Search recipient..."
              value={searchRecipient}
              onChange={(e) => setSearchRecipient(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white mb-2 focus:outline-none focus:border-cyan-500"
            />
            {appTemplates.recipients
              .filter(r => r.title.toLowerCase().includes(searchRecipient.toLowerCase()))
              .map(r => (
                <div
                  key={r.id}
                  onClick={() => {
                    setFormData(prev => ({ ...prev, recipientId: r.id }));
                    setIsRecipientOpen(false);
                  }}
                  className="p-2 text-xs hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
                >
                  <p className="font-bold text-white">{r.title}</p>
                  <p className="text-[10px] text-slate-400">{r.dept}</p>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* APPLICATION TYPE SELECTION */}
      <div>
        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
          Application Type
        </label>
        <select
          value={selectedType}
          onChange={(e) => handleTypeChange(e.target.value)}
          className="w-full bg-slate-900/90 border border-slate-800 focus:border-cyan-500 rounded-xl p-3 text-xs text-white focus:outline-none"
        >
          {appTemplates.templates.map(t => (
            <option key={t.id} value={t.id} className="bg-slate-900 text-white">
              {t.name}
            </option>
          ))}
        </select>
      </div>

      {/* DYNAMIC FIELDS FOR SELECTED TYPE */}
      {currentTemplate?.dynamicFields?.length > 0 && (
        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/80 space-y-3">
          <p className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Specific Details Needed:
          </p>
          {currentTemplate.dynamicFields.map(field => (
            <div key={field.name}>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                {field.label}
              </label>
              <input
                type={field.type}
                placeholder={field.placeholder || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  if (field.name === 'customPurpose') {
                    handleAiPurposeGenerate(val);
                  } else {
                    setFormData(prev => ({
                      ...prev,
                      dynamicData: { ...prev.dynamicData, [field.name]: val }
                    }));
                  }
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
          ))}
        </div>
      )}

      {/* EDITABLE SUBJECT */}
      <div>
        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
          Subject (Editable)
        </label>
        <input
          type="text"
          value={formData.subject}
          onChange={(e) => {
            setFormData(prev => ({ ...prev, subject: e.target.value }));
            if (errors.subject) setErrors(prev => ({ ...prev, subject: null }));
          }}
          className={`w-full bg-slate-900/90 border ${errors.subject ? 'border-rose-500' : 'border-slate-800'} focus:border-cyan-500 rounded-xl p-3 text-xs text-white focus:outline-none`}
        />
        {errors.subject && <p className="text-[10px] text-rose-400 mt-1">{errors.subject}</p>}
      </div>

      {/* EDITABLE BODY */}
      <div>
        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
          Application Body (Editable)
        </label>
        <textarea
          rows={5}
          value={formData.body}
          onChange={(e) => {
            setFormData(prev => ({ ...prev, body: e.target.value }));
            if (errors.body) setErrors(prev => ({ ...prev, body: null }));
          }}
          className={`w-full bg-slate-900/90 border ${errors.body ? 'border-rose-500' : 'border-slate-800'} focus:border-cyan-500 rounded-xl p-3 text-xs text-white leading-relaxed focus:outline-none`}
        />
        {errors.body && <p className="text-[10px] text-rose-400 mt-1">{errors.body}</p>}
      </div>

      {/* STUDENT PERSONAL DATA FIELDS */}
      <div className="border-t border-slate-800 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1">Student Name</label>
          <input
            type="text"
            placeholder="e.g. Ahmad Jahanzaib"
            value={formData.studentName}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, studentName: e.target.value }));
              if (errors.studentName) setErrors(prev => ({ ...prev, studentName: null }));
            }}
            className={`w-full bg-slate-900 border ${errors.studentName ? 'border-rose-500' : 'border-slate-800'} rounded-lg p-2 text-xs text-white focus:border-cyan-500 focus:outline-none`}
          />
          {errors.studentName && <p className="text-[10px] text-rose-400 mt-1">{errors.studentName}</p>}
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1">Registration No</label>
          <input
            type="text"
            placeholder="e.g. 2022-ag-1234"
            value={formData.studentRegNo}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, studentRegNo: e.target.value }));
              if (errors.studentRegNo) setErrors(prev => ({ ...prev, studentRegNo: null }));
            }}
            className={`w-full bg-slate-900 border ${errors.studentRegNo ? 'border-rose-500' : 'border-slate-800'} rounded-lg p-2 text-xs text-white focus:border-cyan-500 focus:outline-none`}
          />
          {errors.studentRegNo && <p className="text-[10px] text-rose-400 mt-1">{errors.studentRegNo}</p>}
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1">Semester & Section</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Sem (e.g. 6th)"
              value={formData.semester}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, semester: e.target.value }));
                if (errors.semester) setErrors(prev => ({ ...prev, semester: null }));
              }}
              className={`w-1/2 bg-slate-900 border ${errors.semester ? 'border-rose-500' : 'border-slate-800'} rounded-lg p-2 text-xs text-white focus:border-cyan-500 focus:outline-none`}
            />
            <input
              type="text"
              placeholder="Sec (e.g. Morning A)"
              value={formData.section}
              onChange={(e) => setFormData(prev => ({ ...prev, section: e.target.value }))}
              className="w-1/2 bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>
          {errors.semester && <p className="text-[10px] text-rose-400 mt-1">{errors.semester}</p>}
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1">Contact No</label>
          <input
            type="text"
            placeholder="0300-1234567"
            value={formData.contactNo}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, contactNo: e.target.value }));
              if (errors.contactNo) setErrors(prev => ({ ...prev, contactNo: null }));
            }}
            className={`w-full bg-slate-900 border ${errors.contactNo ? 'border-rose-500' : 'border-slate-800'} rounded-lg p-2 text-xs text-white focus:border-cyan-500 focus:outline-none`}
          />
          {errors.contactNo && <p className="text-[10px] text-rose-400 mt-1">{errors.contactNo}</p>}
        </div>
      </div>

      {statusMessage && (
        <div className={`p-3 rounded-xl text-xs font-medium border ${statusMessage.type === 'error' ? 'bg-rose-500/10 border-rose-500/30 text-rose-300' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'}`}>
          {statusMessage.text}
        </div>
      )}

      {/* GENERATE ACTION BUTTON */}
      <button
        type="button"
        onClick={handleValidateAndGenerate}
        className="mt-2 w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/20 transition-all cursor-pointer"
      >
        <CheckCircle2 className="w-4 h-4" /> Format & Validate Application
      </button>
    </div>
  );
}