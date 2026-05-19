import { Router, Request, Response } from 'express';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';
import { fetchLatestEmails } from '../../integrations/email/imap';
import { sendEmail } from '../../services/email.service';
import { successResponse } from '../../utils/response';
import { ApiError } from '../../middleware/errorHandler';
import { z } from 'zod';

// ============================================
// Mail Module Routes
//   GET  /api/mail/latest     — Read inbox (Admin/Scolarite)
//   POST /api/mail/send       — Send email (Admin/Scolarite)
// ============================================

const router = Router();

const sendEmailSchema = z.object({
    to: z.union([z.string().email(), z.array(z.string().email())]),
    subject: z.string().min(1).max(200),
    body: z.string().min(1),
    type: z.enum(['info', 'alert', 'reminder', 'success']).optional().default('info'),
});

/**
 * GET /api/mail/latest?limit=10
 * Fetch latest emails from the IMAP inbox.
 */
router.get('/latest', authenticate, requireRole('Admin', 'Scolarite'), async (req: Request, res: Response) => {
    const limit = Math.min(Number(req.query.limit) || 10, 50);
    const emails = await fetchLatestEmails(limit);
    res.json(successResponse({ emails, count: emails.length }, `Fetched ${emails.length} email(s)`));
});

/**
 * POST /api/mail/send
 * Send a transactional email.
 */
router.post('/send', authenticate, requireRole('Admin', 'Scolarite'), async (req: Request, res: Response) => {
    const result = sendEmailSchema.safeParse(req.body);
    if (!result.success) {
        throw ApiError.badRequest(result.error.issues[0].message);
    }

    const { to, subject, body, type } = result.data;
    const sent = await sendEmail({ to, subject, body, type });

    if (!sent) {
        throw ApiError.badRequest('Failed to send email — check SMTP configuration');
    }

    res.json(successResponse(null, 'Email sent successfully'));
});

export default router;
