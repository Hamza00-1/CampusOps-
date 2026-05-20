import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { env } from '../../config/env';
import { logger } from '../../middleware/logger';
import { ApiError } from '../../middleware/errorHandler';
import { successResponse } from '../../utils/response';
import { runDailyPlanningNotifications } from './daily-planning.job';

/**
 * Constant-time HMAC verification for the X-OpenClaw-Signature header.
 * If OPENCLAW_WEBHOOK_SECRET is unset we reject all requests — fail closed.
 */
function verifySignature(rawBody: string, signature: string | undefined): boolean {
    if (!env.OPENCLAW_WEBHOOK_SECRET) return false;
    if (!signature) return false;
    const expected = crypto
        .createHmac('sha256', env.OPENCLAW_WEBHOOK_SECRET)
        .update(rawBody)
        .digest('hex');
    try {
        return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(signature, 'hex'));
    } catch {
        return false;
    }
}

export class OpenClawController {
    /** POST /api/openclaw/webhook — generic event receiver */
    async webhook(req: Request, res: Response, next: NextFunction) {
        try {
            const raw = JSON.stringify(req.body ?? {});
            const sig = req.header('x-openclaw-signature');

            if (!verifySignature(raw, sig)) {
                throw ApiError.unauthorized('Invalid OpenClaw signature');
            }

            const event = req.body?.event as string | undefined;
            const payload = req.body?.payload;

            logger.info(`🪝 OpenClaw event received: ${event || '(unknown)'}`);

            // Known events — extend here as OpenClaw publishes more types
            switch (event) {
                case 'planning.daily.trigger':
                    // Manual trigger from OpenClaw to fire the 7AM job out of schedule
                    await runDailyPlanningNotifications();
                    break;
                case 'health.ping':
                    // No-op — just acknowledge
                    break;
                default:
                    logger.warn(`🪝 OpenClaw event "${event}" has no handler — payload stored in logs only`, payload);
            }

            res.json(successResponse({ event, received: true }, 'Webhook accepted'));
        } catch (e) { next(e); }
    }

    /** POST /api/openclaw/trigger/daily-planning — manual fire (Admin only) */
    async triggerDailyPlanning(_req: Request, res: Response, next: NextFunction) {
        try {
            const summary = await runDailyPlanningNotifications();
            res.json(successResponse(summary, 'Daily planning notifications dispatched'));
        } catch (e) { next(e); }
    }
}

export const openclawController = new OpenClawController();
