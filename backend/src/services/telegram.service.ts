// ============================================
// CampusOps — Telegram Bot Service
// ============================================
import { env } from '../config/env';
import { logger } from '../middleware/logger';

const TELEGRAM_API = 'https://api.telegram.org/bot';

/**
 * Check if Telegram Bot is configured.
 */
export function isTelegramConfigured(): boolean {
    return !!env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_BOT_TOKEN !== 'your-telegram-bot-token';
}

/**
 * Send a text message to a Telegram chat.
 * @param chatId — The user's Telegram chat ID (stored in user.telegramChatId)
 * @param text — The message text (supports Markdown)
 * @returns true if sent successfully
 */
export async function sendTelegramMessage(chatId: string, text: string): Promise<boolean> {
    if (!isTelegramConfigured()) {
        logger.warn(`🤖 Telegram skipped (bot not configured): → chatId=${chatId}`);
        return false;
    }

    try {
        const url = `${TELEGRAM_API}${env.TELEGRAM_BOT_TOKEN}/sendMessage`;
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text,
                parse_mode: 'Markdown',
                disable_web_page_preview: true,
            }),
        });

        const data = await res.json();

        if (!data.ok) {
            logger.error(`🤖 Telegram API error: ${data.description} (chatId=${chatId})`);
            return false;
        }

        logger.info(`🤖 Telegram message sent → chatId=${chatId}`);
        return true;
    } catch (err: any) {
        logger.error(`🤖 Telegram failed: ${err.message}`);
        return false;
    }
}

/**
 * Build a formatted Telegram notification message.
 */
export function buildTelegramMessage(title: string, body: string, type: string = 'info'): string {
    const icons: Record<string, string> = {
        info: 'ℹ️',
        alert: '🚨',
        reminder: '⏰',
        success: '✅',
    };
    const icon = icons[type] || 'ℹ️';
    return `${icon} *${title}*\n\n${body}\n\n_— CampusOps_`;
}

/**
 * Send a notification to multiple Telegram chat IDs.
 * Returns the number of successful sends.
 */
export async function broadcastTelegram(
    chatIds: string[],
    title: string,
    body: string,
    type: string = 'info'
): Promise<number> {
    if (!isTelegramConfigured()) {
        logger.warn(`🤖 Telegram broadcast skipped (bot not configured) — ${chatIds.length} recipients`);
        return 0;
    }

    const message = buildTelegramMessage(title, body, type);
    let successCount = 0;

    // Send sequentially to respect Telegram rate limits (30 msg/sec for bots)
    for (const chatId of chatIds) {
        const ok = await sendTelegramMessage(chatId, message);
        if (ok) successCount++;
        // Small delay to respect rate limits
        if (chatIds.length > 10) {
            await new Promise(r => setTimeout(r, 50));
        }
    }

    logger.info(`🤖 Telegram broadcast: ${successCount}/${chatIds.length} delivered`);
    return successCount;
}

/**
 * Verify bot token is valid (call on startup).
 */
export async function verifyTelegramBot(): Promise<boolean> {
    if (!isTelegramConfigured()) return false;
    try {
        const url = `${TELEGRAM_API}${env.TELEGRAM_BOT_TOKEN}/getMe`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.ok) {
            logger.info(`🤖 Telegram Bot connected: @${data.result.username}`);
            return true;
        }
        logger.warn(`🤖 Telegram Bot token invalid: ${data.description}`);
        return false;
    } catch (err: any) {
        logger.warn(`🤖 Telegram Bot verification failed: ${err.message}`);
        return false;
    }
}
