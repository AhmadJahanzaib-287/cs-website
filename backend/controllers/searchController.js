import Student from '../students/Student.js';
import Faculty from '../faculty/models/Faculty.js';
import Notice from '../notice/models/Notice.js';
import Application from '../applications/Application.js';
import Workload from '../workload/models/Workload.js';
import DownloadFile from '../models/DownloadFile.js';

// Escape regex special characters
const escapeRegex = (str) => str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

/**
 * @desc    Global universal search across Students, Faculty, Notices, Applications, Workload, Downloads
 * @route   GET /api/v1/search
 * @access  Private (Admin)
 */
export const globalSearch = async (req, res) => {
  try {
    const rawQuery = (req.query.q || '').trim();
    if (!rawQuery) {
      return res.status(200).json({
        success: true,
        query: '',
        totalMatches: 0,
        results: {
          students: [],
          faculty: [],
          notices: [],
          applications: [],
          workload: [],
          downloads: [],
        },
      });
    }

    const regex = new RegExp(escapeRegex(rawQuery), 'i');

    const [
      studentsResult,
      facultyResult,
      noticesResult,
      applicationsResult,
      workloadResult,
      downloadsResult,
    ] = await Promise.allSettled([
      // 1. Students
      Student.find({
        $or: [
          { regNo: regex },
          { registrationNo: regex },
          { name: regex },
          { fatherName: regex },
          { email: regex },
          { phone: regex },
          { degree: regex },
          { cnic: regex },
        ],
      })
        .limit(8)
        .lean(),

      // 2. Faculty
      Faculty.find({
        $or: [
          { name: regex },
          { designation: regex },
          { email: regex },
          { category: regex },
          { qualification: regex },
          { phone: regex },
        ],
      })
        .limit(8)
        .lean(),

      // 3. Notices
      Notice.find({
        $or: [
          { title: regex },
          { description: regex },
          { priority: regex },
        ],
      })
        .limit(8)
        .lean(),

      // 4. Applications
      Application.find({
        $or: [
          { serialNumber: regex },
          { studentName: regex },
          { studentRegNo: regex },
          { applicationType: regex },
          { status: regex },
        ],
      })
        .limit(8)
        .lean(),

      // 5. Workload
      Workload.find({
        $or: [
          { title: regex },
          { year: regex },
          { semester: regex },
          { status: regex },
        ],
      })
        .limit(8)
        .lean(),

      // 6. Downloads
      DownloadFile.find({
        $or: [
          { title: regex },
          { category: regex },
          { description: regex },
          { fileName: regex },
        ],
      })
        .limit(6)
        .lean(),
    ]);

    // Format Students
    const rawStudents = studentsResult.status === 'fulfilled' ? studentsResult.value : [];
    const formattedStudents = rawStudents.map((s) => {
      const roll = s.regNo || s.registrationNo || 'No Reg No';
      const sem = s.semester || s.semesterNumber || '1st';
      return {
        id: String(s._id),
        category: 'students',
        categoryLabel: 'Student',
        tab: 'students',
        title: s.name,
        subtitle: `${roll} · ${s.degree} (${sem} Sem · ${s.session})`,
        badge: s.status || 'Active',
        badgeColor: s.status === 'Active' ? 'emerald' : 'amber',
        raw: s,
      };
    });

    // Format Faculty
    const rawFaculty = facultyResult.status === 'fulfilled' ? facultyResult.value : [];
    const formattedFaculty = rawFaculty.map((f) => ({
      id: String(f._id),
      category: 'faculty',
      categoryLabel: 'Faculty',
      tab: 'faculty',
      title: f.name,
      subtitle: `${f.designation} · ${f.qualification || f.category}`,
      badge: f.category || 'Faculty',
      badgeColor: 'blue',
      raw: f,
    }));

    // Format Notices
    const rawNotices = noticesResult.status === 'fulfilled' ? noticesResult.value : [];
    const formattedNotices = rawNotices.map((n) => ({
      id: String(n._id),
      category: 'notices',
      categoryLabel: 'Notice',
      tab: 'notices',
      title: n.title,
      subtitle: `${n.priority} Priority · ${new Date(n.startDate).toLocaleDateString()}`,
      badge: n.priority || 'Normal',
      badgeColor: n.priority === 'Emergency' ? 'rose' : n.priority === 'Important' ? 'amber' : 'sky',
      raw: n,
    }));

    // Format Applications
    const rawApplications = applicationsResult.status === 'fulfilled' ? applicationsResult.value : [];
    const formattedApplications = rawApplications.map((a) => ({
      id: String(a._id),
      category: 'applications',
      categoryLabel: 'Application',
      tab: 'applications',
      title: `${a.applicationType?.replace(/_/g, ' ') || 'Application'} (${a.serialNumber})`,
      subtitle: `${a.studentName} · ${a.studentRegNo}`,
      badge: a.status || 'Pending',
      badgeColor: a.status === 'Approved' ? 'emerald' : a.status === 'Rejected' ? 'rose' : 'amber',
      raw: a,
    }));

    // Format Workload
    const rawWorkload = workloadResult.status === 'fulfilled' ? workloadResult.value : [];
    const formattedWorkload = rawWorkload.map((w) => ({
      id: String(w._id),
      category: 'workload',
      categoryLabel: 'Workload',
      tab: 'workload',
      title: w.title || `${w.semester} ${w.year}`,
      subtitle: `Status: ${w.status || 'draft'} · Year: ${w.year}`,
      badge: w.status?.toUpperCase() || 'WORKLOAD',
      badgeColor: 'purple',
      raw: w,
    }));

    // Format Downloads
    const rawDownloads = downloadsResult.status === 'fulfilled' ? downloadsResult.value : [];
    const formattedDownloads = rawDownloads.map((d) => ({
      id: String(d._id),
      category: 'downloads',
      categoryLabel: 'Download',
      tab: 'downloads',
      title: d.title,
      subtitle: `${d.category || 'General'} · ${d.fileName}`,
      badge: d.category || 'File',
      badgeColor: 'cyan',
      raw: d,
    }));

    const totalMatches =
      formattedStudents.length +
      formattedFaculty.length +
      formattedNotices.length +
      formattedApplications.length +
      formattedWorkload.length +
      formattedDownloads.length;

    res.status(200).json({
      success: true,
      query: rawQuery,
      totalMatches,
      results: {
        students: formattedStudents,
        faculty: formattedFaculty,
        notices: formattedNotices,
        applications: formattedApplications,
        workload: formattedWorkload,
        downloads: formattedDownloads,
      },
    });
  } catch (error) {
    console.error('[Global Search Error]:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform global search: ' + error.message,
    });
  }
};
