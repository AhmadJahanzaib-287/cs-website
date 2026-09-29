import WorkloadAssignment from '../models/WorkloadAssignment.js';

const ordinal = (n) => {
  const num = Number(n);
  const s = ['th', 'st', 'nd', 'rd'];
  const v = num % 100;
  return num + (s[(v - 20) % 10] || s[v] || s[0]);
};

// classLink is a WorkloadAssignment's populated `classId` field, i.e. the
// WorkloadClass LINK document. Its own `.classId` (nested) is the actual
// Class document with degree/semesterNumber/session/section.
const classLabel = (classLink) => {
  const c = classLink.classId;
  return `${ordinal(c.semesterNumber)} Semester ${c.degree}${c.section ? ` Sec ${c.section}` : ''} (${c.session})`;
};

const fetchAllAssignments = (workloadId) =>
  WorkloadAssignment.find({ workloadId })
    .populate({
      path: 'classId',
      populate: { path: 'classId', model: 'Class' },
    })
    .populate('courseId')
    .populate('teachers.teacherId');

/**
 * @desc    Class-wise report — each registered class with its courses + teachers
 * @route   GET /api/v1/workload/:workloadId/report/class-wise?classId=optional
 * @access  Private (Admin)
 */
export const getClassWiseReport = async (req, res) => {
  try {
    const { workloadId } = req.params;
    const { classId } = req.query;

    const assignments = await fetchAllAssignments(workloadId);
    const filtered = classId
      ? assignments.filter((a) => String(a.classId._id) === classId)
      : assignments;

    const grouped = {};
    for (const a of filtered) {
      const key = a.classId._id.toString();
      if (!grouped[key]) grouped[key] = { classLink: a.classId, courses: [] };
      grouped[key].courses.push({
        courseCode: a.courseId.courseCode,
        title: a.courseId.title,
        creditHours: a.courseId.creditHours,
        teachers: a.teachers.map((t) => ({
          name: t.teacherId.name,
          designation: t.teacherId.designation,
          role: t.role,
        })),
      });
    }

    const report = Object.values(grouped).map((g) => ({
      classId: g.classLink._id,
      label: classLabel(g.classLink),
      courses: g.courses,
    }));

    res.status(200).json({ success: true, report });
  } catch (error) {
    console.error(`[Class-wise Report Error]: ${error.message}`);
    res.status(500).json({ success: false, message: 'Internal Server Error generating report' });
  }
};

/**
 * @desc    Teacher-wise report — each teacher with all classes/courses they teach
 * @route   GET /api/v1/workload/:workloadId/report/teacher-wise?teacherId=optional
 * @access  Private (Admin)
 */
export const getTeacherWiseReport = async (req, res) => {
  try {
    const { workloadId } = req.params;
    const { teacherId } = req.query;

    const assignments = await fetchAllAssignments(workloadId);
    const grouped = {};

    for (const a of assignments) {
      for (const t of a.teachers) {
        const key = t.teacherId._id.toString();
        if (teacherId && key !== teacherId) continue;
        if (!grouped[key]) grouped[key] = { teacher: t.teacherId, rows: [] };
        grouped[key].rows.push({
          classLabel: classLabel(a.classId),
          courseCode: a.courseId.courseCode,
          title: a.courseId.title,
          role: t.role,
        });
      }
    }

    const report = Object.values(grouped).map((g) => ({
      teacherId: g.teacher._id,
      label: `${g.teacher.designation || ''} ${g.teacher.name}`.trim(),
      rows: g.rows,
    }));

    res.status(200).json({ success: true, report });
  } catch (error) {
    console.error(`[Teacher-wise Report Error]: ${error.message}`);
    res.status(500).json({ success: false, message: 'Internal Server Error generating report' });
  }
};

/**
 * @desc    Course-wise report — each course with all classes/teachers teaching it
 * @route   GET /api/v1/workload/:workloadId/report/course-wise?courseId=optional
 * @access  Private (Admin)
 */
export const getCourseWiseReport = async (req, res) => {
  try {
    const { workloadId } = req.params;
    const { courseId } = req.query;

    const assignments = await fetchAllAssignments(workloadId);
    const filtered = courseId
      ? assignments.filter((a) => String(a.courseId._id) === courseId)
      : assignments;

    const grouped = {};
    for (const a of filtered) {
      const key = a.courseId._id.toString();
      if (!grouped[key]) grouped[key] = { course: a.courseId, rows: [] };
      grouped[key].rows.push({
        classLabel: classLabel(a.classId),
        teachers: a.teachers
          .map((t) => `${t.teacherId.designation || ''} ${t.teacherId.name} (${t.role})`)
          .join(', '),
      });
    }

    const report = Object.values(grouped).map((g) => ({
      courseId: g.course._id,
      label: `${g.course.courseCode} — ${g.course.title}`,
      rows: g.rows,
    }));

    res.status(200).json({ success: true, report });
  } catch (error) {
    console.error(`[Course-wise Report Error]: ${error.message}`);
    res.status(500).json({ success: false, message: 'Internal Server Error generating report' });
  }
};