import { Router, Request, Response } from 'express';
import { env } from '../../config/env';
import { routeUpdate } from './router';
import { logger } from '../../middleware/logger';

// ============================================
// Telegram Webhook — POST /api/telegram/webhook
// Telegram sends every bot update here.
// ============================================

const router = Router();

router.post('/webhook', async (req: Request, res: Response) => {
    // Verify the secret token Telegram includes in the header
    const secret = req.headers['x-telegram-bot-api-secret-token'];
    if (env.TELEGRAM_WEBHOOK_SECRET && secret !== env.TELEGRAM_WEBHOOK_SECRET) {
        logger.warn('🤖 Telegram webhook: invalid secret token');
        res.sendStatus(401);
        return;
    }

    // Acknowledge immediately — Telegram times out after 60s
    res.sendStatus(200);

    try {
        await routeUpdate(req.body);
    } catch (err: any) {
        logger.error(`🤖 Webhook processing error: ${err.message}`);
    }
});

// GET /api/telegram/generate-otp — authenticated users generate a linking OTP
// This endpoint is mounted in the telegram routes file, called from the app
export { router as telegramWebhookRouter };
