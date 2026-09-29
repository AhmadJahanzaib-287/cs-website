import express from 'express';
import {
  createWorkload,
  getWorkloads,
  getWorkloadById,
  updateWorkload,
  deleteWorkload,
  getWorkloadClasses,
  addWorkloadClasses,
  deleteWorkloadClass,
} from '../controllers/workloadController.js';

import {
  getAllTeachers,
  createTeacher,
  getWorkloadTeachers,
  addWorkloadTeachers,
  removeWorkloadTeacher,
} from '../controllers/teacherController.js';

import { getAllClasses, createClass } from '../controllers/classController.js';

import {
  getAllCourses,
  createCourse,
} from '../controllers/courseController.js';
import {
  getClassAssignments,
  addAssignment,
  deleteAssignment,
} from '../controllers/assignmentController.js';

import {
  getClassWiseReport,
  getTeacherWiseReport,
  getCourseWiseReport,
} from '../controllers/reportController.js';

import { isAuthenticatedUser } from '../../middleware/auth.js';

const router = express.Router();

// Workload Management is Admin-only end to end — no public routes
router.get('/', isAuthenticatedUser, getWorkloads);
router.post('/', isAuthenticatedUser, createWorkload);
router.get('/:id', isAuthenticatedUser, getWorkloadById);
router.put('/:id', isAuthenticatedUser, updateWorkload);
router.delete('/:id', isAuthenticatedUser, deleteWorkload);
router.get('/:workloadId/classes', isAuthenticatedUser, getWorkloadClasses);
router.post('/:workloadId/classes', isAuthenticatedUser, addWorkloadClasses);
router.delete('/classes/:classId', isAuthenticatedUser, deleteWorkloadClass);

router.get('/teachers/master', isAuthenticatedUser, getAllTeachers);
router.post('/teachers/master', isAuthenticatedUser, createTeacher);
router.get('/:workloadId/teachers', isAuthenticatedUser, getWorkloadTeachers);
router.post('/:workloadId/teachers', isAuthenticatedUser, addWorkloadTeachers);
router.delete('/teachers/:workloadTeacherId', isAuthenticatedUser, removeWorkloadTeacher);

router.get('/courses/master', isAuthenticatedUser, getAllCourses);
router.post('/courses/master', isAuthenticatedUser, createCourse);
router.get('/:workloadId/classes/:classId/assignments', isAuthenticatedUser, getClassAssignments);
router.post('/:workloadId/classes/:classId/assignments', isAuthenticatedUser, addAssignment);
router.delete('/assignments/:assignmentId', isAuthenticatedUser, deleteAssignment);

router.get('/:workloadId/report/class-wise', isAuthenticatedUser, getClassWiseReport);
router.get('/:workloadId/report/teacher-wise', isAuthenticatedUser, getTeacherWiseReport);
router.get('/:workloadId/report/course-wise', isAuthenticatedUser, getCourseWiseReport);

router.get('/classes/master', isAuthenticatedUser, getAllClasses);
router.post('/classes/master', isAuthenticatedUser, createClass);

export default router;