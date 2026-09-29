import express from 'express';
import {
  addDownloadFile,
  getDownloadFiles,
  streamDownloadFile,
  updateDownloadFile,
  deleteDownloadFile,
} from '../controllers/downloadController.js';
import { isAuthenticatedUser } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Public — anyone can view the list or download a file
router.get('/', getDownloadFiles);
router.get('/file/:id', streamDownloadFile);

// Admin only — upload, update, delete
router.post('/', isAuthenticatedUser, upload.single('file'), addDownloadFile);
router.put('/:id', isAuthenticatedUser, upload.single('file'), updateDownloadFile);
router.delete('/:id', isAuthenticatedUser, deleteDownloadFile);

export default router;