import { prisma } from '../../config/database';
import { hashPassword, comparePassword } from '../../utils/hash';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/jwt';
import { ApiError } from '../../middleware/errorHandler';
import { AuthPayload } from '../../types';
import { RegisterInput, LoginInput } from './auth.schemas';

// ============================================
// Auth Service — Business Logic
// ============================================

export class AuthService {
    /**
     * Register a new user.
     * - Checks for duplicate email
     * - Validates branch exists
     * - Hashes password
     * - Creates user in DB
     * - Returns tokens
     */
    async register(input: RegisterInput) {
        // Check if email already exists
        const existing = await prisma.user.findUnique({
            where: { email: input.email },
        });

        if (existing) {
            throw ApiError.conflict('A user with this email already exists');
        }

        // Verify branch exists
        const branch = await prisma.branch.findUnique({
            where: { id: input.branchId },
        });

        if (!branch) {
            throw ApiError.badRequest('Invalid branch ID — branch does not exist');
        }

        // Hash password
        const passwordHash = await hashPassword(input.password);

        // Create user
        const user = await prisma.user.create({
            data: {
                name: input.name,
                email: input.email,
                passwordHash,
                role: input.role,
                branchId: input.branchId,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                branchId: true,
                createdAt: true,
            },
        });

        // Generate tokens
        const payload: AuthPayload = {
            id: user.id,
            email: user.email,
            role: user.role,
            branchId: user.branchId,
        };

        const accessToken = signAccessToken(payload);
        const refreshToken = signRefreshToken(user.id);

        // Store refresh token hash in DB
        await prisma.user.update({
            where: { id: user.id },
            data: { refreshToken },
        });

        return {
            user,
            accessToken,
            refreshToken,
        };
    }

    /**
     * Login with email and password.
     * - Finds user by email
     * - Compares password
     * - Returns tokens
     */
    async login(input: LoginInput) {
        // Find user
        const user = await prisma.user.findUnique({
            where: { email: input.email },
        });

        if (!user) {
            throw ApiError.unauthorized('Invalid email or password');
        }

        // Compare password
        const isValid = await comparePassword(input.password, user.passwordHash);

        if (!isValid) {
            throw ApiError.unauthorized('Invalid email or password');
        }

        // Generate tokens
        const payload: AuthPayload = {
            id: user.id,
            email: user.email,
            role: user.role,
            branchId: user.branchId,
        };

        const accessToken = signAccessToken(payload);
        const refreshToken = signRefreshToken(user.id);

        // Store refresh token in DB
        await prisma.user.update({
            where: { id: user.id },
            data: { refreshToken },
        });

        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                branchId: user.branchId,
            },
            accessToken,
            refreshToken,
        };
    }

    /**
     * Refresh tokens using a valid refresh token.
     * - Verifies the refresh token
     * - Checks it matches the stored one (rotation)
     * - Issues new access + refresh tokens
     */
    async refreshTokens(refreshToken: string) {
        // Verify the refresh token
        let userId: string;
        try {
            userId = verifyRefreshToken(refreshToken);
        } catch {
            throw ApiError.unauthorized('Invalid or expired refresh token');
        }

        // Find the user and verify stored token matches
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user || user.refreshToken !== refreshToken) {
            // Token rotation: if stored token doesn't match,
            // it might be stolen. Invalidate all tokens.
            if (user) {
                await prisma.user.update({
                    where: { id: userId },
                    data: { refreshToken: null },
                });
            }
            throw ApiError.unauthorized('Refresh token has been revoked');
        }

        // Generate new tokens (rotation)
        const payload: AuthPayload = {
            id: user.id,
            email: user.email,
            role: user.role,
            branchId: user.branchId,
        };

        const newAccessToken = signAccessToken(payload);
        const newRefreshToken = signRefreshToken(user.id);

        // Update stored refresh token
        await prisma.user.update({
            where: { id: user.id },
            data: { refreshToken: newRefreshToken },
        });

        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        };
    }

    /**
     * Logout — Invalidate the refresh token.
     */
    async logout(userId: string) {
        await prisma.user.update({
            where: { id: userId },
            data: { refreshToken: null },
        });
    }

    /**
     * Change password for authenticated user.
     */
    async changePassword(userId: string, currentPassword: string, newPassword: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw ApiError.notFound('User not found');
        }

        // Verify current password
        const isValid = await comparePassword(currentPassword, user.passwordHash);
        if (!isValid) {
            throw ApiError.unauthorized('Current password is incorrect');
        }

        // Hash and save new password
        const passwordHash = await hashPassword(newPassword);
        await prisma.user.update({
            where: { id: userId },
            data: { passwordHash, refreshToken: null }, // Force re-login
        });
    }

    /**
     * Get current user profile (from JWT payload + DB).
     */
    async getProfile(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                branchId: true,
                telegramChatId: true,
                createdAt: true,
                updatedAt: true,
                branch: {
                    select: { name: true, location: true },
                },
            },
        });

        if (!user) {
            throw ApiError.notFound('User not found');
        }

        return user;
    }
}

// Singleton export
export const authService = new AuthService();
