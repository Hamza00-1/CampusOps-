import { Request, Response, NextFunction } from 'express';
import { notificationService } from './notification.service';
import { successResponse } from '../../utils/response';

export class NotificationController {
    async findMine(req: Request, res: Response, next: NextFunction) {
        try { res.json(successResponse(await notificationService.findByUser(req.user!.id), 'Notifications retrieved')); } catch (e) { next(e); }
    }
    async unreadCount(req: Request, res: Response, next: NextFunction) {
        try { res.json(successResponse({ count: await notificationService.getUnreadCount(req.user!.id) }, 'Unread count')); } catch (e) { next(e); }
    }
    async create(req: Request, res: Response, next: NextFunction) {
        try { res.status(201).json(successResponse(await notificationService.create(req.body), 'Notification sent')); } catch (e) { next(e); }
    }
    async markAsRead(req: Request, res: Response, next: NextFunction) {
        try { res.json(successResponse(await notificationService.markAsRead(req.params.id as string, req.user!.id), 'Marked as read')); } catch (e) { next(e); }
    }
    async markAllAsRead(req: Request, res: Response, next: NextFunction) {
        try { res.json(successResponse(await notificationService.markAllAsRead(req.user!.id), 'All marked as read')); } catch (e) { next(e); }
    }
    async delete(req: Request, res: Response, next: NextFunction) {
        try { await notificationService.delete(req.params.id as string, req.user!.id); res.json(successResponse(null, 'Notification deleted')); } catch (e) { next(e); }
    }
}
export const notificationController = new NotificationController();
