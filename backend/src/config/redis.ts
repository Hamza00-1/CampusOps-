import Redis from 'ioredis';
import { env } from './env';
import { logger } from '../middleware/logger';

// ============================================
// Redis Client
// ============================================

// In-memory fallback: mirrors the setex/get/del subset used for OTP codes.
// Active when Redis is unreachable (no Redis install needed for local dev).
const memStore = new Map<string, { value: string; expiresAt: number }>();

function memSet(key: string, ttlSeconds: number, value: string): void {
    memStore.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
}
function memGet(key: string): string | null {
    const entry = memStore.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) { memStore.delete(key); return null; }
    return entry.value;
}
function memDel(key: string): void { memStore.delete(key); }

let redisAvailable = false;
let redis: Redis | null = null;

export function getRedisClient(): any {
    if (!redis) {
        redis = new Redis(env.REDIS_URL, {
            maxRetriesPerRequest: 1,
            retryStrategy(times: number) {
                if (times > 2) return null;
                return Math.min(times * 200, 1000);
            },
            lazyConnect: true,
        });

        redis.on('connect', () => {
            redisAvailable = true;
            logger.info('🔴 Redis connected');
        });

        redis.on('error', () => {
            redisAvailable = false;
        });
    }

    // Return a thin proxy: real Redis when available, in-memory fallback otherwise.
    return {
        setex: async (key: string, ttl: number, value: string) => {
            if (redisAvailable) return redis!.setex(key, ttl, value);
            memSet(key, ttl, value); return 'OK';
        },
        get: async (key: string) => {
            if (redisAvailable) return redis!.get(key);
            return memGet(key);
        },
        del: async (key: string) => {
            if (redisAvailable) return redis!.del(key);
            memDel(key); return 1;
        },
    };
}

export async function connectRedis(): Promise<void> {
    try {
        if (!redis) getRedisClient(); // initialise the ioredis instance
        await redis!.connect();
    } catch {
        logger.warn('⚠️  Redis not available — using in-memory fallback for OTP codes');
    }
}

export async function disconnectRedis(): Promise<void> {
    if (redis) {
        try { await redis.quit(); } catch { /* ignore */ }
        redis = null;
    }
}
