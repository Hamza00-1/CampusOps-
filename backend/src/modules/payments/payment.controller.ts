import { Request, Response, NextFunction } from 'express';
import { paymentService } from './payment.service';
import { successResponse } from '../../utils/response';

export class PaymentController {
    async findAll(req: Request, res: Response, next: NextFunction) {
        try {
            const query = {
                studentId: req.query.studentId as string | undefined,
                status: req.query.status as string | undefined,
                planType: req.query.planType as string | undefined,
                overdue: req.query.overdue as string | undefined,
            };
            res.json(successResponse(await paymentService.findAll(query as any), 'Payments retrieved'));
        } catch (e) { next(e); }
    }
    async findById(req: Request, res: Response, next: NextFunction) {
        try { res.json(successResponse(await paymentService.findById(req.params.id as string), 'Payment retrieved')); } catch (e) { next(e); }
    }
    async create(req: Request, res: Response, next: NextFunction) {
        try { res.status(201).json(successResponse(await paymentService.create(req.body), 'Payment created')); } catch (e) { next(e); }
    }
    async update(req: Request, res: Response, next: NextFunction) {
        try { res.json(successResponse(await paymentService.update(req.params.id as string, req.body), 'Payment updated')); } catch (e) { next(e); }
    }
    async delete(req: Request, res: Response, next: NextFunction) {
        try { await paymentService.delete(req.params.id as string); res.json(successResponse(null, 'Payment deleted')); } catch (e) { next(e); }
    }
    async getStudentSummary(req: Request, res: Response, next: NextFunction) {
        try { res.json(successResponse(await paymentService.getStudentSummary(req.params.studentId as string), 'Payment summary')); } catch (e) { next(e); }
    }
}
export const paymentController = new PaymentController();
