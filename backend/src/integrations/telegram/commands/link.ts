import { TelegramContext } from '../types';
import { sendTelegramMessage } from '../../../services/telegram.service';
import { prisma } from '../../../config/database';

export async function handleLink(ctx: TelegramContext): Promise<void> {
    const otp = ctx.args[0];

    if (!otp) {
        await sendTelegramMessage(
            ctx.chatId,
            `❌ Please provide your linking code.\n\nUsage: \`/link 123456\`\n\nGet your code from *Settings → Link Telegram* in the CampusOps app.`
        );
        return;
    }

    // Check if already linked
    const alreadyLinked = await prisma.user.findFirst({
        where: { telegramChatId: ctx.chatId },
        select: { name: true },
    });

    if (alreadyLinked) {
        await sendTelegramMessage(
            ctx.chatId,
            `✅ Your account (*${alreadyLinked.name}*) is already linked.\n\nUse /unlink first if you want to link a different account.`
        );
        return;
    }

    // Find user by OTP code
    const user = await prisma.user.findFirst({
        where: { otpCode: otp.trim() },
        select: { id: true, name: true, role: true },
    });

    if (!user) {
        await sendTelegramMessage(
            ctx.chatId,
            `❌ Invalid or expired code.\n\nPlease generate a new code from *Settings → Link Telegram* in the app.`
        );
        return;
    }

    // Link the account: store chatId, clear OTP
    await prisma.user.update({
        where: { id: user.id },
        data: { telegramChatId: ctx.chatId, otpCode: null },
    });

    await sendTelegramMessage(
        ctx.chatId,
        `✅ *Account linked successfully!*\n\n` +
        `Welcome, *${user.name}* (${user.role})!\n\n` +
        `You'll now receive CampusOps notifications here.\n` +
        `Use /help to see available commands.`
    );
}

export async function handleUnlink(ctx: TelegramContext): Promise<void> {
    const user = await prisma.user.findFirst({
        where: { telegramChatId: ctx.chatId },
        select: { id: true, name: true },
    });

    if (!user) {
        await sendTelegramMessage(ctx.chatId, `ℹ️ No account is currently linked to this chat.`);
        return;
    }

    await prisma.user.update({
        where: { id: user.id },
        data: { telegramChatId: null },
    });

    await sendTelegramMessage(
        ctx.chatId,
        `🔓 Account (*${user.name}*) has been unlinked.\n\nUse /link to connect a different account.`
    );
}
