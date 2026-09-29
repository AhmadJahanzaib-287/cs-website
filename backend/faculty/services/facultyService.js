import Faculty from '../models/Faculty.js';

/**
 * Service class handling core database operations and business logic
 * for Faculty management in the Computer Science Department system.
 */
class FacultyService {
  /**
   * Fetch faculty members with optional filtering, search, and pagination.
   *
   * @param {Object} queryParams - Express request query object (category, search, page, limit).
   * @returns {Promise<Object>} Data object containing results array, total count, and pagination info.
   */
  static async getAllFaculty(queryParams = {}) {
    const { category, search, page = 1, limit = 10 } = queryParams;

    const filter = {};

    // Apply category filter if provided and not set to 'All'
    if (category && category !== 'All') {
      filter.category = category;
    }

    // Apply text search on name, qualification, designation, or specializations
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { name: searchRegex },
        { qualification: searchRegex },
        { designation: searchRegex },
        { specializations: searchRegex },
      ];
    }

    // Calculate pagination offsets
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (pageNum - 1) * limitNum;

    // Execute query and total count in parallel
    const [facultyList, total] = await Promise.all([
      Faculty.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Faculty.countDocuments(filter),
    ]);

    return {
      faculty: facultyList,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  /**
   * Fetch a single faculty member by ID.
   *
   * @param {String} id - Faculty document ID.
   * @returns {Promise<Object|null>} Faculty document or null if not found.
   */
  static async getFacultyById(id) {
    return await Faculty.findById(id).lean();
  }

  /**
   * Create a new faculty member record.
   *
   * @param {Object} facultyData - Verified faculty details payload.
   * @returns {Promise<Object>} Newly created Faculty document.
   */
  static async createFaculty(facultyData) {
    const existingFaculty = await Faculty.findOne({ email: facultyData.email });
    if (existingFaculty) {
      const error = new Error('A faculty member with this email address already exists.');
      error.statusCode = 400;
      throw error;
    }

    const newFaculty = new Faculty(facultyData);
    return await newFaculty.save();
  }

  /**
   * Update an existing faculty member record by ID.
   *
   * @param {String} id - Faculty document ID.
   * @param {Object} updateData - Key-value pairs to update.
   * @returns {Promise<Object>} Updated Faculty document.
   */
  static async updateFaculty(id, updateData) {
    const faculty = await Faculty.findById(id);
    if (!faculty) {
      const error = new Error('Faculty member record not found.');
      error.statusCode = 404;
      throw error;
    }

    // Prevent duplicate email conflicts if email is being updated
    if (updateData.email && updateData.email !== faculty.email) {
      const existingEmail = await Faculty.findOne({ email: updateData.email });
      if (existingEmail) {
        const error = new Error('Another faculty member is already using this email address.');
        error.statusCode = 400;
        throw error;
      }
    }

    Object.assign(faculty, updateData);
    return await faculty.save();
  }

  /**
   * Delete a faculty member record by ID.
   *
   * @param {String} id - Faculty document ID.
   * @returns {Promise<Boolean>} Returns true on successful removal.
   */
  static async deleteFaculty(id) {
    const faculty = await Faculty.findById(id);
    if (!faculty) {
      const error = new Error('Faculty member record not found.');
      error.statusCode = 404;
      throw error;
    }

    await faculty.deleteOne();
    return true;
  }
}

export default FacultyService;