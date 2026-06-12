import { fetchLatestMessages, isImapConfigured } from '../../integrations/email/imap';
import { sendEmail } from '../../integrations/email/smtp';
import { ApiError } from '../../middleware/errorHandler';
import { SendMailInput } from './mail.schemas';
import { prisma } from '../../config/database';
import { logger } from '../../middleware/logger';

export class MailService {
    async latest(limit: number) {
        if (!isImapConfigured()) {
            throw ApiError.serviceUnavailable('IMAP not configured on the server');
        }
        return fetchLatestMessages(limit);
    }

    async send(input: SendMailInput) {
        const ok = await sendEmail({
            to: input.to,
            subject: input.subject,
            body: input.body,
            type: input.type || 'info',
        });
        if (!ok) throw ApiError.badRequest('SMTP not configured or send failed — check server logs');
        return { delivered: true, to: input.to, subject: input.subject };
    }

    /**
     * Scan IMAP inbox and transform keyword-matching emails into internal notifications
     * for Admin/Scolarite users. Required by spec section 6.
     */
    async inject() {
        if (!isImapConfigured()) {
            return { skipped: true, messagesScanned: 0, notificationsCreated: 0 };
        }

        const messages = await fetchLatestMessages(20);

        const rules: Array<{ keywords: string[]; title: string; type: 'alert' | 'success' | 'info' }> = [
            { keywords: ['absence justifi', 'justification absence'], title: 'Absence justifiée reçue', type: 'alert' },
            { keywords: ['paiement reçu', 'paiement confirmé', 'payment received'], title: 'Paiement reçu', type: 'success' },
            { keywords: ['inscription', 'enrollment', 'demande d\'inscription'], title: 'Nouvelle demande d\'inscription', type: 'info' },
            { keywords: ['retard signalé', 'late notice'], title: 'Signalement retard reçu', type: 'alert' },
        ];

        const admins = await prisma.user.findMany({
            where: { role: { in: ['Admin', 'Scolarite'] } },
            select: { id: true },
        });

        let notificationsCreated = 0;

        for (const msg of messages) {
            const searchText = `${msg.subject} ${msg.snippet}`.toLowerCase();
            for (const rule of rules) {
                if (rule.keywords.some(k => searchText.includes(k))) {
                    for (const admin of admins) {
                        await prisma.notification.create({
                            data: {
                                userId: admin.id,
                                title: rule.title,
                                content: `De : ${msg.from}\nObjet : ${msg.subject}\n\n${msg.snippet.slice(0, 200)}`,
                                type: rule.type,
                            },
                        });
                        notificationsCreated++;
                    }
                    break;
                }
            }
        }

        logger.info(`📬 Mail inject: scanned ${messages.length} messages, created ${notificationsCreated} notifications`);
        return { messagesScanned: messages.length, notificationsCreated };
    }
}

export const mailService = new MailService();
