// backend/notice/routes/noticeRoutes.js
import express from 'express';
import {
  getNotices,
  getActiveNotice,
  getNoticeById,
  createNotice,
  updateNotice,
  deleteNotice,
  toggleNoticeStatus,
} from '../controllers/noticeController.js';
import { getPublicNoticeList } from '../controllers/noticeController.js';

// Note: If you have an authentication middleware in your project, you can import and apply it here.
// e.g., import { protect, adminOnly } from '../../middleware/authMiddleware.js';

const router = express.Router();

// Public Route (For website visitors to see currently active notice)
router.get('/active', getActiveNotice);
router.get('/public-list', getPublicNoticeList);

// Admin / Management Routes
router.get('/', getNotices);
router.get('/:id', getNoticeById);
router.post('/', createNotice);
router.put('/:id', updateNotice);
router.delete('/:id', deleteNotice);
router.patch('/:id/status', toggleNoticeStatus);

export default router;