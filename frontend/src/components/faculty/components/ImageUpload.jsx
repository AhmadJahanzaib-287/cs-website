import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Image as ImageIcon, AlertCircle, RefreshCw } from 'lucide-react';

/**
 * ImageUpload Component
 *
 * An independent, modular, and reusable image uploader component designed with glassmorphism UI.
 * Features drag-and-drop, client-side validation, live image preview, and error handling.
 * Integrates smoothly with backend image uploading pipelines (MERN/Multer/Cloudinary).
 *
 * @param {File|String|null} value - Current image file object or preview URL.
 * @param {Function} onChange - Callback function triggered when a valid image is selected or cleared. Returns (file | null).
 * @param {String} error - External validation error message string.
 * @param {Number} maxSizeMB - Maximum allowed file size in megabytes (Default: 5MB).
 * @param {Array} acceptedFormats - Allowed MIME types array (Default: ['image/jpeg', 'image/png', 'image/webp']).
 * @param {String} label - Custom field label text.
 * @param {Boolean} required - Shows required asterisk tag if true.
 * @param {String} className - Optional additional parent container styling classes.
 */
export default function ImageUpload({
  value = null,
  onChange,
  error = null,
  maxSizeMB = 5,
  acceptedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  label = 'Upload Profile Image',
  required = false,
  className = '',
}) {
  const [preview, setPreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [localError, setLocalError] = useState(null);
  const fileInputRef = useRef(null);

  // Sync internal preview state whenever value prop changes (supports String URLs & File objects)
  useEffect(() => {
    if (!value) {
      setPreview(null);
      return;
    }

    if (typeof value === 'string') {
      setPreview(value);
    } else if (value instanceof File) {
      const objectUrl = URL.createObjectURL(value);
      setPreview(objectUrl);

      // Clean up memory when component unmounts or value changes
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [value]);

  // Combine prop error and client-side validation error
  const displayError = error || localError;

  /**
   * Validates file size and format before triggering onChange
   */
  const validateAndProcessFile = (file) => {
    setLocalError(null);

    if (!file) return;

    // Check File Type
    if (!acceptedFormats.includes(file.type)) {
      setLocalError('Invalid file format. Please upload JPG, PNG, or WEBP.');
      return;
    }

    // Check File Size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setLocalError(`File size exceeds maximum limit of ${maxSizeMB}MB.`);
      return;
    }

    // Trigger parent callback
    if (onChange) {
      onChange(file);
    }
  };

  // File Input Change Event Handler
  const handleFileSelect = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      validateAndProcessFile(file);
    }
  };

  // Drag and Drop Event Handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  // Remove Selected Image Handler
  const handleClear = (e) => {
    e.stopPropagation();
    setLocalError(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onChange) {
      onChange(null);
    }
  };

  return (
    <div className={`space-y-2 w-full ${className}`}>
      {/* Label */}
      {label && (
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
          {label} {required && <span className="text-cyan-400">*</span>}
        </label>
      )}

      {/* Main Upload Dropzone Container */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current && fileInputRef.current.click()}
        className={`relative group w-full min-h-[180px] rounded-3xl border-2 border-dashed transition-all duration-300 backdrop-blur-2xl flex flex-col items-center justify-center p-4 cursor-pointer overflow-hidden ${
          dragActive
            ? 'border-cyan-400 bg-cyan-500/10 shadow-lg shadow-cyan-500/20'
            : displayError
            ? 'border-rose-500/80 bg-rose-500/5'
            : 'border-slate-800/90 bg-slate-950/80 hover:border-cyan-500/50 hover:bg-slate-900/90'
        }`}
      >
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFormats.join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />

        <AnimatePresence mode="wait">
          {preview ? (
            /* IMAGE PREVIEW MODE */
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative w-full h-full min-h-[160px] flex items-center justify-center group/preview"
            >
              <img
                src={preview}
                alt="Upload preview"
                className="max-h-40 w-auto object-contain rounded-2xl border border-slate-800/80 shadow-md"
              />

              {/* Overlay Action Controls */}
              <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm rounded-2xl opacity-0 group-hover/preview:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current && fileInputRef.current.click();
                  }}
                  className="p-2.5 rounded-xl bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700 transition shadow-lg cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                >
                  <RefreshCw className="w-4 h-4 text-cyan-400" /> Replace
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-400 hover:bg-rose-500/30 transition shadow-lg cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                >
                  <X className="w-4 h-4" /> Remove
                </button>
              </div>
            </motion.div>
          ) : (
            /* UPLOAD PROMPT MODE */
            <motion.div
              key="prompt"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center text-center space-y-3 p-2"
            >
              <div
                className={`p-3.5 rounded-2xl border transition-all duration-300 ${
                  dragActive
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 scale-110'
                    : 'bg-slate-900 border-slate-800 text-slate-400 group-hover:text-cyan-400 group-hover:border-cyan-500/30'
                }`}
              >
                {dragActive ? (
                  <Upload className="w-6 h-6 animate-bounce" />
                ) : (
                  <ImageIcon className="w-6 h-6" />
                )}
              </div>

              <div className="space-y-1">
                <p className="text-xs sm:text-sm font-bold text-slate-200">
                  <span className="text-cyan-400 hover:underline">Click to upload</span> or drag and drop
                </p>
                <p className="text-[11px] text-slate-500">
                  PNG, JPG, or WEBP (Max size: {maxSizeMB}MB)
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Validation Error Display */}
      {displayError && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[11px] font-semibold text-rose-400 flex items-center gap-1 mt-1.5"
        >
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{displayError}</span>
        </motion.p>
      )}
    </div>
  );
}