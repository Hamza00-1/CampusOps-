/**
 * Integration Tests — Auth Flow
 *
 * Requires a running PostgreSQL instance with the CampusOps schema.
 * Run with: npm run test:integration
 *
 * Tests the full flow: register → login → get profile → refresh → logout
 */

process.env.NODE_ENV = 'test';

import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/config/database';

// Test user — unique email per test run to avoid conflicts
const TEST_EMAIL = `test-auth-${Date.now()}@campusops-test.ma`;
const TEST_PASSWORD = 'TestPass123!';

let branchId: string;
let accessToken: string;
let refreshToken: string;
let userId: string;

beforeAll(async () => {
    // Ensure a branch exists for registration
    const branch = await prisma.branch.findFirst();
    if (!branch) {
        const created = await prisma.branch.create({
            data: { name: 'Test Branch', location: 'Test City' },
        });
        branchId = created.id;
    } else {
        branchId = branch.id;
    }
});

afterAll(async () => {
    // Clean up test user
    await prisma.user.deleteMany({ where: { email: TEST_EMAIL } });
    await prisma.$disconnect();
});

describe('Auth Integration — POST /api/auth/register', () => {
    it('registers a new user and returns tokens', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ name: 'Test User', email: TEST_EMAIL, password: TEST_PASSWORD, role: 'Etudiant', branchId });

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.accessToken).toBeDefined();
        expect(res.body.data.refreshToken).toBeDefined();
        expect(res.body.data.user.email).toBe(TEST_EMAIL);

        userId = res.body.data.user.id;
    });

    it('rejects duplicate email with 409', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ name: 'Duplicate', email: TEST_EMAIL, password: TEST_PASSWORD, role: 'Etudiant', branchId });

        expect(res.status).toBe(409);
    });

    it('rejects weak password with 400', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ name: 'Weak', email: `weak-${Date.now()}@test.ma`, password: '1234', role: 'Etudiant', branchId });

        expect(res.status).toBe(400);
    });
});

describe('Auth Integration — POST /api/auth/login', () => {
    it('logs in and returns tokens', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: TEST_EMAIL, password: TEST_PASSWORD });

        expect(res.status).toBe(200);
        expect(res.body.data.accessToken).toBeDefined();
        expect(res.body.data.refreshToken).toBeDefined();

        accessToken = res.body.data.accessToken;
        refreshToken = res.body.data.refreshToken;
    });

    it('rejects wrong password with 401', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: TEST_EMAIL, password: 'WrongPassword123!' });

        expect(res.status).toBe(401);
    });

    it('rejects unknown email with 401', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'nobody@nowhere.ma', password: TEST_PASSWORD });

        expect(res.status).toBe(401);
    });
});

describe('Auth Integration — GET /api/auth/profile', () => {
    it('returns user profile with valid token', async () => {
        const res = await request(app)
            .get('/api/auth/profile')
            .set('Authorization', `Bearer ${accessToken}`);

        expect(res.status).toBe(200);
        expect(res.body.data.email).toBe(TEST_EMAIL);
    });

    it('returns 401 without token', async () => {
        const res = await request(app).get('/api/auth/profile');
        expect(res.status).toBe(401);
    });

    it('returns 401 with malformed token', async () => {
        const res = await request(app)
            .get('/api/auth/profile')
            .set('Authorization', 'Bearer not-a-real-token');
        expect(res.status).toBe(401);
    });
});

describe('Auth Integration — POST /api/auth/refresh', () => {
    it('issues new tokens from a valid refresh token', async () => {
        const res = await request(app)
            .post('/api/auth/refresh')
            .send({ refreshToken });

        expect(res.status).toBe(200);
        expect(res.body.data.accessToken).toBeDefined();
        expect(res.body.data.refreshToken).toBeDefined();

        // Update tokens for subsequent tests
        accessToken = res.body.data.accessToken;
        refreshToken = res.body.data.refreshToken;
    });

    it('rejects an already-rotated refresh token (replay attack)', async () => {
        // Use the OLD refresh token again — should fail (rotation)
        const oldRefreshToken = refreshToken;
        // Rotate once more to invalidate the old one
        await request(app).post('/api/auth/refresh').send({ refreshToken });

        const res = await request(app)
            .post('/api/auth/refresh')
            .send({ refreshToken: oldRefreshToken });

        expect(res.status).toBe(401);
    });
});

describe('Auth Integration — POST /api/auth/logout', () => {
    it('logs out and invalidates the refresh token', async () => {
        // Log in fresh to get a clean token
        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({ email: TEST_EMAIL, password: TEST_PASSWORD });

        const token = loginRes.body.data.accessToken;
        const rt = loginRes.body.data.refreshToken;

        const logoutRes = await request(app)
            .post('/api/auth/logout')
            .set('Authorization', `Bearer ${token}`);

        expect(logoutRes.status).toBe(200);

        // Refresh should now fail
        const refreshRes = await request(app)
            .post('/api/auth/refresh')
            .send({ refreshToken: rt });

        expect(refreshRes.status).toBe(401);
    });
});

describe('RBAC Integration — Admin-only endpoints', () => {
    it('blocks a student from accessing /api/users (Admin only)', async () => {
        // Log in as the test student
        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({ email: TEST_EMAIL, password: TEST_PASSWORD });

        const studentToken = loginRes.body.data.accessToken;

        const res = await request(app)
            .get('/api/users')
            .set('Authorization', `Bearer ${studentToken}`);

        expect(res.status).toBe(403);
    });
});
