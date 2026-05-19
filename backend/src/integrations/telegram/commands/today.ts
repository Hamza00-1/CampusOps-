import { TelegramContext } from '../types';
import { sendTelegramMessage } from '../../../services/telegram.service';
import { prisma } from '../../../config/database';

function formatTime(date: Date): string {
    return date.toLocaleTimeString('fr-MA', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function formatDate(date: Date): string {
    return date.toLocaleDateString('fr-MA', { weekday: 'long', day: 'numeric', month: 'long' });
}

export async function handleToday(ctx: TelegramContext): Promise<void> {
    const user = await prisma.user.findFirst({
        where: { telegramChatId: ctx.chatId },
        select: { id: true, name: true, role: true },
    });

    if (!user) {
        await sendTelegramMessage(ctx.chatId, `🔗 Please link your account first with \`/link YOUR_CODE\`.`);
        return;
    }

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);

    const where: any = { startTime: { gte: today, lt: tomorrow } };

    if (user.role === 'Enseignant') {
        where.teacherId = user.id;
    } else if (user.role === 'Etudiant') {
        const groups = await prisma.groupStudent.findMany({
            where: { studentId: user.id },
            select: { groupId: true },
        });
        where.groupId = { in: groups.map((g: { groupId: string }) => g.groupId) };
    }

    const sessions = await prisma.planning.findMany({
        where,
        include: {
            module: { select: { name: true } },
            group: { select: { name: true } },
            teacher: { select: { name: true } },
        },
        orderBy: { startTime: 'asc' },
    });

    if (sessions.length === 0) {
        await sendTelegramMessage(
            ctx.chatId,
            `📅 *${formatDate(today)}*\n\n🎉 No sessions scheduled for today!`
        );
        return;
    }

    const lines = sessions.map((s: { module: { name: string }; group: { name: string }; startTime: Date; endTime: Date; room: string }, i: number) => {
        const time = `${formatTime(s.startTime)} – ${formatTime(s.endTime)}`;
        return `*${i + 1}. ${s.module.name}*\n⏰ ${time}\n👥 ${s.group.name} · 📍 ${s.room}`;
    });

    await sendTelegramMessage(
        ctx.chatId,
        `📅 *Today — ${formatDate(today)}*\n\n${lines.join('\n\n')}\n\n_${sessions.length} session(s) total_`
    );
}
