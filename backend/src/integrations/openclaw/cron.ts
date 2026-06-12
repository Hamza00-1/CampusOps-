import cron, { ScheduledTask } from 'node-cron';
import { env } from '../../config/env';
import { logger } from '../../middleware/logger';
import { runDailyPlanningNotifications } from './daily-planning.job';
import { prisma } from '../../config/database';
import { sendEmail } from '../../services/email.service';
import { sendTelegramMessage, isTelegramConfigured } from '../../services/telegram.service';

let dailyTask: ScheduledTask | null = null;
let overdueTask: ScheduledTask | null = null;

async function runOverduePaymentScanCron() {
    const now = new Date();
    const overduePayments = await prisma.payment.findMany({
        where: { dueDate: { lt: now }, status: { not: 'Paid' } },
        include: { student: { select: { id: true, name: true, email: true, telegramChatId: true } } },
    });

    let notified = 0;
    for (const p of overduePayments) {
        const amount = Number(p.amount).toLocaleString('fr-FR');
        const dueDate = p.dueDate.toLocaleDateString('fr-FR');

        await sendEmail({
            to: p.student.email,
            subject: `CampusOps — Paiement en retard (${amount} MAD)`,
            body: `Bonjour ${p.student.name},\n\nVotre ${p.planType} de ${amount} MAD (échéance ${dueDate}) est en retard.\n\nVeuillez régulariser auprès de la scolarité.\n\nCampusOps — EIDIA`,
            type: 'alert',
        });

        if (isTelegramConfigured() && p.student.telegramChatId) {
            await sendTelegramMessage(p.student.telegramChatId,
                `💰 *Paiement en retard*\n\n📄 ${p.planType}\n💰 ${amount} MAD\n📅 Échéance: ${dueDate}\n\nContactez la scolarité.`
            );
        }

        await prisma.notification.create({
            data: {
                userId: p.student.id,
                title: `Paiement en retard — ${amount} MAD`,
                content: `Votre ${p.planType} de ${amount} MAD (échéance ${dueDate}) est en retard.`,
                type: 'alert',
            },
        });
        notified++;
    }

    logger.info(`⏰ Overdue payment cron: ${notified} students notified`);
}

export function startCronJobs(): void {
    if (env.CRON_DAILY_PLANNING !== 'on') {
        logger.info('⏰ Cron disabled (CRON_DAILY_PLANNING=off)');
        return;
    }

    if (!cron.validate(env.CRON_DAILY_PLANNING_TIME)) {
        logger.error(`⏰ Invalid cron expression "${env.CRON_DAILY_PLANNING_TIME}" — daily planning job NOT scheduled`);
        return;
    }

    // Workflow 1: Daily planning notification at configured time (default 7 AM)
    dailyTask = cron.schedule(
        env.CRON_DAILY_PLANNING_TIME,
        async () => {
            logger.info('⏰ Daily planning cron firing...');
            try {
                await runDailyPlanningNotifications();
            } catch (err: any) {
                logger.error(`⏰ Daily planning cron failed: ${err.message}`);
            }
        },
        { timezone: env.CRON_TIMEZONE },
    );
    logger.info(`⏰ Daily planning cron scheduled: "${env.CRON_DAILY_PLANNING_TIME}" (${env.CRON_TIMEZONE})`);

    // Workflow 3: Overdue payment scan — runs every day at midnight
    overdueTask = cron.schedule(
        '0 0 * * *',
        async () => {
            logger.info('⏰ Overdue payment scan cron firing...');
            try {
                await runOverduePaymentScanCron();
            } catch (err: any) {
                logger.error(`⏰ Overdue payment scan cron failed: ${err.message}`);
            }
        },
        { timezone: env.CRON_TIMEZONE },
    );
    logger.info(`⏰ Overdue payment scan cron scheduled: "0 0 * * *" (midnight, ${env.CRON_TIMEZONE})`);
}

export function stopCronJobs(): void {
    if (dailyTask) { dailyTask.stop(); dailyTask = null; }
    if (overdueTask) { overdueTask.stop(); overdueTask = null; }
    logger.info('⏰ Cron jobs stopped');
}
