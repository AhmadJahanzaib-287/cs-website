import Course from '../models/Course.js';
import WorkloadAssignment from '../models/WorkloadAssignment.js';

/**
 * @desc    Get all course assignments for a specific class within a Workload
 * @route   GET /api/v1/workload/:workloadId/classes/:classId/assignments
 * @access  Private (Admin)
 */
export const getClassAssignments = async (req, res) => {
  try {
    const { workloadId, classId } = req.params;

    const assignments = await WorkloadAssignment.find({ workloadId, classId })
      .populate('courseId')
      .populate('teachers.teacherId')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: assignments.length,
      assignments,
    });
  } catch (error) {
    console.error(`[Get Class Assignments Error]: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error while fetching assignments',
    });
  }
};

/**
 * @desc    Add a course (+ its teacher rows) to a class — saves instantly
 * @route   POST /api/v1/workload/:workloadId/classes/:classId/assignments
 * @access  Private (Admin)
 */
export const addAssignment = async (req, res) => {
  try {
    const { workloadId, classId } = req.params;
    const { courseId, newCourse, teachers } = req.body;

    if (!Array.isArray(teachers) || teachers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one teacher is required for this course',
      });
    }

    let resolvedCourseId = courseId;

    // If this course doesn't exist in the master list yet, create it first
    if (!resolvedCourseId && newCourse) {
      if (!newCourse.courseCode || !newCourse.title) {
        return res.status(400).json({
          success: false,
          message: 'Course code and title are required for a new course',
        });
      }
      const createdCourse = await Course.create({
        courseCode: newCourse.courseCode,
        title: newCourse.title,
        creditHours: newCourse.creditHours,
      });
      resolvedCourseId = createdCourse._id;
    }

    if (!resolvedCourseId) {
      return res.status(400).json({
        success: false,
        message: 'A course is required',
      });
    }

    const assignment = await WorkloadAssignment.create({
      workloadId,
      classId,
      courseId: resolvedCourseId,
      teachers,
    });

    const populated = await WorkloadAssignment.findById(assignment._id)
      .populate('courseId')
      .populate('teachers.teacherId');

    res.status(201).json({
      success: true,
      message: 'Course assigned successfully',
      assignment: populated,
    });
  } catch (error) {
    console.error(`[Add Assignment Error]: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error while saving assignment',
    });
  }
};

/**
 * @desc    Delete a course assignment from a class
 * @route   DELETE /api/v1/workload/assignments/:assignmentId
 * @access  Private (Admin)
 */
export const deleteAssignment = async (req, res) => {
  try {
    const assignment = await WorkloadAssignment.findById(req.params.assignmentId);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found',
      });
    }

    await assignment.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Assignment removed successfully',
    });
  } catch (error) {
    console.error(`[Delete Assignment Error]: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error while deleting assignment',
    });
  }
};