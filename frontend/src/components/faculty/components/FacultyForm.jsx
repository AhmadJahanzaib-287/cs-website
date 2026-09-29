import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  GraduationCap,
  Mail,
  Phone,
  Building,
  Upload,
  Plus,
  X,
  BookOpen,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Sparkles
} from 'lucide-react';

import API from '../../../api/axios';

/**
 * Reusable Form Input Component
 */
const FormInput = ({ label, id, error, icon: Icon, required, ...props }) => (
  <div className="space-y-1 w-full">
    <label htmlFor={id} className="block text-[10px] font-bold uppercase tracking-wider text-slate-700">
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    <div className="relative flex items-center">
      {Icon && (
        <Icon className="absolute left-3 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
      )}
      <input
        id={id}
        {...props}
        className={`w-full bg-slate-50 border ${
          error
            ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500'
            : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500/20'
        } rounded-lg ${Icon ? 'pl-9' : 'px-3'} pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:bg-white transition-all font-medium`}
      />
    </div>
    {error && (
      <p className="text-[10px] font-semibold text-rose-600 flex items-center gap-1 mt-0.5">
        <AlertCircle className="w-3 h-3 shrink-0" /> {error}
      </p>
    )}
  </div>
);

/**
 * Reusable Form Select Component
 */
const FormSelect = ({ label, id, error, options = [], required, ...props }) => (
  <div className="space-y-1 w-full">
    <label htmlFor={id} className="block text-[10px] font-bold uppercase tracking-wider text-slate-700">
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    <select
      id={id}
      {...props}
      className={`w-full bg-slate-50 border ${
        error
          ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500'
          : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500/20'
      } rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:bg-white transition-all font-medium cursor-pointer`}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} className="bg-white text-slate-800">
          {opt.label}
        </option>
      ))}
    </select>
    {error && (
      <p className="text-[10px] font-semibold text-rose-600 flex items-center gap-1 mt-0.5">
        <AlertCircle className="w-3 h-3 shrink-0" /> {error}
      </p>
    )}
  </div>
);

export default function FacultyForm({
  isOpen = true,
  initialData = null,
  onSubmit,
  onCancel,
  onSuccess,
  isSubmitting: externalSubmitting = false,
}) {
  const initialFormState = {
    name: '',
    designation: 'Lecturer',
    qualification: '',
    category: 'Lecturers',
    email: '',
    phone: '',
    office: '',
    experience: '',
    publicationsCount: 0,
    specializations: [],
  };

  const [formData, setFormData] = useState(initialFormState);
  const [tagInput, setTagInput] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        designation: initialData.designation || 'Lecturer',
        qualification: initialData.qualification || '',
        category: initialData.category || 'Lecturers',
        email: initialData.email || '',
        phone: initialData.phone || '',
        office: initialData.office || '',
        experience: initialData.experience || '',
        publicationsCount: initialData.publicationsCount || 0,
        specializations: Array.isArray(initialData.specializations)
          ? initialData.specializations
          : initialData.specialization
          ? [initialData.specialization]
          : [],
      });

      if (initialData.avatar) {
        const baseHost = API.defaults.baseURL
          ? API.defaults.baseURL.replace('/api/v1', '')
          : `http://${window.location.hostname}:5000`;
        setImagePreview(
          initialData.avatar.startsWith('http')
            ? initialData.avatar
            : `${baseHost}${initialData.avatar.startsWith('/') ? '' : '/'}${initialData.avatar}`
        );
      }
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (errors[id]) {
      setErrors((prev) => ({ ...prev, [id]: null }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrors((prev) => ({ ...prev, image: 'Please select a valid image file.' }));
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setErrors((prev) => ({ ...prev, image: null }));
    }
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !formData.specializations.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        specializations: [...prev.specializations, trimmed],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      specializations: prev.specializations.filter((tag) => tag !== tagToRemove),
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required.';
    if (!formData.designation.trim()) newErrors.designation = 'Designation is required.';
    if (!formData.qualification.trim()) newErrors.qualification = 'Qualification is required.';
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      setStatusMessage({
        type: 'error',
        text: 'Please fill in all required fields (Name, Qualification, Email).',
      });
      return;
    }

    if (loading || externalSubmitting) return;

    try {
      setLoading(true);
      setStatusMessage({ type: '', text: '' });

      const targetId = initialData?._id || initialData?.id || null;

      if (onSubmit) {
        await onSubmit(formData, imageFile, targetId);
      } else {
        const data = new FormData();
        Object.keys(formData).forEach((key) => {
          if (key === 'specializations') {
            data.append('specializations', JSON.stringify(formData[key]));
          } else {
            data.append(key, formData[key]);
          }
        });
        if (imageFile) data.append('avatar', imageFile);

        if (targetId) {
          await API.put(`/faculty/${targetId}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
        } else {
          await API.post('/faculty', data, { headers: { 'Content-Type': 'multipart/form-data' } });
        }
      }

      setStatusMessage({
        type: 'success',
        text: initialData ? 'Faculty member updated successfully!' : 'Faculty member saved successfully!',
      });
      onSuccess?.();

      setTimeout(() => {
        setFormData(initialFormState);
        setImageFile(null);
        setImagePreview(null);
        setStatusMessage({ type: '', text: '' });
        if (onCancel) onCancel();
      }, 1200);
    } catch (err) {
      console.error('Submission Error:', err);
      const errorMessage = typeof err === 'string' ? err : err?.response?.data?.message || 'Faculty member could not be saved.';
      setStatusMessage({
        type: 'error',
        text: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const isBtnDisabled = loading || externalSubmitting;

  const categoryOptions = [
    { value: 'Professors', label: 'Professors' },
    { value: 'Associate Professors', label: 'Associate Professors' },
    { value: 'Assistant Professors', label: 'Assistant Professors' },
    { value: 'Lecturers', label: 'Lecturers' },
  ];

  const handleClose = () => {
    if (!isBtnDisabled) onCancel?.();
  };

  const modalContent = (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-sm">
    {/* Backdrop */}
    <div 
      className="fixed inset-0" 
      onClick={handleClose} 
    />

    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 15 }}
      transition={{ duration: 0.2 }}
      onClick={(e) => e.stopPropagation()}
      className="relative z-10 w-full max-w-4xl bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-2xl overflow-hidden text-slate-800"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 pr-8">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            {initialData ? 'Edit Faculty Member' : 'Register New Faculty'}
          </h3>
        </div>
      </div>

      {/* Close Button */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleClose();
        }}
        disabled={isBtnDisabled}
        className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer z-50 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Close Form"
        aria-label="Close Form"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Status Message */}
      <AnimatePresence>
        {statusMessage.text && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className={`mb-3 p-3 rounded-xl flex items-center gap-2.5 text-xs font-semibold border ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-rose-50 border-rose-200 text-rose-700'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            )}
            <span>{statusMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Profile Photo Upload */}
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-200 bg-white shrink-0 flex items-center justify-center shadow-sm">
            {imagePreview ? (
              <>
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                  className="absolute top-0.5 right-0.5 p-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full transition shadow-md cursor-pointer"
                  title="Remove Image"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </>
            ) : (
              <User className="w-5 h-5 text-slate-400" />
            )}
          </div>
          <div className="flex-1 flex items-center justify-between gap-2">
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                PROFILE PHOTO
              </h4>
              <p className="text-[11px] text-slate-500">
                Upload a formal image (PNG, JPG, WEBP up to 5MB).
              </p>
            </div>
            <div>
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer shadow-sm">
                <Upload className="w-3.5 h-3.5 text-blue-600" />
                <span>Upload Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>
          {errors.image && (
            <p className="text-[10px] font-semibold text-rose-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.image}
            </p>
          )}
        </div>

        {/* Form Fields Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          <FormInput
            label="FULL NAME"
            id="name"
            placeholder="e.g. Dr. Sarah Connor"
            icon={User}
            required
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
          />

          <FormInput
            label="DESIGNATION"
            id="designation"
            placeholder="e.g. Associate Professor"
            icon={Briefcase}
            required
            value={formData.designation}
            onChange={handleChange}
            error={errors.designation}
          />

          <FormSelect
            label="CATEGORY"
            id="category"
            options={categoryOptions}
            value={formData.category}
            onChange={handleChange}
          />

          <FormInput
            label="HIGHEST QUALIFICATION"
            id="qualification"
            placeholder="e.g. Ph.D. in CS"
            icon={GraduationCap}
            required
            value={formData.qualification}
            onChange={handleChange}
            error={errors.qualification}
          />

          <FormInput
            label="EMAIL ADDRESS"
            id="email"
            type="email"
            placeholder="sconnor@csdept.edu"
            icon={Mail}
            required
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
          />

          <FormInput
            label="PHONE NUMBER"
            id="phone"
            placeholder="+92 300 0000000"
            icon={Phone}
            value={formData.phone}
            onChange={handleChange}
          />

          <FormInput
            label="OFFICE LOCATION"
            id="office"
            placeholder="Block A, Room 301"
            icon={Building}
            value={formData.office}
            onChange={handleChange}
          />

          <FormInput
            label="PUBLICATIONS COUNT"
            id="publicationsCount"
            type="number"
            min="0"
            placeholder="0"
            icon={BookOpen}
            value={formData.publicationsCount}
            onChange={handleChange}
          />
        </div>

        {/* Specializations */}
        <div className="space-y-1">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700">
            SPECIALIZATIONS & RESEARCH AREAS
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              placeholder="e.g. Machine Learning (Press Enter)"
              className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all font-medium"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-xs font-bold text-slate-700 transition flex items-center gap-1 cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5 text-slate-600" /> Add
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1 max-h-14 overflow-y-auto">
            {formData.specializations.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 text-[11px] font-semibold text-blue-700"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-rose-600 transition cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          {onCancel && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                handleClose();
              }}
              disabled={isBtnDisabled}
              className="px-5 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isBtnDisabled}
            className="flex items-center gap-1.5 px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-500/20"
          >
            {isBtnDisabled ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                <span>Saving Data...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                <span>{initialData ? 'Update Faculty' : 'Save Faculty'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  </div>
);

  if (!isOpen) return null;

  return ReactDOM.createPortal(modalContent, document.body);
}