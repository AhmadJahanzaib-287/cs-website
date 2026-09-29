import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, CalendarRange, ChevronRight, Loader2, Inbox, Trash2, Folder } from 'lucide-react';
import axios from 'axios';
import CreateWorkloadCard from './CreateWorkloadCard';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const statusStyles = {
  draft: 'bg-gray-100 text-gray-700 border-gray-200',
  in_progress: 'bg-amber-50 text-amber-700 border-amber-200',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const statusLabels = {
  draft: 'Draft',
  in_progress: 'In Progress',
  completed: 'Completed',
};

const stepLabels = {
  1: 'Register Classes',
  2: 'Add Teachers',
  3: 'Assign Workload',
  4: 'Download',
};

export default function WorkloadListPage({ onOpenWorkload }) {
  const [workloads, setWorkloads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const fetchWorkloads = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/v1/workload`, {
        withCredentials: true,
      });
      if (data.success) {
        setWorkloads(data.workloads);
      }
    } catch (err) {
      console.error('[Fetch Workloads Error]:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkloads();
  }, []);

  const handleCreated = (newWorkload) => {
    setWorkloads((prev) => [newWorkload, ...prev]);
    setIsCreateOpen(false);
    onOpenWorkload?.(newWorkload);
  };

  const handleDelete = async (e, workloadId) => {
    e.stopPropagation();
    if (!window.confirm('Delete this workload? Its classes, teacher selections, and course assignments will be removed. This cannot be undone.')) return;

    try {
      const { data } = await axios.delete(`${API_URL}/api/v1/workload/${workloadId}`, {
        withCredentials: true,
      });
      if (data.success) {
        setWorkloads((prev) => prev.filter((w) => w._id !== workloadId));
      }
    } catch (err) {
      console.error('[Delete Workload Error]:', err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white border border-gray-100 p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-blue-50 border border-blue-100 text-[#1e3a8a]">
            <CalendarRange className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">
              Workload Management
            </h2>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Create and manage semester-wise teaching workload.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#1e3a8a] hover:bg-[#1b337a] text-xs font-bold text-white shadow-md transition cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> Create New Workload
        </button>
      </div>

      {/* Main Workload Records Section Container */}
      <div className="bg-white border border-gray-100 p-6 rounded-3xl">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Folder className="w-4 h-4 text-[#1e3a8a]" /> Workload Records
          </h3>
          <span className="text-xs text-gray-500 font-medium">
            Total Workloads: <strong className="text-[#1e3a8a]">{workloads.length}</strong>
          </span>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin text-[#1e3a8a] mb-2" />
            <p className="text-xs font-medium">Loading workloads...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && workloads.length === 0 && (
          <div className="py-12 text-center border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
            <Inbox className="w-10 h-10 text-gray-400 mx-auto mb-2" />
            <p className="text-xs text-gray-500 italic">No workloads created yet.</p>
          </div>
        )}

        {/* Workload Cards Grid */}
        {!isLoading && workloads.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workloads.map((w) => (
              <motion.div
                key={w._id}
                onClick={() => onOpenWorkload?.(w)}
                whileHover={{ y: -2 }}
                className="relative text-left bg-white border border-gray-100 hover:border-blue-200 shadow-sm hover:shadow-md rounded-2xl p-5 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <button
                  onClick={(e) => handleDelete(e, w._id)}
                  className="absolute top-4 right-4 p-1.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition cursor-pointer z-10"
                  title="Delete workload"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <div>
                  <div className="flex items-start justify-between mb-4 pr-8">
                    <div className="p-2 rounded-lg bg-[#1e3a8a] text-white shadow-none">
                      <CalendarRange className="w-4 h-4" />
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${statusStyles[w.status]}`}
                    >
                      {statusLabels[w.status]}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-gray-800 mb-1 group-hover:text-[#1e3a8a] transition-colors">
                    {w.title}
                  </h3>
                  <p className="text-xs text-gray-500 mb-4">
                    Created {new Date(w.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="text-xs font-medium text-gray-500">
                    {w.status === 'completed' ? 'Ready to download' : `Next: ${stepLabels[w.currentStep] || 'Register Classes'}`}
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#1e3a8a] group-hover:translate-x-0.5 transition" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create Workload Modal */}
      <AnimatePresence>
        {isCreateOpen && (
          <CreateWorkloadCard
            onClose={() => setIsCreateOpen(false)}
            onCreated={handleCreated}
          />
        )}
      </AnimatePresence>
    </div>
  );
}