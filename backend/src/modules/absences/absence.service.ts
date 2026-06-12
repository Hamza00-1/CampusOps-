import { prisma } from '../../config/database';
import { ApiError } from '../../middleware/errorHandler';
import { MarkAbsenceInput, MarkBulkInput, JustifyInput } from './absence.schemas';
import { logger } from '../../middleware/logger';
import { sendEmail } from '../../services/email.service';
import { sendTelegramMessage, isTelegramConfigured } from '../../services/telegram.service';

export class AbsenceService {
    private readonly include = {
        session: { select: { id: true, startTime: true, endTime: true, room: true, module: { select: { name: true } } } },
        student: { select: { id: true, name: true, email: true } },
    } as const;

    async findAll(filters: { sessionId?: string; studentId?: string; status?: string }) {
        const where: any = {};
        if (filters.sessionId) where.sessionId = filters.sessionId;
        if (filters.studentId) where.studentId = filters.studentId;
        if (filters.status) where.status = filters.status;
        return prisma.absence.findMany({ where, include: this.include, orderBy: { createdAt: 'desc' } });
    }

    async findById(id: string) {
        const a = await prisma.absence.findUnique({ where: { id }, include: this.include });
        if (!a) throw ApiError.notFound('Absence record not found');
        return a;
    }

    async mark(data: MarkAbsenceInput) {
        const session = await prisma.planning.findUnique({ where: { id: data.sessionId } });
        if (!session) throw ApiError.badRequest('Session not found');
        const student = await prisma.user.findUnique({ where: { id: data.studentId } });
        if (!student || student.role !== 'Etudiant') throw ApiError.badRequest('Invalid student');

        // Upsert: update if exists, create if not
        const existing = await prisma.absence.findFirst({
            where: { sessionId: data.sessionId, studentId: data.studentId },
        });
        const absence = existing
            ? await prisma.absence.update({ where: { id: existing.id }, data: { status: data.status }, include: this.include })
            : await prisma.absence.create({ data, include: this.include });

        // Fire-and-forget: notify student when marked Absent or Late
        if (absence.status !== 'Present') {
            void this.notifyAbsence(absence);
        }
        return absence;
    }

    private async notifyAbsence(absence: { studentId: string; sessionId: string; status: string; createdAt: Date }) {
        try {
            const [studentFull, moduleName] = await Promise.all([
                prisma.user.findUnique({ where: { id: absence.studentId }, select: { name: true, email: true, telegramChatId: true } }),
                prisma.planning.findUnique({ where: { id: absence.sessionId }, include: { module: { select: { name: true } } } })
                    .then(p => p?.module?.name || 'Module inconnu'),
            ]);
            if (!studentFull) return;

            const label = absence.status === 'Late' ? 'retard' : 'absence';
            const date = absence.createdAt.toLocaleDateString('fr-FR');

            await prisma.notification.create({
                data: {
                    userId: absence.studentId,
                    title: `${absence.status === 'Late' ? 'Retard' : 'Absence'} — ${moduleName}`,
                    content: `Vous avez été marqué(e) ${label} le ${date} pour ${moduleName}.`,
                    type: 'alert',
                },
            });

            await sendEmail({
                to: studentFull.email,
                subject: `CampusOps — ${absence.status === 'Late' ? 'Retard' : 'Absence'} enregistré(e) (${moduleName})`,
                body: `Bonjour ${studentFull.name},\n\nUn(e) ${label} a été enregistré(e) :\n\n📚 Module : ${moduleName}\n📅 Date : ${date}\n\nContactez votre enseignant ou la scolarité si c'est une erreur.\n\nCampusOps — EIDIA`,
                type: 'alert',
            });

            if (isTelegramConfigured() && studentFull.telegramChatId) {
                await sendTelegramMessage(
                    studentFull.telegramChatId,
                    `⚠️ *${absence.status === 'Late' ? 'Retard' : 'Absence'} enregistré(e)*\n\n📚 ${moduleName}\n📅 ${date}\n\nContactez la scolarité si c'est une erreur.`,
                );
            }
        } catch (err: any) {
            logger.error(`Absence auto-notify failed: ${err.message}`);
        }
    }

    async markBulk(data: MarkBulkInput) {
        const session = await prisma.planning.findUnique({ where: { id: data.sessionId } });
        if (!session) throw ApiError.badRequest('Session not found');

        const results = await Promise.all(
            data.records.map(r => this.mark({ sessionId: data.sessionId, studentId: r.studentId, status: r.status }))
        );
        return results;
    }

    async justify(id: string, data: JustifyInput) {
        await this.findById(id);
        return prisma.absence.update({ where: { id }, data, include: this.include });
    }

    async getStudentStats(studentId: string) {
        const [total, absent, late, present] = await Promise.all([
            prisma.absence.count({ where: { studentId } }),
            prisma.absence.count({ where: { studentId, status: 'Absent' } }),
            prisma.absence.count({ where: { studentId, status: 'Late' } }),
            prisma.absence.count({ where: { studentId, status: 'Present' } }),
        ]);
        return { studentId, total, present, absent, late, attendanceRate: total > 0 ? Math.round((present / total) * 100) : 100 };
    }

    async delete(id: string) {
        await this.findById(id);
        return prisma.absence.delete({ where: { id } });
    }
}

export const absenceService = new AbsenceService();
