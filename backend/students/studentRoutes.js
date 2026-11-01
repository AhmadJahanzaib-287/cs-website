import express from 'express';
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth.js';
import {
  getStudents,
  getStudentStats,
  getStudentById,
  createStudent,
  createBulkStudents,
  updateStudent,
  deleteStudent,
  bulkDeleteStudents,
} from './studentController.js';

const router = express.Router();

const adminOnly = [isAuthenticatedUser, authorizeRoles('admin', 'superadmin')];

// Stats route must be before /:id
router.get('/stats', ...adminOnly, getStudentStats);

router.get('/', ...adminOnly, getStudents);
router.post('/', ...adminOnly, createStudent);
router.post('/bulk', ...adminOnly, createBulkStudents);
router.post('/bulk-delete', ...adminOnly, bulkDeleteStudents);

router.get('/:id', ...adminOnly, getStudentById);
router.put('/:id', ...adminOnly, updateStudent);
router.delete('/:id', ...adminOnly, deleteStudent);

export default router;

