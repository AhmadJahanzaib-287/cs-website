import Faculty from '../models/Faculty.js';

const parseSpecializations = (value) => {
  if (Array.isArray(value)) {
    if (value.length === 1 && typeof value[0] === 'string') {
      try {
        const parsed = JSON.parse(value[0]);
        if (Array.isArray(parsed)) {
          return parsed.map((item) => String(item).trim()).filter(Boolean);
        }
      } catch {
        // Treat non-JSON values as regular specialization labels.
      }
    }
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value !== 'string' || !value.trim()) return [];

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.map((item) => String(item).trim()).filter(Boolean);
    }
  } catch {
    // Older clients may send comma-separated values.
  }

  return value.split(',').map((item) => item.trim()).filter(Boolean);
};

/**
 * @desc    Get all faculty members (supports filtering & search)
 * @route   GET /api/faculty
 * @access  Public
 */
export const getFacultyMembers = async (req, res) => {
  try {
    const { category, search } = req.query;

    // Build dynamic query filter object
    let query = {};

    // Category filter
    if (category && category !== 'All') {
      query.category = category;
    }

    // Search query filter (matches name, qualification, or specializations)
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { name: searchRegex },
        { qualification: searchRegex },
        { specializations: searchRegex },
        { designation: searchRegex },
      ];
    }

    const faculty = await Faculty.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: faculty.length,
      data: faculty,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve faculty members.',
      error: error.message,
    });
  }
};

/**
 * @desc    Get a single faculty member by ID
 * @route   GET /api/faculty/:id
 * @access  Public
 */
export const getFacultyById = async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id);

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: 'Faculty member not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: faculty,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching faculty details.',
      error: error.message,
    });
  }
};

/**
 * @desc    Create a new faculty member profile
 * @route   POST /api/faculty
 * @access  Private/Admin
 */
export const createFaculty = async (req, res) => {
  try {
    const {
      name,
      designation,
      qualification,
      category,
      email,
      phone,
      office,
      experience,
      publicationsCount,
      specializations,
      bio,
      website,
    } = req.body;

    // Server-side validation
    if (!name || !qualification || !email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields (name, qualification, email).',
      });
    }

    // Check for existing email record
    const existingFaculty = await Faculty.findOne({ email });
    if (existingFaculty) {
      return res.status(400).json({
        success: false,
        message: 'A faculty member with this email address already exists.',
      });
    }

    // Process image avatar URL if uploaded (Multer middleware path attached to req.file)
    let avatarUrl = '';
    if (req.file) {
     avatarUrl = `/uploads/${req.file.filename}`;
    } else if (req.body.avatar) {
      avatarUrl = req.body.avatar;
    }

    const parsedSpecializations = parseSpecializations(specializations);

    const newFaculty = await Faculty.create({
      name,
      designation,
      qualification,
      category,
      email,
      phone,
      office,
      experience,
      publicationsCount: Number(publicationsCount) || 0,
      specializations: parsedSpecializations,
      bio,
      website,
      avatar: avatarUrl,
    });

    return res.status(201).json({
      success: true,
      message: 'Faculty member created successfully.',
      data: newFaculty,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server Error: Unable to create faculty record.',
      error: error.message,
    });
  }
};

/**
 * @desc    Update an existing faculty member profile
 * @route   PUT /api/faculty/:id
 * @access  Private/Admin
 */
export const updateFaculty = async (req, res) => {
  try {
    let faculty = await Faculty.findById(req.params.id);

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: 'Faculty member record not found.',
      });
    }

    const updateData = { ...req.body };

    // Process new image upload if present
    if (req.file) {
      updateData.avatar = `/uploads/${req.file.filename}`;
    }

    if (Object.hasOwn(updateData, 'specializations')) {
      updateData.specializations = parseSpecializations(updateData.specializations);
    }

    faculty = await Faculty.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      message: 'Faculty profile updated successfully.',
      data: faculty,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server Error: Unable to update faculty record.',
      error: error.message,
    });
  }
};

/**
 * @desc    Delete a faculty member profile
 * @route   DELETE /api/faculty/:id
 * @access  Private/Admin
 */
export const deleteFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id);

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: 'Faculty member not found.',
      });
    }

    await faculty.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Faculty member deleted successfully.',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server Error: Unable to delete faculty record.',
      error: error.message,
    });
  }
};