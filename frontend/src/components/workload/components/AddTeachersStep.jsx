import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, ArrowRight, PlusCircle, X, Loader2 } from 'lucide-react';
import axios from 'axios';
import ReusableComboBox from './ReusableComboBox';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const designationOptions = ['Mr.', 'Ms.', 'Dr.', 'Prof.'];

export default function AddTeachersStep({ workload, onNext, onBack, onClose }) {
  const [masterTeachers, setMasterTeachers] = useState([]);
  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('Mr.');

  const [selected, setSelected] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [masterRes, selectedRes] = await Promise.all([
          axios.get(`${API_URL}/api/v1/workload/teachers/master`, { withCredentials: true }),
          axios.get(`${API_URL}/api/v1/workload/${workload._id}/teachers`, {
            withCredentials: true,
          }),
        ]);

        if (masterRes.data.success) setMasterTeachers(masterRes.data.teachers);

        if (selectedRes.data.success) {
          setSelected(
            selectedRes.data.workloadTeachers.map((wt) => ({
              linkId: wt._id,
              teacherId: wt.teacherId._id,
              name: wt.teacherId.name,
              designation: wt.teacherId.designation,
              isNew: false,
            }))
          );
        }
      } catch (err) {
        console.error('[Fetch Teachers Error]:', err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [workload._id]);

  const teacherNameOptions = masterTeachers.map((t) => t.name);

  const handleAddTeacher = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Please enter a teacher name.');
      return;
    }

    const alreadyAdded = selected.some(
      (s) => s.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (alreadyAdded) {
      setError('This teacher is already added.');
      return;
    }

    const existingTeacher = masterTeachers.find(
      (t) => t.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (existingTeacher) {
      setSelected((prev) => [
        ...prev,
        {
          tempId: crypto.randomUUID(),
          teacherId: existingTeacher._id,
          name: existingTeacher.name,
          designation: existingTeacher.designation,
          isNew: false,
        },
      ]);
    } else {
      setSelected((prev) => [
        ...prev,
        {
          tempId: crypto.randomUUID(),
          name: trimmedName,
          designation,
          isNew: true,
        },
      ]);
    }

    setName('');
    setError('');
  };

  const handleRemove = async (item) => {
    if (item.linkId) {
      try {
        await axios.delete(`${API_URL}/api/v1/workload/teachers/${item.linkId}`, {
          withCredentials: true,
        });
      } catch (err) {
        console.error('[Remove Teacher Error]:', err.message);
        return;
      }
    }
    setSelected((prev) =>
      prev.filter((s) => (s.linkId ? s.linkId !== item.linkId : s.tempId !== item.tempId))
    );
  };

  const handleSaveAndNext = async () => {
    if (selected.length === 0) {
      setError('Please add at least one teacher before continuing.');
      return;
    }

    const unsaved = selected.filter((s) => !s.linkId);

    setIsSaving(true);
    setError('');

    try {
      if (unsaved.length > 0) {
        const teacherIds = unsaved.filter((s) => !s.isNew).map((s) => s.teacherId);
        const newTeachers = unsaved
          .filter((s) => s.isNew)
          .map((s) => ({ name: s.name, designation: s.designation }));

        const { data } = await axios.post(
          `${API_URL}/api/v1/workload/${workload._id}/teachers`,
          { teacherIds, newTeachers },
          { withCredentials: true }
        );

        if (data.success) {
          onNext?.(data.workload);
          return;
        }
      } else {
        const { data: updated } = await axios.put(
          `${API_URL}/api/v1/workload/${workload._id}`,
          { currentStep: 3 },
          { withCredentials: true }
        );
        onNext?.(updated.success ? updated.workload : workload);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong while saving teachers.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#10203d]/50 p-3 backdrop-blur-sm sm:p-5">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="max-h-[calc(100dvh-1.5rem)] w-full max-w-5xl overflow-y-auto rounded-xl border border-[#dce5ef] bg-white text-[#25354d] shadow-2xl sm:max-h-[calc(100dvh-2.5rem)]"
      >
        {/* Header - Identical Height & Padding */}
        <div className="flex items-center justify-between border-b border-[#e3eaf1] bg-[#f7fafc] px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3.5">
            <div className="rounded-lg border border-[#dce5ef] bg-white p-2.5 text-[#1e3a8a]">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 tracking-tight">
                Add Teachers
              </h3>
              <p className="text-xs text-gray-500 font-medium">
                Select existing faculty or add a new teacher for this semester.
              </p>
            </div>
          </div>
          {onClose && (
            <button type="button" onClick={onClose} aria-label="Close workload setup" title="Close workload setup" className="rounded-md p-2 text-[#69788d] transition hover:bg-white hover:text-[#17243b]">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content Body - Equal Padding & Structure */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start flex-1">
          {/* Left Form Controls */}
          <div className="lg:col-span-7 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr] gap-3.5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                  Teacher Name
                </label>
                <ReusableComboBox
                  value={name}
                  onChange={setName}
                  options={teacherNameOptions}
                  placeholder="Search or type name..."
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                  Designation
                </label>
                <ReusableComboBox
                  value={designation}
                  onChange={setDesignation}
                  options={designationOptions}
                  placeholder="Designation..."
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddTeacher}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100/70 text-[#1e3a8a] text-sm font-bold transition cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" /> Add Teacher
            </button>

            {error && (
              <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-100 rounded-xl px-3.5 py-2">
                {error}
              </p>
            )}
          </div>

          {/* Right Selected Teachers Panel - Matching Height */}
          <div className="lg:col-span-5 min-h-[190px] rounded-lg border border-[#dce5ef] bg-[#f7fafc] p-4">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200/60">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Selected Teachers
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#1e3a8a]">
                {selected.length}
              </span>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-6 text-gray-400 text-xs font-medium">
                <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading...
              </div>
            ) : selected.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center font-medium">
                No teachers added yet. Search or type a name above.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2 max-h-[150px] overflow-y-auto pr-1">
                <AnimatePresence initial={false}>
                  {selected.map((item) => (
                    <motion.div
                      key={item.linkId || item.tempId}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.15 }}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-xl shadow-sm text-xs font-semibold text-gray-800"
                    >
                      <div className="w-5 h-5 shrink-0 rounded-md bg-blue-50 text-[#1e3a8a] flex items-center justify-center text-[10px] font-bold">
                        {item.name.charAt(0).toUpperCase()}
                      </div>
                      <span>
                        {item.designation} {item.name}
                      </span>
                      <button
                        onClick={() => handleRemove(item)}
                        className="p-0.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition cursor-pointer ml-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions - Identical Height */}
        <div className="flex items-center justify-between border-t border-[#e3eaf1] bg-[#f7fafc] px-4 py-3 sm:px-6">
          <button
            type="button"
            onClick={onBack}
            className="rounded-md border border-[#dce5ef] bg-white px-4 py-2 text-xs font-bold text-[#52647b] transition hover:bg-[#f3f7fb]"
          >
            ← Previous
          </button>
          <button
            type="button"
            onClick={handleSaveAndNext}
            disabled={isSaving}
            className="flex items-center gap-2 rounded-md bg-[#1e3a8a] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#172e6e] disabled:pointer-events-none disabled:opacity-60"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Save & Next <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}