import express from 'express';
import {
  getFacultyMembers,
  getFacultyById,
  createFaculty,
  updateFaculty,
  deleteFaculty,
} from '../controllers/facultyController.js';
import uploadFacultyImage from '../middlewares/uploadImage.js';

const router = express.Router();

/**
 * @route   GET /api/faculty
 * @desc    Fetch all faculty members (with query filtering & search)
 * @access  Public
 *
 * @route   POST /api/faculty
 * @desc    Create a new faculty profile (with single avatar image upload)
 * @access  Private/Admin
 */
router
  .route('/')
  .get(getFacultyMembers)
  .post(uploadFacultyImage, createFaculty);

/**
 * @route   GET /api/faculty/:id
 * @desc    Fetch a single faculty member profile by ID
 * @access  Public
 *
 * @route   PUT /api/faculty/:id
 * @desc    Update an existing faculty member profile (with single avatar image upload)
 * @access  Private/Admin
 *
 * @route   DELETE /api/faculty/:id
 * @desc    Delete a faculty member profile
 * @access  Private/Admin
 */
router
  .route('/:id')
  .get(getFacultyById)
  .put(uploadFacultyImage, updateFaculty)
  .delete(deleteFaculty);

export default router;