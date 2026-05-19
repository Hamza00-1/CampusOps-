// Mock for @prisma/client used in unit tests (no DB required)
export enum Role {
    Admin = 'Admin',
    Scolarite = 'Scolarite',
    Enseignant = 'Enseignant',
    Etudiant = 'Etudiant',
}

export const PrismaClient = jest.fn().mockImplementation(() => ({
    $connect: jest.fn(),
    $disconnect: jest.fn(),
}));
