import { Router } from 'express';
import { authController } from './auth.controller';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validator';
import {
    registerSchema,
    loginSchema,
    refreshTokenSchema,
    changePasswordSchema,
} from './auth.schemas';

// ============================================
// Auth Routes
// ============================================
// POST /api/auth/register      — Create account
// POST /api/auth/login         — Login, get tokens
// POST /api/auth/refresh       — Refresh access token
// POST /api/auth/logout        — Invalidate refresh token
// PUT  /api/auth/change-password — Change password
// GET  /api/auth/profile       — Get current user profile
// ============================================

const router = Router();

// Public routes (no auth needed)
router.post('/register', validate({ body: registerSchema }), authController.register);
router.post('/login', validate({ body: loginSchema }), authController.login);
router.post('/refresh', validate({ body: refreshTokenSchema }), authController.refresh);

// Protected routes (auth required)
router.post('/logout', authenticate, authController.logout);
router.put('/change-password', authenticate, validate({ body: changePasswordSchema }), authController.changePassword);
router.get('/profile', authenticate, authController.getProfile);

export default router;
