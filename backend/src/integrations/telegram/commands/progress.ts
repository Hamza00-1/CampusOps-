import { TelegramContext } from '../types';
import { sendTelegramMessage } from '../../../services/telegram.service';
import { prisma } from '../../../config/database';

function progressBar(pct: number): string {
    const filled = Math.round(pct / 10);
    return `${'█'.repeat(filled)}${'░'.repeat(10 - filled)}`;
}

export async function handleProgress(ctx: TelegramContext): Promise<void> {
    const user = await prisma.user.findFirst({
        where: { telegramChatId: ctx.chatId },
        select: { id: true, name: true, role: true },
    });

    if (!user) {
        await sendTelegramMessage(ctx.chatId, `🔗 Please link your account first with \`/link YOUR_CODE\`.`);
        return;
    }

    if (user.role !== 'Etudiant') {
        await sendTelegramMessage(ctx.chatId, `ℹ️ The /progress command is for students only.`);
        return;
    }

    // Get student's groups
    const groups = await prisma.groupStudent.findMany({
        where: { studentId: user.id },
        select: { groupId: true, group: { select: { name: true } } },
    });

    if (groups.length === 0) {
        await sendTelegramMessage(ctx.chatId, `ℹ️ You are not enrolled in any group yet.`);
        return;
    }

    const groupIds = groups.map((g: { groupId: string }) => g.groupId);
    const progressRecords = await prisma.progress.findMany({
        where: { groupId: { in: groupIds } },
        include: { module: { select: { name: true } }, group: { select: { name: true } } },
        orderBy: { percentage: 'desc' },
    });

    if (progressRecords.length === 0) {
        await sendTelegramMessage(ctx.chatId, `ℹ️ No progress data available yet.`);
        return;
    }

    const lines = progressRecords.map((p: { module: { name: string }; percentage: number }) => {
        const bar = progressBar(p.percentage);
        return `*${p.module.name}*\n${bar} ${p.percentage}%`;
    });

    const avg = Math.round(progressRecords.reduce((s: number, p: { percentage: number }) => s + p.percentage, 0) / progressRecords.length);

    await sendTelegramMessage(
        ctx.chatId,
        `📈 *Course Progress — ${user.name}*\n\n${lines.join('\n\n')}\n\n_Average: ${avg}%_`
    );
}
