import { Router } from 'express';
import { mailController } from './mail.controller';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';
import { validate } from '../../middleware/validator';
import { sendMailSchema, latestMailQuery } from './mail.schemas';

const router = Router();

/** @swagger
 * /api/mail/latest:
 *   get:
 *     tags: [Mail]
 *     summary: Fetch latest messages from the configured IMAP inbox (Admin/Scolarite)
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20, minimum: 1, maximum: 100 }
 *     responses:
 *       200: { description: List of recent messages }
 *       503: { description: IMAP not configured } */
router.get(
    '/latest',
    authenticate,
    requireRole('Admin', 'Scolarite'),
    validate({ query: latestMailQuery }),
    mailController.latest,
);

/** @swagger
 * /api/mail/send:
 *   post:
 *     tags: [Mail]
 *     summary: Send an email via SMTP (Admin/Scolarite)
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [to, subject, body]
 *             properties:
 *               to:      { oneOf: [{ type: string, format: email }, { type: array, items: { type: string, format: email } }] }
 *               subject: { type: string }
 *               body:    { type: string }
 *               type:    { type: string, enum: [info, alert, reminder, success] }
 *     responses:
 *       202: { description: Email accepted for delivery } */
router.post(
    '/send',
    authenticate,
    requireRole('Admin', 'Scolarite'),
    validate({ body: sendMailSchema }),
    mailController.send,
);

/** @swagger
 * /api/mail/inject:
 *   post:
 *     tags: [Mail]
 *     summary: Scan IMAP inbox and inject keyword-matching emails as internal notifications (Admin/Scolarite)
 *     description: Reads the last 20 emails and creates in-app notifications for Admin/Scolarite when keywords like "absence justifiée" or "paiement reçu" are detected.
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200: { description: Injection summary with counts }
 *       503: { description: IMAP not configured } */
router.post(
    '/inject',
    authenticate,
    requireRole('Admin', 'Scolarite'),
    mailController.inject,
);

export default router;
