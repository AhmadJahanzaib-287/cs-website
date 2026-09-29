import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, AlertTriangle, AlertCircle, ArrowRight } from 'lucide-react';
import API from '../../api/axios';

const PublicNoticePopup = () => {
  const [notice, setNotice] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const fetchActiveNotice = async () => {
      try {
        const response = await API.get('/notices/active');
        if (response.data.success && response.data.data) {
          setNotice(response.data.data);
          setIsVisible(true);
        }
      } catch (error) {
        console.error('Error fetching public notice:', error);
      }
    };

    fetchActiveNotice();
  }, []);

  if (!notice || !isVisible) return null;

  const getPriorityStyles = (priority) => {
    switch (priority) {
      case 'Emergency':
        return {
          border: 'border-red-500/40',
          badge: 'bg-red-500/20 text-red-300 border-red-500/30',
          accent: 'from-red-500 via-rose-500 to-red-600',
          iconBg: 'bg-red-500/10 border-red-500/30',
          iconColor: 'text-red-400',
          icon: AlertTriangle,
        };
      case 'Important':
        return {
          border: 'border-amber-500/40',
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          accent: 'from-amber-500 via-orange-500 to-amber-600',
          iconBg: 'bg-amber-500/10 border-amber-500/30',
          iconColor: 'text-amber-400',
          icon: AlertCircle,
        };
      default:
        return {
          border: 'border-cyan-500/30',
          badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
          accent: 'from-cyan-500 via-blue-500 to-indigo-500',
          iconBg: 'bg-cyan-500/10 border-cyan-500/30',
          iconColor: 'text-cyan-400',
          icon: Bell,
        };
    }
  };

  const style = getPriorityStyles(notice.priority);
  const Icon = style.icon;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className={`relative w-full max-w-sm bg-slate-900/95 border ${style.border} rounded-3xl shadow-2xl backdrop-blur-2xl overflow-hidden`}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsVisible(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition cursor-pointer"
              title="Close Announcement"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col items-center text-center px-7 pt-10 pb-8 sm:px-8 sm:pt-11 sm:pb-9">
              {/* Big Centered Icon */}
              <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center mb-5 ${style.iconBg}`}>
                <Icon className={`w-8 h-8 ${style.iconColor}`} />
              </div>

              {/* Priority Badge */}
              <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider border bg-slate-800/60 text-slate-300 border-slate-700 mb-4">
                {notice.priority} Announcement
              </span>

              {/* Title */}
              <h3 className="text-lg font-black text-white mb-2.5 leading-snug">{notice.title}</h3>

              {/* Description */}
              <p className="text-sm text-slate-300 leading-relaxed mb-5">{notice.description}</p>

              {/* Link */}
              {notice.linkUrl && (
                <a
                  href={notice.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition mb-5"
                >
                  {notice.linkText || 'Click here for further information'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              )}

              {/* Valid Till */}
              <p className="text-[11px] text-slate-500 font-mono border-t border-slate-800/80 pt-4 w-full">
                Valid till: {new Date(notice.endDate).toLocaleDateString()}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PublicNoticePopup;