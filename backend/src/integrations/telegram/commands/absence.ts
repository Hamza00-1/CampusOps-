import { TelegramContext } from '../types';
import { sendTelegramMessage } from '../../../services/telegram.service';
import { prisma } from '../../../config/database';

export async function handleAbsence(ctx: TelegramContext): Promise<void> {
    const user = await prisma.user.findFirst({
        where: { telegramChatId: ctx.chatId },
        select: { id: true, name: true, role: true },
    });

    if (!user) {
        await sendTelegramMessage(ctx.chatId, `🔗 Please link your account first with \`/link YOUR_CODE\`.`);
        return;
    }

    if (user.role !== 'Etudiant') {
        await sendTelegramMessage(ctx.chatId, `ℹ️ The /absence command is for students only.`);
        return;
    }

    const absences = await prisma.absence.groupBy({
        by: ['status'],
        where: { studentId: user.id },
        _count: { status: true },
    });

    const total = await prisma.absence.count({ where: { studentId: user.id } });
    const present = absences.find((a: { status: string }) => a.status === 'Present')?._count.status ?? 0;
    const absent = absences.find((a: { status: string }) => a.status === 'Absent')?._count.status ?? 0;
    const late = absences.find((a: { status: string }) => a.status === 'Late')?._count.status ?? 0;
    const rate = total > 0 ? Math.round((present / total) * 100) : 100;

    const bar = `${'█'.repeat(Math.round(rate / 10))}${'░'.repeat(10 - Math.round(rate / 10))}`;

    await sendTelegramMessage(
        ctx.chatId,
        `📊 *Attendance Summary — ${user.name}*\n\n` +
        `${bar} ${rate}%\n\n` +
        `✅ Present: *${present}*\n` +
        `❌ Absent: *${absent}*\n` +
        `⏰ Late: *${late}*\n` +
        `📋 Total sessions: *${total}*`
    );
}
