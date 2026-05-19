import type { Config } from 'jest';

const config: Config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src'],
    testMatch: ['**/__tests__/**/*.test.ts'],
    transform: {
        // diagnostics:false skips full type-checking in tests; tsc --noEmit handles that separately
        '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.json', diagnostics: false }],
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
    clearMocks: true,
    coverageDirectory: 'coverage',
    collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts'],
    moduleNameMapper: {
        '^@prisma/client$': '<rootDir>/src/__mocks__/@prisma/client.ts',
    },
};

export default config;
