import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, Loader2 } from 'lucide-react';
import API from '../../api/axios.js';

export default function DownloadsPage() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const res = await API.get('/downloads');
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
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
  };

  return (
    <section className="relative py-28 px-4 sm:px-8 bg-[#0b0f19] min-h-screen text-slate-100">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-cyan-500/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="text-center max-w-2xl mx-auto mb-12 relative z-10">
        <span className="text-xs font-extrabold tracking-widest text-cyan-400 uppercase bg-cyan-500/10 px-4 py-1.5 rounded-full border border-cyan-500/30 backdrop-blur-md inline-block mb-3">
          Portal Resources
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Downloads
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-2">
          Official forms, notices, and academic documents for students.
        </p>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {loading && (
          <div className="flex items-center justify-center gap-2 text-slate-400 text-sm py-16">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading files...
          </div>
        )}

        {!loading && errorMsg && (
          <p className="text-center text-red-400 text-sm py-16">{errorMsg}</p>
        )}

        {!loading && !errorMsg && files.length === 0 && (
          <p className="text-center text-slate-400 text-sm py-16">
            Abhi koi file available nahi hai.
          </p>
        )}

        {!loading && files.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {files.map((file, index) => (
              <motion.div
                key={file._id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="p-4 rounded-2xl bg-slate-950/30 border border-slate-800/80 backdrop-blur-2xl flex items-start gap-3"
              >
                <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-cyan-400">
                    {file.category}
                  </span>
                  <h3 className="text-sm font-bold text-white mt-0.5 truncate">
                    {file.title}
                  </h3>
                  {file.description && (
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                      {file.description}
                    </p>
                  )}
                  <p className="text-[10px] text-slate-500 mt-1">
                    {formatSize(file.fileSize)}
                  </p>

                  <a
                    href={`${API.defaults.baseURL}/downloads/file/${file._id}`}
                    className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}