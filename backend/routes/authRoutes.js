import express from 'express';
import { login, logout, getMe, removeAvatar, updateAvatar, updatePassword } from '../controllers/authController.js';
import { isAuthenticatedUser } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', login);
router.post('/logout', isAuthenticatedUser, logout);
router.get('/me', isAuthenticatedUser, getMe);
router.put('/password', isAuthenticatedUser, updatePassword);
router.put('/avatar', isAuthenticatedUser, updateAvatar);
router.delete('/avatar', isAuthenticatedUser, removeAvatar);

export default router;