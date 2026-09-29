import Course from '../models/Course.js';

/**
 * @desc    Get the full reusable Course master list (for search-select dropdown)
 * @route   GET /api/v1/workload/courses/master
 * @access  Private (Admin)
 */
export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find().sort({ courseCode: 1 });
    res.status(200).json({
      success: true,
      count: courses.length,
      courses,
    });
  } catch (error) {
    console.error(`[Get Courses Error]: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error while fetching courses',
    });
  }
};

/**
 * @desc    Add a new course to the reusable master list
 * @route   POST /api/v1/workload/courses/master
 * @access  Private (Admin)
 */
export const createCourse = async (req, res) => {
  try {
    const { courseCode, title, creditHours } = req.body;

    if (!courseCode || !title) {
      return res.status(400).json({
        success: false,
        message: 'Course code and title are required',
      });
    }

    const course = await Course.create({ courseCode, title, creditHours });

    res.status(201).json({
      success: true,
      message: 'Course added successfully',
      course,
    });
  } catch (error) {
    console.error(`[Create Course Error]: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error while adding course',
    });
  }
};