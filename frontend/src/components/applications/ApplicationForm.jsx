import React, { useState } from 'react';
import { FileText, Sparkles, CheckCircle2, Loader2, Download } from 'lucide-react';
import appTemplates from '../../data/applicationTemplates.json';

export default function ApplicationForm({ formData, setFormData, onGenerate, isGenerating, generatedApplication }) {
  const [selectedType, setSelectedType] = useState(formData.applicationType);
  const [searchRecipient, setSearchRecipient] = useState('');
  const [isRecipientOpen, setIsRecipientOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [statusMessage, setStatusMessage] = useState(null);

  const updateFormData = (update) => {
    setStatusMessage(null);
    setFormData(update);
  };

  const handleValidateAndGenerate = async () => {
    if (isGenerating) return;
    const newErrors = {};

    if (!formData.subject?.trim()) newErrors.subject = 'Subject is required.';
    if (!formData.body?.trim()) newErrors.body = 'Application body is required.';
    if (!formData.studentName?.trim()) newErrors.studentName = 'Student name is required.';
    if (!formData.studentRegNo?.trim()) newErrors.studentRegNo = 'Registration number is required.';
    if (formData.studentName?.trim().length > 120) newErrors.studentName = 'Name must be 120 characters or fewer.';
    if (formData.studentRegNo?.trim().length > 60) newErrors.studentRegNo = 'Registration number must be 60 characters or fewer.';
    if (!formData.semester?.trim()) newErrors.semester = 'Semester is required.';
    if (!formData.contactNo?.trim()) newErrors.contactNo = 'Contact number is required.';
    if (formData.contactNo?.trim() && !/^[+()\d\s-]{7,20}$/.test(formData.contactNo.trim())) {
      newErrors.contactNo = 'Enter a valid contact number.';
    }
    if (formData.subject?.trim().length > 240) newErrors.subject = 'Subject must be 240 characters or fewer.';
    if (formData.body?.trim().length > 10000) newErrors.body = 'Application body must be 10,000 characters or fewer.';
    currentTemplate?.dynamicFields?.forEach((field) => {
      if (field.required && !String(formData.dynamicData?.[field.name] || '').trim()) {
        newErrors[`dynamicData.${field.name}`] = `${field.label} is required.`;
      }
      if (String(formData.dynamicData?.[field.name] || '').length > 220) {
        newErrors[`dynamicData.${field.name}`] = `${field.label} must be 220 characters or fewer.`;
      }
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setStatusMessage({ type: 'error', text: 'Please fill in all required fields marked below.' });
      return;
    }

    setStatusMessage({ type: 'pending', text: 'Saving your application...' });
    try {
      const result = await onGenerate(generatedApplication);
      if (!result) return;
      const { application, pdfError } = result;
      setStatusMessage({
        type: pdfError ? 'warning' : 'success',
        text: pdfError
          ? `${application.serialNumber} is saved with status ${application.status}, but the PDF download failed. Use the button below to retry the PDF without creating another record.`
          : `${application.serialNumber} saved with status ${application.status}. The PDF has been downloaded.`,
      });
    } catch (error) {
      setStatusMessage({
        type: 'error',
        text: error.response?.data?.message || (error.response
          ? 'The application could not be saved. Please correct the details and try again.'
          : 'The application service is unreachable. Start or restart the backend, then try again.'),
      });
    }
  };
  // Recipient Select Handler
  const activeRecipient = appTemplates.recipients.find(r => r.id === formData.recipientId) || appTemplates.recipients[0];

  // Application Type Change Handler
  const handleTypeChange = (typeId) => {
    setSelectedType(typeId);
    const tmpl = appTemplates.templates.find(t => t.id === typeId);
    if (!tmpl) return;

    updateFormData(prev => ({
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
    updateFormData(prev => ({
      ...prev,
      subject: `Application Regarding ${purposeText}`,
      body: `Respected Sir,\n\nWith due respect, I am writing to formally request your approval regarding ${purposeText}.\n\nDue to genuine academic and personal requirement, I kindly request you to process this application as early as possible.\n\nI shall be highly obliged for your kind consideration.`,
      dynamicData: { ...prev.dynamicData, customPurpose: purposeText }
    }));
  };

  const currentTemplate = appTemplates.templates.find(t => t.id === selectedType);

  return (
    <div className={`flex flex-col gap-5 rounded-lg border border-[#d5e1ec] bg-white p-5 text-[#40516a] shadow-[0_18px_50px_-38px_rgba(23,36,59,0.45)] transition-opacity sm:p-6 ${isGenerating ? 'pointer-events-none opacity-80' : ''}`}>
      
      <div className="border-b border-[#e3eaf1] pb-4">
        <h2 className="flex items-center gap-2 text-lg font-extrabold text-[#17243b]">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[#edf4f8] text-[#0e7490]"><FileText className="h-4 w-4" /></span>
          <span>Application details</span>
        </h2>
        <p className="mt-1 text-xs text-[#69788d]">
          Request and student information
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
          <span className="text-xs font-bold text-[#1e3a8a]">Change</span>
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
                <button
                  key={r.id}
                  type="button"
                  onClick={() => {
                    updateFormData(prev => ({ ...prev, recipientId: r.id }));
                    setIsRecipientOpen(false);
                  }}
                  className="block w-full rounded-md p-2 text-left text-xs transition-colors hover:bg-[#f3f7fb] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0e7490]"
                >
                  <p className="font-bold text-[#25354d]">{r.title}</p>
                  <p className="text-[10px] text-[#69788d]">{r.dept}</p>
                </button>
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
                maxLength={field.type === 'number' ? undefined : 220}
                required={field.required}
                value={formData.dynamicData?.[field.name] || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  if (field.name === 'customPurpose') {
                    handleAiPurposeGenerate(val);
                  } else {
                    updateFormData(prev => ({
                      ...prev,
                      dynamicData: { ...prev.dynamicData, [field.name]: val }
                    }));
                  }
                  if (errors[`dynamicData.${field.name}`]) {
                    setErrors(prev => ({ ...prev, [`dynamicData.${field.name}`]: null }));
                  }
                }}
                className={`w-full rounded-md border bg-white p-2.5 text-xs text-[#17243b] placeholder-[#91a0b3] outline-none transition focus:border-[#0e7490] focus:ring-2 focus:ring-[#0e7490]/15 ${errors[`dynamicData.${field.name}`] ? 'border-rose-500' : 'border-[#ced8e4]'}`}
              />
              {errors[`dynamicData.${field.name}`] && <p className="mt-1 text-[10px] text-rose-700">{errors[`dynamicData.${field.name}`]}</p>}
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
          maxLength={240}
          value={formData.subject}
          onChange={(e) => {
            updateFormData(prev => ({ ...prev, subject: e.target.value }));
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
          maxLength={10000}
          value={formData.body}
          onChange={(e) => {
            updateFormData(prev => ({ ...prev, body: e.target.value }));
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
            maxLength={120}
            placeholder="e.g. Ahmad Jahanzaib"
            value={formData.studentName}
            onChange={(e) => {
              updateFormData(prev => ({ ...prev, studentName: e.target.value }));
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
            maxLength={60}
            placeholder="e.g. 2022-ag-1234"
            value={formData.studentRegNo}
            onChange={(e) => {
              updateFormData(prev => ({ ...prev, studentRegNo: e.target.value }));
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
              maxLength={30}
              placeholder="Sem (e.g. 6th)"
              value={formData.semester}
              onChange={(e) => {
                updateFormData(prev => ({ ...prev, semester: e.target.value }));
                if (errors.semester) setErrors(prev => ({ ...prev, semester: null }));
              }}
              className={`w-1/2 rounded-md border bg-white p-2 text-xs text-[#17243b] placeholder-[#91a0b3] focus:border-[#0e7490] focus:outline-none ${errors.semester ? 'border-rose-500' : 'border-[#ced8e4]'}`}
            />
            <input
              type="text"
              maxLength={60}
              placeholder="Sec (e.g. Morning A)"
              value={formData.section}
              onChange={(e) => updateFormData(prev => ({ ...prev, section: e.target.value }))}
              className="w-1/2 rounded-md border border-[#ced8e4] bg-white p-2 text-xs text-[#17243b] placeholder-[#91a0b3] focus:border-[#0e7490] focus:outline-none"
            />
          </div>
          {errors.semester && <p className="mt-1 text-[10px] text-rose-700">{errors.semester}</p>}
        </div>

        <div>
          <label className="mb-1 block text-[11px] font-semibold text-[#52647b]">Contact No</label>
          <input
            type="text"
            maxLength={30}
            placeholder="0300-1234567"
            value={formData.contactNo}
            onChange={(e) => {
              updateFormData(prev => ({ ...prev, contactNo: e.target.value }));
              if (errors.contactNo) setErrors(prev => ({ ...prev, contactNo: null }));
            }}
            className={`w-full rounded-md border bg-white p-2 text-xs text-[#17243b] placeholder-[#91a0b3] focus:border-[#0e7490] focus:outline-none ${errors.contactNo ? 'border-rose-500' : 'border-[#ced8e4]'}`}
          />
          {errors.contactNo && <p className="mt-1 text-[10px] text-rose-700">{errors.contactNo}</p>}
        </div>
      </div>

      {statusMessage && (
        <div role={statusMessage.type === 'error' ? 'alert' : 'status'} className={`rounded-md border p-3 text-xs font-medium ${statusMessage.type === 'error' ? 'border-rose-200 bg-rose-50 text-rose-700' : statusMessage.type === 'pending' ? 'border-[#b9dce2] bg-[#edf7f8] text-[#0e7490]' : statusMessage.type === 'warning' ? 'border-amber-200 bg-amber-50 text-amber-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`}>
          {statusMessage.text}
        </div>
      )}

      {/* GENERATE ACTION BUTTON */}
      <button
        type="button"
        onClick={handleValidateAndGenerate}
        disabled={isGenerating || (Boolean(generatedApplication) && statusMessage?.type !== 'warning')}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-md bg-[#1e3a8a] py-3.5 text-xs font-bold uppercase text-white shadow-md shadow-[#1e3a8a]/15 transition-colors hover:bg-[#172e6e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0e7490] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : generatedApplication && statusMessage?.type !== 'warning' ? <CheckCircle2 className="w-4 h-4" /> : <Download className="w-4 h-4" />}
        {isGenerating ? generatedApplication ? 'Retrying PDF...' : 'Saving & Downloading...' : generatedApplication ? statusMessage?.type === 'warning' ? 'Retry PDF Download' : 'Application Generated' : 'Save & Download Application'}
      </button>
    </div>
  );
}