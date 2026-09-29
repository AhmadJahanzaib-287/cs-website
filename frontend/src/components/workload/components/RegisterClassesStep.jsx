import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { School, ArrowRight, PlusCircle, X, Loader2 } from 'lucide-react';
import axios from 'axios';
import ReusableComboBox from './ReusableComboBox';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const degreeOptions = ['BSCS', 'BSSE', 'BSIT', 'BSAI', 'BSDS'];
const semesterOptions = ['1', '2', '3', '4', '5', '6', '7', '8'];
const sessionOptions = ['Morning', 'Evening'];
const sectionOptions = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

const ordinal = (n) => {
  const num = Number(n);
  const s = ['th', 'st', 'nd', 'rd'];
  const v = num % 100;
  return num + (s[(v - 20) % 10] || s[v] || s[0]);
};

const getClassLabel = (c) =>
  `${ordinal(c.semesterNumber)} Sem ${c.degree}${c.section ? ` Sec ${c.section}` : ''} (${c.session})`;

export default function RegisterClassesStep({ workload, onNext, onBack }) {
  const [degree, setDegree] = useState('BSCS');
  const [semesterNumber, setSemesterNumber] = useState('1');
  const [session, setSession] = useState('Morning');
  const [section, setSection] = useState('A');

  const [masterClasses, setMasterClasses] = useState([]);
  const [selected, setSelected] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [masterRes, selectedRes] = await Promise.all([
          axios.get(`${API_URL}/api/v1/workload/classes/master`, { withCredentials: true }),
          axios.get(`${API_URL}/api/v1/workload/${workload._id}/classes`, {
            withCredentials: true,
          }),
        ]);

        if (masterRes.data.success) setMasterClasses(masterRes.data.classes);

        if (selectedRes.data.success && selectedRes.data.workloadClasses.length > 0) {
          setSelected(
            selectedRes.data.workloadClasses.map((wc) => ({
              linkId: wc._id,
              classId: wc.classId._id,
              degree: wc.classId.degree,
              semesterNumber: wc.classId.semesterNumber,
              session: wc.classId.session,
              section: wc.classId.section,
              isNew: false,
            }))
          );
        } else if (masterRes.data.success) {
          setSelected(
            masterRes.data.classes.map((c) => ({
              tempId: crypto.randomUUID(),
              classId: c._id,
              degree: c.degree,
              semesterNumber: c.semesterNumber,
              session: c.session,
              section: c.section,
              isNew: false,
            }))
          );
        }
      } catch (err) {
        console.error('[Fetch Classes Error]:', err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [workload._id]);

  const handleAddClass = () => {
    setError('');

    const alreadyAdded = selected.some(
      (s) =>
        s.degree === degree &&
        s.semesterNumber === semesterNumber &&
        s.session === session &&
        s.section === section
    );
    if (alreadyAdded) {
      setError('This class is already added.');
      return;
    }

    const existingClass = masterClasses.find(
      (c) =>
        c.degree === degree &&
        c.semesterNumber === semesterNumber &&
        c.session === session &&
        c.section === section
    );

    if (existingClass) {
      setSelected((prev) => [
        ...prev,
        {
          tempId: crypto.randomUUID(),
          classId: existingClass._id,
          degree,
          semesterNumber,
          session,
          section,
          isNew: false,
        },
      ]);
    } else {
      setSelected((prev) => [
        ...prev,
        {
          tempId: crypto.randomUUID(),
          degree,
          semesterNumber,
          session,
          section,
          isNew: true,
        },
      ]);
    }
  };

  const handleRemoveClass = async (item) => {
    if (item.linkId) {
      try {
        await axios.delete(`${API_URL}/api/v1/workload/classes/${item.linkId}`, {
          withCredentials: true,
        });
      } catch (err) {
        console.error('[Remove Class Error]:', err.message);
        return;
      }
    }
    setSelected((prev) =>
      prev.filter((s) => (s.linkId ? s.linkId !== item.linkId : s.tempId !== item.tempId))
    );
  };

  const handleSaveAndNext = async () => {
    if (selected.length === 0) {
      setError('Please add at least one class before continuing.');
      return;
    }

    const unsaved = selected.filter((s) => !s.linkId);

    setIsSaving(true);
    setError('');

    try {
      if (unsaved.length > 0) {
        const classIds = unsaved.filter((s) => !s.isNew).map((s) => s.classId);
        const newClasses = unsaved
          .filter((s) => s.isNew)
          .map((s) => ({
            degree: s.degree,
            semesterNumber: s.semesterNumber,
            session: s.session,
            section: s.section,
          }));

        const { data } = await axios.post(
          `${API_URL}/api/v1/workload/${workload._id}/classes`,
          { classIds, newClasses },
          { withCredentials: true }
        );

        if (data.success) {
          onNext?.(data.workload);
          return;
        }
      } else {
        const { data: updated } = await axios.put(
          `${API_URL}/api/v1/workload/${workload._id}`,
          { currentStep: 2 },
          { withCredentials: true }
        );
        onNext?.(updated.success ? updated.workload : workload);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong while saving classes.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-5xl bg-white border border-gray-100 rounded-3xl shadow-2xl overflow-hidden text-gray-800 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-2xl bg-blue-50 border border-blue-100 text-[#1e3a8a]">
              <School className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 tracking-tight">
                Register Classes
              </h3>
              <p className="text-xs text-gray-500 font-medium">
                Add every class that needs a workload this semester.
              </p>
            </div>
          </div>
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Form Controls */}
          <div className="lg:col-span-7 space-y-4">
            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                  Degree
                </label>
                <ReusableComboBox
                  value={degree}
                  onChange={setDegree}
                  options={degreeOptions}
                  placeholder="Degree..."
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                  Semester
                </label>
                <ReusableComboBox
                  value={semesterNumber}
                  onChange={setSemesterNumber}
                  options={semesterOptions}
                  placeholder="Semester..."
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                  Session
                </label>
                <ReusableComboBox
                  value={session}
                  onChange={setSession}
                  options={sessionOptions}
                  placeholder="Session..."
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                  Section
                </label>
                <ReusableComboBox
                  value={section}
                  onChange={setSection}
                  options={sectionOptions}
                  placeholder="Section..."
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddClass}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100/70 text-[#1e3a8a] text-sm font-bold transition cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" /> Add Class
            </button>

            {error && (
              <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-100 rounded-xl px-3.5 py-2">
                {error}
              </p>
            )}
          </div>

          {/* Right Selected Classes Grid */}
          <div className="lg:col-span-5 bg-gray-50 border border-gray-200/70 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200/60">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Registered Classes
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
                No classes added yet. Fill form & click Add Class.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2 max-h-[170px] overflow-y-auto pr-1">
                <AnimatePresence initial={false}>
                  {selected.map((item) => (
                    <motion.div
                      key={item.linkId || item.tempId}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.15 }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-xl shadow-sm text-xs font-semibold text-gray-800"
                    >
                      <span>{getClassLabel(item)}</span>
                      <button
                        onClick={() => handleRemoveClass(item)}
                        className="p-0.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50/50 border-t border-gray-100">
          <button
            type="button"
            onClick={onBack}
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-100 transition cursor-pointer"
          >
            ← Previous
          </button>
          <button
            type="button"
            onClick={handleSaveAndNext}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1e3a8a] hover:bg-[#1b337a] text-xs font-bold text-white shadow-lg shadow-blue-900/10 transition cursor-pointer disabled:opacity-60 disabled:pointer-events-none"
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