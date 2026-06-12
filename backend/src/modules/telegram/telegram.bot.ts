// ============================================
// CampusOps — Telegram Bot: command handling + long-polling
// Polling lets the bot work on localhost (no public webhook needed).
// ============================================
import { prisma } from '../../config/database';
import { getRedisClient } from '../../config/redis';
import { env } from '../../config/env';
import { logger } from '../../middleware/logger';
import { sendTelegramMessage, isTelegramConfigured, httpsPost } from '../../services/telegram.service';

const TELEGRAM_API = 'https://api.telegram.org/bot';
const CODE_TTL_SECONDS = 300;

// ── Command processing (shared by polling loop and webhook handler) ──────────
export async function processUpdate(update: any): Promise<void> {
    const message = update?.message;
    if (!message || !message.text) return;

    const chatId = String(message.chat.id);
    const text: string = message.text.trim();
    const firstName = message.from?.first_name || 'there';

    const getLinkedUser = async () =>
        prisma.user.findFirst({
            where: { telegramChatId: chatId },
            select: { id: true, name: true, email: true, role: true },
        });

    const fmtTime = (d: Date) =>
        d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Casablanca' });
    const fmtDate = (d: Date) =>
        d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Africa/Casablanca' });

    try {
        if (text === '/start' || text.startsWith('/start ')) {
            const code = String(Math.floor(100000 + Math.random() * 900000));
            const redis = getRedisClient();
            await redis.setex(`tg_link:${code}`, CODE_TTL_SECONDS, chatId);

            await sendTelegramMessage(chatId,
                `👋 Bonjour ${firstName}!\n\n` +
                `Bienvenue sur *CampusOps Bot*.\n\n` +
                `Votre code de liaison :\n\n` +
                `🔑 \`${code}\`\n\n` +
                `Collez ce code dans la section *Automation → Bot Telegram* de votre compte CampusOps dans les *5 minutes*.\n\n` +
                `_Ce code expire dans 5 minutes._`
            );
            logger.info(`🤖 Telegram /start: code ${code} sent → chatId=${chatId}`);

        } else if (text === '/help') {
            await sendTelegramMessage(chatId,
                `*Commandes CampusOps Bot*\n\n` +
                `📋 /today — Planning du jour\n` +
                `📅 /week — Planning de la semaine\n` +
                `❌ /absence — Absences récentes\n` +
                `📊 /progress — Avancement des modules\n` +
                `✅ /status — Vérifier la liaison du compte\n` +
                `🔗 /start — Lier votre compte\n` +
                `❓ /help — Ce message\n\n` +
                `_Vous devez d'abord lier votre compte avec /start._`
            );

        } else if (text === '/status') {
            const user = await getLinkedUser();
            if (user) {
                await sendTelegramMessage(chatId,
                    `✅ Compte lié à *${user.name}*\n📧 ${user.email}\n🎭 Rôle : ${user.role}`
                );
            } else {
                await sendTelegramMessage(chatId,
                    `❌ Ce Telegram n'est lié à aucun compte CampusOps.\n\nEnvoyez /start pour obtenir un code.`
                );
            }

        } else if (text === '/today') {
            const user = await getLinkedUser();
            if (!user) { await sendTelegramMessage(chatId, `❌ Compte non lié. Envoyez /start d'abord.`); return; }

            const today = new Date(); today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
            const where: any = { startTime: { gte: today, lt: tomorrow } };
            if (user.role === 'Enseignant') where.teacherId = user.id;
            if (user.role === 'Etudiant') {
                const groups = await prisma.groupStudent.findMany({ where: { studentId: user.id }, select: { groupId: true } });
                where.groupId = { in: groups.map(g => g.groupId) };
            }
            const sessions = await prisma.planning.findMany({
                where,
                include: { module: { select: { name: true } }, group: { select: { name: true } }, teacher: { select: { name: true } } },
                orderBy: { startTime: 'asc' },
            });
            if (sessions.length === 0) {
                await sendTelegramMessage(chatId, `📋 *Planning du jour*\n_${fmtDate(today)}_\n\n🎉 Aucune séance aujourd'hui !`);
            } else {
                let msg = `📋 *Planning du jour*\n_${fmtDate(today)}_\n\n`;
                for (const s of sessions) {
                    msg += `⏰ ${fmtTime(s.startTime)} → ${fmtTime(s.endTime)}\n`;
                    msg += `📚 ${s.module.name}\n`;
                    msg += `👥 ${s.group.name} — 🏫 ${s.room || 'TBD'}\n`;
                    msg += `👨‍🏫 ${(s as any).teacher?.name || '—'}\n\n`;
                }
                await sendTelegramMessage(chatId, msg);
            }

        } else if (text === '/week') {
            const user = await getLinkedUser();
            if (!user) { await sendTelegramMessage(chatId, `❌ Compte non lié. Envoyez /start d'abord.`); return; }

            const now = new Date();
            const monday = new Date(now);
            monday.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
            monday.setHours(0, 0, 0, 0);
            const sunday = new Date(monday); sunday.setDate(monday.getDate() + 7);
            const where: any = { startTime: { gte: monday, lt: sunday } };
            if (user.role === 'Enseignant') where.teacherId = user.id;
            if (user.role === 'Etudiant') {
                const groups = await prisma.groupStudent.findMany({ where: { studentId: user.id }, select: { groupId: true } });
                where.groupId = { in: groups.map(g => g.groupId) };
            }
            const sessions = await prisma.planning.findMany({
                where,
                include: { module: { select: { name: true } }, group: { select: { name: true } }, teacher: { select: { name: true } } },
                orderBy: { startTime: 'asc' },
            });
            if (sessions.length === 0) {
                await sendTelegramMessage(chatId, `📅 *Planning de la semaine*\n\n🎉 Aucune séance cette semaine !`);
            } else {
                let msg = `📅 *Planning de la semaine* (${sessions.length} séances)\n\n`;
                let lastDay = '';
                for (const s of sessions) {
                    const day = fmtDate(s.startTime);
                    if (day !== lastDay) { msg += `\n📌 *${day}*\n`; lastDay = day; }
                    msg += `  ⏰ ${fmtTime(s.startTime)}–${fmtTime(s.endTime)} | ${s.module.name} | ${s.room || 'TBD'}\n`;
                }
                await sendTelegramMessage(chatId, msg);
            }

        } else if (text === '/absence') {
            const user = await getLinkedUser();
            if (!user) { await sendTelegramMessage(chatId, `❌ Compte non lié. Envoyez /start d'abord.`); return; }

            const where: any = {};
            if (user.role === 'Etudiant') where.studentId = user.id;
            if (user.role === 'Enseignant') {
                const mySessions = await prisma.planning.findMany({ where: { teacherId: user.id }, select: { id: true } });
                where.sessionId = { in: mySessions.map(s => s.id) };
            }
            const absences = await prisma.absence.findMany({
                where,
                include: { student: { select: { name: true } }, session: { include: { module: { select: { name: true } } } } },
                orderBy: { createdAt: 'desc' },
                take: 10,
            });
            const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
            const monthCount = await prisma.absence.count({ where: { ...where, createdAt: { gte: monthStart } } });

            if (absences.length === 0) {
                await sendTelegramMessage(chatId, `❌ *Absences*\n\n✅ Aucune absence enregistrée !`);
            } else {
                let msg = `❌ *Absences récentes* (${monthCount} ce mois)\n\n`;
                for (const a of absences) {
                    const icon = a.status === 'Absent' ? '🔴' : a.status === 'Late' ? '🟡' : '🟢';
                    const mod = (a as any).session?.module?.name || '?';
                    msg += `${icon} ${a.student.name} — ${mod}\n`;
                    msg += `   ${a.status}${a.justificationDocUrl ? ' ✅ Justifié' : ''} — ${fmtDate(a.createdAt)}\n\n`;
                }
                await sendTelegramMessage(chatId, msg);
            }

        } else if (text === '/progress') {
            const user = await getLinkedUser();
            if (!user) { await sendTelegramMessage(chatId, `❌ Compte non lié. Envoyez /start d'abord.`); return; }

            let groupIds: string[] = [];
            if (user.role === 'Etudiant') {
                const gs = await prisma.groupStudent.findMany({ where: { studentId: user.id }, select: { groupId: true } });
                groupIds = gs.map(g => g.groupId);
            } else if (user.role === 'Enseignant') {
                const ss = await prisma.planning.findMany({ where: { teacherId: user.id }, select: { groupId: true } });
                groupIds = [...new Set(ss.map(s => s.groupId))];
            } else {
                const all = await prisma.group.findMany({ select: { id: true } });
                groupIds = all.map(g => g.id);
            }
            const progress = await prisma.progress.findMany({
                where: { groupId: { in: groupIds } },
                include: { module: { select: { name: true } }, group: { select: { name: true } } },
                orderBy: { percentage: 'desc' },
            });
            if (progress.length === 0) {
                await sendTelegramMessage(chatId, `📊 *Avancement*\n\nAucune donnée disponible.`);
            } else {
                let msg = `📊 *Avancement des modules*\n\n`;
                for (const p of progress) {
                    const filled = Math.round(p.percentage / 10);
                    const bar = '█'.repeat(filled) + '░'.repeat(10 - filled);
                    msg += `${p.module.name}\n${bar} ${p.percentage}% — ${p.group.name}\n\n`;
                }
                await sendTelegramMessage(chatId, msg);
            }

        } else {
            await sendTelegramMessage(chatId,
                `Je comprends uniquement les commandes.\n\nEnvoyez /help pour la liste complète.`
            );
        }
    } catch (err: any) {
        logger.error(`🤖 processUpdate error: ${err.message}`);
    }
}

// ── Long-polling loop ────────────────────────────────────────────────────────
let pollingActive = false;
let lastUpdateId = 0;

export async function startTelegramPolling(): Promise<void> {
    if (!isTelegramConfigured()) {
        logger.warn('🤖 Telegram polling skipped — TELEGRAM_BOT_TOKEN not configured');
        return;
    }

    // Clear any previously registered webhook so polling works
    try {
        await httpsPost(`${TELEGRAM_API}${env.TELEGRAM_BOT_TOKEN}/deleteWebhook`, { drop_pending_updates: false });
        logger.info('🤖 Telegram webhook cleared — using long-polling');
    } catch { /* ignore */ }

    pollingActive = true;
    logger.info('🤖 Telegram long-polling started');

    const poll = async () => {
        while (pollingActive) {
            try {
                const url = `${TELEGRAM_API}${env.TELEGRAM_BOT_TOKEN}/getUpdates`;
                const resp = await httpsPost(url, {
                    offset: lastUpdateId + 1,
                    timeout: 25,
                    allowed_updates: ['message'],
                });

                if (resp.ok && Array.isArray(resp.result)) {
                    for (const update of resp.result) {
                        lastUpdateId = update.update_id;
                        await processUpdate(update);
                    }
                }
            } catch (err: any) {
                if (pollingActive) {
                    logger.error(`🤖 Telegram polling error: ${err.message} — retrying in 5s`);
                    await new Promise(r => setTimeout(r, 5000));
                }
            }
        }
    };

    // Run the loop in the background — don't await it
    poll().catch(err => logger.error(`🤖 Telegram polling fatal: ${err.message}`));
}

export function stopTelegramPolling(): void {
    pollingActive = false;
    logger.info('🤖 Telegram polling stopped');
}
