import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Loader2, GraduationCap, User, Phone, CheckCircle } from 'lucide-react';
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

const EditStudentModal = ({ isOpen, onClose, student, onSuccess }) => {
  const [formData, setFormData] = useState({
    regNo: '',
    name: '',
    fatherName: '',
    email: '',
    phone: '',
    degree: 'BS Computer Science',
    academicSession: '2023-2027',
    semester: '1st',
    session: 'Morning',
    section: 'A',
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

  useEffect(() => {
    if (student) {
      setFormData({
        regNo: student.regNo || student.registrationNo || '',
        name: student.name || '',
        fatherName: student.fatherName || '',
        email: student.email || '',
        phone: student.phone || '',
        degree: student.degree || 'BS Computer Science',
        academicSession: student.academicSession || '2023-2027',
        semester: student.semester || student.semesterNumber || '1st',
        session: student.session || 'Morning',
        section: student.section || 'A',
        gender: student.gender || 'Male',
        cnic: student.cnic || '',
        guardianPhone: student.guardianPhone || '',
        address: student.address || '',
        status: student.status || 'Active',
        cgpa: student.cgpa || '',
      });
      setError(null);
      setSuccessMsg(null);
    }
  }, [student]);

  if (!isOpen || !student) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.regNo.trim()) {
      setError('Registration No and Name are required');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await API.put(`/students/${student._id}`, formData);
      if (response.data.success) {
        setSuccessMsg('Student record updated successfully');
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1000);
      }
    } catch (err) {
      console.error('Update student error:', err);
      setError(err.response?.data?.message || 'Failed to update student');
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
        <div className="flex items-center justify-between border-b border-[#e3eaf1] bg-[#f8fafc] px-6 py-4">
          <div>
            <h2 className="text-base font-bold text-[#17243b]">Edit Student Profile</h2>
            <p className="text-xs text-[#69788d]">Updating record for {student.name} ({student.regNo})</p>
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

          {/* Class details */}
          <div className="rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-4">
            <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0e7490]">
              <GraduationCap className="h-4 w-4" />
              <span>Class & Enrollment Details</span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#475569]">Degree / Program *</label>
                <select
                  name="degree"
                  value={formData.degree}
                  onChange={handleChange}
                  className="w-full rounded-md border border-[#cbd5e1] bg-white px-3 py-2 text-xs font-medium text-[#1e293b]"
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
                  className="w-full rounded-md border border-[#cbd5e1] bg-white px-3 py-2 text-xs font-medium text-[#1e293b]"
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
                  className="w-full rounded-md border border-[#cbd5e1] bg-white px-3 py-2 text-xs font-medium text-[#1e293b]"
                >
                  {SESSIONS.map((sess) => (
                    <option key={sess} value={sess}>{sess}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-[#475569]">Section</label>
                <select
                  name="section"
                  value={formData.section}
                  onChange={handleChange}
                  className="w-full rounded-md border border-[#cbd5e1] bg-white px-3 py-2 text-xs font-medium text-[#1e293b]"
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
                  className="w-full rounded-md border border-[#cbd5e1] bg-white px-3 py-2 text-xs font-medium text-[#1e293b]"
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
                  className="w-full rounded-md border border-[#cbd5e1] bg-white px-3 py-2 text-xs font-medium text-[#1e293b]"
                >
                  <option value="Active">Active</option>
                  <option value="Suspended">Suspended</option>
                  <option value="Passed Out">Passed Out</option>
                  <option value="Dropped">Dropped</option>
                </select>
              </div>
            </div>
          </div>

          {/* Student Info */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#475569]">Roll No / Reg No *</label>
              <input
                type="text"
                name="regNo"
                value={formData.regNo}
                onChange={handleChange}
                className="w-full rounded-md border border-[#cbd5e1] px-3 py-2 text-xs font-semibold uppercase text-[#1e293b]"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-[#475569]">Student Full Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full rounded-md border border-[#cbd5e1] px-3 py-2 text-xs font-medium text-[#1e293b]"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-[#475569]">Father's Name</label>
              <input
                type="text"
                name="fatherName"
                value={formData.fatherName}
                onChange={handleChange}
                className="w-full rounded-md border border-[#cbd5e1] px-3 py-2 text-xs font-medium text-[#1e293b]"
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
              <label className="mb-1 block text-xs font-semibold text-[#475569]">Phone / Mobile</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full rounded-md border border-[#cbd5e1] px-3 py-2 text-xs font-medium text-[#1e293b]"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-[#475569]">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-md border border-[#cbd5e1] px-3 py-2 text-xs font-medium text-[#1e293b]"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-[#475569]">CNIC / B-Form</label>
              <input
                type="text"
                name="cnic"
                value={formData.cnic}
                onChange={handleChange}
                className="w-full rounded-md border border-[#cbd5e1] px-3 py-2 text-xs font-medium text-[#1e293b]"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-[#475569]">Guardian Phone</label>
              <input
                type="text"
                name="guardianPhone"
                value={formData.guardianPhone}
                onChange={handleChange}
                className="w-full rounded-md border border-[#cbd5e1] px-3 py-2 text-xs font-medium text-[#1e293b]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-[#475569]">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full rounded-md border border-[#cbd5e1] px-3 py-2 text-xs font-medium text-[#1e293b]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-[#e2e8f0] pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-md border border-[#cbd5e1] bg-white px-4 py-2 text-xs font-semibold text-[#475569] hover:bg-[#f1f5f9]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-md bg-[#1e3a8a] px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#172e6e] disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditStudentModal;

