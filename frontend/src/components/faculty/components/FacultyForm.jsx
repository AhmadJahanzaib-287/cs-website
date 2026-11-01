import React, { useState, useEffect, useRef } from 'react';
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
    <label htmlFor={id} className="block text-[10px] font-bold uppercase tracking-wider text-[#52647b]">
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    <div className="relative flex items-center">
      {Icon && (
        <Icon className="pointer-events-none absolute left-3 h-3.5 w-3.5 text-[#8290a3]" />
      )}
      <input
        id={id}
        {...props}
        className={`w-full bg-slate-50 border ${
          error
            ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/15'
            : 'border-[#dce5ef] focus:border-[#0e7490] focus:ring-[#0e7490]/15'
          } rounded-md bg-[#f7fafc] ${Icon ? 'pl-9' : 'px-3'} py-2 text-xs font-medium text-[#25354d] placeholder-[#91a0b3] transition focus:bg-white focus:outline-none focus:ring-2`}
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
    <label htmlFor={id} className="block text-[10px] font-bold uppercase tracking-wider text-[#52647b]">
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    <select
      id={id}
      {...props}
      className={`w-full bg-slate-50 border ${
        error
            ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/15'
            : 'border-[#dce5ef] focus:border-[#0e7490] focus:ring-[#0e7490]/15'
          } rounded-md bg-[#f7fafc] px-3 py-2 text-xs font-medium text-[#25354d] transition focus:bg-white focus:outline-none focus:ring-2`}
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
  const [removeExistingImage, setRemoveExistingImage] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const imageInputRef = useRef(null);

  useEffect(() => {
    setImageFile(null);
    setImagePreview(null);
    setRemoveExistingImage(false);
    setTagInput('');
    setErrors({});
    setStatusMessage({ type: '', text: '' });

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
    } else {
      setFormData({ ...initialFormState, specializations: [] });
    }
  }, [initialData]);

  useEffect(() => () => {
    if (imagePreview?.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
  }, [imagePreview]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (errors[id]) {
      setErrors((prev) => ({ ...prev, [id]: null }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) {
      const acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!acceptedTypes.includes(file.type.toLowerCase())) {
        setImageFile(null);
        setImagePreview(null);
        setErrors((prev) => ({ ...prev, image: 'Choose a JPG, PNG, or WebP image.' }));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setImageFile(null);
        setImagePreview(null);
        setErrors((prev) => ({ ...prev, image: 'Image size must not exceed 5 MB.' }));
        return;
      }
      setImageFile(file);
      setRemoveExistingImage(false);
      setImagePreview(URL.createObjectURL(file));
      setErrors((prev) => ({ ...prev, image: null }));
    }
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    const alreadyAdded = formData.specializations.some((tag) => tag.toLowerCase() === trimmed.toLowerCase());
    if (trimmed && !alreadyAdded) {
      setFormData((prev) => ({
        ...prev,
        specializations: [...prev.specializations, trimmed],
      }));
    }
    if (trimmed) setTagInput('');
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
    if (loading || externalSubmitting) return;
    if (errors.image) {
      setStatusMessage({ type: 'error', text: errors.image });
      return;
    }

    if (!validate()) {
      setStatusMessage({
        type: 'error',
        text: 'Please fill in all required fields (Name, Qualification, Email).',
      });
      return;
    }

    try {
      setLoading(true);
      setStatusMessage({ type: '', text: '' });

      const targetId = initialData?._id || initialData?.id || null;

      if (onSubmit) {
        await onSubmit(formData, imageFile, targetId, removeExistingImage);
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
        if (removeExistingImage) data.append('removeAvatar', 'true');

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
        setRemoveExistingImage(false);
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
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#10203d]/55 p-3 backdrop-blur-sm sm:p-5">
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
      className="relative z-10 max-h-[94vh] w-full max-w-5xl overflow-y-auto border border-[#dce5ef] bg-white p-4 text-[#25354d] shadow-2xl sm:p-6"
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between border-b border-[#e3eaf1] pb-3 pr-8">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-md border border-[#d5e1ec] bg-[#edf4f8] text-[#0e7490]"><Sparkles className="h-4 w-4" /></span>
          <div>
          <p className="text-[10px] font-bold uppercase text-[#0e7490]">People / Department directory</p>
          <h3 className="text-base font-extrabold text-[#17243b]">
            {initialData ? 'Edit Faculty Member' : 'Register New Faculty'}
          </h3>
          </div>
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
        className="absolute right-4 top-4 z-50 rounded-md p-2 text-[#69788d] transition hover:bg-[#f3f7fb] hover:text-[#17243b] disabled:cursor-not-allowed disabled:opacity-50"
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
            className={`mb-3 flex items-center gap-2.5 border px-3 py-2.5 text-xs font-semibold ${
              statusMessage.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-rose-200 bg-rose-50 text-rose-700'
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
      <form onSubmit={handleSubmit} aria-busy={isBtnDisabled} className="space-y-3">
        {/* Profile Photo Upload */}
        <div className="flex flex-col items-start gap-3 border-y border-[#dce5ef] bg-[#f7fafc] p-3 sm:flex-row sm:items-center">
          <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-[#dce5ef] bg-white">
            {imagePreview ? (
              <>
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                    setRemoveExistingImage(Boolean(initialData?.avatar));
                  }}
                  className="absolute right-1 top-1 rounded-sm bg-rose-700 p-1 text-white transition hover:bg-rose-800"
                  title="Remove Image"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </>
            ) : (
              <User className="h-6 w-6 text-[#b7c4d2]" />
            )}
          </div>
          <div className="flex-1 flex items-center justify-between gap-2">
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#25354d]">
                PROFILE PHOTO
              </h4>
              <p className="mt-0.5 text-[11px] text-[#69788d]">
                Upload a formal image (PNG, JPG, WEBP up to 5MB).
              </p>
            </div>
            <div>
              <label className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md border border-[#cbd8e6] bg-white px-3 text-xs font-semibold text-[#1e3a8a] transition hover:border-[#0e7490] hover:bg-[#edf7f8]">
                <Upload className="h-3.5 w-3.5 text-[#0e7490]" />
                <span>Upload Image</span>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
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
          <label className="block text-[10px] font-bold uppercase tracking-wider text-[#52647b]">
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
              className="h-9 flex-1 rounded-md border border-[#dce5ef] bg-[#f7fafc] px-3 text-xs font-medium text-[#25354d] outline-none transition placeholder:text-[#91a0b3] focus:border-[#0e7490] focus:bg-white focus:ring-2 focus:ring-[#0e7490]/15"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="inline-flex h-9 shrink-0 items-center gap-1 rounded-md border border-[#cbd8e6] bg-white px-3 text-xs font-bold text-[#1e3a8a] transition hover:border-[#0e7490] hover:bg-[#edf7f8]"
            >
              <Plus className="w-3.5 h-3.5 text-slate-600" /> Add
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1 max-h-14 overflow-y-auto">
            {formData.specializations.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-sm border border-[#d5e1ec] bg-[#edf4f8] px-2.5 py-1 text-[11px] font-semibold text-[#1e3a8a]"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  aria-label={`Remove ${tag}`}
                  className="text-[#69788d] transition hover:text-rose-700"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-2 border-t border-[#e3eaf1] pt-4">
          {onCancel && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                handleClose();
              }}
              disabled={isBtnDisabled}
              className="h-10 rounded-md border border-[#dce5ef] px-4 text-xs font-semibold text-[#52647b] transition hover:bg-[#f7fafc] disabled:opacity-50"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isBtnDisabled}
            className="inline-flex h-10 items-center gap-2 rounded-md bg-[#1e3a8a] px-5 text-xs font-bold text-white transition hover:bg-[#172e6e] disabled:cursor-not-allowed disabled:opacity-50"
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