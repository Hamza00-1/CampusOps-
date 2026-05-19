import { TelegramContext } from '../types';
import { sendTelegramMessage } from '../../../services/telegram.service';

export async function handleHelp(ctx: TelegramContext): Promise<void> {
    await sendTelegramMessage(
        ctx.chatId,
        `📚 *CampusOps Bot Commands*\n\n` +
        `🔗 *Account*\n` +
        `/start — Welcome message\n` +
        `/link <code> — Link your CampusOps account\n` +
        `/unlink — Unlink your account\n\n` +
        `📅 *Schedule*\n` +
        `/today — Today's sessions\n` +
        `/week — This week's sessions\n\n` +
        `📊 *Academic*\n` +
        `/absence — Your absence summary\n` +
        `/progress — Course progress\n\n` +
        `ℹ️ *Other*\n` +
        `/help — Show this message`
    );
}
