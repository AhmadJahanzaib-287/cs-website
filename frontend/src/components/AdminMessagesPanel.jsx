import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Trash2, CircleDot, CheckCircle2, Loader2, Inbox } from 'lucide-react';
import API from '../api/axios';

export default function AdminMessagesPanel() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  const fetchMessages = async () => {
    try {
      const { data } = await API.get('/contact');
      if (data.success) setMessages(data.data);
    } catch (err) {
      console.error('[Fetch Messages Error]:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleExpand = async (msg) => {
    const opening = expandedId !== msg._id;
    setExpandedId(opening ? msg._id : null);

    if (opening && !msg.isRead) {
      try {
        const { data } = await API.patch(`/contact/${msg._id}/read`);
        if (data.success) {
          setMessages((prev) => prev.map((m) => (m._id === msg._id ? data.data : m)));
        }
      } catch (err) {
        console.error('[Mark Read Error]:', err.message);
      }
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this message? This cannot be undone.')) return;

    try {
      await API.delete(`/contact/${id}`);
      setMessages((prev) => prev.filter((m) => m._id !== id));
    } catch (err) {
      console.error('[Delete Message Error]:', err.message);
    }
  };

  const unreadCount = messages.filter((m) => !m.isRead).length;

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Mail className="w-5 h-5 text-cyan-400" /> Contact Messages
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Messages submitted through the public Contact Us form.
          </p>
        </div>
        {unreadCount > 0 && (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            {unreadCount} Unread
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-slate-500">
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading messages...
        </div>
      ) : messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-slate-800 rounded-3xl">
          <Inbox className="w-8 h-8 text-slate-600 mb-2" />
          <p className="text-slate-400 font-semibold text-sm">No messages yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => handleExpand(msg)}
                className={`rounded-2xl border backdrop-blur-xl cursor-pointer transition-colors ${
                  msg.isRead
                    ? 'bg-slate-900/60 border-slate-800'
                    : 'bg-cyan-500/[0.04] border-cyan-500/30'
                }`}
              >
                <div className="flex items-start gap-3 p-4">
                  <div className="mt-1 shrink-0">
                    {msg.isRead ? (
                      <CheckCircle2 className="w-4 h-4 text-slate-600" />
                    ) : (
                      <CircleDot className="w-4 h-4 text-cyan-400" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <p className="text-sm font-bold text-slate-100">
                        {msg.name}{' '}
                        <span className="font-normal text-slate-500 text-xs">— {msg.email}</span>
                      </p>
                      <span className="text-[10px] text-slate-500 shrink-0">
                        {new Date(msg.createdAt).toLocaleString()}
                      </span>
                    </div>
                    {msg.subject && (
                      <p className="text-xs font-semibold text-cyan-400/90 mt-1">{msg.subject}</p>
                    )}
                    <p
                      className={`text-xs text-slate-400 mt-1 ${
                        expandedId === msg._id ? '' : 'line-clamp-1'
                      }`}
                    >
                      {msg.message}
                    </p>
                  </div>

                  <button
                    onClick={(e) => handleDelete(e, msg._id)}
                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}