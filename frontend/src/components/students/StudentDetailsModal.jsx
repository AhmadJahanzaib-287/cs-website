import React from 'react';
import { X, GraduationCap, Mail, Phone, MapPin, Calendar, Clock, User, ShieldCheck } from 'lucide-react';

const StudentDetailsModal = ({ isOpen, onClose, student }) => {
  if (!isOpen || !student) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#10203d]/60 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-[#dce5ef] bg-white shadow-2xl transition-all"
      >
        <div className="flex items-center justify-between border-b border-[#e3eaf1] bg-[#172e6e] px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-lg font-bold">
              {student.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-base font-bold leading-tight">{student.name}</h2>
              <p className="font-mono text-xs text-cyan-200">{student.regNo || student.registrationNo}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-white/70 hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-xs text-[#334155]">
          {/* Class Banner */}
          <div className="rounded-lg border border-[#b9e0e8] bg-[#eef8fa] p-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase text-[#0e7490]">Enrolled Program</p>
              <h3 className="mt-0.5 text-sm font-extrabold text-[#17243b]">{student.degree}</h3>
              <p className="mt-0.5 text-xs text-[#52647b]">
                {student.semester || student.semesterNumber || '1st'} Semester · Section {student.section} · {student.session} Shift
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-white border border-[#b9e0e8] px-2.5 py-1 text-xs font-bold text-[#1e3a8a]">
                Batch {student.academicSession || '2023-2027'}
              </span>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${student.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                {student.status || 'Active'}
              </span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-3 rounded-lg border border-[#e2e8f0] p-4">
              <p className="font-bold uppercase text-[10px] text-[#64748b]">Identity & Demographics</p>
              <div>
                <span className="text-[#64748b]">Father Name:</span>
                <p className="font-semibold text-[#1e293b]">{student.fatherName || '—'}</p>
              </div>
              <div>
                <span className="text-[#64748b]">Gender:</span>
                <p className="font-semibold text-[#1e293b]">{student.gender || '—'}</p>
              </div>
              <div>
                <span className="text-[#64748b]">CNIC / B-Form:</span>
                <p className="font-semibold text-[#1e293b]">{student.cnic || '—'}</p>
              </div>
              {student.cgpa && (
                <div>
                  <span className="text-[#64748b]">CGPA:</span>
                  <p className="font-semibold text-[#0e7490]">{student.cgpa}</p>
                </div>
              )}
            </div>

            <div className="space-y-3 rounded-lg border border-[#e2e8f0] p-4">
              <p className="font-bold uppercase text-[10px] text-[#64748b]">Contact & Residence</p>
              <div>
                <span className="text-[#64748b]">Student Phone:</span>
                <p className="font-semibold text-[#1e293b]">{student.phone || '—'}</p>
              </div>
              <div>
                <span className="text-[#64748b]">Email Address:</span>
                <p className="font-semibold text-[#1e293b]">{student.email || '—'}</p>
              </div>
              <div>
                <span className="text-[#64748b]">Guardian Phone:</span>
                <p className="font-semibold text-[#1e293b]">{student.guardianPhone || '—'}</p>
              </div>
              <div>
                <span className="text-[#64748b]">Address / Domicile:</span>
                <p className="font-semibold text-[#1e293b]">{student.address || '—'}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-[#f1f5f9] pt-3 text-[11px] text-[#94a3b8]">
            <span>Record created: {new Date(student.createdAt).toLocaleDateString()}</span>
            <span>Last modified: {new Date(student.updatedAt).toLocaleDateString()}</span>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md bg-[#1e3a8a] px-4 py-2 text-xs font-bold text-white hover:bg-[#172e6e]"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetailsModal;

