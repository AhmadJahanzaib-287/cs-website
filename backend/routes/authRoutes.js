import express from 'express';
import { login, logout, getMe } from '../controllers/authController.js';
import { isAuthenticatedUser } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', login);
router.post('/logout', isAuthenticatedUser, logout);
router.get('/me', isAuthenticatedUser, getMe);

export default router;