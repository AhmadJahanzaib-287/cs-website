import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardList, PlusCircle, X, Loader2, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import ReusableComboBox from './ReusableComboBox';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const roleOptions = ['T', 'P', 'T+P', 'PG-1', 'PG-2'];

const ordinal = (n) => {
  const num = Number(n);
  const s = ['th', 'st', 'nd', 'rd'];
  const v = num % 100;
  return num + (s[(v - 20) % 10] || s[v] || s[0]);
};

const getClassLabel = (c) =>
  `${ordinal(c.semesterNumber)} Semester ${c.degree}${c.section ? ` Sec ${c.section}` : ''} (${c.session})`;

export default function AssignWorkloadStep({ workload, onFinish, onBack }) {
  const [classes, setClasses] = useState([]);
  const [workloadTeachers, setWorkloadTeachers] = useState([]);
  const [masterCourses, setMasterCourses] = useState([]);
  const [activeClassId, setActiveClassId] = useState(null);
  const [assignments, setAssignments] = useState([]);

  const [isLoadingBase, setIsLoadingBase] = useState(true);
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [error, setError] = useState('');

  // Course form state
  const [courseCode, setCourseCode] = useState('');
  const [courseTitle, setCourseTitle] = useState('');
  const [creditHours, setCreditHours] = useState('');
  const [teacherRows, setTeacherRows] = useState([{ tempId: crypto.randomUUID(), name: '', role: 'T' }]);

  const matchedCourse = masterCourses.find(
    (c) => c.courseCode.toLowerCase() === courseCode.trim().toLowerCase()
  );

  useEffect(() => {
    const fetchBase = async () => {
      try {
        const [classesRes, teachersRes, coursesRes] = await Promise.all([
          axios.get(`${API_URL}/api/v1/workload/${workload._id}/classes`, {
            withCredentials: true,
          }),
          axios.get(`${API_URL}/api/v1/workload/${workload._id}/teachers`, {
            withCredentials: true,
          }),
          axios.get(`${API_URL}/api/v1/workload/courses/master`, { withCredentials: true }),
        ]);

        if (classesRes.data.success) {
          const mappedClasses = classesRes.data.workloadClasses.map((wc) => ({
            _id: wc._id,
            degree: wc.classId.degree,
            semesterNumber: wc.classId.semesterNumber,
            session: wc.classId.session,
            section: wc.classId.section,
          }));
          setClasses(mappedClasses);
          if (mappedClasses.length > 0) {
            setActiveClassId(mappedClasses[0]._id);
          }
        }
        if (teachersRes.data.success) setWorkloadTeachers(teachersRes.data.workloadTeachers);
        if (coursesRes.data.success) setMasterCourses(coursesRes.data.courses);
      } catch (err) {
        console.error('[Fetch Assign Base Data Error]:', err.message);
      } finally {
        setIsLoadingBase(false);
      }
    };
    fetchBase();
  }, [workload._id]);

  useEffect(() => {
    if (!activeClassId) return;
    const fetchAssignments = async () => {
      setIsLoadingAssignments(true);
      try {
        const { data } = await axios.get(
          `${API_URL}/api/v1/workload/${workload._id}/classes/${activeClassId}/assignments`,
          { withCredentials: true }
        );
        if (data.success) setAssignments(data.assignments);
      } catch (err) {
        console.error('[Fetch Assignments Error]:', err.message);
      } finally {
        setIsLoadingAssignments(false);
      }
    };
    fetchAssignments();
  }, [activeClassId, workload._id]);

  const resetCourseForm = () => {
    setCourseCode('');
    setCourseTitle('');
    setCreditHours('');
    setTeacherRows([{ tempId: crypto.randomUUID(), name: '', role: 'T' }]);
  };

  const handleAddTeacherRow = () => {
    setTeacherRows((prev) => [...prev, { tempId: crypto.randomUUID(), name: '', role: 'T' }]);
  };

  const handleRemoveTeacherRow = (tempId) => {
    setTeacherRows((prev) => prev.filter((r) => r.tempId !== tempId));
  };

  const handleUpdateTeacherRow = (tempId, field, value) => {
    setTeacherRows((prev) =>
      prev.map((r) => (r.tempId === tempId ? { ...r, [field]: value } : r))
    );
  };

  const handleAddCourse = async () => {
    setError('');

    if (!courseCode.trim()) {
      setError('Please enter a course code.');
      return;
    }
    if (!matchedCourse && !courseTitle.trim()) {
      setError('Please enter the course title for this new course.');
      return;
    }

    const filledRows = teacherRows.filter((r) => r.name.trim());
    if (filledRows.length === 0) {
      setError('Please assign at least one teacher.');
      return;
    }

    const resolvedTeachers = [];
    for (const row of filledRows) {
      const match = workloadTeachers.find(
        (wt) => wt.teacherId.name.toLowerCase() === row.name.trim().toLowerCase()
      );
      if (!match) {
        setError(
          `"${row.name}" is not in this workload's teacher list. Add them in the previous step first.`
        );
        return;
      }
      resolvedTeachers.push({ teacherId: match.teacherId._id, role: row.role });
    }

    setIsSaving(true);
    try {
      const body = matchedCourse
        ? { courseId: matchedCourse._id, teachers: resolvedTeachers }
        : {
            newCourse: {
              courseCode: courseCode.trim().toUpperCase(),
              title: courseTitle.trim(),
              creditHours: creditHours.trim(),
            },
            teachers: resolvedTeachers,
          };

      const { data } = await axios.post(
        `${API_URL}/api/v1/workload/${workload._id}/classes/${activeClassId}/assignments`,
        body,
        { withCredentials: true }
      );

      if (data.success) {
        setAssignments((prev) => [...prev, data.assignment]);
        if (!matchedCourse) {
          setMasterCourses((prev) => [...prev, data.assignment.courseId]);
        }
        resetCourseForm();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    try {
      await axios.delete(`${API_URL}/api/v1/workload/assignments/${assignmentId}`, {
        withCredentials: true,
      });
      setAssignments((prev) => prev.filter((a) => a._id !== assignmentId));
    } catch (err) {
      console.error('[Delete Assignment Error]:', err.message);
    }
  };

  const handleFinish = async () => {
    setIsFinishing(true);
    try {
      const { data } = await axios.put(
        `${API_URL}/api/v1/workload/${workload._id}`,
        { currentStep: 4 },
        { withCredentials: true }
      );
      if (data.success) {
        onFinish?.(data.workload);
      }
    } catch (err) {
      console.error('[Finish Workload Error]:', err.message);
    } finally {
      setIsFinishing(false);
    }
  };

  const activeClass = classes.find((c) => c._id === activeClassId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-5xl bg-white border border-gray-100 rounded-3xl shadow-2xl overflow-hidden text-gray-800 flex flex-col"
      >
        {/* Header - Matching Add Teachers exactly */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-blue-50 border border-blue-100 text-[#1e3a8a]">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 tracking-tight">
                Assign Courses
              </h3>
              <p className="text-[11px] text-gray-500 font-medium">
                Distribute courses and assign teachers to specific classes.
              </p>
            </div>
          </div>
          {onBack && (
            <button
              onClick={onBack}
              className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {isLoadingBase ? (
          <div className="flex items-center justify-center py-12 text-gray-500 text-xs font-medium">
            <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading data...
          </div>
        ) : (
          <div className="px-6 py-4 space-y-3">
            {/* Class Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
              {classes.map((c) => (
                <button
                  key={c._id}
                  onClick={() => setActiveClassId(c._id)}
                  className={`shrink-0 px-3 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition cursor-pointer border ${
                    activeClassId === c._id
                      ? 'bg-blue-50 text-[#1e3a8a] border-blue-200 shadow-xs'
                      : 'bg-white text-gray-500 border-gray-200 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  {getClassLabel(c)}
                </button>
              ))}
            </div>

            {/* Content Body Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
              {/* Left: Inputs */}
              <div className="lg:col-span-6 space-y-2.5">
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                      Course Code
                    </label>
                    <ReusableComboBox
                      value={courseCode}
                      onChange={setCourseCode}
                      options={masterCourses.map((c) => c.courseCode)}
                      placeholder="e.g. CS-306"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                      Credit Hours
                    </label>
                    <ReusableComboBox
                      value={matchedCourse ? matchedCourse.creditHours || '' : creditHours}
                      onChange={setCreditHours}
                      options={['3(3-0)', '3(2-1)', '2(2-0)', '1(0-1)']}
                      placeholder="e.g. 3(2-1)"
                      disabled={!!matchedCourse}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                    Course Title
                  </label>
                  <input
                    type="text"
                    value={matchedCourse ? matchedCourse.title : courseTitle}
                    onChange={(e) => setCourseTitle(e.target.value)}
                    disabled={!!matchedCourse}
                    placeholder="e.g. Digital Logic Design"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 text-xs text-gray-800 placeholder-gray-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:opacity-60 transition"
                  />
                </div>

                {/* Teacher Rows */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-600">
                    Assigned Teacher(s)
                  </label>
                  <div className="max-h-[80px] overflow-y-auto space-y-1.5 pr-1">
                    {teacherRows.map((row) => (
                      <div key={row.tempId} className="flex items-center gap-2">
                        <div className="flex-1">
                          <ReusableComboBox
                            value={row.name}
                            onChange={(v) => handleUpdateTeacherRow(row.tempId, 'name', v)}
                            options={workloadTeachers.map((wt) => wt.teacherId.name)}
                            placeholder="Select teacher..."
                          />
                        </div>
                        <div className="w-20 shrink-0">
                          <ReusableComboBox
                            value={row.role}
                            onChange={(v) => handleUpdateTeacherRow(row.tempId, 'role', v)}
                            options={roleOptions}
                            placeholder="Role"
                          />
                        </div>
                        {teacherRows.length > 1 && (
                          <button
                            onClick={() => handleRemoveTeacherRow(row.tempId)}
                            className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition cursor-pointer shrink-0"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handleAddTeacherRow}
                    className="text-[10px] font-bold text-[#1e3a8a] hover:text-blue-700 transition cursor-pointer inline-block"
                  >
                    + Add Co-Teacher
                  </button>
                </div>

                {error && (
                  <p className="text-[11px] font-semibold text-red-600 bg-red-50 border border-red-100 rounded-lg px-2.5 py-1">
                    {error}
                  </p>
                )}

                <button
                  onClick={handleAddCourse}
                  disabled={isSaving || !activeClassId}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100/70 text-[#1e3a8a] text-xs font-bold transition cursor-pointer disabled:opacity-60 disabled:pointer-events-none"
                >
                  {isSaving ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <PlusCircle className="w-3.5 h-3.5" /> Add to Class
                    </>
                  )}
                </button>
              </div>

              {/* Right: Assigned Courses Panel (Fixed Height matching Left Side) */}
              <div className="lg:col-span-6 bg-gray-50 border border-gray-200/70 rounded-2xl p-3 h-[215px] flex flex-col">
                <div className="flex items-center justify-between mb-1.5 pb-1.5 border-b border-gray-200/60 shrink-0">
                  <span className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">
                    Assigned Courses List
                  </span>
                  {activeClass && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-600 truncate max-w-[140px]">
                      {getClassLabel(activeClass)}
                    </span>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto pr-1">
                  {isLoadingAssignments ? (
                    <div className="flex items-center justify-center h-full text-gray-400 text-xs font-medium">
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> Loading...
                    </div>
                  ) : assignments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center px-4">
                      <ClipboardList className="w-5 h-5 text-gray-300 mb-1" />
                      <p className="text-[10px] text-gray-400 font-medium">
                        No courses assigned yet.
                      </p>
                    </div>
                  ) : (
                    <table className="w-full text-left text-[11px]">
                      <thead className="text-gray-500 text-[9px] uppercase font-bold sticky top-0 bg-gray-50 z-10">
                        <tr>
                          <th className="pb-1 px-1">Code</th>
                          <th className="pb-1 px-1">Title</th>
                          <th className="pb-1 px-1">Teacher(s)</th>
                          <th className="pb-1 px-1"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200/60">
                        <AnimatePresence initial={false}>
                          {assignments.map((a) => (
                            <motion.tr
                              key={a._id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="group hover:bg-gray-100/50 transition-colors"
                            >
                              <td className="py-1 px-1 font-bold text-gray-800 whitespace-nowrap">
                                {a.courseId.courseCode}
                              </td>
                              <td className="py-1 px-1 text-gray-700 font-medium truncate max-w-[90px]">
                                {a.courseId.title}
                              </td>
                              <td className="py-1 px-1 text-gray-600 text-[10px] leading-tight">
                                {a.teachers
                                  .map((t) => `${t.teacherId.name} (${t.role})`)
                                  .join(', ')}
                              </td>
                              <td className="py-1 px-1 text-right">
                                <button
                                  onClick={() => handleDeleteAssignment(a._id)}
                                  className="p-0.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition cursor-pointer"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </td>
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions - Exactly matching Add Teachers Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-gray-50/50 border-t border-gray-100 shrink-0">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-100 transition cursor-pointer"
          >
            ← Previous
          </button>
          <button
            type="button"
            onClick={handleFinish}
            disabled={isFinishing}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#1e3a8a] hover:bg-[#1b337a] text-xs font-bold text-white shadow-md transition cursor-pointer disabled:opacity-60 disabled:pointer-events-none"
          >
            {isFinishing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" /> Finish & Generate
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}