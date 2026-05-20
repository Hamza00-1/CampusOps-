import { PrismaClient, Role, AbsenceStatus, PaymentPlanType, PaymentStatus } from '@prisma/client';
import bcrypt from 'bcrypt';
import { env } from '../src/config/env';

const prisma = new PrismaClient();

// ── Helpers ──
function getMonday(d: Date) {
  const day = d.getDay(), diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.getFullYear(), d.getMonth(), diff);
}
function dt(base: Date, dayOffset: number, h: number, m = 0) {
  const d = new Date(base); d.setDate(d.getDate() + dayOffset); d.setHours(h, m, 0, 0); return d;
}
const hash = (pw: string) => bcrypt.hash(pw, env.BCRYPT_SALT_ROUNDS);

// ── Module definitions per field ──
const FIELDS: { key: string; name: string; teacher: { name: string; email: string }; groups: string[]; modules: Record<string, string[]> }[] = [
  {
    key: 'CS', name: 'CS & Cyber Security',
    teacher: { name: 'Prof. Karim Mansouri', email: 'karim.mansouri@uemf.ma' },
    groups: ['CS-G1', 'CS-G2'],
    modules: {
      S5: ['Secure Web Programming','Advanced Networking','Advanced Algorithmics','Project Management','Languages & Communication 1','Software Engineering','Admin & Securing OS'],
      S6: ['Machine Learning','Cloud Computing','Operations Research','Distributed Applications','Intro to Cybersecurity','Lang & Comm 2','Infographics'],
      S7: ['Information Theory','Cryptology','Database Administration','Node.js Platform','Security of Smartphone OS','Lang & Comm 3','VR/AR'],
      S8: ['Network Security','Blockchain Technology','DevSecOps','Intro to AI','Lang & Comm 4','Digital Forensics & Incident Management','NoSQL Database Security'],
      S9: ['Audit & Cybersecurity Norms','Intrusion Detection Tests','Deep Learning & Cybersecurity','Data Hiding','Securing Windows & AD','Lang & Comm 5','Labor Law & HR Management'],
      S10: ['Final Year Project'],
    },
  },
  {
    key: 'ROB', name: 'Robotics & Cobotics',
    teacher: { name: 'Prof. Leila Bennani', email: 'leila.bennani@uemf.ma' },
    groups: ['ROB-G1', 'ROB-G2'],
    modules: {
      S5: ['Control Theory','Signal Processing','Microprocessors','CAD & 3D Printing','Power Electronics & Electrical Engineering','EuroMed Languages & Culture','Project Management'],
      S6: ['Embedded Systems','Image Processing','Programmable Logic Circuits & VHDL','Microcontrollers','Sequential Automation & Case Studies','EuroMed Languages & Culture','Computer Graphics'],
      S7: ['Navigation & Localization for Robots','Machine Learning','Android Mobile Dev','Robot OS ROS2','Design & Modeling of Robotic Systems','VR/AR','Professional Communication 1'],
      S8: ['Fuzzy Logic & Neural Networks','Critical Systems & Real-Time RTOS','OpenCV & Computer Vision','PLC','Research Project','Intro to AI','Professional Communication 2'],
      S9: ['Intelligent Optimization for Robotics','VR & 3D with Blender','Technologies for Automotive & Aeronautical Industries','Drone Technology & Operation','Industrial Local Area Networks','Labor Law & HR Management','Professional Communication 3'],
      S10: ['Final Year Project'],
    },
  },
  {
    key: 'AI', name: 'Artificial Intelligence',
    teacher: { name: 'Prof. Omar Tazi', email: 'omar.tazi@uemf.ma' },
    groups: ['AI-G1', 'AI-G2'],
    modules: {
      S5: ['OOP & Modeling','Supervised Machine Learning','SQL & NoSQL Databases','Data Processing & Analysis in R','Cybersecurity Fundamentals','Project Management','Lang & Comm 1'],
      S6: ['Advanced Algorithms & Data Structures','Unsupervised Machine Learning','Operations Research','Multilayer Neural Networks','Image Processing','Lang & Comm 2','Computer Graphics'],
      S7: ['CNN','RNN','Network Services & Protocols','Android Mobile Dev','Advanced Statistics','AI for Business','Lang & Comm 3'],
      S8: ['NLP','Multi-Agent Systems & Distributed AI','Embedded Systems & Connected Objects','Combinatorial & Metaheuristic Optimization','Modern Deep Learning Architectures','Lang & Comm 4','Labor Law & HR Management'],
      S9: ['Reinforcement Learning','Fuzzy Logic & Uncertainty Theory','Computer Vision','OCR','Cloud Computing','Digital Entrepreneurship','Lang & Comm 5'],
      S10: ['Final Year Project'],
    },
  },
  {
    key: 'FS', name: 'Full Stack Engineering & Multimedia',
    teacher: { name: 'Prof. Sara El Fassi', email: 'sara.elfassi@uemf.ma' },
    groups: ['FS-G1', 'FS-G2'],
    modules: {
      S5: ['Language & Comm 1','Project Management','Computer Networks','Web Technologies','Database Engineering','Advanced Python Algorithms','Full Stack Security'],
      S6: ['UX & Interface Design','Software Engineering','Database Management','PHP Frameworks','Combinatorial Optimization','Infographics','Lang & Comm 2'],
      S7: ['Advanced Front End Dev','Node.js Platform','Cloud Computing','Git & GitHub','Java EE Environment','Virtual Reality','Lang & Comm 3'],
      S8: ['Advanced Back End','Oracle Administration','Blockchain Technologies','Mobile iOS/Android Dev','VR Integration','Intro to AI','Lang & Comm 4'],
      S9: ['Advanced Mobile Dev','Orchestration & Containerization of Web Services','Web & Mobile DevOps','Machine Learning for Web Devs','CI/CD Pipelines','Labor Law & HR Management','Communication Skills'],
      S10: ['Final Year Project'],
    },
  },
  {
    key: 'BD', name: 'Big Data Analytics',
    teacher: { name: 'Prof. Mehdi Alaoui', email: 'mehdi.alaoui@uemf.ma' },
    groups: ['BD-G1', 'BD-G2'],
    modules: {
      S5: ['Intro to Cybersecurity','Advanced Python Programming','Software System Design & Modeling','Advanced Networks','Java & Neo4j Technologies','EuroMed Languages & Culture','Intro to AI'],
      S6: ['Image Processing','Operations Research','Parallel Computing & Distributed Apps','Advanced Algorithms','Human-Machine Interfaces','EuroMed Languages & Culture','Computer Graphics'],
      S7: ['Database Engineering','Advanced Inferential Statistics','SaaS App Development','Machine Learning','Decision Support IS & Business Intelligence','VR/AR','Professional Communication 1'],
      S8: ['Advanced Exploratory Statistics','Big Data I','Blockchain Technologies','Data Analysis & Extraction','Research Project','Labor Law & HR Management','Professional Communication 2'],
      S9: ['Big Data II','Cloud Computing & IoT','Deep Learning','RPA & ERP','Knowledge Graph Systems & Applications','Digital Entrepreneurship','Professional Communication 3'],
      S10: ['Final Year Project'],
    },
  },
];

// 80 realistic Moroccan student names (8 per group × 10 groups)
const STUDENT_NAMES = [
  // CS-G1
  'Hamza Khchichine','Yassine Idrissi','Soukaina Bennis','Omar Cherkaoui','Nadia El Ouali','Mehdi Alami','Fatima Zahra Rachidi','Karim Nassiri',
  // CS-G2
  'Imane Boukili','Zakaria Hmidi','Salma Tazi','Ahmed Berrada','Lina Fassi','Rachid Benyahia','Hind Lahlou','Mourad Kettani',
  // ROB-G1
  'Anas Sekkat','Hajar Benjelloun','Youssef Chraibi','Sanaa El Idrissi','Othmane Zouine','Kenza Afilal','Badr Laamrani','Ghita Serghini',
  // ROB-G2
  'Reda Squalli','Meryem Tlemcani','Adil Benkirane','Houda Slaoui','Saad Guessous','Amina Qadiri','Tarik Berrechid','Loubna Filali',
  // AI-G1
  'Ayoub Mernissi','Chaima El Amrani','Walid Benjelloun','Rim Bouzidi','Oussama Ziani','Dounia Laraki','Ilyas Sbai','Hafsa El Baz',
  // AI-G2
  'Amine Bennani','Wiam Ouazzani','Khalil Senhaji','Safaa Raissouni','Marouane Touzani','Ikram Hajji','Faisal Kabbaj','Zineb Belkadi',
  // FS-G1
  'Taha Mouline','Noura Regragui','Bilal Sefiani','Samira El Khattabi','Ismail Benmoussa','Leila Zerhouni','Naoufel Lamdouar','Asmae Bensouda',
  // FS-G2
  'Rayan Guerraoui','Hasnae Fahmi','Driss El Younoussi','Khadija Daoudi','Ziad Bouhaddou','Mouna Chrifi','Hamid El Maachi','Siham Jamai',
  // BD-G1
  'Soufiane Belghiti','Malika Tounsi','Yousra Fikri','Abdelilah Rahmani','Hanane Boucetta','Nizar Benchekroun','Amal Senhaji','Mounir Tadlaoui',
  // BD-G2
  'Anass Lotfi','Rajae Benkiran','Oualid Sefrioui','Meriem Alami','Yahya Andaloussi','Nisrine Tahiri','Chakib El Fassi','Ibtissam Doukkali',
];

const ROOMS = ['Amphi A','Amphi B','Salle B-204','Salle B-207','Salle B-301','Lab C-12','Salle A-110','Salle A-305','Lab IoT','Lab Cyber'];

async function main() {
  console.log('🌱 Starting EIDIA seed...\n');

  // ── Clean ──
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

  // ── 1. Branch ──
  console.log('🏢 Creating EIDIA branch...');
  const branch = await prisma.branch.create({
    data: { name: 'EIDIA', location: 'UEMF — Route de Meknès, Fès' },
  });

  // ── 2. Demo accounts ──
  console.log('👤 Creating demo accounts...');
  const [adminPw, scolarPw, profPw, studentPw] = await Promise.all([
    hash('Admin123!'), hash('Scolar123!'), hash('Prof123!'), hash('Student123!'),
  ]);

  const admin = await prisma.user.create({
    data: { name: 'Admin System', email: 'admin@campusops.ma', passwordHash: adminPw, role: Role.Admin, branchId: branch.id },
  });
  await prisma.user.create({
    data: { name: 'Service Scolarité', email: 'scolarite@campusops.ma', passwordHash: scolarPw, role: Role.Scolarite, branchId: branch.id },
  });
  const demoProf = await prisma.user.create({
    data: { name: 'Dr. Professeur', email: 'prof@campusops.ma', passwordHash: profPw, role: Role.Enseignant, branchId: branch.id },
  });
  const demoStudent = await prisma.user.create({
    data: { name: 'Etudiant Demo', email: 'student@campusops.ma', passwordHash: studentPw, role: Role.Etudiant, branchId: branch.id },
  });

  // ── 2b. REAL EIDIA users (from roles.xlsx) ──
  // Default password for all real accounts: CampusOps@2026 (users should change after first login)
  console.log('🎓 Creating real EIDIA accounts from roles.xlsx...');
  const realPw = await hash('CampusOps@2026');
  const realUsers: Array<{ name: string; email: string; phone: string; role: Role }> = [
    { name: 'Hamza Khchinich',   email: 'hamza.khchichine@eidia.ueuromed.org', phone: '+212660609941', role: Role.Admin },
    { name: 'Karima Ed Dahhak',  email: 'karima.eddahhak@eidia.ueuromed.org',  phone: '+212771493177', role: Role.Scolarite },
    { name: 'Imad Adnane',       email: 'imad.adnane@eidia.ueuromed.org',      phone: '+212611526620', role: Role.Enseignant },
    { name: 'Siham Lyzoul',      email: 'siham.lyzoul@eidia.ueuromed.org',     phone: '+212620407095', role: Role.Etudiant },
    { name: 'Brahim Nakkar',     email: 'brahim.nakkar@eidia.ueuromed.org',    phone: '+212659756354', role: Role.Etudiant },
  ];
  const realCreated: Record<string, { id: string; role: Role }> = {};
  for (const u of realUsers) {
    const created = await prisma.user.create({
      data: {
        name: u.name,
        email: u.email,
        passwordHash: realPw,
        role: u.role,
        whatsappNumber: u.phone,
        branchId: branch.id,
      },
    });
    realCreated[u.email] = { id: created.id, role: u.role };
  }
  console.log(`   → ${realUsers.length} real EIDIA accounts created (password: CampusOps@2026)`);

  // ── 3. Teachers (5) ──
  console.log('👩‍🏫 Creating 5 field teachers...');
  const teachers: Record<string, { id: string }> = {};
  for (const f of FIELDS) {
    teachers[f.key] = await prisma.user.create({
      data: { name: f.teacher.name, email: f.teacher.email, passwordHash: profPw, role: Role.Enseignant, branchId: branch.id },
    });
  }

  // ── 4. Modules (all semesters, all fields) ──
  console.log('📚 Creating modules...');
  const allModules: Record<string, { id: string; name: string; fieldKey: string; semester: string }[]> = {};
  for (const f of FIELDS) {
    allModules[f.key] = [];
    for (const [sem, names] of Object.entries(f.modules)) {
      for (const modName of names) {
        const m = await prisma.module.create({
          data: { name: modName, description: `Field: ${f.name} | Semester: ${sem}`, branchId: branch.id },
        });
        allModules[f.key].push({ id: m.id, name: modName, fieldKey: f.key, semester: sem });
      }
    }
  }
  const totalMods = Object.values(allModules).reduce((s, a) => s + a.length, 0);
  console.log(`   → ${totalMods} modules created`);

  // ── 5. Groups (10) ──
  console.log('🎓 Creating 10 groups...');
  const groups: Record<string, { id: string; name: string }[]> = {};
  for (const f of FIELDS) {
    groups[f.key] = [];
    for (const gName of f.groups) {
      const g = await prisma.group.create({
        data: { name: gName, academicYear: '2025/2026', branchId: branch.id },
      });
      groups[f.key].push({ id: g.id, name: gName });
    }
  }

  // ── 6. Students (80) + GroupStudent enrollment ──
  console.log('🧑‍🎓 Creating 80 students & enrolling...');
  let nameIdx = 0;
  const allStudentIds: string[] = [];
  const groupStudentIds: Record<string, string[]> = {};

  for (const f of FIELDS) {
    for (const g of groups[f.key]) {
      groupStudentIds[g.id] = [];
      for (let i = 0; i < 8; i++) {
        const sName = STUDENT_NAMES[nameIdx];
        const emailSlug = sName.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z.]/g, '');
        const student = await prisma.user.create({
          data: { name: sName, email: `${emailSlug}@etu.uemf.ma`, passwordHash: studentPw, role: Role.Etudiant, branchId: branch.id },
        });
        await prisma.groupStudent.create({ data: { groupId: g.id, studentId: student.id } });
        allStudentIds.push(student.id);
        groupStudentIds[g.id].push(student.id);
        nameIdx++;
      }
    }
  }

  // Enroll demo student + demo prof to CS
  const csG1 = groups['CS'][0];
  await prisma.groupStudent.create({ data: { groupId: csG1.id, studentId: demoStudent.id } });
  groupStudentIds[csG1.id].push(demoStudent.id);

  // Enroll real EIDIA students (siham, brahim) into CS-G1 too
  for (const u of realUsers) {
    if (u.role === Role.Etudiant) {
      const r = realCreated[u.email];
      await prisma.groupStudent.create({ data: { groupId: csG1.id, studentId: r.id } });
      groupStudentIds[csG1.id].push(r.id);
      allStudentIds.push(r.id);
    }
  }

  console.log(`   → ${nameIdx} students enrolled`);

  // ── 7. Planning (3 sessions/week per teacher: Mon, Wed, Fri for S8 modules) ──
  console.log('📅 Creating planning sessions...');
  const monday = getMonday(new Date());
  const dayOffsets = [0, 2, 4]; // Mon, Wed, Fri
  const timeSlots = [
    { h: 8, m: 0, eh: 10, em: 0 },
    { h: 10, m: 30, eh: 12, em: 30 },
    { h: 14, m: 0, eh: 16, em: 0 },
  ];
  const allSessions: { id: string; groupId: string }[] = [];
  let roomIdx = 0;

  for (const f of FIELDS) {
    const s8Modules = allModules[f.key].filter(m => m.semester === 'S8');
    const teacherId = teachers[f.key].id;
    let modCursor = 0;

    for (let dayI = 0; dayI < dayOffsets.length; dayI++) {
      const dayOff = dayOffsets[dayI];
      const slot = timeSlots[dayI % timeSlots.length];
      const mod = s8Modules[modCursor % s8Modules.length];
      modCursor++;

      for (const g of groups[f.key]) {
        const session = await prisma.planning.create({
          data: {
            moduleId: mod.id, groupId: g.id, teacherId,
            room: ROOMS[roomIdx % ROOMS.length],
            startTime: dt(monday, dayOff, slot.h, slot.m),
            endTime: dt(monday, dayOff, slot.eh, slot.em),
          },
        });
        allSessions.push({ id: session.id, groupId: g.id });
        roomIdx++;
      }
    }
  }

  // Demo prof also gets sessions for CS modules
  const csS8 = allModules['CS'].filter(m => m.semester === 'S8');
  if (csS8.length > 0) {
    for (const g of groups['CS']) {
      await prisma.planning.create({
        data: {
          moduleId: csS8[0].id, groupId: g.id, teacherId: demoProf.id,
          room: 'Lab Cyber', startTime: dt(monday, 1, 14, 0), endTime: dt(monday, 1, 16, 0),
        },
      });
    }
  }

  console.log(`   → ${allSessions.length + 2} sessions created`);

  // ── 8. Absences (3 per group per session: mix Present/Absent/Late) ──
  console.log('✍️  Creating absence records...');
  const statuses: AbsenceStatus[] = [AbsenceStatus.Present, AbsenceStatus.Absent, AbsenceStatus.Late];
  let absCount = 0;

  for (const sess of allSessions) {
    const students = groupStudentIds[sess.groupId] || [];
    for (let i = 0; i < Math.min(3, students.length); i++) {
      await prisma.absence.create({
        data: { sessionId: sess.id, studentId: students[i], status: statuses[i % 3] },
      });
      absCount++;
    }
  }
  console.log(`   → ${absCount} absence records`);

  // ── 9. Payments (2 per student: Inscription=Paid, Mensualite=Unpaid) ──
  console.log('💸 Creating payments...');
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 15);
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 15);

  for (const sid of allStudentIds) {
    await prisma.payment.createMany({
      data: [
        { studentId: sid, planType: PaymentPlanType.Inscription, amount: 45000.00, status: PaymentStatus.Paid, dueDate: lastMonth },
        { studentId: sid, planType: PaymentPlanType.Mensualite, amount: 5000.00, status: PaymentStatus.Unpaid, dueDate: nextMonth },
      ],
    });
  }
  // Demo student payments
  await prisma.payment.createMany({
    data: [
      { studentId: demoStudent.id, planType: PaymentPlanType.Inscription, amount: 45000.00, status: PaymentStatus.Paid, dueDate: lastMonth },
      { studentId: demoStudent.id, planType: PaymentPlanType.Mensualite, amount: 5000.00, status: PaymentStatus.Unpaid, dueDate: nextMonth },
    ],
  });
  console.log(`   → ${allStudentIds.length * 2 + 2} payments`);

  // ── 10. Progress (S8 modules per group) ──
  console.log('📈 Creating progress tracking...');
  for (const f of FIELDS) {
    const s8 = allModules[f.key].filter(m => m.semester === 'S8');
    for (const g of groups[f.key]) {
      for (const mod of s8) {
        await prisma.progress.create({
          data: { moduleId: mod.id, groupId: g.id, percentage: 20 + Math.floor(Math.random() * 60), lastUpdatedById: teachers[f.key].id },
        });
      }
    }
  }

  // ── 11. Notifications ──
  console.log('🔔 Creating notifications...');
  await prisma.notification.createMany({
    data: [
      { userId: admin.id, title: 'Bienvenue sur CampusOps', content: 'Le système est opérationnel pour l\'année 2025/2026. Toutes les filières EIDIA sont configurées.', type: 'success' },
      { userId: demoStudent.id, title: 'Paiement en attente', content: 'Votre mensualité de 5 000 MAD est due le mois prochain.', type: 'alert' },
      { userId: demoProf.id, title: 'Sessions planifiées', content: 'Vos sessions S8 pour CS & Cyber Security sont programmées cette semaine.', type: 'info' },
      { userId: teachers['AI'].id, title: 'Rappel de saisie', content: 'Veuillez mettre à jour la progression du module NLP pour AI-G1 et AI-G2.', type: 'reminder' },
      { userId: teachers['FS'].id, title: 'Nouveau semestre', content: 'Les modules S8 Full Stack sont maintenant disponibles dans le planning.', type: 'info' },
    ],
  });

  console.log('\n✅ EIDIA seed complete!');
  console.log(`   Branch: 1 | Teachers: 5 | Students: ${nameIdx} | Groups: 10`);
  console.log(`   Modules: ${totalMods} | Sessions: ${allSessions.length + 2} | Absences: ${absCount}`);
  console.log(`   Payments: ${allStudentIds.length * 2 + 2} | Notifications: 5`);
  console.log('\n   Demo accounts: admin/scolarite/prof/student @campusops.ma');
  console.log('   Real EIDIA accounts (password: CampusOps@2026):');
  for (const u of realUsers) console.log(`     • ${u.email.padEnd(46)} [${u.role}]`);
}

main()
  .catch((e) => { console.error('❌ Error seeding:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
