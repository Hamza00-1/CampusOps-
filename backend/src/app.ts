import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { httpLogger } from './middleware/logger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { successResponse } from './utils/response';
import authRoutes from './modules/auth/auth.routes';

// ============================================
// CampusOps — Express Application
// ============================================

const app = express();

// ===== Global Middleware =====

// Security headers
app.use(helmet());

// CORS
app.use(cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Compression
app.use(compression());

// Request logging
app.use(httpLogger);

// ===== Rate Limiting =====

// Global rate limiter
const globalLimiter = rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX_REQUESTS,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many requests. Please try again later.',
    },
});
app.use(globalLimiter);

// Strict rate limiter for auth endpoints (prevent brute force)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 15,                   // 15 attempts per window
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many authentication attempts. Please try again in 15 minutes.',
    },
});

// ===== Health Check (outside API prefix) =====
app.get('/health', (_req, res) => {
    res.json(successResponse({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: env.NODE_ENV,
        version: '1.0.0',
    }, 'CampusOps API is running'));
});

// ===== API Routes =====
app.use(`${env.API_PREFIX}/auth`, authLimiter, authRoutes);

// Placeholder API root
app.get(env.API_PREFIX, (_req, res) => {
    res.json(successResponse({
        name: 'CampusOps API',
        version: '1.0.0',
        docs: `${env.API_PREFIX}/docs`,
        health: '/health',
        modules: [
            'auth', 'users', 'branches', 'modules', 'groups',
            'planning', 'absences', 'progress', 'payments',
            'notifications', 'mail',
        ],
    }, 'Welcome to CampusOps API'));
});

// ===== Error Handling =====
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
