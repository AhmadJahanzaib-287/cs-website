import React, { useState } from 'react';
import { X, UserPlus, CheckCircle, AlertCircle, Loader2, GraduationCap, Building2, Phone, User, Mail, ShieldAlert } from 'lucide-react';
import API from '../../api/axios';

const DEGREES = [
  'BS Computer Science',
  'BS Software Engineering',
  'BS Artificial Intelligence',
  'BS Information Technology',
  'BS Data Science',
  'MS Computer Science',
];

const SEMESTERS = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];
const SESSIONS = ['Morning', 'Evening'];
const SECTIONS = ['A', 'B', 'C', 'D'];
const BATCHES = ['2021-2025', '2022-2026', '2023-2027', '2024-2028', '2025-2029', '2026-2030'];

const AddStudentModal = ({ isOpen, onClose, onSuccess, initialClass = {} }) => {
  const [formData, setFormData] = useState({
    regNo: '',
    name: '',
    fatherName: '',
    email: '',
    phone: '',
    degree: initialClass.degree || 'BS Computer Science',
    academicSession: initialClass.academicSession || '2023-2027',
    semester: initialClass.semester || '1st',
    session: initialClass.session || 'Morning',
    section: initialClass.section || 'A',
    gender: 'Male',
    cnic: '',
    guardianPhone: '',
    address: '',
    status: 'Active',
    cgpa: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!formData.regNo.trim()) {
      setError('Registration / Roll Number is required');
      return;
    }
    if (!formData.name.trim()) {
      setError('Student Name is required');
      return;
    }

    setLoading(true);
    try {
      const response = await API.post('/students', formData);
      if (response.data.success) {
        setSuccessMsg(`Student "${formData.name}" added successfully!`);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1200);
      }
    } catch (err) {
      console.error('Error adding student:', err);
      setError(err.response?.data?.message || 'Failed to add student. Please check input values.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#10203d]/60 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-[#dce5ef] bg-white shadow-2xl transition-all"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#e3eaf1] bg-[#f8fafc] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1e3a8a] text-white">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#17243b]">Enroll Student (1 by 1)</h2>
              <p className="text-xs text-[#69788d]">Add an individual student directly into a target class</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-md p-1.5 text-[#69788d] transition hover:bg-[#edf2f7] hover:text-[#17243b] disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="flex items-center gap-2.5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-800">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800">
              <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Section 1: Class Assignment */}
          <div className="rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-4">
            <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0e7490]">
              <GraduationCap className="h-4 w-4" />
              <span>Target Class & Academic Program</span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#475569]">Degree / Program *</label>
                <select
                  name="degree"
                  value={formData.degree}
                  onChange={handleChange}
                  required
                  className="w-full rounded-md border border-[#cbd5e1] bg-white px-3 py-2 text-xs font-medium text-[#1e293b] outline-none transition focus:border-[#0e7490] focus:ring-1 focus:ring-[#0e7490]"
                >
                  {DEGREES.map((deg) => (
                    <option key={deg} value={deg}>{deg}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-[#475569]">Semester *</label>
                <select
                  name="semester"
                  value={formData.semester}
                  onChange={handleChange}
                  required
                  className="w-full rounded-md border border-[#cbd5e1] bg-white px-3 py-2 text-xs font-medium text-[#1e293b] outline-none transition focus:border-[#0e7490] focus:ring-1 focus:ring-[#0e7490]"
                >
                  {SEMESTERS.map((sem) => (
                    <option key={sem} value={sem}>{sem} Semester</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-[#475569]">Shift / Session *</label>
                <select
                  name="session"
                  value={formData.session}
                  onChange={handleChange}
                  required
                  className="w-full rounded-md border border-[#cbd5e1] bg-white px-3 py-2 text-xs font-medium text-[#1e293b] outline-none transition focus:border-[#0e7490] focus:ring-1 focus:ring-[#0e7490]"
                >
                  {SESSIONS.map((sess) => (
                    <option key={sess} value={sess}>{sess}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-[#475569]">Section *</label>
                <select
                  name="section"
                  value={formData.section}
                  onChange={handleChange}
                  className="w-full rounded-md border border-[#cbd5e1] bg-white px-3 py-2 text-xs font-medium text-[#1e293b] outline-none transition focus:border-[#0e7490] focus:ring-1 focus:ring-[#0e7490]"
                >
                  {SECTIONS.map((sec) => (
                    <option key={sec} value={sec}>Section {sec}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-[#475569]">Batch / Session Years</label>
                <select
                  name="academicSession"
                  value={formData.academicSession}
                  onChange={handleChange}
                  className="w-full rounded-md border border-[#cbd5e1] bg-white px-3 py-2 text-xs font-medium text-[#1e293b] outline-none transition focus:border-[#0e7490] focus:ring-1 focus:ring-[#0e7490]"
                >
                  {BATCHES.map((batch) => (
                    <option key={batch} value={batch}>{batch}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-[#475569]">Enrollment Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full rounded-md border border-[#cbd5e1] bg-white px-3 py-2 text-xs font-medium text-[#1e293b] outline-none transition focus:border-[#0e7490] focus:ring-1 focus:ring-[#0e7490]"
                >
                  <option value="Active">Active / Enrolled</option>
                  <option value="Suspended">Suspended</option>
                  <option value="Passed Out">Passed Out</option>
                  <option value="Dropped">Dropped</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Student Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1e3a8a]">
              <User className="h-4 w-4" />
              <span>Student Personal Details</span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#475569]">
                  Roll No / Registration No * <span className="font-normal text-[#94a3b8]">(e.g. 2023-AG-1234)</span>
                </label>
                <input
                  type="text"
                  name="regNo"
                  required
                  placeholder="2023-AG-8001"
                  value={formData.regNo}
                  onChange={handleChange}
                  className="w-full rounded-md border border-[#cbd5e1] px-3 py-2 text-xs font-semibold uppercase text-[#1e293b] outline-none transition focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a]"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-[#475569]">Student Full Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Muhammad Ali"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full rounded-md border border-[#cbd5e1] px-3 py-2 text-xs font-medium text-[#1e293b] outline-none transition focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a]"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-[#475569]">Father's Name</label>
                <input
                  type="text"
                  name="fatherName"
                  placeholder="Tariq Mehmood"
                  value={formData.fatherName}
                  onChange={handleChange}
                  className="w-full rounded-md border border-[#cbd5e1] px-3 py-2 text-xs font-medium text-[#1e293b] outline-none transition focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a]"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-[#475569]">Gender</label>
                <div className="flex gap-4 pt-1 text-xs">
                  {['Male', 'Female', 'Other'].map((g) => (
                    <label key={g} className="flex cursor-pointer items-center gap-1.5 font-medium text-[#334155]">
                      <input
                        type="radio"
                        name="gender"
                        value={g}
                        checked={formData.gender === g}
                        onChange={handleChange}
                        className="text-[#1e3a8a] accent-[#1e3a8a]"
                      />
                      <span>{g}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-[#475569]">CNIC / B-Form Number</label>
                <input
                  type="text"
                  name="cnic"
                  placeholder="33100-1234567-1"
                  value={formData.cnic}
                  onChange={handleChange}
                  className="w-full rounded-md border border-[#cbd5e1] px-3 py-2 text-xs font-medium text-[#1e293b] outline-none transition focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a]"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-[#475569]">CGPA / Prior Marks</label>
                <input
                  type="text"
                  name="cgpa"
                  placeholder="3.65 / 4.00"
                  value={formData.cgpa}
                  onChange={handleChange}
                  className="w-full rounded-md border border-[#cbd5e1] px-3 py-2 text-xs font-medium text-[#1e293b] outline-none transition focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a]"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Contact Details */}
          <div className="space-y-4 border-t border-[#f1f5f9] pt-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#52647b]">
              <Phone className="h-4 w-4" />
              <span>Contact Information</span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#475569]">Student Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="student@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-md border border-[#cbd5e1] px-3 py-2 text-xs font-medium text-[#1e293b] outline-none transition focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a]"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-[#475569]">Phone / Mobile</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="0300-1234567"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full rounded-md border border-[#cbd5e1] px-3 py-2 text-xs font-medium text-[#1e293b] outline-none transition focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a]"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-[#475569]">Guardian / Father Phone</label>
                <input
                  type="tel"
                  name="guardianPhone"
                  placeholder="0301-9876543"
                  value={formData.guardianPhone}
                  onChange={handleChange}
                  className="w-full rounded-md border border-[#cbd5e1] px-3 py-2 text-xs font-medium text-[#1e293b] outline-none transition focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a]"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="mb-1 block text-xs font-semibold text-[#475569]">Permanent Address / City</label>
                <input
                  type="text"
                  name="address"
                  placeholder="Sub Campus PARS, Jhang Road, Faisalabad"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full rounded-md border border-[#cbd5e1] px-3 py-2 text-xs font-medium text-[#1e293b] outline-none transition focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a]"
                />
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-[#e2e8f0] pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-md border border-[#cbd5e1] bg-white px-4 py-2 text-xs font-semibold text-[#475569] transition hover:bg-[#f1f5f9] disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-md bg-[#1e3a8a] px-5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#172e6e] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Enrolling Student...</span>
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  <span>Enroll Student</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStudentModal;

