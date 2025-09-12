import express from 'express';
import { login, me } from '../controllers/authController';
import { validateLogin, handleValidationErrors } from '../middleware';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

// POST /api/auth/login
router.post('/login', validateLogin, handleValidationErrors, login);

// GET /api/auth/me
router.get('/me', authenticateToken, me);

export default router;