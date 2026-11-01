import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Bell, AlertCircle, AlertTriangle, Info, Check } from 'lucide-react';

const priorityOptions = [
  { value: 'Normal', icon: Info, color: 'blue' },
  { value: 'Important', icon: AlertCircle, color: 'amber' },
  { value: 'Emergency', icon: AlertTriangle, color: 'red' },
];

const priorityStyles = {
  blue: {
    active: 'bg-[#edf2fb] text-[#1e3a8a] border-[#c9d7ee] shadow-sm',
    idle: 'bg-[#f7fafc] text-[#52647b] border-[#dce5ef] hover:bg-[#edf2fb]',
  },
  amber: {
    active: 'bg-amber-50 text-amber-800 border-amber-200 shadow-sm',
    idle: 'bg-[#f7fafc] text-[#52647b] border-[#dce5ef] hover:bg-amber-50',
  },
  red: {
    active: 'bg-rose-50 text-rose-800 border-rose-200 shadow-sm',
    idle: 'bg-[#f7fafc] text-[#52647b] border-[#dce5ef] hover:bg-rose-50',
  },
};

const toLocalDateTimeInput = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (part) => String(part).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const NoticeModal = ({ isOpen, onClose, onSubmit, initialData, isSubmitting = false, submitError = '' }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    priority: 'Normal',
    isActive: true,
    linkUrl: '',
    linkText: '',
    showInFeed: true,
    feedEndDate: '',
  });
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        startDate: toLocalDateTimeInput(initialData.startDate),
        endDate: toLocalDateTimeInput(initialData.endDate),
        priority: initialData.priority || 'Normal',
        isActive: initialData.isActive !== undefined ? initialData.isActive : true,
        linkUrl: initialData.linkUrl || '',
        linkText: initialData.linkText || '',
        showInFeed: initialData.showInFeed !== undefined ? initialData.showInFeed : true,
        feedEndDate: toLocalDateTimeInput(initialData.feedEndDate),
      });
    } else {
      setFormData({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        priority: 'Normal',
        isActive: true,
        linkUrl: '',
        linkText: '',
        showInFeed: true,
        feedEndDate: '',
      });
    }
    setError('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (isSaving || isSubmitting) return;

    if (!formData.title.trim() || !formData.description.trim() || !formData.startDate || !formData.endDate) {
      setError('Please fill in all required fields.');
      return;
    }

    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      setError('End Date & Time cannot be before Start Date & Time.');
      return;
    }

    setIsSaving(true);
    try {
      await onSubmit({
        ...formData,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        feedEndDate: formData.feedEndDate ? new Date(formData.feedEndDate).toISOString() : '',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const saving = isSaving || isSubmitting;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#10203d]/55 p-3 backdrop-blur-sm sm:p-5">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="relative max-h-[94vh] w-full max-w-5xl overflow-y-auto border border-[#dce5ef] bg-white shadow-2xl"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-md p-2 text-[#69788d] transition hover:bg-[#f3f7fb] hover:text-[#17243b]"
          aria-label="Close notice form"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-4 sm:p-6">
          {/* Header */}
          <div className="mb-5 flex items-center gap-3 border-b border-[#e3eaf1] pb-4 pr-10">
            <div className="flex h-10 w-10 items-center justify-center rounded-md border border-[#d5e1ec] bg-[#edf4f8] text-[#0e7490]">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-[#0e7490]">Communications / Website</p>
              <h3 className="mt-0.5 text-lg font-extrabold text-[#17243b] sm:text-xl">
                {initialData ? 'Edit Notice' : 'Create New Notice'}
              </h3>
              <p className="text-xs text-[#69788d]">
                Share a clear announcement with the campus community.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {(error || submitError) && (
              <p className="flex items-center gap-2 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error || submitError}
              </p>
            )}

            {/* 2-Column Grid Layout */}
            <div className="grid grid-cols-1 gap-x-8 gap-y-5 lg:grid-cols-2">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-[#52647b]">
                    Notice Title *
                  </label>
                  <input
                    type="text"
                    maxLength={140}
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Fall Midterm Examination Schedule"
                    className="h-10 w-full rounded-md border border-[#dce5ef] bg-[#f7fafc] px-3 text-xs text-[#25354d] outline-none transition placeholder:text-[#91a0b3] focus:border-[#0e7490] focus:bg-white focus:ring-2 focus:ring-[#0e7490]/15"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-[#52647b]">
                    Description *
                  </label>
                  <textarea
                    rows={4}
                    maxLength={5000}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter detailed notice information..."
                    className="w-full resize-y rounded-md border border-[#dce5ef] bg-[#f7fafc] px-3 py-2.5 text-xs leading-5 text-[#25354d] outline-none transition placeholder:text-[#91a0b3] focus:border-[#0e7490] focus:bg-white focus:ring-2 focus:ring-[#0e7490]/15"
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-[#52647b]">
                      Start Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      step="60"
                      max={formData.endDate || undefined}
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="h-11 w-full min-w-0 rounded-md border border-[#dce5ef] bg-[#f7fafc] px-2.5 text-xs text-[#25354d] outline-none focus:border-[#0e7490] focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-[#52647b]">
                      End Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      step="60"
                      min={formData.startDate || undefined}
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="h-11 w-full min-w-0 rounded-md border border-[#dce5ef] bg-[#f7fafc] px-2.5 text-xs text-[#25354d] outline-none focus:border-[#0e7490] focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                    Priority
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {priorityOptions.map((opt) => {
                      const Icon = opt.icon;
                      const isActive = formData.priority === opt.value;
                      const s = priorityStyles[opt.color];
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, priority: opt.value })}
                          className={`flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl text-[11px] font-bold transition cursor-pointer border ${
                            isActive ? s.active : s.idle
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          {opt.value}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                    Initial Status
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, isActive: true })}
                      className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                        formData.isActive
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm'
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" /> Active
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, isActive: false })}
                      className={`flex items-center justify-center gap-1.5 rounded-md border px-3 py-2 text-xs font-bold transition ${
                        !formData.isActive
                          ? 'border-[#cbd8e6] bg-[#edf4f8] text-[#40516a] shadow-sm'
                          : 'border-[#dce5ef] bg-[#f7fafc] text-[#52647b] hover:bg-[#edf4f8]'
                      }`}
                    >
                      Inactive
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                      Link URL (optional)
                    </label>
                    <input
                      type="url"
                      value={formData.linkUrl}
                      onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-3.5 py-2 rounded-xl bg-gray-50/80 border border-gray-200 text-xs text-gray-800 placeholder-gray-400 outline-none focus:border-[#1e3a8a] focus:bg-white transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                      Link Text (optional)
                    </label>
                    <input
                      type="text"
                      value={formData.linkText}
                      onChange={(e) => setFormData({ ...formData, linkText: e.target.value })}
                      placeholder="Click details"
                      className="w-full px-3.5 py-2 rounded-xl bg-gray-50/80 border border-gray-200 text-xs text-gray-800 placeholder-gray-400 outline-none focus:border-[#1e3a8a] focus:bg-white transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                    Show in Notices Feed
                  </label>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, showInFeed: true })}
                      className={`rounded-md border px-3 py-2 text-xs font-bold transition ${
                        formData.showInFeed
                          ? 'border-[#c9d7ee] bg-[#edf2fb] text-[#1e3a8a] shadow-sm'
                          : 'border-[#dce5ef] bg-[#f7fafc] text-[#52647b] hover:bg-[#edf2fb]'
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, showInFeed: false })}
                      className={`rounded-md border px-3 py-2 text-xs font-bold transition ${
                        !formData.showInFeed
                          ? 'border-[#cbd8e6] bg-[#edf4f8] text-[#40516a] shadow-sm'
                          : 'border-[#dce5ef] bg-[#f7fafc] text-[#52647b] hover:bg-[#edf4f8]'
                      }`}
                    >
                      No
                    </button>
                  </div>

                  {formData.showInFeed && (
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                        Keep in Feed Until (optional)
                      </label>
                      <input
                        type="datetime-local"
                        step="60"
                        value={formData.feedEndDate}
                        onChange={(e) => setFormData({ ...formData, feedEndDate: e.target.value })}
                        className="h-10 w-full rounded-md border border-[#dce5ef] bg-[#f7fafc] px-2.5 text-[11px] text-[#25354d] outline-none focus:border-[#0e7490] focus:bg-white"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Action Buttons */}
            <div className="mt-2 flex items-center justify-end gap-2 border-t border-[#e3eaf1] pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="h-10 rounded-md border border-[#dce5ef] px-4 text-xs font-bold text-[#52647b] transition hover:bg-[#f7fafc]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="h-10 rounded-md bg-[#1e3a8a] px-5 text-xs font-bold text-white transition hover:bg-[#172e6e] disabled:cursor-wait disabled:opacity-60"
              >
                {saving ? 'Saving...' : initialData ? 'Update Notice' : 'Save Notice'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default NoticeModal;