import { z } from 'zod';
import dotenv from 'dotenv';

// Load .env file in non-production environments
dotenv.config();

// ============================================
// Environment Schema — Validates ALL env vars
// at startup. If anything is missing or invalid,
// the server crashes immediately with a clear error.
// ============================================
const envSchema = z.object({
    // Server
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().default(3000),
    API_PREFIX: z.string().default('/api'),

    // Database
    DATABASE_URL: z.string().url(),

    // Redis
    REDIS_URL: z.string().default('redis://localhost:6379'),

    // JWT
    JWT_ACCESS_SECRET: z.string().min(16),
    JWT_REFRESH_SECRET: z.string().min(16),
    JWT_ACCESS_EXPIRY: z.string().default('15m'),
    JWT_REFRESH_EXPIRY: z.string().default('7d'),

    // Bcrypt
    BCRYPT_SALT_ROUNDS: z.coerce.number().min(8).max(16).default(12),

    // Rate Limiting
    RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),    // 15 min
    RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),

    // CORS
    CORS_ORIGIN: z.string().default('http://localhost:5173'),

    // Logging
    LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'debug']).default('info'),
});

// Parse and validate — will throw if invalid
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error('❌ Invalid environment variables:');
    console.error(parsed.error.flatten().fieldErrors);
    process.exit(1);
}

export const env = parsed.data;
export type Env = z.infer<typeof envSchema>;
