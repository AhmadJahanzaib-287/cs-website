import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowDownToLine, FileText, Loader2, Search, FolderOpen, CalendarDays, HardDriveDownload } from 'lucide-react';
import API from '../../api/axios.js';

export default function DownloadsPage() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const res = await API.get('/downloads', { params: { limit: 100 } });
        setFiles(res.data.files || []);
      } catch (err) {
        setErrorMsg('Files load nahi ho saki, dobara try karein');
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, []);

  const formatSize = (bytes) => {
    if (!bytes) return 'Size unavailable';
    const mb = bytes / (1024 * 1024);
    return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
  };

  const categories = ['All', ...new Set(files.map((file) => file.category || 'General'))];
  const filteredFiles = files.filter((file) => {
    const matchesCategory = selectedCategory === 'All' || (file.category || 'General') === selectedCategory;
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = !query || [file.title, file.description, file.fileName, file.category]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(query));
    return matchesCategory && matchesSearch;
  });

  return (
    <section className="min-h-screen bg-[#f3f7fb] px-4 pb-16 pt-28 text-[#17243b] sm:px-8 sm:pt-32">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 border-b border-[#d5e1ec] pb-6">
          <p className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase text-[#0e7490]"><span className="h-px w-7 bg-[#0e7490]" /> Student services / Resource library</p>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-extrabold text-[#17243b] sm:text-4xl">Downloads</h1>
              <p className="mt-2 text-sm text-[#69788d]">Official forms, notices, and academic documents from DCS PARS.</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#52647b]">
              <FolderOpen className="h-4 w-4 text-[#0e7490]" /> {files.length} resources
            </div>
          </div>
        </header>

        <div className="mb-5 flex flex-col gap-3 border-y border-[#dce5ef] bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <label className="flex h-10 w-full items-center gap-2 rounded-md border border-[#dce5ef] bg-[#f7fafc] px-3 sm:max-w-sm">
            <Search className="h-4 w-4 shrink-0 text-[#8290a3]" />
            <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search documents" aria-label="Search downloads" className="w-full bg-transparent text-xs text-[#25354d] outline-none placeholder:text-[#91a0b3]" />
          </label>
          <div className="flex max-w-full gap-1 overflow-x-auto" role="group" aria-label="Filter downloads by category">
            {categories.map((category) => (
              <button key={category} type="button" onClick={() => setSelectedCategory(category)} aria-pressed={selectedCategory === category} className={`shrink-0 rounded-md px-3 py-2 text-xs font-semibold transition ${selectedCategory === category ? 'bg-[#1e3a8a] text-white' : 'text-[#52647b] hover:bg-[#edf4f8] hover:text-[#1e3a8a]'}`}>
                {category}
              </button>
            ))}
          </div>
        </div>

      <div className="mx-auto max-w-6xl">
        {loading && (
          <div className="flex min-h-56 items-center justify-center gap-2 text-sm text-[#69788d]">
            <Loader2 className="h-4 w-4 animate-spin text-[#0e7490]" /> Loading resources...
          </div>
        )}

        {!loading && errorMsg && (
          <p role="alert" className="border border-rose-200 bg-rose-50 px-4 py-3 text-center text-sm text-rose-700">{errorMsg}</p>
        )}

        {!loading && !errorMsg && files.length === 0 && (
          <div className="border-y border-[#dce5ef] bg-white py-16 text-center">
            <FolderOpen className="mx-auto mb-3 h-8 w-8 text-[#b7c4d2]" />
            <p className="text-sm font-bold text-[#40516a]">No resources available yet</p>
            <p className="mt-1 text-xs text-[#8290a3]">New documents will appear here when published.</p>
          </div>
        )}

        {!loading && !errorMsg && files.length > 0 && filteredFiles.length > 0 && (
          <div className="divide-y divide-[#e3eaf1] border-y border-[#dce5ef] bg-white">
            {filteredFiles.map((file, index) => (
              <motion.div
                key={file._id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="flex flex-col gap-4 px-4 py-4 transition-colors hover:bg-[#fbfcfd] sm:flex-row sm:items-center sm:px-5"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-[#d5e1ec] bg-[#edf4f8] text-[#1e3a8a]">
                  <FileText className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-[#0e7490]">
                    {file.category}
                  </span>
                  <h3 className="mt-0.5 truncate text-sm font-bold text-[#25354d]">
                    {file.title}
                  </h3>
                  {file.description && (
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#69788d]">
                      {file.description}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-[#8290a3]">
                    <span className="inline-flex items-center gap-1"><HardDriveDownload className="h-3 w-3" />{formatSize(file.fileSize)}</span>
                    {file.createdAt && <span className="inline-flex items-center gap-1"><CalendarDays className="h-3 w-3" />{new Date(file.createdAt).toLocaleDateString()}</span>}
                    {file.fileName && <span className="max-w-56 truncate">{file.fileName}</span>}
                  </div>
                </div>
                <a href={`${API.defaults.baseURL}/downloads/file/${file._id}`} className="inline-flex h-9 shrink-0 items-center justify-center gap-2 self-start rounded-md bg-[#1e3a8a] px-3.5 text-xs font-bold text-white transition hover:bg-[#172e6e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0e7490] sm:self-auto">
                  <ArrowDownToLine className="h-4 w-4" /> Download
                </a>
              </motion.div>
            ))}
          </div>
        )}
        {!loading && !errorMsg && files.length > 0 && filteredFiles.length === 0 && (
          <div className="border-y border-[#dce5ef] bg-white py-14 text-center">
            <Search className="mx-auto mb-3 h-7 w-7 text-[#b7c4d2]" />
            <p className="text-sm font-bold text-[#40516a]">No matching documents</p>
            <p className="mt-1 text-xs text-[#8290a3]">Try another search or category.</p>
          </div>
        )}
      </div>
      </div>
    </section>
  );
}