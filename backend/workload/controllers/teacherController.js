import Teacher from '../models/Teacher.js';
import WorkloadTeacher from '../models/WorkloadTeacher.js';
import Workload from '../models/Workload.js';

/**
 * @desc    Get the full reusable Teacher master list (for search-select dropdown)
 * @route   GET /api/v1/workload/teachers/master
 * @access  Private (Admin)
 */
export const getAllTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find({ isActive: true }).sort({ name: 1 });
    res.status(200).json({
      success: true,
      count: teachers.length,
      teachers,
    });
  } catch (error) {
    console.error(`[Get Teachers Error]: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error while fetching teachers',
    });
  }
};

/**
 * @desc    Add a new teacher to the reusable master list
 * @route   POST /api/v1/workload/teachers/master
 * @access  Private (Admin)
 */
export const createTeacher = async (req, res) => {
  try {
    const { name, designation, department } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Teacher name is required',
      });
    }

    const teacher = await Teacher.create({ name, designation, department });

    res.status(201).json({
      success: true,
      message: 'Teacher added successfully',
      teacher,
    });
  } catch (error) {
    console.error(`[Create Teacher Error]: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error while adding teacher',
    });
  }
};

/**
 * @desc    Get teachers selected for a specific Workload session
 * @route   GET /api/v1/workload/:workloadId/teachers
 * @access  Private (Admin)
 */
export const getWorkloadTeachers = async (req, res) => {
  try {
    const workloadTeachers = await WorkloadTeacher.find({
      workloadId: req.params.workloadId,
    })
      .populate('teacherId')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: workloadTeachers.length,
      workloadTeachers,
    });
  } catch (error) {
    console.error(`[Get Workload Teachers Error]: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error while fetching workload teachers',
    });
  }
};

/**
 * @desc    Bulk-select teachers for a Workload ("Save & Next" on Add Teachers step).
 *          Accepts a mix of existing teacherIds and brand-new teacher objects
 *          (new ones are created in the master list first, then linked).
 * @route   POST /api/v1/workload/:workloadId/teachers
 * @access  Private (Admin)
 */
export const addWorkloadTeachers = async (req, res) => {
  try {
    const { workloadId } = req.params;
    const { teacherIds = [], newTeachers = [] } = req.body;

    const workload = await Workload.findById(workloadId);
    if (!workload) {
      return res.status(404).json({
        success: false,
        message: 'Workload not found',
      });
    }

    if (teacherIds.length === 0 && newTeachers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one teacher is required',
      });
    }

    // Create any brand-new teachers in the master list first
    let createdTeachers = [];
    if (newTeachers.length > 0) {
      createdTeachers = await Teacher.insertMany(
        newTeachers.map((t) => ({
          name: t.name,
          designation: t.designation,
          department: t.department,
        }))
      );
    }

    const allTeacherIds = [...teacherIds, ...createdTeachers.map((t) => t._id)];

    // Insert selections, skipping ones already linked (unique index guards duplicates)
    const linkDocs = allTeacherIds.map((teacherId) => ({ workloadId, teacherId }));
    let insertedLinks = [];
    try {
      insertedLinks = await WorkloadTeacher.insertMany(linkDocs, { ordered: false });
    } catch (bulkError) {
      // Some inserts may fail on duplicates — that's fine, keep whichever succeeded
      insertedLinks = bulkError.insertedDocs || [];
    }

    if (workload.currentStep < 3) workload.currentStep = 3;
    if (workload.status === 'draft') workload.status = 'in_progress';
    await workload.save();

    const populatedLinks = await WorkloadTeacher.find({
      _id: { $in: insertedLinks.map((l) => l._id) },
    }).populate('teacherId');

    res.status(201).json({
      success: true,
      message: 'Teachers saved successfully',
      workloadTeachers: populatedLinks,
      workload,
    });
  } catch (error) {
    console.error(`[Add Workload Teachers Error]: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error while saving teachers',
    });
  }
};

/**
 * @desc    Remove a teacher from this Workload's selection (does NOT delete from master list)
 * @route   DELETE /api/v1/workload/teachers/:workloadTeacherId
 * @access  Private (Admin)
 */
export const removeWorkloadTeacher = async (req, res) => {
  try {
    const link = await WorkloadTeacher.findById(req.params.workloadTeacherId);

    if (!link) {
      return res.status(404).json({
        success: false,
        message: 'Teacher selection not found',
      });
    }

    await link.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Teacher removed from workload',
    });
  } catch (error) {
    console.error(`[Remove Workload Teacher Error]: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error while removing teacher',
    });
  }
};