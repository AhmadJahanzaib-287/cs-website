import express from 'express';
import rateLimit from 'express-rate-limit';
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth.js';
import { createApplication, getApplications, updateApplicationStatus } from './applicationController.js';

const router = express.Router();
const applicationSubmissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many applications submitted. Please try again later.' },
});
const adminOnly = [isAuthenticatedUser, authorizeRoles('admin', 'superadmin')];

router.post('/', applicationSubmissionLimiter, createApplication);
router.get('/', ...adminOnly, getApplications);
router.patch('/:id/status', ...adminOnly, updateApplicationStatus);

export default router;