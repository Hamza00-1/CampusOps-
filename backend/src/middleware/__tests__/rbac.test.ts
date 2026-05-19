// Unit tests for RBAC middleware

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-at-least-16-chars';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-at-least-16-chars';

import { Request, Response, NextFunction } from 'express';
import { requireRole, requireOwnerOrAdmin } from '../rbac';
import { ApiError } from '../errorHandler';

function makeReq(user?: any, params?: any): Request {
    return { user, params: params ?? {} } as unknown as Request;
}

const res = {} as Response;

describe('requireRole middleware', () => {
    it('calls next() when user has the required role', () => {
        const req = makeReq({ id: '1', role: 'Admin' });
        const next = jest.fn() as unknown as NextFunction;
        requireRole('Admin')(req, res, next);
        expect(next).toHaveBeenCalledTimes(1);
        expect(next).toHaveBeenCalledWith(); // no error passed
    });

    it('calls next() when user has one of multiple allowed roles', () => {
        const req = makeReq({ id: '1', role: 'Scolarite' });
        const next = jest.fn() as unknown as NextFunction;
        requireRole('Admin', 'Scolarite')(req, res, next);
        expect(next).toHaveBeenCalledTimes(1);
    });

    it('throws 403 when user role is not allowed', () => {
        const req = makeReq({ id: '1', role: 'Etudiant' });
        const next = jest.fn() as unknown as NextFunction;
        expect(() => requireRole('Admin')(req, res, next)).toThrow(ApiError);
        expect(next).not.toHaveBeenCalled();
    });

    it('throws 401 when req.user is undefined', () => {
        const req = makeReq(undefined);
        const next = jest.fn() as unknown as NextFunction;
        expect(() => requireRole('Admin')(req, res, next)).toThrow(ApiError);
    });

    it('thrown error has 403 status code for wrong role', () => {
        const req = makeReq({ id: '1', role: 'Etudiant' });
        const next = jest.fn() as unknown as NextFunction;
        try {
            requireRole('Admin')(req, res, next);
        } catch (err: any) {
            expect(err.statusCode).toBe(403);
        }
    });
});

describe('requireOwnerOrAdmin middleware', () => {
    it('allows Admin to access any resource', () => {
        const req = makeReq({ id: 'admin-1', role: 'Admin' }, { id: 'other-user-id' });
        const next = jest.fn() as unknown as NextFunction;
        requireOwnerOrAdmin('id')(req, res, next);
        expect(next).toHaveBeenCalledTimes(1);
    });

    it('allows user to access their own resource', () => {
        const req = makeReq({ id: 'user-abc', role: 'Etudiant' }, { id: 'user-abc' });
        const next = jest.fn() as unknown as NextFunction;
        requireOwnerOrAdmin('id')(req, res, next);
        expect(next).toHaveBeenCalledTimes(1);
    });

    it('throws 403 when a non-admin accesses another user\'s resource', () => {
        const req = makeReq({ id: 'user-abc', role: 'Etudiant' }, { id: 'user-xyz' });
        const next = jest.fn() as unknown as NextFunction;
        expect(() => requireOwnerOrAdmin('id')(req, res, next)).toThrow(ApiError);
    });

    it('uses the custom param name', () => {
        const req = makeReq({ id: 'user-abc', role: 'Etudiant' }, { studentId: 'user-abc' });
        const next = jest.fn() as unknown as NextFunction;
        requireOwnerOrAdmin('studentId')(req, res, next);
        expect(next).toHaveBeenCalledTimes(1);
    });
});
