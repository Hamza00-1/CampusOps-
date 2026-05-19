import { TelegramContext } from '../types';
import { sendTelegramMessage } from '../../../services/telegram.service';
import { prisma } from '../../../config/database';

function formatTime(date: Date): string {
    return date.toLocaleTimeString('fr-MA', { hour: '2-digit', minute: '2-digit', hour12: false });
}

const DAY_NAMES = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

export async function handleWeek(ctx: TelegramContext): Promise<void> {
    const user = await prisma.user.findFirst({
        where: { telegramChatId: ctx.chatId },
        select: { id: true, name: true, role: true },
    });

    if (!user) {
        await sendTelegramMessage(ctx.chatId, `🔗 Please link your account first with \`/link YOUR_CODE\`.`);
        return;
    }

    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - now.getDay() + 1);
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 7);

    const where: any = { startTime: { gte: monday, lt: sunday } };

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
        },
        orderBy: { startTime: 'asc' },
    });

    if (sessions.length === 0) {
        await sendTelegramMessage(ctx.chatId, `📅 *This Week*\n\n🎉 No sessions this week!`);
        return;
    }

    // Group by day
    const byDay = new Map<number, typeof sessions>();
    for (const s of sessions) {
        const day = s.startTime.getDay();
        if (!byDay.has(day)) byDay.set(day, []);
        byDay.get(day)!.push(s);
    }

    const lines: string[] = [];
    for (const [day, daySessions] of byDay) {
        const date = daySessions[0].startTime;
        lines.push(`*${DAY_NAMES[day]} ${date.getDate()}/${date.getMonth() + 1}*`);
        for (const s of daySessions) {
            lines.push(`  • ${s.module.name} — ${formatTime(s.startTime)}–${formatTime(s.endTime)} · ${s.room}`);
        }
    }

    await sendTelegramMessage(
        ctx.chatId,
        `📅 *This Week's Schedule*\n\n${lines.join('\n')}\n\n_${sessions.length} session(s) total_`
    );
}
