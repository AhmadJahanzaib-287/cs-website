import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Trash2, CircleDot, CheckCircle2, Loader2, Inbox, Search, RefreshCw, AlertCircle, ChevronDown } from 'lucide-react';
import API from '../api/axios';

export default function AdminMessagesPanel() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [search, setSearch] = useState('');
  const [view, setView] = useState('all');
  const [errorMessage, setErrorMessage] = useState('');

  const fetchMessages = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const { data } = await API.get('/contact');
      if (data.success) setMessages(data.data);
    } catch (err) {
      console.error('[Fetch Messages Error]:', err.message);
      setErrorMessage(err.response?.data?.message || 'Could not load messages. Check the connection and try again.');
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
      setErrorMessage(err.response?.data?.message || 'Could not delete this message. Please try again.');
    }
  };

  const unreadCount = messages.filter((m) => !m.isRead).length;
  const filteredMessages = messages.filter((message) => {
    const matchesView = view === 'all' || !message.isRead;
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || [message.name, message.email, message.subject, message.message]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(query));
    return matchesView && matchesSearch;
  });

  return (
    <section className="mx-auto max-w-6xl space-y-5" aria-labelledby="messages-title">
      <header className="flex flex-col gap-4 border-b border-[#d5e1ec] pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase text-[#0e7490]"><span className="h-px w-7 bg-[#0e7490]" /> Communications / Inbox</p>
          <h2 id="messages-title" className="text-2xl font-extrabold text-[#17243b] sm:text-3xl">Contact messages</h2>
          <p className="mt-1.5 text-sm text-[#69788d]">Every submission from the public Contact Us form.</p>
        </div>
        <button type="button" onClick={fetchMessages} disabled={isLoading} aria-label="Refresh messages" className="inline-flex h-10 w-10 items-center justify-center self-start rounded-md border border-[#dce5ef] bg-white text-[#1e3a8a] transition hover:bg-[#f7fafc] disabled:opacity-50 sm:self-auto">
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </header>

      <div className="grid grid-cols-2 gap-3">
        <div className="border-y border-[#dce5ef] bg-white px-4 py-3.5 first:border-l sm:px-5"><p className="text-xs font-semibold text-[#69788d]">All messages</p><p className="mt-2 text-2xl font-extrabold tabular-nums text-[#17243b]">{messages.length}</p></div>
        <div className="border-y border-[#dce5ef] bg-white px-4 py-3.5 last:border-r sm:px-5"><p className="text-xs font-semibold text-[#69788d]">Unread</p><p className="mt-2 text-2xl font-extrabold tabular-nums text-[#0e7490]">{unreadCount}</p></div>
      </div>

      <div className="border-y border-[#dce5ef] bg-white">
        <div className="flex flex-col gap-3 border-b border-[#e3eaf1] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex items-center gap-1" role="group" aria-label="Filter messages">
            <button type="button" onClick={() => setView('all')} aria-pressed={view === 'all'} className={`rounded-md px-3 py-2 text-xs font-bold transition ${view === 'all' ? 'bg-[#1e3a8a] text-white' : 'text-[#52647b] hover:bg-[#edf4f8]'}`}>All ({messages.length})</button>
            <button type="button" onClick={() => setView('unread')} aria-pressed={view === 'unread'} className={`rounded-md px-3 py-2 text-xs font-bold transition ${view === 'unread' ? 'bg-[#1e3a8a] text-white' : 'text-[#52647b] hover:bg-[#edf4f8]'}`}>Unread ({unreadCount})</button>
          </div>
          <label className="flex h-10 w-full items-center gap-2 rounded-md border border-[#dce5ef] bg-[#f7fafc] px-3 sm:max-w-sm">
            <Search className="h-4 w-4 shrink-0 text-[#8290a3]" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search sender or message" aria-label="Search messages" className="w-full bg-transparent text-xs text-[#25354d] outline-none placeholder:text-[#91a0b3]" />
          </label>
        </div>

        {errorMessage && (
          <div role="alert" className="m-4 flex flex-col gap-3 border border-rose-200 bg-rose-50 p-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center gap-2 text-xs font-medium text-rose-700"><AlertCircle className="h-4 w-4 shrink-0" />{errorMessage}</p>
            <button type="button" onClick={fetchMessages} className="shrink-0 text-left text-xs font-bold text-rose-800 underline underline-offset-2">Retry</button>
          </div>
        )}

        {isLoading ? (
          <div className="flex min-h-52 items-center justify-center text-sm text-[#69788d]"><Loader2 className="mr-2 h-5 w-5 animate-spin text-[#0e7490]" />Loading messages...</div>
        ) : !errorMessage && messages.length === 0 ? (
          <div className="py-16 text-center"><Inbox className="mx-auto mb-3 h-8 w-8 text-[#b7c4d2]" /><p className="text-sm font-bold text-[#40516a]">No messages yet</p><p className="mt-1 text-xs text-[#8290a3]">Messages sent from the website will appear here.</p></div>
        ) : !errorMessage && filteredMessages.length === 0 ? (
          <div className="py-14 text-center"><Search className="mx-auto mb-3 h-7 w-7 text-[#b7c4d2]" /><p className="text-sm font-bold text-[#40516a]">No matching messages</p><p className="mt-1 text-xs text-[#8290a3]">Change the search or message filter.</p></div>
        ) : !errorMessage && (
          <div className="divide-y divide-[#e3eaf1]">
            <AnimatePresence initial={false}>
              {filteredMessages.map((msg) => (
                <motion.article key={msg._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`border-l-2 transition-colors ${msg.isRead ? 'border-transparent' : 'border-[#0e7490] bg-[#f7fbfc]'}`}>
                  <div className="flex items-start gap-3 px-4 py-4 sm:px-5">
                    <div className="mt-1 shrink-0">{msg.isRead ? <CheckCircle2 className="h-4 w-4 text-[#8290a3]" /> : <CircleDot className="h-4 w-4 text-[#0e7490]" />}</div>
                    <button type="button" onClick={() => handleExpand(msg)} aria-expanded={expandedId === msg._id} className="min-w-0 flex-1 cursor-pointer text-left">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                        <p className="break-words text-sm font-bold text-[#25354d]">{msg.name}<span className="ml-1.5 break-all text-xs font-normal text-[#69788d]">{msg.email}</span></p>
                        <span className="shrink-0 text-[10px] text-[#8290a3]">{new Date(msg.createdAt).toLocaleString()}</span>
                      </div>
                      {msg.subject && <p className="mt-1 text-xs font-semibold text-[#0e7490]">{msg.subject}</p>}
                      <p className={`mt-1 whitespace-pre-wrap break-words text-xs leading-5 text-[#52647b] ${expandedId === msg._id ? '' : 'line-clamp-2'}`}>{msg.message}</p>
                      <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-[#1e3a8a]">{expandedId === msg._id ? 'Show less' : 'Read message'}<ChevronDown className={`h-3 w-3 transition-transform ${expandedId === msg._id ? 'rotate-180' : ''}`} /></span>
                    </button>
                    <button type="button" onClick={(event) => handleDelete(event, msg._id)} aria-label={`Delete message from ${msg.name}`} title="Delete message" className="shrink-0 rounded-md border border-[#dce5ef] bg-white p-2 text-[#69788d] transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </div>
        )}
        <footer className="border-t border-[#e3eaf1] px-5 py-3 text-[11px] text-[#8290a3]">Showing {filteredMessages.length} of {messages.length} messages</footer>
      </div>
    </section>
  );
}