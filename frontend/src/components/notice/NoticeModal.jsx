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
    active: 'bg-blue-50 text-[#1e3a8a] border-blue-200 shadow-sm',
    idle: 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:text-gray-900',
  },
  amber: {
    active: 'bg-amber-50 text-amber-700 border-amber-200 shadow-sm',
    idle: 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:text-gray-900',
  },
  red: {
    active: 'bg-red-50 text-red-700 border-red-200 shadow-sm',
    idle: 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:text-gray-900',
  },
};

const NoticeModal = ({ isOpen, onClose, onSubmit, initialData }) => {
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

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        startDate: initialData.startDate ? new Date(initialData.startDate).toISOString().slice(0, 16) : '',
        endDate: initialData.endDate ? new Date(initialData.endDate).toISOString().slice(0, 16) : '',
        priority: initialData.priority || 'Normal',
        isActive: initialData.isActive !== undefined ? initialData.isActive : true,
        linkUrl: initialData.linkUrl || '',
        linkText: initialData.linkText || '',
        showInFeed: initialData.showInFeed !== undefined ? initialData.showInFeed : true,
        feedEndDate: initialData.feedEndDate
          ? new Date(initialData.feedEndDate).toISOString().slice(0, 16)
          : '',
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

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim() || !formData.description.trim() || !formData.startDate || !formData.endDate) {
      setError('Please fill in all required fields.');
      return;
    }

    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      setError('End Date & Time cannot be before Start Date & Time.');
      return;
    }

    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-4xl bg-white border border-gray-100 rounded-3xl shadow-2xl relative overflow-hidden"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer z-10"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 sm:p-7">
          {/* Header */}
          <div className="flex items-center gap-3.5 mb-4 pb-3 border-b border-gray-100">
            <div className="p-2.5 rounded-2xl bg-blue-50 border border-blue-100 text-[#1e3a8a]">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight">
                {initialData ? 'Edit Notice' : 'Create New Notice'}
              </h3>
              <p className="text-[11px] text-gray-500 font-medium">
                Post an announcement to the public website.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {error && (
              <p className="flex items-center gap-2 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </p>
            )}

            {/* 2-Column Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
              {/* Left Column */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                    Notice Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Fall Midterm Examination Schedule"
                    className="w-full px-3.5 py-2 rounded-xl bg-gray-50/80 border border-gray-200 text-xs text-gray-800 placeholder-gray-400 outline-none focus:border-[#1e3a8a] focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                    Description *
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter detailed notice information..."
                    className="w-full px-3.5 py-2 rounded-xl bg-gray-50/80 border border-gray-200 text-xs text-gray-800 placeholder-gray-400 outline-none focus:border-[#1e3a8a] focus:bg-white transition resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                      Start Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-gray-50/80 border border-gray-200 text-[11px] text-gray-800 outline-none focus:border-[#1e3a8a] focus:bg-white transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                      End Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-gray-50/80 border border-gray-200 text-[11px] text-gray-800 outline-none focus:border-[#1e3a8a] focus:bg-white transition"
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
                      className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                        !formData.isActive
                          ? 'bg-gray-200 text-gray-800 border-gray-300 shadow-sm'
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:text-gray-900'
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
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                        formData.showInFeed
                          ? 'bg-blue-50 text-[#1e3a8a] border-blue-200 shadow-sm'
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, showInFeed: false })}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                        !formData.showInFeed
                          ? 'bg-gray-200 text-gray-800 border-gray-300 shadow-sm'
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:text-gray-900'
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
                        value={formData.feedEndDate}
                        onChange={(e) => setFormData({ ...formData, feedEndDate: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-xl bg-gray-50/80 border border-gray-200 text-[11px] text-gray-800 outline-none focus:border-[#1e3a8a] focus:bg-white transition"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 mt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-[#1e3a8a] hover:bg-[#1b337a] text-xs font-bold text-white shadow-md transition cursor-pointer"
              >
                {initialData ? 'Update Notice' : 'Save Notice'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default NoticeModal;