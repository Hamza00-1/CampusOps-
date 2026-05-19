import { env } from '../../config/env';
import { logger } from '../../middleware/logger';

// ============================================
// IMAP Email Inbox Reader
// Reads latest emails via IMAP using imap-simple
// ============================================

export interface MailMessage {
    uid: number;
    subject: string;
    from: string;
    date: string;
    body: string;
    isRead: boolean;
}

function isImapConfigured(): boolean {
    return !!(env.IMAP_HOST && env.IMAP_USER && env.IMAP_PASS);
}

/**
 * Fetch the N most recent emails from the inbox.
 * Returns an empty array if IMAP is not configured.
 */
export async function fetchLatestEmails(limit = 10): Promise<MailMessage[]> {
    if (!isImapConfigured()) {
        logger.warn('📬 IMAP not configured — skipping inbox fetch');
        return [];
    }

    try {
        // Dynamic import to avoid crashing if imap-simple isn't installed
        const imapSimple = await import('imap-simple');
        const { simpleParser } = await import('mailparser');

        const config = {
            imap: {
                user: env.IMAP_USER!,
                password: env.IMAP_PASS!,
                host: env.IMAP_HOST!,
                port: env.IMAP_PORT ?? 993,
                tls: env.IMAP_TLS !== false,
                authTimeout: 10000,
                tlsOptions: { rejectUnauthorized: false },
            },
        };

        const connection = await imapSimple.connect(config);
        await connection.openBox('INBOX');

        const searchCriteria = ['ALL'];
        const fetchOptions = {
            bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)', 'TEXT'],
            markSeen: false,
            struct: true,
        };

        const messages = await connection.search(searchCriteria, fetchOptions);
        await connection.end();

        // Sort by UID desc (newest first), take `limit`
        const latest = messages
            .sort((a, b) => (b.attributes.uid as number) - (a.attributes.uid as number))
            .slice(0, limit);

        const results: MailMessage[] = [];

        for (const msg of latest) {
            const headerPart = msg.parts.find((p: any) => p.which.startsWith('HEADER'));
            const textPart = msg.parts.find((p: any) => p.which === 'TEXT');

            const headers = headerPart?.body ?? {};
            const rawText = textPart?.body ?? '';

            let bodyText = rawText;
            try {
                const parsed = await simpleParser(rawText);
                bodyText = parsed.text ?? rawText;
            } catch {
                // fallback to raw
            }

            results.push({
                uid: msg.attributes.uid as number,
                subject: (headers['subject']?.[0] ?? '(no subject)').trim(),
                from: (headers['from']?.[0] ?? '').trim(),
                date: (headers['date']?.[0] ?? '').trim(),
                body: bodyText.slice(0, 500), // truncate for API response
                isRead: !!(msg.attributes.flags as string[])?.includes('\\Seen'),
            });
        }

        logger.info(`📬 IMAP: fetched ${results.length} emails`);
        return results;
    } catch (err: any) {
        logger.error(`📬 IMAP fetch failed: ${err.message}`);
        return [];
    }
}
