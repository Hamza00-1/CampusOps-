// ============================================
// CampusOps — Telegram Controller
// ============================================
import { Request, Response, NextFunction } from 'express';
import { getRedisClient } from '../../config/redis';
import { prisma } from '../../config/database';
import { sendTelegramMessage, isTelegramConfigured, httpsPost } from '../../services/telegram.service';
import { successResponse } from '../../utils/response';
import { ApiError } from '../../middleware/errorHandler';
import { env } from '../../config/env';
import { logger } from '../../middleware/logger';

const TELEGRAM_API = 'https://api.telegram.org/bot';
const CODE_TTL_SECONDS = 300; // 5 minutes

/**
 * POST /api/telegram/webhook
 * Receives updates from Telegram (set via setWebhook or via polling).
 * When a user sends /start, we generate a link code and reply with it.
 */
export async function handleWebhook(req: Request, res: Response, next: NextFunction) {
    try {
        const update = req.body;
        const message = update?.message;

        if (!message || !message.text) {
            res.json({ ok: true }); return;
        }

        const chatId = String(message.chat.id);
        const text: string = message.text.trim();
        const firstName = message.from?.first_name || 'there';

        if (text === '/start' || text.startsWith('/start ')) {
            // Generate a random 6-digit code
            const code = String(Math.floor(100000 + Math.random() * 900000));
            const redis = getRedisClient();
            await redis.setex(`tg_link:${code}`, CODE_TTL_SECONDS, chatId);

            const reply =
                `👋 Hello ${firstName}!\n\n` +
                `Welcome to *CampusOps Bot*.\n\n` +
                `Your link code is:\n\n` +
                `🔑 \`${code}\`\n\n` +
                `Paste this code in the *Settings → Telegram* section of your CampusOps account within *5 minutes*.\n\n` +
                `_This code expires in 5 minutes._`;

            await sendTelegramMessage(chatId, reply);
            logger.info(`🤖 Telegram link code ${code} sent to chatId=${chatId}`);
        } else if (text === '/help') {
            await sendTelegramMessage(chatId,
                `*CampusOps Bot Commands*\n\n` +
                `/start — Get a link code to connect your account\n` +
                `/help — Show this help message\n\n` +
                `Once linked, you will receive instant notifications from CampusOps here.`
            );
        } else if (text === '/status') {
            // Check if this chatId is linked to any user
            const user = await prisma.user.findFirst({ where: { telegramChatId: chatId }, select: { name: true, email: true } });
            if (user) {
                await sendTelegramMessage(chatId, `✅ Your Telegram is linked to *${user.name}* (${user.email}).`);
            } else {
                await sendTelegramMessage(chatId, `❌ This Telegram account is not linked to any CampusOps account.\n\nSend /start to get a link code.`);
            }
        } else {
            await sendTelegramMessage(chatId,
                `I only understand commands. Send /start to link your account or /help for more info.`
            );
        }

        res.json({ ok: true });
    } catch (err) {
        next(err);
    }
}

/**
 * POST /api/telegram/link
 * Body: { code: "123456" }
 * The authenticated user submits the code they received from the bot.
 * Backend validates the code → saves chatId to user record → sends confirmation.
 */
export async function linkAccount(req: Request, res: Response, next: NextFunction) {
    try {
        const { code } = req.body;
        if (!code || !/^\d{6}$/.test(String(code))) {
            throw ApiError.badRequest('Invalid code format. Code must be 6 digits.');
        }

        const redis = getRedisClient();
        const chatId = await redis.get(`tg_link:${String(code)}`);
        if (!chatId) {
            throw ApiError.badRequest('Code is invalid or has expired. Please send /start to the bot again.');
        }

        // Check if this chatId is already used by another user
        const alreadyLinked = await prisma.user.findFirst({
            where: { telegramChatId: chatId, NOT: { id: req.user!.id } },
            select: { id: true },
        });
        if (alreadyLinked) {
            await redis.del(`tg_link:${String(code)}`);
            throw ApiError.conflict('This Telegram account is already linked to another CampusOps user.');
        }

        // Save telegramChatId to the user
        const user = await prisma.user.update({
            where: { id: req.user!.id },
            data: { telegramChatId: chatId },
            select: { id: true, name: true, email: true, telegramChatId: true },
        });

        // Consume the code
        await redis.del(`tg_link:${String(code)}`);

        // Send confirmation message on Telegram
        await sendTelegramMessage(chatId,
            `✅ *Account linked successfully!*\n\n` +
            `Your CampusOps account (*${user.name}*) is now connected.\n\n` +
            `You will receive instant notifications here from now on. 🎉`
        );

        logger.info(`🤖 Telegram linked: userId=${user.id} → chatId=${chatId}`);
        res.json(successResponse(user, 'Telegram account linked successfully'));
    } catch (err) {
        next(err);
    }
}

/**
 * POST /api/telegram/unlink
 * Removes the telegramChatId from the authenticated user.
 */
export async function unlinkAccount(req: Request, res: Response, next: NextFunction) {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.user!.id }, select: { telegramChatId: true, name: true } });

        if (user?.telegramChatId) {
            // Notify them on Telegram before unlinking
            await sendTelegramMessage(user.telegramChatId,
                `ℹ️ Your Telegram has been *unlinked* from CampusOps.\n\nSend /start if you want to reconnect.`
            );
        }

        const updated = await prisma.user.update({
            where: { id: req.user!.id },
            data: { telegramChatId: null },
            select: { id: true, name: true, email: true, telegramChatId: true },
        });

        res.json(successResponse(updated, 'Telegram account unlinked'));
    } catch (err) {
        next(err);
    }
}

/**
 * GET /api/telegram/status
 * Returns whether the current user has Telegram linked.
 */
export async function getStatus(req: Request, res: Response, next: NextFunction) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user!.id },
            select: { telegramChatId: true },
        });
        res.json(successResponse({
            linked: !!user?.telegramChatId,
            chatId: user?.telegramChatId || null,
            botConfigured: isTelegramConfigured(),
        }, 'Telegram status'));
    } catch (err) {
        next(err);
    }
}

/**
 * POST /api/telegram/test
 * Sends a test message to the authenticated user (must be linked).
 */
export async function sendTest(req: Request, res: Response, next: NextFunction) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user!.id },
            select: { telegramChatId: true, name: true },
        });

        if (!user?.telegramChatId) {
            throw ApiError.badRequest('Telegram not linked. Please link your account first.');
        }

        const ok = await sendTelegramMessage(user.telegramChatId,
            `🔔 *Test notification from CampusOps*\n\nHello ${user.name}! Your Telegram notifications are working perfectly. ✅`
        );

        res.json(successResponse({ sent: ok }, ok ? 'Test message sent' : 'Failed to send — check bot token'));
    } catch (err) {
        next(err);
    }
}
