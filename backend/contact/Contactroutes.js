import express from 'express';
import {
  createContactMessage,
  getContactMessages,
  toggleMessageReadStatus,
  deleteContactMessage,
} from './Contactcontroller.js';
import { isAuthenticatedUser } from '../middleware/auth.js';

const router = express.Router();

// Public — anyone can submit the contact form
router.post('/', createContactMessage);

// Admin only — view submitted messages
router.get('/', isAuthenticatedUser, getContactMessages);

router.patch('/:id/read', isAuthenticatedUser, toggleMessageReadStatus);
router.delete('/:id', isAuthenticatedUser, deleteContactMessage);

export default router;