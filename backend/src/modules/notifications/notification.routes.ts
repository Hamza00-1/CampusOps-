import { Router } from 'express';
import { notificationController } from './notification.controller';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';
import { validate } from '../../middleware/validator';
import { createNotificationSchema, notificationIdParam } from './notification.schemas';

const router = Router();

/** @swagger
 * /api/notifications:
 *   get:
 *     tags: [Notifications]
 *     summary: Get my notifications (last 50)
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Notification list */
router.get('/', authenticate, notificationController.findMine);

/** @swagger
 * /api/notifications/unread:
 *   get:
 *     tags: [Notifications]
 *     summary: Get unread notification count
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Unread count */
router.get('/unread', authenticate, notificationController.unreadCount);

/** @swagger
 * /api/notifications:
 *   post:
 *     tags: [Notifications]
 *     summary: Send a notification to a user (Admin/Scolarite)
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, title, content]
 *             properties:
 *               userId: { type: string, format: uuid }
 *               title: { type: string, example: "Payment Reminder" }
 *               content: { type: string, example: "Your monthly payment is due on May 1st." }
 *     responses:
 *       201:
 *         description: Notification sent */
router.post('/', authenticate, requireRole('Admin', 'Scolarite'), validate({ body: createNotificationSchema }), notificationController.create);

/** @swagger
 * /api/notifications/read-all:
 *   put:
 *     tags: [Notifications]
 *     summary: Mark all my notifications as read
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: All marked as read */
router.put('/read-all', authenticate, notificationController.markAllAsRead);

router.put('/:id/read', authenticate, validate({ params: notificationIdParam }), notificationController.markAsRead);
router.delete('/:id', authenticate, validate({ params: notificationIdParam }), notificationController.delete);

export default router;
