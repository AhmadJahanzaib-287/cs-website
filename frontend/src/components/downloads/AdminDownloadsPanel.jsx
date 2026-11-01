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
  Search,
  ArrowDownToLine,
  AlertTriangle,
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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [deletingItem, setDeletingItem] = useState(null);

  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [fetchingFiles, setFetchingFiles] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [listError, setListError] = useState('');

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
      setListError('');
    } catch (err) {
      console.error('Error loading files:', err);
      setListError(err.response?.data?.message || 'Could not load downloads. Please try again.');
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

    if (!title.trim() || (!editingId && !file)) {
      setErrorMsg('Title aur file dono zaroori hain');
      return;
    }
    if (file && file.size > 20 * 1024 * 1024) {
      setErrorMsg('File size cannot exceed 20 MB.');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
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

      handleCloseModal();
      await loadFiles();
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
    setIsDeleting(true);
    setErrorMsg('');
    try {
      await API.delete(`/downloads/${id}`);
      setDeletingItem(null);
      await loadFiles();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Could not delete this download. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const categories = ['All', ...new Set(files.map((item) => item.category || 'General'))];
  const filteredFiles = files.filter((item) => {
    const categoryMatches = selectedCategory === 'All' || (item.category || 'General') === selectedCategory;
    const query = searchQuery.trim().toLowerCase();
    const searchMatches = !query || [item.title, item.description, item.fileName, item.category]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(query));
    return categoryMatches && searchMatches;
  });

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="flex flex-col gap-4 border-b border-[#d5e1ec] pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase text-[#0e7490]"><span className="h-px w-7 bg-[#0e7490]" /> Student services / Resource library</p>
          <h2 className="text-2xl font-extrabold text-[#17243b] sm:text-3xl">Downloads</h2>
          <p className="mt-1.5 text-sm text-[#69788d]">Publish and maintain forms, notices, and academic resources.</p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-md bg-[#1e3a8a] px-4 text-xs font-bold text-white transition hover:bg-[#172e6e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0e7490] sm:self-auto"
        >
          <Plus className="h-4 w-4" /> Upload resource
        </button>
      </header>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {categories.filter((item) => item !== 'All').slice(0, 4).map((item) => (
          <div key={item} className="border-y border-[#dce5ef] bg-white px-4 py-3.5 first:border-l last:border-r sm:px-5">
            <p className="text-xs font-semibold text-[#69788d]">{item}</p>
            <p className="mt-2 text-2xl font-extrabold tabular-nums text-[#17243b]">{files.filter((fileItem) => (fileItem.category || 'General') === item).length}</p>
          </div>
        ))}
        {categories.length === 1 && <div className="col-span-2 border-y border-[#dce5ef] bg-white px-4 py-3.5 sm:px-5 xl:col-span-4"><p className="text-xs font-semibold text-[#69788d]">Published resources</p><p className="mt-2 text-2xl font-extrabold tabular-nums text-[#17243b]">{files.length}</p></div>}
      </div>

      {/* Uploaded Files Section List */}
      <section className="border-y border-[#dce5ef] bg-white" aria-label="Download inventory">
        <div className="flex flex-col gap-3 border-b border-[#e3eaf1] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-bold text-[#25354d]"><Folder className="h-4 w-4 text-[#0e7490]" />Resource library</h3>
            <p className="mt-1 text-xs text-[#8290a3]">{filteredFiles.length} of {files.length} resources</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="flex h-10 w-full items-center gap-2 rounded-md border border-[#dce5ef] bg-[#f7fafc] px-3 sm:w-64">
              <Search className="h-4 w-4 shrink-0 text-[#8290a3]" />
              <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search resources" aria-label="Search downloads" className="w-full bg-transparent text-xs text-[#25354d] outline-none placeholder:text-[#91a0b3]" />
            </label>
            <select value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)} aria-label="Filter downloads by category" className="h-10 rounded-md border border-[#dce5ef] bg-white px-3 text-xs font-semibold text-[#52647b] outline-none focus:border-[#0e7490]">
              {categories.map((item) => <option key={item} value={item}>{item === 'All' ? 'All categories' : item}</option>)}
            </select>
          </div>
        </div>

        {listError && <p role="alert" className="m-4 border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs font-medium text-rose-700">{listError}</p>}

        {fetchingFiles ? (
          <div className="flex min-h-56 flex-col items-center justify-center text-[#69788d]">
            <Loader2 className="mb-2 h-6 w-6 animate-spin text-[#0e7490]" />
            <p className="text-xs font-medium">Loading resources...</p>
          </div>
        ) : !listError && files.length === 0 ? (
          <div className="py-16 text-center">
            <FileText className="mx-auto mb-3 h-8 w-8 text-[#b7c4d2]" />
            <p className="text-sm font-bold text-[#40516a]">No resources uploaded yet</p>
            <p className="mt-1 text-xs text-[#8290a3]">Upload a document to publish it on the public downloads page.</p>
          </div>
        ) : !listError && filteredFiles.length === 0 ? (
          <div className="py-14 text-center">
            <Search className="mx-auto mb-3 h-7 w-7 text-[#b7c4d2]" />
            <p className="text-sm font-bold text-[#40516a]">No matching resources</p>
          </div>
        ) : !listError && (
          <div className="divide-y divide-[#e3eaf1]">
            {filteredFiles.map((item) => (
              <div
                key={item._id}
                className="flex flex-col gap-4 px-4 py-4 transition-colors hover:bg-[#fbfcfd] sm:flex-row sm:items-center sm:px-5"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-[#d5e1ec] bg-[#edf4f8] text-[#1e3a8a]">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="max-w-full truncate text-sm font-bold text-[#25354d]">{item.title}</h4>
                    <span className="rounded-sm border border-[#d5e1ec] bg-[#edf4f8] px-2 py-0.5 text-[10px] font-bold text-[#1e3a8a]">{item.category || 'General'}</span>
                  </div>
                  <p className="mt-1 line-clamp-1 text-xs text-[#69788d]">{item.description || item.fileName || 'No description provided.'}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-[#8290a3]">
                    <span className="max-w-56 truncate">{item.fileName || 'Attached file'}</span>
                    <span>{item.fileSize ? item.fileSize >= 1024 * 1024 ? `${(item.fileSize / (1024 * 1024)).toFixed(1)} MB` : `${Math.round(item.fileSize / 1024)} KB` : 'Size unavailable'}</span>
                    <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" />{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Date unavailable'}</span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <a href={`${API.defaults.baseURL}/downloads/file/${item._id}`} aria-label={`Download ${item.title}`} className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-[#dce5ef] bg-white px-3 text-xs font-bold text-[#1e3a8a] transition hover:border-[#b9dce2] hover:bg-[#edf7f8]"><ArrowDownToLine className="h-4 w-4" /><span className="hidden sm:inline">Download</span></a>
                  <button
                    type="button"
                    onClick={() => handleEdit(item)}
                    aria-label={`Edit ${item.title}`}
                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-[#dce5ef] bg-white px-3 text-xs font-bold text-[#52647b] transition hover:border-[#b9dce2] hover:bg-[#edf7f8] hover:text-[#1e3a8a]"
                  >
                    <Edit className="h-3.5 w-3.5" /><span className="hidden sm:inline">Edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setErrorMsg(''); setDeletingItem(item); }}
                    aria-label={`Delete ${item.title}`}
                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-[#dce5ef] bg-white px-3 text-xs font-bold text-[#69788d] transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                  >
                    <Trash2 className="h-3.5 w-3.5" /><span className="hidden sm:inline">Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Modal Popup (Same Size & Styling as Notice Modal) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#10203d]/55 p-3 backdrop-blur-sm sm:p-5">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="relative max-h-[94vh] w-full max-w-4xl overflow-y-auto border border-[#dce5ef] bg-white text-[#25354d] shadow-2xl"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={handleCloseModal}
                aria-label="Close upload form"
                className="absolute right-4 top-4 z-10 rounded-md p-2 text-[#69788d] transition hover:bg-[#f3f7fb] hover:text-[#17243b]"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="p-4 sm:p-6">
                {/* Header */}
                <div className="mb-5 flex items-center gap-3 border-b border-[#e3eaf1] pb-4 pr-10">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md border border-[#d5e1ec] bg-[#edf4f8] text-[#0e7490]">
                    <UploadCloud className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-[#0e7490]">Student services / Resource library</p>
                    <h3 className="mt-0.5 text-lg font-extrabold text-[#17243b] sm:text-xl">
                      {editingId ? 'Edit File' : 'Upload Download File'}
                    </h3>
                    <p className="text-xs text-[#69788d]">
                      Add document details and select a resource file.
                    </p>
                  </div>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} aria-busy={loading} className="space-y-4">
                  {errorMsg && (
                    <div role="alert" className="flex items-center gap-2 border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs font-semibold text-rose-700">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {errorMsg}
                    </div>
                  )}

                  {successMsg && (
                    <div role="status" className="flex items-center gap-2 border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs font-semibold text-emerald-700">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      {successMsg}
                    </div>
                  )}

                  {/* 2-Column Grid Layout */}
                  <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
                    {/* Left Column */}
                    <div className="space-y-3">
                      <div>
                        <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-[#52647b]">
                          Title <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          maxLength={140}
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="e.g. Admission Form 2026"
                          className="h-10 w-full rounded-md border border-[#dce5ef] bg-[#f7fafc] px-3 text-xs text-[#25354d] outline-none transition placeholder:text-[#91a0b3] focus:border-[#0e7490] focus:bg-white focus:ring-2 focus:ring-[#0e7490]/15"
                        />
                      </div>

                      <div>
                        <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-[#52647b]">
                          Category
                        </label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="h-10 w-full rounded-md border border-[#dce5ef] bg-[#f7fafc] px-3 text-xs text-[#25354d] outline-none transition focus:border-[#0e7490] focus:bg-white focus:ring-2 focus:ring-[#0e7490]/15"
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
                        <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-[#52647b]">
                          Description (optional)
                        </label>
                        <textarea
                          rows={3}
                          maxLength={1000}
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Short description of the file..."
                          className="w-full resize-y rounded-md border border-[#dce5ef] bg-[#f7fafc] px-3 py-2.5 text-xs leading-5 text-[#25354d] outline-none transition placeholder:text-[#91a0b3] focus:border-[#0e7490] focus:bg-white focus:ring-2 focus:ring-[#0e7490]/15"
                        />
                      </div>

                      <div>
                        <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-[#52647b]">
                          Choose file{' '}
                          {editingId ? (
                            <span className="text-gray-400 font-normal lowercase">(optional)</span>
                          ) : (
                            <span className="text-red-500">*</span>
                          )}
                        </label>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.zip"
                          onChange={(e) => { setFile(e.target.files?.[0] || null); setErrorMsg(''); }}
                          className="w-full rounded-md border border-[#dce5ef] bg-[#f7fafc] px-3 py-2 text-xs text-[#52647b] file:mr-3 file:rounded-sm file:border-0 file:bg-[#edf2fb] file:px-2.5 file:py-1 file:text-[11px] file:font-bold file:text-[#1e3a8a] hover:file:bg-[#dfe9f7]"
                        />
                        {file && <p className="mt-1 text-[10px] text-[#69788d]">Selected: {file.name} · {(file.size / (1024 * 1024)).toFixed(2)} MB</p>}
                        {editingId && !file && <p className="mt-1 text-[10px] text-[#8290a3]">Leave empty to keep the current file. Maximum size: 20 MB.</p>}
                      </div>
                    </div>
                  </div>

                  {/* Footer Action Buttons */}
                  <div className="mt-2 flex items-center justify-end gap-2 border-t border-[#e3eaf1] pt-4">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      disabled={loading}
                      className="h-10 rounded-md border border-[#dce5ef] px-4 text-xs font-bold text-[#52647b] transition hover:bg-[#f7fafc] disabled:opacity-60"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex h-10 items-center gap-2 rounded-md bg-[#1e3a8a] px-5 text-xs font-bold text-white transition hover:bg-[#172e6e] disabled:cursor-wait disabled:opacity-60"
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

      <AnimatePresence>
        {deletingItem && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#10203d]/55 p-4 backdrop-blur-sm">
            <motion.section
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="delete-download-title"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="w-full max-w-sm border border-[#dce5ef] bg-white p-5 shadow-2xl"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-rose-200 bg-rose-50 text-rose-700"><AlertTriangle className="h-5 w-5" /></span>
                <div>
                  <h3 id="delete-download-title" className="text-sm font-bold text-[#17243b]">Delete this resource?</h3>
                  <p className="mt-1 text-xs leading-5 text-[#69788d]">“{deletingItem.title}” will be removed from the public downloads page.</p>
                </div>
              </div>
              {errorMsg && <p role="alert" className="mt-4 border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">{errorMsg}</p>}
              <div className="mt-5 flex justify-end gap-2 border-t border-[#e3eaf1] pt-4">
                <button type="button" onClick={() => { setDeletingItem(null); setErrorMsg(''); }} disabled={isDeleting} className="h-9 rounded-md border border-[#dce5ef] px-3 text-xs font-bold text-[#52647b] transition hover:bg-[#f7fafc] disabled:opacity-60">Cancel</button>
                <button type="button" onClick={() => handleDelete(deletingItem._id)} disabled={isDeleting} className="inline-flex h-9 items-center gap-2 rounded-md bg-rose-700 px-3.5 text-xs font-bold text-white transition hover:bg-rose-800 disabled:opacity-60">
                  {isDeleting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}{isDeleting ? 'Deleting...' : 'Delete resource'}
                </button>
              </div>
            </motion.section>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}