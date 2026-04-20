import { prisma } from '../../config/database';
import { ApiError } from '../../middleware/errorHandler';
import { CreateNotificationInput } from './notification.schemas';

export class NotificationService {
    async findByUser(userId: string) {
        return prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
    }

    async getUnreadCount(userId: string) {
        return prisma.notification.count({ where: { userId, isRead: false } });
    }

    async create(data: CreateNotificationInput) {
        const user = await prisma.user.findUnique({ where: { id: data.userId } });
        if (!user) throw ApiError.badRequest('User not found');
        return prisma.notification.create({ data });
    }

    async markAsRead(id: string, userId: string) {
        const n = await prisma.notification.findUnique({ where: { id } });
        if (!n) throw ApiError.notFound('Notification not found');
        if (n.userId !== userId) throw ApiError.forbidden('Not your notification');
        return prisma.notification.update({ where: { id }, data: { isRead: true } });
    }

    async markAllAsRead(userId: string) {
        return prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        });
    }

    async delete(id: string, userId: string) {
        const n = await prisma.notification.findUnique({ where: { id } });
        if (!n) throw ApiError.notFound('Notification not found');
        if (n.userId !== userId) throw ApiError.forbidden('Not your notification');
        return prisma.notification.delete({ where: { id } });
    }
}

export const notificationService = new NotificationService();
