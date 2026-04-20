import { z } from 'zod';

export const createNotificationSchema = z.object({
    userId: z.string().uuid(),
    title: z.string().min(1).max(200),
    content: z.string().min(1).max(5000),
});
export const notificationIdParam = z.object({ id: z.string().uuid() });
export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
