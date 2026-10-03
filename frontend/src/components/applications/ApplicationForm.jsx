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
    <div className="flex flex-col gap-6 rounded-xl border border-[#dce5ef] bg-white p-5 text-[#40516a] shadow-[0_18px_50px_-38px_rgba(23,36,59,0.45)] sm:p-6">
      
      <div className="border-b border-[#e3eaf1] pb-4">
        <h2 className="flex items-center gap-2 text-lg font-extrabold text-[#17243b]">
          <FileText className="h-5 w-5 text-[#0e7490]" /> Application Details
        </h2>
        <p className="mt-1 text-xs text-[#69788d]">
          Fill out student details to generate instant official application.
        </p>
      </div>

      {/* RECIPIENT SEARCHABLE COMBOBOX */}
      <div className="relative">
        <label className="mb-2 block text-xs font-bold uppercase text-[#52647b]">
          Select Recipient
        </label>
        <button
          type="button"
          onClick={() => setIsRecipientOpen(!isRecipientOpen)}
          className="flex w-full items-center justify-between rounded-md border border-[#ced8e4] bg-white p-3 text-left text-xs text-[#25354d] transition focus:border-[#0e7490] focus:outline-none focus:ring-2 focus:ring-[#0e7490]/15"
        >
          <span>{activeRecipient.title} — <span className="text-[#69788d]">{activeRecipient.dept}</span></span>
          <span className="text-xs font-bold text-[#1e3a8a]">Change ▾</span>
        </button>

        {isRecipientOpen && (
          <div className="absolute z-30 mt-2 max-h-52 w-full overflow-y-auto rounded-md border border-[#d5e1ec] bg-white p-2 shadow-xl">
            <input
              type="text"
              placeholder="Search recipient..."
              value={searchRecipient}
              onChange={(e) => setSearchRecipient(e.target.value)}
              className="mb-2 w-full rounded-md border border-[#ced8e4] bg-white p-2 text-xs text-[#17243b] placeholder-[#91a0b3] focus:border-[#0e7490] focus:outline-none"
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
                  className="cursor-pointer rounded-md p-2 text-xs transition-colors hover:bg-[#f3f7fb]"
                >
                  <p className="font-bold text-[#25354d]">{r.title}</p>
                  <p className="text-[10px] text-[#69788d]">{r.dept}</p>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* APPLICATION TYPE SELECTION */}
      <div>
        <label className="mb-2 block text-xs font-bold uppercase text-[#52647b]">
          Application Type
        </label>
        <select
          value={selectedType}
          onChange={(e) => handleTypeChange(e.target.value)}
          className="w-full rounded-md border border-[#ced8e4] bg-white p-3 text-xs text-[#25354d] focus:border-[#0e7490] focus:outline-none focus:ring-2 focus:ring-[#0e7490]/15"
        >
          {appTemplates.templates.map(t => (
            <option key={t.id} value={t.id} className="bg-white text-[#25354d]">
              {t.name}
            </option>
          ))}
        </select>
      </div>

      {/* DYNAMIC FIELDS FOR SELECTED TYPE */}
      {currentTemplate?.dynamicFields?.length > 0 && (
        <div className="space-y-3 rounded-md border border-[#dce5ef] bg-[#f7fafc] p-4">
          <p className="flex items-center gap-1.5 text-xs font-bold text-[#0e7490]">
            <Sparkles className="w-3.5 h-3.5" /> Specific Details Needed:
          </p>
          {currentTemplate.dynamicFields.map(field => (
            <div key={field.name}>
              <label className="mb-1 block text-[11px] font-semibold text-[#52647b]">
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
                className="w-full rounded-md border border-[#ced8e4] bg-white p-2.5 text-xs text-[#17243b] placeholder-[#91a0b3] focus:border-[#0e7490] focus:outline-none focus:ring-2 focus:ring-[#0e7490]/15"
              />
            </div>
          ))}
        </div>
      )}

      {/* EDITABLE SUBJECT */}
      <div>
        <label className="mb-2 block text-xs font-bold uppercase text-[#52647b]">
          Subject (Editable)
        </label>
        <input
          type="text"
          value={formData.subject}
          onChange={(e) => {
            setFormData(prev => ({ ...prev, subject: e.target.value }));
            if (errors.subject) setErrors(prev => ({ ...prev, subject: null }));
          }}
          className={`w-full rounded-md border bg-white p-3 text-xs text-[#17243b] focus:outline-none focus:ring-2 focus:ring-[#0e7490]/15 ${errors.subject ? 'border-rose-500' : 'border-[#ced8e4] focus:border-[#0e7490]'}`}
        />
        {errors.subject && <p className="mt-1 text-[10px] text-rose-700">{errors.subject}</p>}
      </div>

      {/* EDITABLE BODY */}
      <div>
        <label className="mb-2 block text-xs font-bold uppercase text-[#52647b]">
          Application Body (Editable)
        </label>
        <textarea
          rows={5}
          value={formData.body}
          onChange={(e) => {
            setFormData(prev => ({ ...prev, body: e.target.value }));
            if (errors.body) setErrors(prev => ({ ...prev, body: null }));
          }}
          className={`w-full rounded-md border bg-white p-3 text-xs leading-relaxed text-[#17243b] focus:outline-none focus:ring-2 focus:ring-[#0e7490]/15 ${errors.body ? 'border-rose-500' : 'border-[#ced8e4] focus:border-[#0e7490]'}`}
        />
        {errors.body && <p className="mt-1 text-[10px] text-rose-700">{errors.body}</p>}
      </div>

      {/* STUDENT PERSONAL DATA FIELDS */}
      <div className="grid grid-cols-1 gap-3 border-t border-[#e3eaf1] pt-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-[11px] font-semibold text-[#52647b]">Student Name</label>
          <input
            type="text"
            placeholder="e.g. Ahmad Jahanzaib"
            value={formData.studentName}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, studentName: e.target.value }));
              if (errors.studentName) setErrors(prev => ({ ...prev, studentName: null }));
            }}
            className={`w-full rounded-md border bg-white p-2 text-xs text-[#17243b] placeholder-[#91a0b3] focus:border-[#0e7490] focus:outline-none ${errors.studentName ? 'border-rose-500' : 'border-[#ced8e4]'}`}
          />
          {errors.studentName && <p className="mt-1 text-[10px] text-rose-700">{errors.studentName}</p>}
        </div>

        <div>
          <label className="mb-1 block text-[11px] font-semibold text-[#52647b]">Registration No</label>
          <input
            type="text"
            placeholder="e.g. 2022-ag-1234"
            value={formData.studentRegNo}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, studentRegNo: e.target.value }));
              if (errors.studentRegNo) setErrors(prev => ({ ...prev, studentRegNo: null }));
            }}
            className={`w-full rounded-md border bg-white p-2 text-xs text-[#17243b] placeholder-[#91a0b3] focus:border-[#0e7490] focus:outline-none ${errors.studentRegNo ? 'border-rose-500' : 'border-[#ced8e4]'}`}
          />
          {errors.studentRegNo && <p className="mt-1 text-[10px] text-rose-700">{errors.studentRegNo}</p>}
        </div>

        <div>
          <label className="mb-1 block text-[11px] font-semibold text-[#52647b]">Semester & Section</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Sem (e.g. 6th)"
              value={formData.semester}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, semester: e.target.value }));
                if (errors.semester) setErrors(prev => ({ ...prev, semester: null }));
              }}
              className={`w-1/2 rounded-md border bg-white p-2 text-xs text-[#17243b] placeholder-[#91a0b3] focus:border-[#0e7490] focus:outline-none ${errors.semester ? 'border-rose-500' : 'border-[#ced8e4]'}`}
            />
            <input
              type="text"
              placeholder="Sec (e.g. Morning A)"
              value={formData.section}
              onChange={(e) => setFormData(prev => ({ ...prev, section: e.target.value }))}
              className="w-1/2 rounded-md border border-[#ced8e4] bg-white p-2 text-xs text-[#17243b] placeholder-[#91a0b3] focus:border-[#0e7490] focus:outline-none"
            />
          </div>
          {errors.semester && <p className="mt-1 text-[10px] text-rose-700">{errors.semester}</p>}
        </div>

        <div>
          <label className="mb-1 block text-[11px] font-semibold text-[#52647b]">Contact No</label>
          <input
            type="text"
            placeholder="0300-1234567"
            value={formData.contactNo}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, contactNo: e.target.value }));
              if (errors.contactNo) setErrors(prev => ({ ...prev, contactNo: null }));
            }}
            className={`w-full rounded-md border bg-white p-2 text-xs text-[#17243b] placeholder-[#91a0b3] focus:border-[#0e7490] focus:outline-none ${errors.contactNo ? 'border-rose-500' : 'border-[#ced8e4]'}`}
          />
          {errors.contactNo && <p className="mt-1 text-[10px] text-rose-700">{errors.contactNo}</p>}
        </div>
      </div>

      {statusMessage && (
        <div role="status" className={`rounded-md border p-3 text-xs font-medium ${statusMessage.type === 'error' ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`}>
          {statusMessage.text}
        </div>
      )}

      {/* GENERATE ACTION BUTTON */}
      <button
        type="button"
        onClick={handleValidateAndGenerate}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-md bg-[#1e3a8a] py-3.5 text-xs font-bold uppercase text-white shadow-md shadow-[#1e3a8a]/15 transition-colors hover:bg-[#172e6e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0e7490]"
      >
        <CheckCircle2 className="w-4 h-4" /> Format & Validate Application
      </button>
    </div>
  );
}