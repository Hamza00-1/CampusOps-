import { Router, Request, Response } from 'express';
import { authenticate } from '../../middleware/auth';
import { prisma } from '../../config/database';
import { successResponse } from '../../utils/response';
import { ApiError } from '../../middleware/errorHandler';
import { telegramWebhookRouter } from '../../integrations/telegram/webhook';
import { isTelegramConfigured } from '../../services/telegram.service';
import crypto from 'crypto';

// ============================================
// Telegram Routes
//   POST /api/telegram/webhook      — Telegram Bot updates
//   POST /api/telegram/generate-otp — Authenticated: generate a linking OTP
//   GET  /api/telegram/status       — Check if telegram is linked
// ============================================

const router = Router();

// Mount webhook (no auth — Telegram sends updates here)
router.use('/', telegramWebhookRouter);

/**
 * POST /api/telegram/generate-otp
 * Generates a 6-digit OTP that users send via the bot to link their account.
 */
router.post('/generate-otp', authenticate, async (req: Request, res: Response) => {
    const userId = req.user!.id;

    if (!isTelegramConfigured()) {
        throw ApiError.badRequest('Telegram bot is not configured on this server');
    }

    // Generate a 6-digit numeric OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    await prisma.user.update({
        where: { id: userId },
        data: { otpCode: otp },
    });

    res.json(successResponse({ otp }, 'Send this code to the CampusOps Telegram bot using /link ' + otp));
});

/**
 * GET /api/telegram/status
 * Returns whether the current user has Telegram linked.
 */
router.get('/status', authenticate, async (req: Request, res: Response) => {
    const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        select: { telegramChatId: true },
    });

    res.json(successResponse({
        linked: !!user?.telegramChatId,
        botConfigured: isTelegramConfigured(),
    }));
});

/**
 * DELETE /api/telegram/unlink
 * Unlinks Telegram from the authenticated user's account.
 */
router.delete('/unlink', authenticate, async (req: Request, res: Response) => {
    await prisma.user.update({
        where: { id: req.user!.id },
        data: { telegramChatId: null },
    });
    res.json(successResponse(null, 'Telegram account unlinked'));
});

export default router;
