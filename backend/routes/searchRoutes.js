import express from 'express';
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth.js';
import { globalSearch } from '../controllers/searchController.js';

const router = express.Router();

const adminOnly = [isAuthenticatedUser, authorizeRoles('admin', 'superadmin')];

router.get('/', ...adminOnly, globalSearch);

export default router;

