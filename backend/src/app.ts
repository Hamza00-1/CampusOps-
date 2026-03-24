import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { env } from './config/env';
import { httpLogger } from './middleware/logger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { successResponse } from './utils/response';

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
// Each module's routes will be mounted here in later phases:
//   app.use(`${env.API_PREFIX}/auth`, authRoutes);
//   app.use(`${env.API_PREFIX}/users`, userRoutes);
//   etc.

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
