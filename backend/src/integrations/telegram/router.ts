import { TelegramUpdate, TelegramContext } from './types';
import { sendTelegramMessage } from '../../services/telegram.service';
import { handleStart } from './commands/start';
import { handleHelp } from './commands/help';
import { handleLink, handleUnlink } from './commands/link';
import { handleToday } from './commands/today';
import { handleWeek } from './commands/week';
import { handleAbsence } from './commands/absence';
import { handleProgress } from './commands/progress';
import { logger } from '../../middleware/logger';

// Map command strings to handlers
const COMMANDS: Record<string, (ctx: TelegramContext) => Promise<void>> = {
    '/start': handleStart,
    '/help': handleHelp,
    '/link': handleLink,
    '/unlink': handleUnlink,
    '/today': handleToday,
    '/week': handleWeek,
    '/absence': handleAbsence,
    '/progress': handleProgress,
};

export async function routeUpdate(update: TelegramUpdate): Promise<void> {
    const msg = update.message;
    if (!msg?.text || !msg.from) return;

    const text = msg.text.trim();
    const chatId = String(msg.chat.id);

    // Extract command — strip bot username suffix (e.g. /start@MyBot → /start)
    const parts = text.split(' ');
    const commandRaw = parts[0].split('@')[0].toLowerCase();
    const args = parts.slice(1);

    const ctx: TelegramContext = {
        chatId,
        userId: msg.from.id,
        text,
        args,
        username: msg.from.username,
        firstName: msg.from.first_name,
    };

    const handler = COMMANDS[commandRaw];

    if (handler) {
        logger.info(`🤖 Telegram command: ${commandRaw} from chatId=${chatId}`);
        try {
            await handler(ctx);
        } catch (err: any) {
            logger.error(`🤖 Command ${commandRaw} failed: ${err.message}`);
            await sendTelegramMessage(chatId, `⚠️ Something went wrong. Please try again.`);
        }
    }
    // Silently ignore unknown text (not a command)
}
