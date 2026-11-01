import React, { useState, useEffect } from 'react';
import API from "../../api/axios";
import NoticeModal from './NoticeModal';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Power, 
  Bell, 
  ChevronLeft, 
  ChevronRight,
  AlertTriangle,
  Loader2,
  Inbox
} from 'lucide-react';

const AdminNoticePanel = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [isSavingNotice, setIsSavingNotice] = useState(false);
  const [noticeSaveError, setNoticeSaveError] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // 1. Fetch Notices
  const fetchNotices = async () => {
    try {
      setLoading(true);
      const res = await API.get('/notices'); 
      if (res.data.success) {
        setNotices(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching notices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  // 2. Create or Update Notice
  const handleCreateOrUpdate = async (formData) => {
    setIsSavingNotice(true);
    setNoticeSaveError('');
    try {
      if (editingNotice) {
        await API.put(`/notices/${editingNotice._id}`, formData);
      } else {
        await API.post('/notices', formData);
      }
      setIsModalOpen(false);
      setEditingNotice(null);
      fetchNotices();
      return true;
    } catch (err) {
      console.error('Error saving notice:', err);
      setNoticeSaveError(err.response?.data?.message || 'Could not save this notice. Please try again.');
      return false;
    } finally {
      setIsSavingNotice(false);
    }
  };

  // 3. Toggle Status
  const handleToggleStatus = async (id) => {
    try {
      await API.patch(`/notices/${id}/status`);
      fetchNotices();
    } catch (err) {
      console.error('Error toggling status:', err);
    }
  };

  // 4. Delete Notice
  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await API.delete(`/notices/${deletingId}`);
      setDeletingId(null);
      fetchNotices();
    } catch (err) {
      console.error('Error deleting notice:', err);
    }
  };

  // Search filter
  const filteredNotices = notices.filter(
    (n) =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredNotices.length / itemsPerPage);
  const paginatedNotices = filteredNotices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const activeNotices = notices.filter((notice) => notice.isActive).length;
  const urgentNotices = notices.filter((notice) => notice.priority === 'Emergency').length;
  const feedNotices = notices.filter((notice) => notice.showInFeed).length;

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'Emergency':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">Emergency</span>;
      case 'Important':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">Important</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">Normal</span>;
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="flex flex-col gap-4 border-b border-[#d5e1ec] pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase text-[#0e7490]"><span className="h-px w-7 bg-[#0e7490]" /> Communications / Website</p>
          <h2 className="text-2xl font-extrabold text-[#17243b] sm:text-3xl">Notice management</h2>
          <p className="mt-1.5 text-sm text-[#69788d]">Publish campus updates, priority alerts, and feed announcements.</p>
        </div>

        <button
          onClick={() => {
            setEditingNotice(null);
            setNoticeSaveError('');
            setIsModalOpen(true);
          }}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#1e3a8a] px-4 text-xs font-bold text-white transition hover:bg-[#172e6e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0e7490]"
        >
          <Plus className="h-4 w-4" /> Create notice
        </button>
      </header>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[
          { label: 'All notices', value: notices.length, tone: 'text-[#0e7490] bg-[#e8f5f6]' },
          { label: 'Active now', value: activeNotices, tone: 'text-emerald-700 bg-emerald-50' },
          { label: 'Emergency', value: urgentNotices, tone: 'text-rose-700 bg-rose-50' },
          { label: 'In public feed', value: feedNotices, tone: 'text-[#1e3a8a] bg-[#edf2fb]' },
        ].map((stat) => (
          <div key={stat.label} className="border-y border-[#dce5ef] bg-white px-4 py-3.5 first:border-l last:border-r sm:px-5">
            <p className="text-xs font-semibold text-[#69788d]">{stat.label}</p>
            <p className="mt-2 flex items-center gap-2 text-2xl font-extrabold tabular-nums text-[#17243b]">
              {stat.value}<span className={`h-2 w-2 rounded-full ${stat.tone.split(' ')[1]}`} />
            </p>
          </div>
        ))}
      </div>

      <section className="border-y border-[#dce5ef] bg-white" aria-label="Notice directory">
        <div className="flex flex-col gap-3 border-b border-[#e3eaf1] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <h3 className="text-sm font-bold text-[#25354d]">Published notices</h3>
            <p className="mt-1 text-xs text-[#8290a3]">{filteredNotices.length} records · newest campus communications</p>
          </div>
          <label className="flex h-10 w-full items-center gap-2 rounded-md border border-[#dce5ef] bg-[#f7fafc] px-3 sm:max-w-sm">
            <Search className="h-4 w-4 shrink-0 text-[#8290a3]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search title or notice text"
              aria-label="Search notices"
              className="w-full bg-transparent text-xs text-[#25354d] outline-none placeholder:text-[#91a0b3]"
            />
          </label>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="flex min-h-56 flex-col items-center justify-center text-[#69788d]">
            <Loader2 className="mb-2 h-6 w-6 animate-spin text-[#0e7490]" />
            <p className="text-xs font-medium">Loading notices...</p>
          </div>
        ) : paginatedNotices.length === 0 ? (
          <div className="py-16 text-center">
            <Inbox className="mx-auto mb-3 h-8 w-8 text-[#b7c4d2]" />
            <p className="text-sm font-bold text-[#40516a]">No notices found</p>
            <p className="mt-1 text-xs text-[#8290a3]">Create a notice or adjust your search.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-left text-xs text-[#52647b]">
              <thead className="border-b border-[#e3eaf1] bg-[#f7fafc] text-[10px] font-bold uppercase tracking-wider text-[#8290a3]">
                <tr>
                  <th className="px-5 py-3">Notice</th>
                  <th className="px-5 py-3">Priority</th>
                  <th className="px-5 py-3">Schedule</th>
                  <th className="px-5 py-3">Visibility</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#edf1f5]">
                {paginatedNotices.map((notice) => (
                  <tr key={notice._id} className="transition-colors hover:bg-[#fbfcfd]">
                    <td className="max-w-sm px-5 py-4">
                      <p className="truncate font-bold text-[#25354d]">{notice.title}</p>
                      <p className="mt-1 line-clamp-2 text-[11px] leading-5 text-[#69788d]">{notice.description}</p>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">{getPriorityBadge(notice.priority)}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-[10px] text-[#69788d]">
                      <div><strong className="text-[#40516a]">From</strong> {new Date(notice.startDate).toLocaleString()}</div>
                      <div className="mt-1"><strong className="text-[#40516a]">Until</strong> {new Date(notice.endDate).toLocaleString()}</div>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleToggleStatus(notice._id)}
                        aria-label={`${notice.isActive ? 'Deactivate' : 'Activate'} ${notice.title}`}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold transition ${
                          notice.isActive
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'border-[#dce5ef] bg-[#f3f7fb] text-[#69788d] hover:bg-[#e9eff5]'
                        }`}
                      >
                        <Power className="h-3 w-3" />
                        {notice.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setEditingNotice(notice);
                            setNoticeSaveError('');
                            setIsModalOpen(true);
                          }}
                          className="rounded-md border border-[#dce5ef] bg-white p-2 text-[#69788d] transition hover:border-[#b9dce2] hover:bg-[#edf7f8] hover:text-[#1e3a8a]"
                          title="Edit notice"
                          aria-label={`Edit ${notice.title}`}
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingId(notice._id)}
                          className="rounded-md border border-[#dce5ef] bg-white p-2 text-[#69788d] transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                          title="Delete notice"
                          aria-label={`Delete ${notice.title}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[#e3eaf1] px-5 py-3 text-xs font-medium text-[#69788d]">
            <span>Page {currentPage} of {totalPages}</span>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                aria-label="Previous page"
                className="rounded-md border border-[#dce5ef] bg-white p-2 text-[#52647b] transition hover:bg-[#f7fafc] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                aria-label="Next page"
                className="rounded-md border border-[#dce5ef] bg-white p-2 text-[#52647b] transition hover:bg-[#f7fafc] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Notice Create/Edit Modal */}
      <NoticeModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingNotice(null);
          setNoticeSaveError('');
        }}
        onSubmit={handleCreateOrUpdate}
        initialData={editingNotice}
        isSubmitting={isSavingNotice}
        submitError={noticeSaveError}
      />

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#10203d]/55 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm space-y-4 border border-[#dce5ef] bg-white p-6 text-center shadow-2xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md border border-rose-200 bg-rose-50 text-rose-700">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#17243b]">Delete this notice?</h3>
              <p className="mt-1 text-xs leading-5 text-[#69788d]">This will permanently remove it from the website and notices feed.</p>
            </div>
            <div className="flex items-center gap-2 border-t border-[#e3eaf1] pt-4">
              <button
                onClick={() => setDeletingId(null)}
                className="h-10 flex-1 border border-[#dce5ef] bg-white text-xs font-bold text-[#52647b] transition hover:bg-[#f7fafc]"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="h-10 flex-1 bg-rose-700 text-xs font-bold text-white transition hover:bg-rose-800"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNoticePanel;