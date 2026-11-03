import express from 'express';
import rateLimit from 'express-rate-limit';
import { login, logout, getMe, removeAvatar, updateAvatar, updatePassword } from '../controllers/authController.js';
import { createAdminInvitation, completeAdminInvitation, getAdminInvitation } from '../controllers/adminInvitationController.js';
import { authorizeRoles, isAuthenticatedUser } from '../middleware/auth.js';

const router = express.Router();
const invitationSetupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/login', login);
router.post('/logout', isAuthenticatedUser, logout);
router.get('/me', isAuthenticatedUser, getMe);
router.put('/password', isAuthenticatedUser, updatePassword);
router.put('/avatar', isAuthenticatedUser, updateAvatar);
router.delete('/avatar', isAuthenticatedUser, removeAvatar);
router.post('/admin-invitations', isAuthenticatedUser, authorizeRoles('superadmin'), createAdminInvitation);
router.get('/admin-invitations/:token', invitationSetupLimiter, getAdminInvitation);
router.post('/admin-invitations/complete', invitationSetupLimiter, completeAdminInvitation);

export default router;