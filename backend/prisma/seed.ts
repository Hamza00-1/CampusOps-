import { PrismaClient, Role, AbsenceStatus, PaymentPlanType, PaymentStatus } from '@prisma/client';
import bcrypt from 'bcrypt';
import { env } from '../src/config/env';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

    // 1. Clean up existing data (optional, useful for development)
    // Be careful with this in production!
    if (env.NODE_ENV === 'development') {
        console.log('🧹 Cleaning existing data...');
        await prisma.notification.deleteMany();
        await prisma.payment.deleteMany();
        await prisma.progress.deleteMany();
        await prisma.absence.deleteMany();
        await prisma.planning.deleteMany();
        await prisma.groupStudent.deleteMany();
        await prisma.user.deleteMany();
        await prisma.group.deleteMany();
        await prisma.module.deleteMany();
        await prisma.branch.deleteMany();
    }

    // 2. Create Branches
    console.log('🏢 Creating branches...');
    const fstBranch = await prisma.branch.create({
        data: {
            name: 'Fès - Campus Principal',
            location: 'Route de Meknès, Fès',
        },
    });

    const rabatBranch = await prisma.branch.create({
        data: {
            name: 'Rabat - Extension',
            location: 'Technopolis, Rabat',
        },
    });

    // 3. Create Users
    console.log('👥 Creating demo users...');

    const adminPassword = await bcrypt.hash('Admin123!', env.BCRYPT_SALT_ROUNDS);
    const scolaritePassword = await bcrypt.hash('Scolar123!', env.BCRYPT_SALT_ROUNDS);
    const profPassword = await bcrypt.hash('Prof123!', env.BCRYPT_SALT_ROUNDS);
    const studentPassword = await bcrypt.hash('Student123!', env.BCRYPT_SALT_ROUNDS);

    const admin = await prisma.user.create({
        data: {
            name: 'Admin System',
            email: 'admin@campusops.ma',
            passwordHash: adminPassword,
            role: Role.Admin,
            branchId: fstBranch.id,
        },
    });

    const scolarite = await prisma.user.create({
        data: {
            name: 'Service Scolarité',
            email: 'scolarite@campusops.ma',
            passwordHash: scolaritePassword,
            role: Role.Scolarite,
            branchId: fstBranch.id,
        },
    });

    const prof = await prisma.user.create({
        data: {
            name: 'Dr. Professeur',
            email: 'prof@campusops.ma',
            passwordHash: profPassword,
            role: Role.Enseignant,
            branchId: fstBranch.id,
        },
    });

    const student1 = await prisma.user.create({
        data: {
            name: 'Etudiant Un',
            email: 'student@campusops.ma',
            passwordHash: studentPassword,
            role: Role.Etudiant,
            branchId: fstBranch.id,
        },
    });

    // 4. Create Modules
    console.log('📚 Creating modules...');
    const moduleCloud = await prisma.module.create({
        data: {
            name: 'Cloud Computing',
            description: 'Introduction to AWS, Azure, and distributed architectures.',
            branchId: fstBranch.id,
        },
    });

    const moduleDist = await prisma.module.create({
        data: {
            name: 'Distributed Applications',
            description: 'Microservices, Docker, Kubernetes, and gRPC.',
            branchId: fstBranch.id,
        },
    });

    // 5. Create Groups & Enrollment
    console.log('🎓 Creating groups and enrollments...');
    const groupA = await prisma.group.create({
        data: {
            name: 'Master Informatique - G1',
            academicYear: '2025/2026',
            branchId: fstBranch.id,
        },
    });

    await prisma.groupStudent.create({
        data: {
            groupId: groupA.id,
            studentId: student1.id,
        },
    });

    // 6. Create Planning
    console.log('📅 Creating planning sessions...');
    const now = new Date();

    const planning1 = await prisma.planning.create({
        data: {
            moduleId: moduleCloud.id,
            groupId: groupA.id,
            teacherId: prof.id,
            room: 'Amphi A',
            startTime: new Date(now.setHours(8, 0, 0, 0)),
            endTime: new Date(now.setHours(10, 0, 0, 0)),
        },
    });

    const planning2 = await prisma.planning.create({
        data: {
            moduleId: moduleDist.id,
            groupId: groupA.id,
            teacherId: prof.id,
            room: 'Labo 1',
            startTime: new Date(now.setHours(10, 30, 0, 0)),
            endTime: new Date(now.setHours(12, 30, 0, 0)),
        },
    });

    // 7. Create Absences
    console.log('✍️ Creating absences...');
    await prisma.absence.create({
        data: {
            sessionId: planning1.id,
            studentId: student1.id,
            status: AbsenceStatus.Late,
        },
    });

    // 8. Create Progress Tracking
    console.log('📈 Creating progress tracking...');
    await prisma.progress.create({
        data: {
            moduleId: moduleCloud.id,
            groupId: groupA.id,
            percentage: 25,
            lastUpdatedById: prof.id,
        },
    });

    // 9. Create Payments
    console.log('💸 Creating payments...');
    await prisma.payment.create({
        data: {
            studentId: student1.id,
            planType: PaymentPlanType.Inscription,
            amount: 4500.00,
            status: PaymentStatus.Paid,
            dueDate: new Date(now.setMonth(now.getMonth() - 1)),
        },
    });

    await prisma.payment.create({
        data: {
            studentId: student1.id,
            planType: PaymentPlanType.Mensualite,
            amount: 1500.00,
            status: PaymentStatus.Unpaid,
            dueDate: new Date(now.setMonth(now.getMonth() + 1)),
        },
    });

    // 10. Create Notifications
    console.log('🔔 Creating notifications...');
    await prisma.notification.create({
        data: {
            userId: student1.id,
            title: 'Reminder: Upcoming Payment',
            content: 'Your next monthly payment of 1500.00 MAD is due soon.',
        },
    });

    console.log('✅ Seed complete! All demo data loaded successfully.');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding data:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
