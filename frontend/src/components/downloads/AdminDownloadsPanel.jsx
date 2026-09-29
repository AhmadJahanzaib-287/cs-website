import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Edit,
  Trash2,
  X,
  FileText,
  Plus,
  Download,
  Folder,
  Calendar,
  Loader2,
} from 'lucide-react';
import API from '../../api/axios.js';

export default function AdminDownloadsPanel() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [file, setFile] = useState(null);

  const [files, setFiles] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [fetchingFiles, setFetchingFiles] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch downloads list
  const loadFiles = async () => {
    setFetchingFiles(true);
    try {
      const res = await API.get('/downloads');
      const fileData =
        res.data?.files ||
        res.data?.downloads ||
        res.data?.data ||
        (Array.isArray(res.data) ? res.data : []);

      setFiles(Array.isArray(fileData) ? fileData : []);
    } catch (err) {
      console.error('Error loading files:', err);
      setFiles([]);
    } finally {
      setFetchingFiles(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  // Reset Form
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('General');
    setFile(null);
    setEditingId(null);
    setSuccessMsg('');
    setErrorMsg('');
  };

  const handleOpenCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!title || (!editingId && !file)) {
      setErrorMsg('Title aur file dono zaroori hain');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      if (file) {
        formData.append('file', file);
      }

      if (editingId) {
        await API.put(`/downloads/${editingId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setSuccessMsg('File successfully update ho gayi!');
      } else {
        await API.post('/downloads', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setSuccessMsg('File successfully upload ho gayi!');
      }

      setTimeout(async () => {
        handleCloseModal();
        await loadFiles();
      }, 800);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Operation fail ho gaya, dobara try karein');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (fileItem) => {
    setEditingId(fileItem._id);
    setTitle(fileItem.title || '');
    setDescription(fileItem.description || '');
    setCategory(fileItem.category || 'General');
    setFile(null);
    setSuccessMsg('');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Kya aap is file ko delete karna chahte hain?')) return;

    try {
      await API.delete(`/downloads/${id}`);
      loadFiles();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete fail ho gaya, dobara try karein');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Header */}
      <div className="bg-white border border-gray-100 p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-blue-50 border border-blue-100 text-[#1e3a8a]">
            <Download className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">Downloads Management</h2>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Manage downloadable resources, forms, notices, and documents.
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#1e3a8a] hover:bg-[#1b337a] text-xs font-bold text-white shadow-md transition cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Upload Download File
        </button>
      </div>

      {/* Uploaded Files Section List */}
      <div className="bg-white border border-gray-100 p-6 rounded-3xl">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Folder className="w-4 h-4 text-[#1e3a8a]" /> Uploaded Files List
          </h3>
          <span className="text-xs text-gray-500 font-medium">
            Total Files: <strong className="text-[#1e3a8a]">{files.length}</strong>
          </span>
        </div>

        {fetchingFiles ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin text-[#1e3a8a] mb-2" />
            <p className="text-xs font-medium">Loading files...</p>
          </div>
        ) : !Array.isArray(files) || files.length === 0 ? (
          <div className="py-12 text-center border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
            <FileText className="w-10 h-10 text-gray-400 mx-auto mb-2" />
            <p className="text-xs text-gray-500 italic">No files uploaded yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.map((item) => (
              <div
                key={item._id}
                className="p-5 rounded-2xl bg-white border border-gray-100 hover:border-blue-200 shadow-sm hover:shadow-md flex flex-col justify-between transition-all group"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-bold text-gray-900 line-clamp-1 group-hover:text-[#1e3a8a] transition-colors">
                      {item.title}
                    </h4>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#1e3a8a] border border-blue-100 shrink-0">
                      {item.category || 'General'}
                    </span>
                  </div>

                  {item.description ? (
                    <p className="text-xs text-gray-500 line-clamp-2 min-h-[32px]">
                      {item.description}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400 italic min-h-[32px]">
                      No description provided.
                    </p>
                  )}

                  <div className="pt-2 border-t border-gray-100 space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-600">
                      <FileText className="w-3.5 h-3.5 text-[#1e3a8a] shrink-0" />
                      <span className="truncate">
                        {item.originalName || item.fileName || item.fileUrl || 'Attached File'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[10px] text-gray-400">
                      <Calendar className="w-3 h-3 shrink-0" />
                      <span>
                        Uploaded:{' '}
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-4 mt-3 border-t border-gray-100">
                  <button
                    onClick={() => handleEdit(item)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#1e3a8a] font-bold text-xs transition cursor-pointer border border-blue-100"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(item._id)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs border border-red-100 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Popup (Same Size & Styling as Notice Modal) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-4xl bg-white border border-gray-100 rounded-3xl shadow-2xl relative overflow-hidden text-gray-800"
            >
              {/* Close Button */}
              <button
                onClick={handleCloseModal}
                className="absolute top-5 right-5 p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer z-10"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="p-6 sm:p-7">
                {/* Header */}
                <div className="flex items-center gap-3.5 mb-4 pb-3 border-b border-gray-100">
                  <div className="p-2.5 rounded-2xl bg-blue-50 border border-blue-100 text-[#1e3a8a]">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight">
                      {editingId ? 'Edit File' : 'Upload Download File'}
                    </h3>
                    <p className="text-[11px] text-gray-500 font-medium">
                      Fill details below to update website downloads.
                    </p>
                  </div>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="space-y-3.5">
                  {errorMsg && (
                    <div className="flex items-center gap-2 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {errorMsg}
                    </div>
                  )}

                  {successMsg && (
                    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3.5 py-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      {successMsg}
                    </div>
                  )}

                  {/* 2-Column Grid Layout */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                    {/* Left Column */}
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                          Title <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="e.g. Admission Form 2026"
                          className="w-full px-3.5 py-2 rounded-xl bg-gray-50/80 border border-gray-200 text-xs text-gray-800 placeholder-gray-400 outline-none focus:border-[#1e3a8a] focus:bg-white transition"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                          Category
                        </label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl bg-gray-50/80 border border-gray-200 text-xs text-gray-800 outline-none focus:border-[#1e3a8a] focus:bg-white transition"
                        >
                          <option value="General">General</option>
                          <option value="Notices">Notices</option>
                          <option value="Forms">Forms</option>
                          <option value="Syllabus">Syllabus</option>
                          <option value="Datesheet">Datesheet</option>
                        </select>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                          Description (optional)
                        </label>
                        <textarea
                          rows={2}
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Short description of the file..."
                          className="w-full px-3.5 py-2 rounded-xl bg-gray-50/80 border border-gray-200 text-xs text-gray-800 placeholder-gray-400 outline-none focus:border-[#1e3a8a] focus:bg-white transition resize-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                          Choose file{' '}
                          {editingId ? (
                            <span className="text-gray-400 font-normal lowercase">(optional)</span>
                          ) : (
                            <span className="text-red-500">*</span>
                          )}
                        </label>
                        <input
                          type="file"
                          onChange={(e) => setFile(e.target.files[0])}
                          className="w-full px-3 py-1.5 rounded-xl bg-gray-50/80 border border-gray-200 text-xs text-gray-600 file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[11px] file:font-bold file:bg-blue-50 file:text-[#1e3a8a] hover:file:bg-blue-100 focus:outline-none transition cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Footer Action Buttons */}
                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 mt-2">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="px-5 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition cursor-pointer"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center gap-2 px-6 py-2 rounded-xl bg-[#1e3a8a] hover:bg-[#1b337a] text-xs font-bold text-white shadow-md transition cursor-pointer disabled:opacity-60 disabled:pointer-events-none"
                    >
                      {loading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <UploadCloud className="w-3.5 h-3.5" />
                      )}
                      {loading ? 'Processing...' : editingId ? 'Update File' : 'Upload File'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}