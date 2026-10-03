import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, CalendarRange, ChevronRight, Loader2, Inbox, Trash2, Folder, CircleCheck, Clock3, FilePlus2 } from 'lucide-react';
import axios from 'axios';
import CreateWorkloadCard from './CreateWorkloadCard';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const statusStyles = {
  draft: 'bg-[#f3f7fb] text-[#52647b] border-[#dce5ef]',
  in_progress: 'bg-amber-50 text-amber-800 border-amber-200',
  completed: 'bg-emerald-50 text-emerald-800 border-emerald-200',
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

  const workloadCounts = {
    inProgress: workloads.filter((workload) => workload.status === 'in_progress').length,
    completed: workloads.filter((workload) => workload.status === 'completed').length,
    drafts: workloads.filter((workload) => workload.status === 'draft').length,
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-7 py-2">
      <header className="flex flex-col justify-between gap-4 border-b border-[#d5e1ec] pb-5 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase text-[#0e7490]">Academic operations</p>
          <h2 className="text-2xl font-extrabold tracking-tight text-[#17243b] sm:text-3xl">Workload Management</h2>
          <p className="mt-1.5 max-w-xl text-sm text-[#69788d]">Create and manage semester-wise teaching workloads.</p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-[#1e3a8a] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#172e6e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0e7490]"
        >
          <Plus className="h-4 w-4" /> Create workload
        </button>
      </header>

      <section className="grid grid-cols-2 divide-x divide-y divide-[#dce5ef] border-y border-[#dce5ef] bg-white sm:grid-cols-4 sm:divide-y-0" aria-label="Workload summary">
        <div className="flex items-center gap-3 px-4 py-3.5 sm:px-5">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[#edf2fb] text-[#1e3a8a]"><Folder className="h-4 w-4" /></span>
          <div><p className="text-[10px] font-bold uppercase text-[#8290a3]">All sessions</p><p className="mt-0.5 text-lg font-extrabold tabular-nums text-[#17243b]">{isLoading ? '–' : workloads.length}</p></div>
        </div>
        <div className="flex items-center gap-3 px-4 py-3.5 sm:px-5">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-amber-50 text-amber-700"><Clock3 className="h-4 w-4" /></span>
          <div><p className="text-[10px] font-bold uppercase text-[#8290a3]">In progress</p><p className="mt-0.5 text-lg font-extrabold tabular-nums text-[#17243b]">{isLoading ? '–' : workloadCounts.inProgress}</p></div>
        </div>
        <div className="flex items-center gap-3 px-4 py-3.5 sm:px-5">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-50 text-emerald-700"><CircleCheck className="h-4 w-4" /></span>
          <div><p className="text-[10px] font-bold uppercase text-[#8290a3]">Completed</p><p className="mt-0.5 text-lg font-extrabold tabular-nums text-[#17243b]">{isLoading ? '–' : workloadCounts.completed}</p></div>
        </div>
        <div className="flex items-center gap-3 px-4 py-3.5 sm:px-5">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[#f3f7fb] text-[#52647b]"><FilePlus2 className="h-4 w-4" /></span>
          <div><p className="text-[10px] font-bold uppercase text-[#8290a3]">Drafts</p><p className="mt-0.5 text-lg font-extrabold tabular-nums text-[#17243b]">{isLoading ? '–' : workloadCounts.drafts}</p></div>
        </div>
      </section>
      <section className="overflow-hidden rounded-lg border border-[#dce5ef] bg-white shadow-[0_8px_24px_-22px_rgba(23,36,59,0.5)]">
        <div className="flex items-center justify-between gap-3 border-b border-[#e3eaf1] px-4 py-4 sm:px-5">
          <div>
            <h3 className="text-sm font-bold text-[#25354d]">Workload sessions</h3>
            <p className="mt-0.5 text-xs text-[#8290a3]">Open a session to continue its workflow.</p>
          </div>
          <span className="rounded-md border border-[#dce5ef] bg-[#f7fafc] px-2.5 py-1.5 text-[11px] font-semibold text-[#52647b]">
            {isLoading ? 'Loading' : `${workloads.length} ${workloads.length === 1 ? 'session' : 'sessions'}`}
          </span>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-14 text-[#8290a3]">
            <Loader2 className="mb-2 h-7 w-7 animate-spin text-[#1e3a8a]" />
            <p className="text-xs font-medium">Loading workloads...</p>
          </div>
        )}

        {!isLoading && workloads.length === 0 && (
          <div className="mx-4 my-5 flex flex-col items-center justify-center border border-dashed border-[#cbd8e6] bg-[#f7fafc] px-5 py-12 text-center sm:mx-5">
            <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-md bg-white text-[#1e3a8a] shadow-sm ring-1 ring-[#dce5ef]"><Inbox className="h-5 w-5" /></span>
            <h4 className="text-sm font-bold text-[#25354d]">No workload sessions yet</h4>
            <p className="mt-1 max-w-sm text-xs leading-5 text-[#69788d]">Create a session to register classes, add teachers, and assign the semester workload.</p>
            <button onClick={() => setIsCreateOpen(true)} className="mt-4 inline-flex items-center gap-2 rounded-md bg-[#1e3a8a] px-3.5 py-2 text-xs font-bold text-white transition hover:bg-[#172e6e]">
              <Plus className="h-4 w-4" /> Create first workload
            </button>
          </div>
        )}

        {!isLoading && workloads.length > 0 && (
          <div className="divide-y divide-[#edf1f5]">
            {workloads.map((workload) => (
              <motion.div
                key={workload._id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="group flex flex-col gap-3 px-4 py-4 transition-colors hover:bg-[#f8fafc] sm:flex-row sm:items-center sm:gap-5 sm:px-5"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#edf2fb] text-[#1e3a8a]"><CalendarRange className="h-4 w-4" /></span>
                  <div className="min-w-0">
                    <h4 className="truncate text-sm font-bold text-[#25354d]">{workload.title}</h4>
                    <p className="mt-1 text-xs text-[#8290a3]">Created {new Date(workload.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 pl-[52px] sm:pl-0">
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase ${statusStyles[workload.status] || statusStyles.draft}`}>
                    {statusLabels[workload.status] || 'Draft'}
                  </span>
                  <span className="min-w-36 text-xs text-[#69788d]">
                    {workload.status === 'completed' ? 'Ready to download' : `Next: ${stepLabels[workload.currentStep] || 'Register Classes'}`}
                  </span>
                  <button
                    type="button"
                    onClick={() => onOpenWorkload?.(workload)}
                    className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-bold text-[#1e3a8a] transition hover:bg-[#edf2fb] hover:text-[#0e7490]"
                  >
                    Open <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(event) => handleDelete(event, workload._id)}
                    className="rounded-md p-2 text-[#8290a3] transition hover:bg-rose-50 hover:text-rose-700"
                    aria-label={`Delete ${workload.title}`}
                    title="Delete workload"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>
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