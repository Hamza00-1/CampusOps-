// Unit tests for password hashing utilities

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-at-least-16-chars';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-at-least-16-chars';
process.env.BCRYPT_SALT_ROUNDS = '8'; // Minimum allowed; fast enough for tests

import { hashPassword, comparePassword } from '../hash';

describe('Password Hashing (bcrypt)', () => {
    const plainPassword = 'MySecurePass123!';

    describe('hashPassword', () => {
        it('returns a string different from the input', async () => {
            const hash = await hashPassword(plainPassword);
            expect(typeof hash).toBe('string');
            expect(hash).not.toBe(plainPassword);
        });

        it('produces different hashes for the same password (salt)', async () => {
            const hash1 = await hashPassword(plainPassword);
            const hash2 = await hashPassword(plainPassword);
            expect(hash1).not.toBe(hash2);
        });

        it('produces a bcrypt-format string starting with $2b$', async () => {
            const hash = await hashPassword(plainPassword);
            expect(hash.startsWith('$2b$')).toBe(true);
        });
    });

    describe('comparePassword', () => {
        it('returns true when password matches the hash', async () => {
            const hash = await hashPassword(plainPassword);
            const result = await comparePassword(plainPassword, hash);
            expect(result).toBe(true);
        });

        it('returns false for a wrong password', async () => {
            const hash = await hashPassword(plainPassword);
            const result = await comparePassword('WrongPassword!', hash);
            expect(result).toBe(false);
        });

        it('returns false for an empty string', async () => {
            const hash = await hashPassword(plainPassword);
            const result = await comparePassword('', hash);
            expect(result).toBe(false);
        });

        it('handles reasonably long passwords (bcrypt truncates at 72 bytes)', async () => {
            // bcrypt truncates at 72 bytes, so we test within that limit
            const longPass = 'A'.repeat(50) + 'B!2xYz#';
            const hash = await hashPassword(longPass);
            expect(await comparePassword(longPass, hash)).toBe(true);
            expect(await comparePassword('A'.repeat(50) + 'C!2xYz#', hash)).toBe(false);
        });
    });
});
