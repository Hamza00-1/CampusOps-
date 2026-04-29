// Mock data for CampusOps prototype
window.CO_DATA = {
  roles: [
    { key: 'admin', name: 'Admin', email: 'admin@campusops.ma', color: '#3b82f6', initials: 'AD' },
    { key: 'scolarite', name: 'Scolarité', email: 'scolarite@campusops.ma', color: '#06b6d4', initials: 'SC' },
    { key: 'enseignant', name: 'Enseignant', email: 'prof@campusops.ma', color: '#10b981', initials: 'MK' },
    { key: 'etudiant', name: 'Étudiant', email: 'student@campusops.ma', color: '#f59e0b', initials: 'YB' },
  ],

  branches: [
    { id: 'b1', name: 'Génie Informatique', code: 'GI', students: 342 },
    { id: 'b2', name: 'Génie Civil', code: 'GC', students: 218 },
    { id: 'b3', name: 'Génie Industriel', code: 'GIND', students: 198 },
    { id: 'b4', name: 'Management', code: 'MGT', students: 287 },
    { id: 'b5', name: 'Data & AI', code: 'DAI', students: 156 },
  ],

  modules: [
    { id: 'm1', code: 'CS401', name: 'Distributed Systems', branch: 'GI', teacher: 'M. Karim', progress: 68, color: '#3b82f6' },
    { id: 'm2', code: 'CS402', name: 'Cloud Computing',     branch: 'GI', teacher: 'M. Karim', progress: 54, color: '#06b6d4' },
    { id: 'm3', code: 'CS403', name: 'Machine Learning',    branch: 'DAI', teacher: 'Mme. Rahmouni', progress: 82, color: '#8b5cf6' },
    { id: 'm4', code: 'CS404', name: 'Database Systems',    branch: 'GI', teacher: 'M. El Idrissi', progress: 91, color: '#10b981' },
    { id: 'm5', code: 'CS405', name: 'Algorithms',           branch: 'GI', teacher: 'Mme. Bennani', progress: 45, color: '#f59e0b' },
    { id: 'm6', code: 'MGT301', name: 'Project Management', branch: 'MGT', teacher: 'M. Tazi', progress: 72, color: '#ef4444' },
  ],

  groups: [
    { id: 'g1', name: 'GI-4-A', branch: 'GI', students: 28 },
    { id: 'g2', name: 'GI-4-B', branch: 'GI', students: 26 },
    { id: 'g3', name: 'DAI-3-A', branch: 'DAI', students: 24 },
    { id: 'g4', name: 'MGT-2-A', branch: 'MGT', students: 32 },
  ],

  students: [
    { id: 's1', name: 'Youssef Benali',   email: 'y.benali@campusops.ma',   group: 'GI-4-A', paymentStatus: 'paid',    attendance: 94, progress: 76 },
    { id: 's2', name: 'Aya El Khatib',    email: 'a.elkhatib@campusops.ma', group: 'GI-4-A', paymentStatus: 'paid',    attendance: 98, progress: 88 },
    { id: 's3', name: 'Mehdi Ouazzani',   email: 'm.ouazzani@campusops.ma', group: 'GI-4-B', paymentStatus: 'pending', attendance: 82, progress: 64 },
    { id: 's4', name: 'Fatima Zahra A.',  email: 'f.alaoui@campusops.ma',   group: 'GI-4-A', paymentStatus: 'paid',    attendance: 96, progress: 81 },
    { id: 's5', name: 'Omar Chraibi',     email: 'o.chraibi@campusops.ma',  group: 'GI-4-B', paymentStatus: 'overdue', attendance: 71, progress: 52 },
    { id: 's6', name: 'Nour Tazi',        email: 'n.tazi@campusops.ma',     group: 'DAI-3-A',paymentStatus: 'paid',    attendance: 92, progress: 85 },
    { id: 's7', name: 'Salim Bouzid',     email: 's.bouzid@campusops.ma',   group: 'GI-4-A', paymentStatus: 'pending', attendance: 88, progress: 70 },
    { id: 's8', name: 'Lina Amrani',      email: 'l.amrani@campusops.ma',   group: 'MGT-2-A',paymentStatus: 'paid',    attendance: 95, progress: 79 },
    { id: 's9', name: 'Rayan Idrissi',    email: 'r.idrissi@campusops.ma',  group: 'DAI-3-A',paymentStatus: 'paid',    attendance: 90, progress: 83 },
    { id: 's10', name: 'Sara Lahlou',      email: 's.lahlou@campusops.ma',  group: 'GI-4-B', paymentStatus: 'overdue', attendance: 68, progress: 48 },
    { id: 's11', name: 'Hamza Naciri',     email: 'h.naciri@campusops.ma',  group: 'GI-4-A', paymentStatus: 'paid',    attendance: 93, progress: 77 },
    { id: 's12', name: 'Imane Sabri',      email: 'i.sabri@campusops.ma',   group: 'MGT-2-A',paymentStatus: 'paid',    attendance: 97, progress: 86 },
  ],

  // Weekly planning (Mon=0 .. Sat=5), each slot is [startHour, endHour]
  planning: [
    { day: 0, start: 8,  end: 10, module: 'Distributed Systems', code: 'CS401', group: 'GI-4-A', room: 'B204', teacher: 'M. Karim', color: '#3b82f6' },
    { day: 0, start: 10, end: 12, module: 'Algorithms',           code: 'CS405', group: 'GI-4-A', room: 'B105', teacher: 'Mme. Bennani', color: '#f59e0b' },
    { day: 0, start: 14, end: 16, module: 'Database Systems',     code: 'CS404', group: 'GI-4-B', room: 'A301', teacher: 'M. El Idrissi', color: '#10b981' },
    { day: 1, start: 8,  end: 10, module: 'Cloud Computing',      code: 'CS402', group: 'GI-4-A', room: 'B204', teacher: 'M. Karim', color: '#06b6d4' },
    { day: 1, start: 10, end: 12, module: 'Machine Learning',     code: 'CS403', group: 'DAI-3-A', room: 'C102', teacher: 'Mme. Rahmouni', color: '#8b5cf6' },
    { day: 2, start: 8,  end: 11, module: 'Distributed Systems',  code: 'CS401', group: 'GI-4-B', room: 'B204', teacher: 'M. Karim', color: '#3b82f6' },
    { day: 2, start: 14, end: 16, module: 'Project Management',   code: 'MGT301',group: 'MGT-2-A', room: 'D202', teacher: 'M. Tazi', color: '#ef4444' },
    { day: 3, start: 10, end: 12, module: 'Algorithms',           code: 'CS405', group: 'GI-4-B', room: 'B105', teacher: 'Mme. Bennani', color: '#f59e0b' },
    { day: 3, start: 14, end: 17, module: 'Cloud Computing',      code: 'CS402', group: 'GI-4-B', room: 'B204', teacher: 'M. Karim', color: '#06b6d4' },
    { day: 4, start: 8,  end: 10, module: 'Machine Learning',     code: 'CS403', group: 'DAI-3-A', room: 'C102', teacher: 'Mme. Rahmouni', color: '#8b5cf6' },
    { day: 4, start: 10, end: 12, module: 'Database Systems',     code: 'CS404', group: 'GI-4-A', room: 'A301', teacher: 'M. El Idrissi', color: '#10b981' },
    { day: 5, start: 9,  end: 11, module: 'Project Management',   code: 'MGT301',group: 'MGT-2-A', room: 'D202', teacher: 'M. Tazi', color: '#ef4444' },
  ],

  payments: [
    { id: 'p1', student: 'Youssef Benali',  amount: 5500, status: 'paid',    dueDate: '2026-04-01', paidAt: '2026-03-29', method: 'Virement' },
    { id: 'p2', student: 'Aya El Khatib',   amount: 5500, status: 'paid',    dueDate: '2026-04-01', paidAt: '2026-03-28', method: 'Carte' },
    { id: 'p3', student: 'Mehdi Ouazzani',  amount: 5500, status: 'pending', dueDate: '2026-04-25', paidAt: null,          method: '—' },
    { id: 'p4', student: 'Omar Chraibi',    amount: 5500, status: 'overdue', dueDate: '2026-03-15', paidAt: null,          method: '—' },
    { id: 'p5', student: 'Sara Lahlou',     amount: 5500, status: 'overdue', dueDate: '2026-03-15', paidAt: null,          method: '—' },
    { id: 'p6', student: 'Salim Bouzid',    amount: 5500, status: 'pending', dueDate: '2026-04-25', paidAt: null,          method: '—' },
    { id: 'p7', student: 'Nour Tazi',       amount: 5500, status: 'paid',    dueDate: '2026-04-01', paidAt: '2026-04-02', method: 'Espèces' },
    { id: 'p8', student: 'Lina Amrani',     amount: 5500, status: 'paid',    dueDate: '2026-04-01', paidAt: '2026-03-31', method: 'Virement' },
  ],

  notifications: [
    { id: 'n1', type: 'absence',  title: 'Absence marquée',    desc: '3 étudiants absents en CS401 aujourd\'hui.',       time: 'il y a 12 min', icon: '🔴', unread: true },
    { id: 'n2', type: 'payment',  title: 'Paiement en retard', desc: 'Omar Chraibi — échéance dépassée de 38 jours.', time: 'il y a 1 h',   icon: '💳', unread: true },
    { id: 'n3', type: 'schedule', title: 'Changement de salle', desc: 'CS402 déplacé de B204 vers B210 demain.',         time: 'il y a 2 h',  icon: '📅', unread: true },
    { id: 'n4', type: 'progress', title: 'Module terminé',     desc: 'Database Systems atteint 91% de complétion.',      time: 'il y a 5 h',  icon: '📈', unread: false },
    { id: 'n5', type: 'system',   title: 'Rapport hebdomadaire', desc: 'Le rapport de présence de la semaine est prêt.', time: 'hier',        icon: '📊', unread: false },
    { id: 'n6', type: 'telegram', title: 'Bot activé',         desc: '42 étudiants liés au bot Telegram.',              time: 'hier',        icon: '💬', unread: false },
  ],

  days: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
  hours: [8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
};
