import express from 'express';
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth.js';
import { getSettings, updateSettings } from './settingController.js';

const router = express.Router();

const adminOnly = [isAuthenticatedUser, authorizeRoles('admin', 'superadmin')];

router.get('/', getSettings);
router.put('/', ...adminOnly, updateSettings);

export default router;

