import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  GraduationCap,
  Plus,
  FileSpreadsheet,
  Download,
  Search,
  Filter,
  Trash2,
  Edit2,
  Eye,
  RefreshCw,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Users,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import API from '../../api/axios';
import AddStudentModal from './AddStudentModal';
import BulkExcelUploadModal from './BulkExcelUploadModal';
import EditStudentModal from './EditStudentModal';
import StudentDetailsModal from './StudentDetailsModal';
import { downloadSampleTemplate, exportStudentsToExcel } from './excelHelpers';

const DEGREES = [
  'All Programs',
  'BS Computer Science',
  'BS Software Engineering',
  'BS Artificial Intelligence',
  'BS Information Technology',
  'BS Data Science',
  'MS Computer Science',
];

const SEMESTERS = ['All Semesters', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];
const SESSIONS = ['All Shifts', 'Morning', 'Evening'];
const SECTIONS = ['All Sections', 'A', 'B', 'C', 'D'];

const AdminStudentsPanel = () => {
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, morning: 0, evening: 0, byDegree: {} });
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDegree, setSelectedDegree] = useState('All Programs');
  const [selectedSemester, setSelectedSemester] = useState('All Semesters');
  const [selectedSession, setSelectedSession] = useState('All Shifts');
  const [selectedSection, setSelectedSection] = useState('All Sections');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Selection
  const [selectedIds, setSelectedIds] = useState([]);

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [viewingStudent, setViewingStudent] = useState(null);
  const [deletingStudent, setDeletingStudent] = useState(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [actionAlert, setActionAlert] = useState(null);

  // Class defaults for Add & Bulk Upload based on current filter selection
  const currentClassDefaults = useMemo(() => {
    return {
      degree: selectedDegree !== 'All Programs' ? selectedDegree : 'BS Computer Science',
      semester: selectedSemester !== 'All Semesters' ? selectedSemester : '1st',
      session: selectedSession !== 'All Shifts' ? selectedSession : 'Morning',
      section: selectedSection !== 'All Sections' ? selectedSection : 'A',
      academicSession: '2023-2027',
    };
  }, [selectedDegree, selectedSemester, selectedSession, selectedSection]);

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const res = await API.get('/students/stats');
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error('Error fetching student stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit,
        search: search.trim() || undefined,
        degree: selectedDegree !== 'All Programs' ? selectedDegree : undefined,
        semester: selectedSemester !== 'All Semesters' ? selectedSemester : undefined,
        session: selectedSession !== 'All Shifts' ? selectedSession : undefined,
        section: selectedSection !== 'All Sections' ? selectedSection : undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
      };

      const res = await API.get('/students', { params });
      if (res.data.success) {
        setStudents(res.data.data);
        setTotalPages(res.data.pagination.totalPages);
        setTotalCount(res.data.pagination.total);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
      setActionAlert({ type: 'error', message: 'Failed to load student list' });
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, search, selectedDegree, selectedSemester, selectedSession, selectedSection, selectedStatus]);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(students.map((s) => s._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleDeleteStudent = async (student) => {
    if (!window.confirm(`Are you sure you want to delete student "${student.name}" (${student.regNo})?`)) {
      return;
    }

    try {
      const res = await API.delete(`/students/${student._id}`);
      if (res.data.success) {
        setActionAlert({ type: 'success', message: res.data.message });
        fetchStudents();
        fetchStats();
        setSelectedIds((prev) => prev.filter((id) => id !== student._id));
      }
    } catch (err) {
      console.error('Delete student error:', err);
      setActionAlert({ type: 'error', message: err.response?.data?.message || 'Failed to delete student' });
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} selected students? This action cannot be undone.`)) {
      return;
    }

    setBulkDeleting(true);
    try {
      const res = await API.post('/students/bulk-delete', { ids: selectedIds });
      if (res.data.success) {
        setActionAlert({ type: 'success', message: res.data.message });
        setSelectedIds([]);
        fetchStudents();
        fetchStats();
      }
    } catch (err) {
      console.error('Bulk delete error:', err);
      setActionAlert({ type: 'error', message: 'Failed to delete selected students' });
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleExportFiltered = async () => {
    try {
      const title = `Class_Students_${selectedDegree !== 'All Programs' ? selectedDegree : 'All'}_${selectedSemester !== 'All Semesters' ? selectedSemester : ''}_${selectedSession !== 'All Shifts' ? selectedSession : ''}`;
      await exportStudentsToExcel(students, title);
    } catch (err) {
      console.error('Export error:', err);
      setActionAlert({ type: 'error', message: 'Failed to export Excel file' });
    }
  };

  const handleDownloadSample = async () => {
    try {
      await downloadSampleTemplate(currentClassDefaults);
    } catch (err) {
      console.error('Download template error:', err);
      setActionAlert({ type: 'error', message: 'Failed to download template' });
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col gap-4 border-b border-[#d5e1ec] pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase text-[#0e7490]">
            <span className="h-px w-7 bg-[#0e7490]" /> Academic Directory / Class Enrollment
          </p>
          <h2 className="text-2xl font-extrabold text-[#17243b] sm:text-3xl">Students Management</h2>
          <p className="mt-1.5 text-sm text-[#69788d]">
            Enroll individual students, bulk import entire classes via Excel sheets, and organize class rosters.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleDownloadSample}
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-[#cbd5e1] bg-white px-3 text-xs font-bold text-[#475569] shadow-xs transition hover:bg-[#f8fafc] hover:text-[#17243b]"
            title="Download formatted sample Excel sheet"
          >
            <Download className="h-3.5 w-3.5 text-[#0e7490]" />
            <span>Excel Template</span>
          </button>

          <button
            type="button"
            onClick={() => setIsBulkOpen(true)}
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-[#0e7490] bg-[#eef8fa] px-3.5 text-xs font-bold text-[#0e7490] shadow-xs transition hover:bg-[#0e7490] hover:text-white"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Upload Class Excel</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-[#1e3a8a] px-4 text-xs font-bold text-white shadow-xs transition hover:bg-[#172e6e]"
          >
            <Plus className="h-4 w-4" />
            <span>Add Student (1 by 1)</span>
          </button>
        </div>
      </div>

      {/* Action Alert Banner */}
      {actionAlert && (
        <div
          className={`flex items-center justify-between rounded-lg border px-4 py-3 text-xs font-semibold ${
            actionAlert.type === 'error'
              ? 'border-rose-200 bg-rose-50 text-rose-800'
              : 'border-emerald-200 bg-emerald-50 text-emerald-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionAlert.type === 'error' ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
            <span>{actionAlert.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionAlert(null)}
            className="text-[11px] font-bold underline opacity-80 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ── Stats Overview ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-[#dce5ef] bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-[#69788d]">Total Enrolled</p>
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
              <GraduationCap className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-extrabold text-[#17243b]">
            {statsLoading ? '–' : stats.total?.toLocaleString()}
          </p>
          <span className="mt-1 text-[11px] font-semibold text-emerald-700">
            {stats.active} active students
          </span>
        </div>

        <div className="rounded-lg border border-[#dce5ef] bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-[#69788d]">Morning Shift</p>
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-50 text-amber-600">
              <Sun className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-extrabold text-[#17243b]">
            {statsLoading ? '–' : stats.morning?.toLocaleString()}
          </p>
          <span className="mt-1 text-[11px] text-[#64748b]">Morning Sections</span>
        </div>

        <div className="rounded-lg border border-[#dce5ef] bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-[#69788d]">Evening Shift</p>
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-50 text-indigo-600">
              <Moon className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-extrabold text-[#17243b]">
            {statsLoading ? '–' : stats.evening?.toLocaleString()}
          </p>
          <span className="mt-1 text-[11px] text-[#64748b]">Evening Sections</span>
        </div>

        <div className="rounded-lg border border-[#dce5ef] bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-[#69788d]">Active Programs</p>
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-cyan-50 text-cyan-700">
              <Users className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-extrabold text-[#17243b]">
            {statsLoading ? '–' : Object.keys(stats.byDegree || {}).length || 5}
          </p>
          <span className="mt-1 text-[11px] text-[#64748b]">CS, SE, AI, IT, DS</span>
        </div>
      </div>

      {/* ── Filters & Search Bar ── */}
      <div className="rounded-xl border border-[#dce5ef] bg-white p-4 shadow-xs space-y-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#94a3b8]" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by Roll No, Name, CNIC, Phone..."
              className="w-full rounded-md border border-[#cbd5e1] bg-[#f8fafc] py-2 pl-9 pr-4 text-xs font-medium text-[#1e293b] outline-none transition focus:border-[#0e7490] focus:bg-white focus:ring-1 focus:ring-[#0e7490]"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-2.5 text-xs text-[#94a3b8] hover:text-[#1e293b]"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick class actions */}
          <div className="flex flex-wrap items-center gap-2">
            {selectedIds.length > 0 && (
              <button
                type="button"
                onClick={handleBulkDelete}
                disabled={bulkDeleting}
                className="inline-flex items-center gap-1.5 rounded-md bg-rose-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-rose-700 disabled:opacity-60"
              >
                {bulkDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                <span>Delete Selected ({selectedIds.length})</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleExportFiltered}
              disabled={students.length === 0}
              className="inline-flex items-center gap-1.5 rounded-md border border-[#cbd5e1] bg-white px-3 py-1.5 text-xs font-semibold text-[#334155] shadow-xs hover:bg-[#f8fafc] disabled:opacity-50"
              title="Export current filtered view to Excel"
            >
              <Download className="h-3.5 w-3.5 text-[#0e7490]" />
              <span>Export to Excel</span>
            </button>

            <button
              type="button"
              onClick={() => {
                fetchStudents();
                fetchStats();
              }}
              className="inline-flex items-center gap-1 rounded-md border border-[#cbd5e1] bg-white p-1.5 text-xs text-[#64748b] hover:bg-[#f8fafc]"
              title="Refresh student records"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5 border-t border-[#f1f5f9] pt-3">
          <div>
            <label className="text-[10px] font-bold uppercase text-[#64748b]">Program</label>
            <select
              value={selectedDegree}
              onChange={(e) => {
                setSelectedDegree(e.target.value);
                setCurrentPage(1);
              }}
              className="mt-1 w-full rounded-md border border-[#cbd5e1] bg-[#f8fafc] px-2.5 py-1.5 text-xs font-medium text-[#1e293b] outline-none"
            >
              {DEGREES.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-[#64748b]">Semester</label>
            <select
              value={selectedSemester}
              onChange={(e) => {
                setSelectedSemester(e.target.value);
                setCurrentPage(1);
              }}
              className="mt-1 w-full rounded-md border border-[#cbd5e1] bg-[#f8fafc] px-2.5 py-1.5 text-xs font-medium text-[#1e293b] outline-none"
            >
              {SEMESTERS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-[#64748b]">Shift</label>
            <select
              value={selectedSession}
              onChange={(e) => {
                setSelectedSession(e.target.value);
                setCurrentPage(1);
              }}
              className="mt-1 w-full rounded-md border border-[#cbd5e1] bg-[#f8fafc] px-2.5 py-1.5 text-xs font-medium text-[#1e293b] outline-none"
            >
              {SESSIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-[#64748b]">Section</label>
            <select
              value={selectedSection}
              onChange={(e) => {
                setSelectedSection(e.target.value);
                setCurrentPage(1);
              }}
              className="mt-1 w-full rounded-md border border-[#cbd5e1] bg-[#f8fafc] px-2.5 py-1.5 text-xs font-medium text-[#1e293b] outline-none"
            >
              {SECTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-[#64748b]">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="mt-1 w-full rounded-md border border-[#cbd5e1] bg-[#f8fafc] px-2.5 py-1.5 text-xs font-medium text-[#1e293b] outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
              <option value="Passed Out">Passed Out</option>
              <option value="Dropped">Dropped</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Students Data Table ── */}
      <div className="rounded-xl border border-[#dce5ef] bg-white shadow-xs overflow-hidden">
        <div className="flex items-center justify-between border-b border-[#e3eaf1] bg-[#f8fafc] px-5 py-3">
          <div>
            <span className="text-xs font-bold text-[#17243b]">Enrolled Class Directory</span>
            <span className="ml-2 rounded-full bg-[#e2e8f0] px-2 py-0.5 text-[11px] font-semibold text-[#475569]">
              {totalCount} students found
            </span>
          </div>
          {selectedIds.length > 0 && (
            <span className="text-xs font-bold text-[#1e3a8a]">
              {selectedIds.length} of {students.length} selected
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-xs">
            <thead className="border-b border-[#e2e8f0] bg-[#f1f5f9] text-[11px] font-bold uppercase tracking-wider text-[#475569]">
              <tr>
                <th className="w-10 p-3 text-center">
                  <input
                    type="checkbox"
                    checked={students.length > 0 && selectedIds.length === students.length}
                    onChange={handleSelectAll}
                    className="accent-[#1e3a8a]"
                  />
                </th>
                <th className="p-3">Roll / Reg No</th>
                <th className="p-3">Student Name</th>
                <th className="p-3">Enrolled Class</th>
                <th className="p-3">Batch</th>
                <th className="p-3">Contact</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf1f5] text-[#334155]">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-xs text-[#64748b]">
                    <Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin text-[#0e7490]" />
                    <span>Loading student records...</span>
                  </td>
                </tr>
              ) : students.length > 0 ? (
                students.map((student) => {
                  const isSelected = selectedIds.includes(student._id);
                  return (
                    <tr
                      key={student._id}
                      className={`transition-colors hover:bg-[#f8fafc] ${isSelected ? 'bg-cyan-50/50' : ''}`}
                    >
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectOne(student._id)}
                          className="accent-[#1e3a8a]"
                        />
                      </td>

                      {/* Reg No */}
                      <td className="p-3 font-mono font-bold text-[#1e3a8a]">
                        <span className="rounded-sm bg-blue-50 px-2 py-0.5 border border-blue-200">
                          {student.regNo || student.registrationNo || '—'}
                        </span>
                      </td>

                      {/* Name */}
                      <td className="p-3">
                        <p className="font-bold text-[#17243b]">{student.name}</p>
                        {student.fatherName && (
                          <p className="text-[11px] text-[#64748b]">S/D of {student.fatherName}</p>
                        )}
                      </td>

                      {/* Class */}
                      <td className="p-3">
                        <p className="font-semibold text-[#0e7490]">{student.degree}</p>
                        <p className="text-[11px] text-[#64748b]">
                          {student.semester || student.semesterNumber || '1st'} Sem · {student.session} (Sec {student.section})
                        </p>
                      </td>

                      {/* Batch */}
                      <td className="p-3 font-mono text-[11px] text-[#475569]">
                        {student.academicSession || '2023-2027'}
                      </td>

                      {/* Contact */}
                      <td className="p-3">
                        <p className="text-xs text-[#1e293b]">{student.phone || '—'}</p>
                        <p className="text-[11px] text-[#64748b]">{student.email || '—'}</p>
                      </td>

                      {/* Status */}
                      <td className="p-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            student.status === 'Active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : student.status === 'Suspended'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {student.status || 'Active'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setViewingStudent(student)}
                            className="rounded p-1 text-[#64748b] transition hover:bg-[#edf2f7] hover:text-[#0e7490]"
                            title="View student profile"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingStudent(student)}
                            className="rounded p-1 text-[#64748b] transition hover:bg-[#edf2f7] hover:text-[#1e3a8a]"
                            title="Edit student"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteStudent(student)}
                            className="rounded p-1 text-[#64748b] transition hover:bg-rose-50 hover:text-rose-600"
                            title="Delete student"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="py-16 text-center">
                    <GraduationCap className="mx-auto mb-2 h-10 w-10 text-[#94a3b8]" />
                    <p className="text-sm font-bold text-[#334155]">No students found</p>
                    <p className="mt-1 text-xs text-[#64748b]">
                      No student records match your current filter or search criteria.
                    </p>
                    <div className="mt-4 flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsAddOpen(true)}
                        className="rounded-md bg-[#1e3a8a] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#172e6e]"
                      >
                        Enroll 1 Student
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsBulkOpen(true)}
                        className="rounded-md border border-[#0e7490] bg-[#eef8fa] px-3.5 py-1.5 text-xs font-bold text-[#0e7490] hover:bg-[#0e7490] hover:text-white"
                      >
                        Upload Class Excel
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ── Table Footer & Pagination ── */}
        <div className="flex flex-col gap-3 border-t border-[#e2e8f0] bg-[#f8fafc] p-4 sm:flex-row sm:items-center sm:justify-between text-xs text-[#475569]">
          <div className="flex items-center gap-3">
            <span>
              Page <strong className="text-[#17243b]">{currentPage}</strong> of{' '}
              <strong className="text-[#17243b]">{totalPages}</strong> ({totalCount} students)
            </span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="rounded border border-[#cbd5e1] bg-white px-2 py-1 text-xs"
            >
              <option value="25">25 per page</option>
              <option value="50">50 per page</option>
              <option value="100">100 per page</option>
              <option value="200">200 per page</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1 || loading}
              className="inline-flex items-center gap-1 rounded border border-[#cbd5e1] bg-white px-2.5 py-1.5 font-semibold hover:bg-[#f1f5f9] disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages || loading}
              className="inline-flex items-center gap-1 rounded border border-[#cbd5e1] bg-white px-2.5 py-1.5 font-semibold hover:bg-[#f1f5f9] disabled:opacity-50"
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      <AddStudentModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={() => {
          fetchStudents();
          fetchStats();
        }}
        initialClass={currentClassDefaults}
      />

      <BulkExcelUploadModal
        isOpen={isBulkOpen}
        onClose={() => setIsBulkOpen(false)}
        onSuccess={() => {
          fetchStudents();
          fetchStats();
        }}
        initialClass={currentClassDefaults}
      />

      <EditStudentModal
        isOpen={Boolean(editingStudent)}
        onClose={() => setEditingStudent(null)}
        student={editingStudent}
        onSuccess={() => {
          fetchStudents();
          fetchStats();
        }}
      />

      <StudentDetailsModal
        isOpen={Boolean(viewingStudent)}
        onClose={() => setViewingStudent(null)}
        student={viewingStudent}
      />
    </div>
  );
};

export default AdminStudentsPanel;

