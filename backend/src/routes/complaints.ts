import express from 'express';
import {
  createComplaint,
  getAllComplaints,
  getComplaintById,
  updateComplaint,
  deleteComplaint
} from '../controllers/complaintsController';
import { createComment, getComments } from '../controllers/commentsController';
import {
  authenticateToken,
  requireRole,
  validateComplaint,
  validateComplaintId,
  validateStatus,
  validateComment,
  validatePagination,
  handleValidationErrors
} from '../middleware';

const router = express.Router();

// Public routes
// POST /api/complaints
router.post('/', validateComplaint, handleValidationErrors, createComplaint);

// Protected admin routes
// GET /api/complaints
router.get('/', 
  authenticateToken, 
  requireRole(['admin', 'agent']), 
  validatePagination, 
  handleValidationErrors, 
  getAllComplaints
);

// GET /api/complaints/:id
router.get('/:id', 
  authenticateToken, 
  requireRole(['admin', 'agent']), 
  validateComplaintId, 
  handleValidationErrors, 
  getComplaintById
);

// PATCH /api/complaints/:id
router.patch('/:id', 
  authenticateToken, 
  requireRole(['admin', 'agent']), 
  validateComplaintId, 
  validateStatus, 
  handleValidationErrors, 
  updateComplaint
);

// DELETE /api/complaints/:id
router.delete('/:id', 
  authenticateToken, 
  requireRole(['admin']), 
  validateComplaintId, 
  handleValidationErrors, 
  deleteComplaint
);

// Comment routes
// POST /api/complaints/:id/comments
router.post('/:id/comments', 
  authenticateToken, 
  requireRole(['admin', 'agent']), 
  validateComplaintId, 
  validateComment, 
  handleValidationErrors, 
  createComment
);

// GET /api/complaints/:id/comments
router.get('/:id/comments', 
  authenticateToken, 
  requireRole(['admin', 'agent']), 
  validateComplaintId, 
  handleValidationErrors, 
  getComments
);

export default router;