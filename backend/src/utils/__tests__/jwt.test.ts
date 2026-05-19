// Unit tests for JWT utilities
// These run in isolation — no DB or HTTP needed.

// Set env vars before any imports touch the env module
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-at-least-16-chars';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-at-least-16-chars';
process.env.JWT_ACCESS_EXPIRY = '15m';
process.env.JWT_REFRESH_EXPIRY = '7d';

import {
    signAccessToken,
    signRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
    hashToken,
} from '../jwt';
import { AuthPayload } from '../../types';

const samplePayload: AuthPayload = {
    id: 'user-123',
    email: 'test@campusops.ma',
    role: 'Etudiant',
    branchId: 'branch-abc',
};

describe('JWT Utilities', () => {
    describe('hashToken', () => {
        it('returns a 64-char hex string', () => {
            const hash = hashToken('some-token');
            expect(hash).toHaveLength(64);
            expect(hash).toMatch(/^[a-f0-9]+$/);
        });

        it('is deterministic — same input yields same hash', () => {
            expect(hashToken('abc')).toBe(hashToken('abc'));
        });

        it('different inputs produce different hashes', () => {
            expect(hashToken('token-a')).not.toBe(hashToken('token-b'));
        });
    });

    describe('signAccessToken / verifyAccessToken', () => {
        it('signs a token that can be verified', () => {
            const token = signAccessToken(samplePayload);
            expect(typeof token).toBe('string');
            expect(token.split('.').length).toBe(3); // JWT = header.payload.sig
        });

        it('decoded payload contains all fields', () => {
            const token = signAccessToken(samplePayload);
            const decoded = verifyAccessToken(token);
            expect(decoded.id).toBe(samplePayload.id);
            expect(decoded.email).toBe(samplePayload.email);
            expect(decoded.role).toBe(samplePayload.role);
            expect(decoded.branchId).toBe(samplePayload.branchId);
        });

        it('throws on invalid token', () => {
            expect(() => verifyAccessToken('invalid.token.here')).toThrow();
        });

        it('throws on tampered token', () => {
            const token = signAccessToken(samplePayload);
            const tampered = token.slice(0, -5) + 'XXXXX';
            expect(() => verifyAccessToken(tampered)).toThrow();
        });

        it('throws when verified with wrong secret', () => {
            // Sign with different secret manually
            const jwt = require('jsonwebtoken');
            const fakeToken = jwt.sign(samplePayload, 'wrong-secret', { expiresIn: '15m' });
            expect(() => verifyAccessToken(fakeToken)).toThrow();
        });
    });

    describe('signRefreshToken / verifyRefreshToken', () => {
        it('signs a refresh token for a user id', () => {
            const token = signRefreshToken('user-123');
            expect(typeof token).toBe('string');
        });

        it('decoded token returns the original user id', () => {
            const token = signRefreshToken('user-456');
            const userId = verifyRefreshToken(token);
            expect(userId).toBe('user-456');
        });

        it('throws on invalid refresh token', () => {
            expect(() => verifyRefreshToken('bad-token')).toThrow();
        });

        it('access token is rejected by verifyRefreshToken', () => {
            const accessToken = signAccessToken(samplePayload);
            // Access token uses a different secret — should throw
            expect(() => verifyRefreshToken(accessToken)).toThrow();
        });
    });
});
