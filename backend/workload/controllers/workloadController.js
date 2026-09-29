import Workload from '../models/Workload.js';
import WorkloadClass from '../models/WorkloadClass.js';
import WorkloadAssignment from '../models/WorkloadAssignment.js';
import Class from '../models//Class.js';

/**
 * @desc    Create a new Workload session (Year + Semester) — Step "+ Create New"
 * @route   POST /api/v1/workload
 * @access  Private (Admin)
 */
export const createWorkload = async (req, res) => {
  try {
    const { year, semester } = req.body;

    if (!year || !semester) {
      return res.status(400).json({
        success: false,
        message: 'Year and Semester are required',
      });
    }

    const newWorkload = await Workload.create({
      year,
      semester,
      title: `${semester} Semester ${year}`,
      createdBy: req.user?.id,
    });

    res.status(201).json({
      success: true,
      message: 'Workload created successfully',
      workload: newWorkload,
    });
  } catch (error) {
    console.error(`[Create Workload Error]: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error while creating workload',
    });
  }
};

/**
 * @desc    Get all Workload sessions (for the list/dashboard page)
 * @route   GET /api/v1/workload
 * @access  Private (Admin)
 */
export const getWorkloads = async (req, res) => {
  try {
    const workloads = await Workload.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: workloads.length,
      workloads,
    });
  } catch (error) {
    console.error(`[Get Workloads Error]: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error while fetching workloads',
    });
  }
};

/**
 * @desc    Get a single Workload by ID (used when user clicks "Continue" on a card)
 * @route   GET /api/v1/workload/:id
 * @access  Private (Admin)
 */
export const getWorkloadById = async (req, res) => {
  try {
    const workload = await Workload.findById(req.params.id);

    if (!workload) {
      return res.status(404).json({
        success: false,
        message: 'Workload not found',
      });
    }

    res.status(200).json({
      success: true,
      workload,
    });
  } catch (error) {
    console.error(`[Get Workload Error]: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error while fetching workload',
    });
  }
};

/**
 * @desc    Update a Workload's current step / status (wizard progress tracking)
 * @route   PUT /api/v1/workload/:id
 * @access  Private (Admin)
 */
export const updateWorkload = async (req, res) => {
  try {
    const workload = await Workload.findById(req.params.id);

    if (!workload) {
      return res.status(404).json({
        success: false,
        message: 'Workload not found',
      });
    }

    const { currentStep, status, year, semester } = req.body;

    if (currentStep !== undefined) workload.currentStep = currentStep;
    if (status) workload.status = status;
    if (year) workload.year = year;
    if (semester) workload.semester = semester;

    await workload.save();

    res.status(200).json({
      success: true,
      message: 'Workload updated successfully',
      workload,
    });
  } catch (error) {
    console.error(`[Update Workload Error]: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error while updating workload',
    });
  }
};

/**
 * @desc    Delete a Workload session
 * @route   DELETE /api/v1/workload/:id
 * @access  Private (Admin)
 */
export const deleteWorkload = async (req, res) => {
  try {
    const workload = await Workload.findById(req.params.id);
 
    if (!workload) {
      return res.status(404).json({
        success: false,
        message: 'Workload not found',
      });
    }
 
    await WorkloadAssignment.deleteMany({ workloadId: workload._id });
    await workload.deleteOne();
 
    res.status(200).json({
      success: true,
      message: 'Workload deleted successfully',
    });
  } catch (error) {
    console.error(`[Delete Workload Error]: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error while deleting workload',
    });
  }
};

/**
 * @desc    Get all classes registered under a specific Workload
 * @route   GET /api/v1/workload/:workloadId/classes
 * @access  Private (Admin)
 */
export const getWorkloadClasses = async (req, res) => {
  try {
    const workloadClasses = await WorkloadClass.find({
      workloadId: req.params.workloadId,
    })
      .populate('classId')
      .sort({ createdAt: 1 });
 
    res.status(200).json({
      success: true,
      count: workloadClasses.length,
      workloadClasses,
    });
  } catch (error) {
    console.error(`[Get Workload Classes Error]: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error while fetching classes',
    });
  }
};
 

/**
 * @desc    Bulk-select classes for a Workload ("Save & Next" on Register Classes step).
 *          Accepts a mix of existing classIds and brand-new class objects (new ones are
 *          created in the master list first, then linked) — same pattern as teachers.
 * @route   POST /api/v1/workload/:workloadId/classes
 * @access  Private (Admin)
 */
export const addWorkloadClasses = async (req, res) => {
  try {
    const { workloadId } = req.params;
    const { classIds = [], newClasses = [] } = req.body;
 
    const workload = await Workload.findById(workloadId);
    if (!workload) {
      return res.status(404).json({
        success: false,
        message: 'Workload not found',
      });
    }
 
    if (classIds.length === 0 && newClasses.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one class is required',
      });
    }
 
    let createdClasses = [];
    if (newClasses.length > 0) {
      createdClasses = await Class.insertMany(
        newClasses.map((c) => ({
          degree: c.degree,
          semesterNumber: c.semesterNumber,
          session: c.session,
          section: c.section,
        }))
      );
    }
 
    const allClassIds = [...classIds, ...createdClasses.map((c) => c._id)];
 
    const linkDocs = allClassIds.map((classId) => ({ workloadId, classId }));
    let insertedLinks = [];
    try {
      insertedLinks = await WorkloadClass.insertMany(linkDocs, { ordered: false });
    } catch (bulkError) {
      insertedLinks = bulkError.insertedDocs || [];
    }
 
    if (workload.currentStep < 2) workload.currentStep = 2;
    if (workload.status === 'draft') workload.status = 'in_progress';
    await workload.save();
 
    const populatedLinks = await WorkloadClass.find({
      _id: { $in: insertedLinks.map((l) => l._id) },
    }).populate('classId');
 
    res.status(201).json({
      success: true,
      message: 'Classes saved successfully',
      workloadClasses: populatedLinks,
      workload,
    });
  } catch (error) {
    console.error(`[Add Workload Classes Error]: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error while saving classes',
    });
  }
};
/**
 * @desc    Remove a class from this Workload's selection (does NOT delete the
 *          master Class — same pattern as removeWorkloadTeacher)
 * @route   DELETE /api/v1/workload/classes/:workloadClassId
 * @access  Private (Admin)
 */
export const deleteWorkloadClass = async (req, res) => {
  try {
    const link = await WorkloadClass.findById(req.params.workloadClassId);
 
    if (!link) {
      return res.status(404).json({
        success: false,
        message: 'Class selection not found',
      });
    }
 
    await link.deleteOne();
 
    res.status(200).json({
      success: true,
      message: 'Class removed from workload',
    });
  } catch (error) {
    console.error(`[Delete Workload Class Error]: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error while removing class',
    });
  }
};
 