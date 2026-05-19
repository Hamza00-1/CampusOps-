import { TelegramContext } from '../types';
import { sendTelegramMessage } from '../../../services/telegram.service';
import { prisma } from '../../../config/database';

export async function handleStart(ctx: TelegramContext): Promise<void> {
    const linkedUser = await prisma.user.findFirst({
        where: { telegramChatId: ctx.chatId },
        select: { name: true, role: true },
    });

    if (linkedUser) {
        await sendTelegramMessage(
            ctx.chatId,
            `👋 Welcome back, *${linkedUser.name}*!\n\nYour account is linked.\n\n` +
            `Use /help to see available commands.`
        );
        return;
    }

    await sendTelegramMessage(
        ctx.chatId,
        `🎓 *Welcome to CampusOps Bot!*\n\n` +
        `This bot gives you real-time access to your campus data.\n\n` +
        `*To get started:*\n` +
        `1. Log in to the CampusOps web app\n` +
        `2. Go to Settings → Link Telegram\n` +
        `3. Copy the 6-digit code\n` +
        `4. Send: \`/link YOUR_CODE\`\n\n` +
        `Use /help to see all commands.`
    );
}
