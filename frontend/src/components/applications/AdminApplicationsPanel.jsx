import React, { useEffect, useState } from 'react';
import { AlertCircle, BriefcaseBusiness, CalendarClock, CheckCircle2, Clock3, Loader2, RefreshCw, Search } from 'lucide-react';
import API from '../../api/axios';

const statusOptions = ['Pending', 'Under Review', 'Approved', 'Rejected'];
const statusStyles = {
  Pending: 'border-amber-200 bg-amber-50 text-amber-800',
  'Under Review': 'border-sky-200 bg-sky-50 text-sky-800',
  Approved: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  Rejected: 'border-rose-200 bg-rose-50 text-rose-800',
};

const formatDate = (date) => new Intl.DateTimeFormat('en-PK', {
  dateStyle: 'medium',
  timeStyle: 'short',
}).format(new Date(date));

export default function AdminApplicationsPanel() {
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, underReview: 0, approved: 0, rejected: 0 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const fetchApplications = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const { data } = await API.get('/applications', {
        params: { limit: 100, search: search.trim() || undefined, status: statusFilter || undefined },
      });
      setApplications(data.data);
      setStats(data.stats);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Could not load applications.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(fetchApplications, 250);
    return () => window.clearTimeout(timer);
  }, [search, statusFilter]);

  const handleStatusChange = async (applicationId, status) => {
    setUpdatingId(applicationId);
    setErrorMessage('');
    try {
      await API.patch(`/applications/${applicationId}/status`, { status });
      await fetchApplications();
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Could not update application status.');
    } finally {
      setUpdatingId('');
    }
  };

  const summaryCards = [
    { label: 'All applications', value: stats.total, icon: BriefcaseBusiness, color: 'text-[#0e7490] bg-[#e8f5f6]' },
    { label: 'Pending', value: stats.pending, icon: Clock3, color: 'text-amber-700 bg-amber-50' },
    { label: 'Under review', value: stats.underReview, icon: CalendarClock, color: 'text-sky-700 bg-sky-50' },
    { label: 'Resolved', value: stats.approved + stats.rejected, icon: CheckCircle2, color: 'text-emerald-700 bg-emerald-50' },
  ];

  return (
    <section className="mx-auto max-w-7xl space-y-6" aria-labelledby="applications-title">
      <header className="flex flex-col gap-4 border-b border-[#d5e1ec] pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase text-[#0e7490]">Student services / Registry</p>
          <h2 id="applications-title" className="text-2xl font-extrabold text-[#17243b] sm:text-3xl">Applications</h2>
          <p className="mt-1.5 text-sm text-[#69788d]">Track generated requests and update their review status.</p>
        </div>
        <button type="button" onClick={fetchApplications} disabled={isLoading} aria-label="Refresh applications" className="inline-flex h-10 w-10 items-center justify-center self-start rounded-md border border-[#dce5ef] bg-white text-[#1e3a8a] transition hover:bg-[#f7fafc] disabled:opacity-60 sm:self-auto">
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </header>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {summaryCards.map(({ label, value, icon: Icon, color }) => (
          <article key={label} className="border-y border-[#dce5ef] bg-white px-4 py-4 first:border-l last:border-r sm:px-5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold text-[#69788d]">{label}</p>
              <span className={`flex h-8 w-8 items-center justify-center rounded-md ${color}`}><Icon className="h-4 w-4" /></span>
            </div>
            <p className="mt-3 text-2xl font-extrabold tabular-nums text-[#17243b]">{value}</p>
          </article>
        ))}
      </div>

      <div className="border-y border-[#dce5ef] bg-white">
        <div className="flex flex-col gap-3 border-b border-[#e3eaf1] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <h3 className="text-sm font-bold text-[#25354d]">Generated applications</h3>
            <p className="mt-1 text-xs text-[#8290a3]">Newest submissions appear first.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="flex h-10 min-w-56 items-center gap-2 rounded-md border border-[#dce5ef] bg-[#f7fafc] px-3">
              <Search className="h-4 w-4 shrink-0 text-[#8290a3]" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, serial, reg no." className="w-full bg-transparent text-xs text-[#25354d] outline-none placeholder:text-[#91a0b3]" aria-label="Search applications" />
            </label>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter by status" className="h-10 rounded-md border border-[#dce5ef] bg-white px-3 text-xs font-semibold text-[#40516a] outline-none focus:border-[#0e7490]">
              <option value="">All statuses</option>
              {statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
          </div>
        </div>

        {errorMessage && <p role="alert" className="m-4 flex items-center gap-2 rounded-md border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs font-medium text-rose-700"><AlertCircle className="h-4 w-4 shrink-0" />{errorMessage}</p>}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-xs text-[#52647b]">
            <thead className="bg-[#f7fafc] text-[10px] font-bold uppercase text-[#8290a3]">
              <tr>
                <th className="px-5 py-3">Serial number</th>
                <th className="px-5 py-3">Applicant</th>
                <th className="px-5 py-3">Application</th>
                <th className="px-5 py-3">Generated</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Review</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf1f5]">
              {applications.map((application) => (
                <tr key={application._id} className="transition hover:bg-[#fbfcfd]">
                  <td className="px-5 py-4 font-mono text-[11px] font-bold text-[#1e3a8a]">{application.serialNumber}</td>
                  <td className="px-5 py-4">
                    <p className="font-bold text-[#25354d]">{application.studentName}</p>
                    <p className="mt-1 text-[10px] text-[#8290a3]">{application.studentRegNo} · Sem {application.semester}{application.section ? ` · ${application.section}` : ''}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-[#25354d]">{application.applicationType.replaceAll('_', ' ')}</p>
                    <p className="mt-1 max-w-56 truncate text-[10px] text-[#8290a3]" title={application.subject}>{application.subject}</p>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-[#52647b]">{formatDate(application.createdAt)}</td>
                  <td className="px-5 py-4"><span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold ${statusStyles[application.status]}`}>{application.status}</span></td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <select value={application.status} disabled={updatingId === application._id} onChange={(event) => handleStatusChange(application._id, event.target.value)} aria-label={`Update status for ${application.serialNumber}`} className="rounded-md border border-[#dce5ef] bg-white px-2.5 py-2 text-[11px] font-semibold text-[#40516a] outline-none focus:border-[#0e7490] disabled:opacity-60">
                        {statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
                      </select>
                      {updatingId === application._id && <Loader2 className="h-4 w-4 animate-spin text-[#0e7490]" />}
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && applications.length === 0 && (
                <tr><td colSpan="6" className="px-5 py-16 text-center">
                  <BriefcaseBusiness className="mx-auto h-8 w-8 text-[#b7c4d2]" />
                  <p className="mt-3 text-sm font-bold text-[#40516a]">No applications found</p>
                  <p className="mt-1 text-xs text-[#8290a3]">Newly generated applications will appear here.</p>
                </td></tr>
              )}
              {isLoading && applications.length === 0 && (
                <tr><td colSpan="6" className="px-5 py-16 text-center text-xs font-medium text-[#69788d]"><Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin text-[#0e7490]" />Loading applications...</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <footer className="border-t border-[#e3eaf1] px-5 py-3 text-[11px] text-[#8290a3]">Showing {applications.length} of {stats.total} applications</footer>
      </div>
    </section>
  );
}