import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env';
import { httpLogger } from './middleware/logger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { successResponse } from './utils/response';
import { swaggerSpec } from './config/swagger';

// ===== Route Imports =====
import authRoutes from './modules/auth/auth.routes';
import branchRoutes from './modules/branches/branch.routes';
import userRoutes from './modules/users/user.routes';
import moduleRoutes from './modules/modules/module.routes';
import groupRoutes from './modules/groups/group.routes';
import planningRoutes from './modules/planning/planning.routes';
import absenceRoutes from './modules/absences/absence.routes';
import progressRoutes from './modules/progress/progress.routes';
import paymentRoutes from './modules/payments/payment.routes';
import notificationRoutes from './modules/notifications/notification.routes';

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
        version: '2.0.0',
    }, 'CampusOps API is running'));
});

// ===== Swagger API Docs =====
app.use(`${env.API_PREFIX}/docs`, swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'CampusOps API Docs',
}));

// ===== API Routes =====
app.use(`${env.API_PREFIX}/auth`, authLimiter, authRoutes);
app.use(`${env.API_PREFIX}/branches`, branchRoutes);
app.use(`${env.API_PREFIX}/users`, userRoutes);
app.use(`${env.API_PREFIX}/modules`, moduleRoutes);
app.use(`${env.API_PREFIX}/groups`, groupRoutes);
app.use(`${env.API_PREFIX}/planning`, planningRoutes);
app.use(`${env.API_PREFIX}/absences`, absenceRoutes);
app.use(`${env.API_PREFIX}/progress`, progressRoutes);
app.use(`${env.API_PREFIX}/payments`, paymentRoutes);
app.use(`${env.API_PREFIX}/notifications`, notificationRoutes);

// API root
app.get(env.API_PREFIX, (_req, res) => {
    res.json(successResponse({
        name: 'CampusOps API',
        version: '2.0.0',
        docs: `${env.API_PREFIX}/docs`,
        health: '/health',
        modules: [
            'auth', 'users', 'branches', 'modules', 'groups',
            'planning', 'absences', 'progress', 'payments',
            'notifications',
        ],
    }, 'Welcome to CampusOps API — All modules active'));
});

// ===== Error Handling =====
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
