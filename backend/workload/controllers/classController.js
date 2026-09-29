import Class from '../models/Class.js';

/**
 * @desc    Get the full reusable Class master list (for search-select matching)
 * @route   GET /api/v1/workload/classes/master
 * @access  Private (Admin)
 */
export const getAllClasses = async (req, res) => {
  try {
    const classes = await Class.find().sort({ degree: 1, semesterNumber: 1, section: 1 });
    res.status(200).json({
      success: true,
      count: classes.length,
      classes,
    });
  } catch (error) {
    console.error(`[Get Classes Error]: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error while fetching classes',
    });
  }
};

/**
 * @desc    Add a new class to the reusable master list
 * @route   POST /api/v1/workload/classes/master
 * @access  Private (Admin)
 */
export const createClass = async (req, res) => {
  try {
    const { degree, semesterNumber, session, section } = req.body;

    if (!degree || !semesterNumber || !session) {
      return res.status(400).json({
        success: false,
        message: 'Degree, semester, and session are required',
      });
    }

    const newClass = await Class.create({ degree, semesterNumber, session, section });

    res.status(201).json({
      success: true,
      message: 'Class added successfully',
      class: newClass,
    });
  } catch (error) {
    console.error(`[Create Class Error]: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error while adding class',
    });
  }
};