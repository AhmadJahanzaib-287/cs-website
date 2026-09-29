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
    try {
      if (editingNotice) {
        await API.put(`/notices/${editingNotice._id}`, formData);
      } else {
        await API.post('/notices', formData);
      }
      setIsModalOpen(false);
      setEditingNotice(null);
      fetchNotices();
    } catch (err) {
      console.error('Error saving notice:', err);
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
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white border border-gray-100 p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-blue-50 border border-blue-100 text-[#1e3a8a]">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">
              Notice Management
            </h2>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Manage broadcasts, exam alerts, and website popup announcements.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setEditingNotice(null);
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#1e3a8a] hover:bg-[#1b337a] text-xs font-bold text-white shadow-md transition cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> Create Notice
        </button>
      </div>

      {/* Main Section Container */}
      <div className="bg-white border border-gray-100 p-6 rounded-3xl">
        {/* Search & Stats Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3 w-full sm:w-80 bg-gray-50/80 border border-gray-200 px-3.5 py-2 rounded-xl text-xs">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search notices by title or content..."
              className="bg-transparent border-none outline-none text-gray-800 placeholder-gray-400 w-full"
            />
          </div>
          <span className="text-xs text-gray-500 font-medium">
            Total Notices: <strong className="text-[#1e3a8a]">{filteredNotices.length}</strong>
          </span>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin text-[#1e3a8a] mb-2" />
            <p className="text-xs font-medium">Loading notices...</p>
          </div>
        ) : paginatedNotices.length === 0 ? (
          <div className="py-12 text-center border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
            <Inbox className="w-10 h-10 text-gray-400 mx-auto mb-2" />
            <p className="text-xs text-gray-500 italic">No notices found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-gray-50/80 text-gray-500 font-bold border-b border-gray-100 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5 rounded-l-xl">Title & Description</th>
                  <th className="p-3.5">Priority</th>
                  <th className="p-3.5">Active Window</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right rounded-r-xl">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedNotices.map((notice) => (
                  <tr key={notice._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-3.5 max-w-xs">
                      <p className="font-bold text-gray-900 truncate">{notice.title}</p>
                      <p className="text-[11px] text-gray-500 truncate mt-0.5">{notice.description}</p>
                    </td>
                    <td className="p-3.5">{getPriorityBadge(notice.priority)}</td>
                    <td className="p-3.5 text-[11px] text-gray-500">
                      <div><strong className="text-gray-700">Start:</strong> {new Date(notice.startDate).toLocaleString()}</div>
                      <div><strong className="text-gray-700">End:</strong> {new Date(notice.endDate).toLocaleString()}</div>
                    </td>
                    <td className="p-3.5">
                      <button
                        onClick={() => handleToggleStatus(notice._id)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1.5 transition cursor-pointer ${
                          notice.isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                        }`}
                      >
                        <Power className="w-3 h-3" />
                        {notice.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setEditingNotice(notice);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 bg-gray-50 border border-gray-200 text-gray-600 hover:text-[#1e3a8a] hover:border-blue-200 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                          title="Edit Notice"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingId(notice._id)}
                          className="p-1.5 bg-gray-50 border border-gray-200 text-gray-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50 rounded-lg transition cursor-pointer"
                          title="Delete Notice"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
          <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100 text-xs text-gray-500 font-medium">
            <span>Page {currentPage} of {totalPages}</span>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                className="p-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                className="p-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Notice Create/Edit Modal */}
      <NoticeModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingNotice(null);
        }}
        onSubmit={handleCreateOrUpdate}
        initialData={editingNotice}
      />

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white border border-gray-100 rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-xl">
            <div className="w-12 h-12 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Delete Notice?</h3>
              <p className="text-xs text-gray-500 font-medium mt-1">This action cannot be undone. Are you sure you want to permanently remove this notice?</p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
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