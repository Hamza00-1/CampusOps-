import { schedule, ScheduledTask } from 'node-cron';
import { prisma } from '../config/database';
import { logger } from '../middleware/logger';
import { sendTelegramMessage, buildTelegramMessage, isTelegramConfigured } from '../services/telegram.service';
import { sendEmail } from '../services/email.service';

// ============================================
// CampusOps — Scheduled Cron Jobs
// ============================================

let tasks: ScheduledTask[] = [];

/**
 * Build a text summary of today's planning sessions for one user.
 */
async function getTodaySummary(userId: string, role: string): Promise<string | null> {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);

    const where: any = { startTime: { gte: today, lt: tomorrow } };
    if (role === 'Enseignant') where.teacherId = userId;
    if (role === 'Etudiant') {
        const groups = await prisma.groupStudent.findMany({
            where: { studentId: userId }, select: { groupId: true },
        });
        if (groups.length === 0) return null;
        where.groupId = { in: groups.map((g: { groupId: string }) => g.groupId) };
    }

    const sessions = await prisma.planning.findMany({
        where,
        include: { module: { select: { name: true } }, group: { select: { name: true } } },
        orderBy: { startTime: 'asc' },
    });

    if (sessions.length === 0) return null;

    const lines = sessions.map((s: { module: { name: string }; startTime: Date; room: string }) => {
        const time = s.startTime.toLocaleTimeString('fr-MA', { hour: '2-digit', minute: '2-digit', hour12: false });
        return `• ${s.module.name} at ${time} — ${s.room}`;
    });

    return lines.join('\n');
}

/**
 * Daily 7 AM notification: send today's schedule to all users who have
 * Telegram or email notifications configured.
 */
async function runDailyPlanningNotification(): Promise<void> {
    logger.info('⏰ Cron: running daily planning notification...');

    const users = await prisma.user.findMany({
        where: {
            OR: [
                { telegramChatId: { not: null } },
                { email: { not: '' } },
            ],
            role: { in: ['Etudiant', 'Enseignant'] },
        },
        select: { id: true, name: true, email: true, role: true, telegramChatId: true },
    });

    let telegramSent = 0;
    let emailSent = 0;

    for (const user of users) {
        const summary = await getTodaySummary(user.id, user.role);
        if (!summary) continue; // no sessions today, skip

        const title = `Good morning, ${user.name}! 📅 Today's Schedule`;
        const body = summary;

        // Telegram
        if (user.telegramChatId && isTelegramConfigured()) {
            const msg = buildTelegramMessage(title, body, 'reminder');
            const ok = await sendTelegramMessage(user.telegramChatId, msg);
            if (ok) telegramSent++;
        }

        // Email
        try {
            const ok = await sendEmail({
                to: user.email,
                subject: `Today's Schedule`,
                body: summary,
                type: 'reminder',
            });
            if (ok) emailSent++;
        } catch {
            // Non-fatal
        }

        // Small delay to avoid rate limiting
        await new Promise(r => setTimeout(r, 100));
    }

    logger.info(`⏰ Cron: daily notification done — Telegram: ${telegramSent}, Email: ${emailSent}`);
}

/**
 * Check for overdue payments and notify scolarité staff.
 */
async function runOverduePaymentAlert(): Promise<void> {
    logger.info('⏰ Cron: checking overdue payments...');

    const overdue = await prisma.payment.count({
        where: { status: 'Unpaid', dueDate: { lt: new Date() } },
    });

    if (overdue === 0) return;

    const scolariteUsers = await prisma.user.findMany({
        where: { role: 'Scolarite', telegramChatId: { not: null } },
        select: { telegramChatId: true },
    });

    for (const u of scolariteUsers) {
        if (!u.telegramChatId) continue;
        await sendTelegramMessage(
            u.telegramChatId,
            buildTelegramMessage(
                'Overdue Payments Alert',
                `⚠️ There are *${overdue}* overdue payment(s) requiring attention.\n\nLog in to CampusOps to review them.`,
                'alert'
            )
        );
    }
}

/**
 * Start all cron jobs.
 */
export function startCron(): void {
    // Daily at 07:00 — send today's schedule
    const dailyPlanning = schedule('0 7 * * *', runDailyPlanningNotification, {
        timezone: 'Africa/Casablanca',
    });

    // Daily at 09:00 — check overdue payments (Mon–Fri only)
    const overdueAlert = schedule('0 9 * * 1-5', runOverduePaymentAlert, {
        timezone: 'Africa/Casablanca',
    });

    tasks = [dailyPlanning, overdueAlert];
    logger.info('⏰ Cron jobs started: daily planning (07:00), overdue alerts (09:00 Mon–Fri)');
}

/**
 * Stop all cron jobs (called on graceful shutdown).
 */
export function stopCron(): void {
    tasks.forEach(t => t.stop());
    tasks = [];
}
