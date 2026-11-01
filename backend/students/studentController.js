import Student from './Student.js';

const escapeRegex = (str) => str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

/**
 * @desc    Get all students with filtering, search, and pagination
 * @route   GET /api/v1/students
 * @access  Private (Admin)
 */
export const getStudents = async (req, res) => {
  try {
    const {
      search,
      degree,
      semester,
      session,
      section,
      academicSession,
      status,
      page = 1,
      limit = 50,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const query = {};

    if (degree && degree !== 'all' && degree !== 'All Programs') {
      query.degree = degree;
    }
    if (semester && semester !== 'all' && semester !== 'All Semesters') {
      query.$or = [{ semester }, { semesterNumber: semester }];
    }
    if (session && session !== 'all' && session !== 'All Shifts') {
      query.session = new RegExp(`^${session}$`, 'i');
    }
    if (section && section !== 'all' && section !== 'All Sections') {
      query.section = section.toUpperCase();
    }
    if (academicSession && academicSession !== 'all') {
      query.academicSession = academicSession;
    }
    if (status && status !== 'all') {
      query.status = new RegExp(`^${status}$`, 'i');
    }

    if (search && search.trim() !== '') {
      const regex = new RegExp(escapeRegex(search.trim()), 'i');
      const searchConditions = [
        { regNo: regex },
        { registrationNo: regex },
        { name: regex },
        { fatherName: regex },
        { email: regex },
        { phone: regex },
        { cnic: regex },
      ];

      if (query.$or) {
        query.$and = [{ $or: query.$or }, { $or: searchConditions }];
        delete query.$or;
      } else {
        query.$or = searchConditions;
      }
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [students, total] = await Promise.all([
      Student.find(query).sort(sort).skip(skip).limit(limitNum),
      Student.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: students,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (error) {
    console.error('[Get Students Error]:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve students: ' + error.message,
    });
  }
};

/**
 * @desc    Get aggregate stats of registered students
 * @route   GET /api/v1/students/stats
 * @access  Private (Admin)
 */
export const getStudentStats = async (req, res) => {
  try {
    const [total, active, morningCount, eveningCount, degreeGroups] = await Promise.all([
      Student.countDocuments(),
      Student.countDocuments({ status: { $regex: /^active$/i } }),
      Student.countDocuments({ session: { $regex: /^morning$/i } }),
      Student.countDocuments({ session: { $regex: /^evening$/i } }),
      Student.aggregate([
        { $group: { _id: '$degree', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    const byDegree = degreeGroups.reduce((acc, curr) => {
      if (curr._id) {
        acc[curr._id] = curr.count;
      }
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      stats: {
        total,
        active,
        morning: morningCount,
        evening: eveningCount,
        byDegree,
      },
    });
  } catch (error) {
    console.error('[Student Stats Error]:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve student statistics',
    });
  }
};

/**
 * @desc    Get a single student by ID
 * @route   GET /api/v1/students/:id
 * @access  Private (Admin)
 */
export const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching student details: ' + error.message,
    });
  }
};

/**
 * @desc    Create a single student
 * @route   POST /api/v1/students
 * @access  Private (Admin)
 */
export const createStudent = async (req, res) => {
  try {
    const {
      regNo,
      registrationNo,
      name,
      fatherName,
      email,
      phone,
      degree,
      academicSession,
      semester,
      semesterNumber,
      session,
      section,
      gender,
      cnic,
      status,
      guardianPhone,
      address,
      cgpa,
    } = req.body;

    const rawRoll = (regNo || registrationNo || '').trim();
    const rawName = (name || '').trim();
    const rawDegree = (degree || '').trim();
    const rawSemester = (semester || semesterNumber || '1st').trim();
    const rawSession = (session || 'Morning').trim();

    if (!rawRoll || !rawName || !rawDegree) {
      return res.status(400).json({
        success: false,
        message: 'Registration Number, Name, and Degree / Program are required',
      });
    }

    const normalizedRoll = rawRoll.toUpperCase();

    // Check duplicate
    const existing = await Student.findOne({
      $or: [{ regNo: normalizedRoll }, { registrationNo: normalizedRoll }],
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Student with Registration Number "${normalizedRoll}" already exists (${existing.name})`,
      });
    }

    const newStudent = await Student.create({
      regNo: normalizedRoll,
      registrationNo: normalizedRoll,
      name: rawName,
      fatherName: fatherName?.trim() || '',
      email: email?.trim().toLowerCase() || '',
      phone: phone?.trim() || '',
      degree: rawDegree,
      academicSession: academicSession?.trim() || '2023-2027',
      semester: rawSemester,
      semesterNumber: rawSemester,
      session: rawSession.toLowerCase().includes('even') ? 'Evening' : 'Morning',
      section: section ? section.trim().toUpperCase() : 'A',
      gender: gender || 'Male',
      cnic: cnic?.trim() || '',
      status: status || 'Active',
      guardianPhone: guardianPhone?.trim() || '',
      address: address?.trim() || '',
      cgpa: cgpa?.trim() || '',
    });

    res.status(201).json({
      success: true,
      message: 'Student added successfully',
      data: newStudent,
    });
  } catch (error) {
    console.error('[Create Student Error]:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create student',
    });
  }
};

/**
 * @desc    Bulk create / import students
 * @route   POST /api/v1/students/bulk
 * @access  Private (Admin)
 */
export const createBulkStudents = async (req, res) => {
  try {
    const { students = [], duplicateAction = 'skip', defaultClassInfo = {} } = req.body;

    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No student records provided for bulk import',
      });
    }

    let insertedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    const errors = [];
    const bulkOps = [];

    for (let index = 0; index < students.length; index++) {
      const row = students[index];
      const rowNum = index + 1;

      const rawRoll = row.regNo || row.rollNo || row.registrationNo || row.registrationNumber;
      const rawName = row.name || row.studentName || row.fullName;

      if (!rawRoll || !rawName) {
        errors.push({
          row: rowNum,
          message: `Row ${rowNum}: Registration Number and Name are required`,
          data: row,
        });
        continue;
      }

      const roll = String(rawRoll).trim().toUpperCase();
      const name = String(rawName).trim();
      const degree = row.degree?.trim() || defaultClassInfo.degree?.trim() || 'BS Computer Science';
      const semester = row.semester?.trim() || row.semesterNumber?.trim() || defaultClassInfo.semester?.trim() || '1st';
      const session = (row.session?.trim() || defaultClassInfo.session?.trim() || 'Morning');
      const academicSession = row.academicSession?.trim() || defaultClassInfo.academicSession?.trim() || '2023-2027';
      const section = (row.section?.trim() || defaultClassInfo.section?.trim() || 'A').toUpperCase();

      const normalizedSession = session.toLowerCase().includes('even') ? 'Evening' : 'Morning';

      const studentDoc = {
        regNo: roll,
        registrationNo: roll,
        name,
        fatherName: row.fatherName?.trim() || '',
        email: row.email?.trim().toLowerCase() || '',
        phone: row.phone?.trim() || row.contactNumber?.trim() || '',
        degree,
        academicSession,
        semester,
        semesterNumber: semester,
        session: normalizedSession,
        section,
        gender: row.gender?.trim() || 'Male',
        cnic: row.cnic?.trim() || '',
        status: row.status?.trim() || 'Active',
        guardianPhone: row.guardianPhone?.trim() || '',
        address: row.address?.trim() || '',
        cgpa: row.cgpa ? String(row.cgpa).trim() : '',
      };

      if (duplicateAction === 'update') {
        bulkOps.push({
          updateOne: {
            filter: { $or: [{ regNo: roll }, { registrationNo: roll }] },
            update: { $set: studentDoc },
            upsert: true,
          },
        });
      } else {
        bulkOps.push({
          updateOne: {
            filter: { $or: [{ regNo: roll }, { registrationNo: roll }] },
            update: { $setOnInsert: studentDoc },
            upsert: true,
          },
        });
      }
    }

    if (bulkOps.length > 0) {
      const result = await Student.bulkWrite(bulkOps, { ordered: false });
      insertedCount = result.upsertedCount || 0;
      if (duplicateAction === 'update') {
        updatedCount = result.modifiedCount || 0;
      } else {
        skippedCount = result.matchedCount || 0;
      }
    }

    res.status(200).json({
      success: true,
      message: `Processed ${bulkOps.length} students: ${insertedCount} inserted, ${updatedCount} updated, ${skippedCount} skipped`,
      summary: {
        totalReceived: students.length,
        inserted: insertedCount,
        updated: updatedCount,
        skipped: skippedCount,
        errorCount: errors.length,
        errors,
      },
    });
  } catch (error) {
    console.error('[Bulk Import Students Error]:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process bulk student import: ' + error.message,
    });
  }
};

/**
 * @desc    Update a student
 * @route   PUT /api/v1/students/:id
 * @access  Private (Admin)
 */
export const updateStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    const {
      regNo,
      registrationNo,
      name,
      fatherName,
      email,
      phone,
      degree,
      academicSession,
      semester,
      semesterNumber,
      session,
      section,
      gender,
      cnic,
      status,
      guardianPhone,
      address,
      cgpa,
    } = req.body;

    const rawRoll = (regNo || registrationNo || '').trim();
    if (rawRoll) {
      const normalizedRoll = rawRoll.toUpperCase();
      if (normalizedRoll !== student.regNo && normalizedRoll !== student.registrationNo) {
        const existing = await Student.findOne({
          $or: [{ regNo: normalizedRoll }, { registrationNo: normalizedRoll }],
        });
        if (existing && existing._id.toString() !== student._id.toString()) {
          return res.status(409).json({
            success: false,
            message: `Registration Number "${normalizedRoll}" is already assigned to another student`,
          });
        }
        student.regNo = normalizedRoll;
        student.registrationNo = normalizedRoll;
      }
    }

    if (name) student.name = name.trim();
    if (fatherName !== undefined) student.fatherName = fatherName.trim();
    if (email !== undefined) student.email = email.trim().toLowerCase();
    if (phone !== undefined) student.phone = phone.trim();
    if (degree) student.degree = degree.trim();
    if (academicSession) student.academicSession = academicSession.trim();
    if (semester || semesterNumber) {
      student.semester = (semester || semesterNumber).trim();
      student.semesterNumber = student.semester;
    }
    if (session) student.session = session.trim();
    if (section) student.section = section.trim().toUpperCase();
    if (gender) student.gender = gender;
    if (cnic !== undefined) student.cnic = cnic.trim();
    if (status) student.status = status;
    if (guardianPhone !== undefined) student.guardianPhone = guardianPhone.trim();
    if (address !== undefined) student.address = address.trim();
    if (cgpa !== undefined) student.cgpa = cgpa ? String(cgpa).trim() : '';

    await student.save();

    res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      data: student,
    });
  } catch (error) {
    console.error('[Update Student Error]:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update student',
    });
  }
};

/**
 * @desc    Delete single student
 * @route   DELETE /api/v1/students/:id
 * @access  Private (Admin)
 */
export const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    res.status(200).json({
      success: true,
      message: `Student "${student.name}" deleted successfully`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete student: ' + error.message,
    });
  }
};

/**
 * @desc    Bulk delete students by array of IDs
 * @route   POST /api/v1/students/bulk-delete
 * @access  Private (Admin)
 */
export const bulkDeleteStudents = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of student IDs to delete',
      });
    }

    const result = await Student.deleteMany({ _id: { $in: ids } });

    res.status(200).json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} students`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error('[Bulk Delete Students Error]:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete selected students: ' + error.message,
    });
  }
};
