// CampusOps — mock data
const ROLES = {
  admin:      { id:'admin',      label:'Administrator', name:'Dr. Amira Saadi',    email:'a.saadi@campus.edu',     color:'#5FA83C' },
  scolarite:  { id:'scolarite',  label:'Scolarité',     name:'Khalid El Amrani',   email:'k.elamrani@campus.edu', color:'#7C3AED' },
  enseignant: { id:'enseignant', label:'Enseignant',    name:'Prof. Leïla Bennani', email:'l.bennani@campus.edu',  color:'#7CB342' },
  etudiant:   { id:'etudiant',   label:'Étudiant',      name:'Yassine Idrissi',    email:'y.idrissi@campus.edu',   color:'#F59E0B' },
};

const NAV_GROUPS = [
  { label:'Academic',      items:[
    { id:'dashboard',     label:'Dashboard',     icon:'◈', roles:['admin','scolarite','enseignant','etudiant'] },
    { id:'planning',      label:'Planning',      icon:'▦', roles:['admin','scolarite','enseignant','etudiant'] },
    { id:'absences',      label:'Attendance',    icon:'✓', roles:['admin','scolarite','enseignant','etudiant'] },
    { id:'modules',       label:'Modules',       icon:'≡', roles:['admin','scolarite','enseignant','etudiant'] },
  ]},
  { label:'Personal',      items:[
    { id:'progress',      label:'Progress',      icon:'◴', roles:['admin','scolarite','enseignant','etudiant'] },
    { id:'payments',      label:'Payments',      icon:'❐', roles:['admin','scolarite','etudiant'] },
  ]},
  { label:'Administration',items:[
    { id:'users',         label:'Users',         icon:'◍', roles:['admin'] },
    { id:'groups',        label:'Groups',        icon:'◎', roles:['admin','scolarite'] },
    { id:'branches',      label:'Branches',      icon:'⬡', roles:['admin'] },
    { id:'notifications', label:'Notifications', icon:'◐', roles:['admin','scolarite','enseignant','etudiant'] },
  ]},
];

const MODULES = [
  { code:'CS301', name:'Algorithms & Data Structures', color:'#5FA83C', credits:6, teacher:'Prof. L. Bennani' },
  { code:'MA205', name:'Linear Algebra',               color:'#7CB342', credits:4, teacher:'Prof. R. Taibi' },
  { code:'PH210', name:'Quantum Physics',              color:'#7C3AED', credits:5, teacher:'Prof. M. Chafiq' },
  { code:'EN150', name:'Business English',             color:'#F59E0B', credits:3, teacher:'Ms. J. Alaoui' },
  { code:'CS420', name:'Distributed Systems',          color:'#DC2626', credits:6, teacher:'Prof. O. Mansouri' },
  { code:'DB310', name:'Database Systems',             color:'#0891B2', credits:5, teacher:'Prof. S. Laghmari' },
];

const GROUPS_LIST = [
  { id:'L3-INFO-A', name:'L3 Info — Group A',  branch:'Computer Science', students:28, year:'2024-25' },
  { id:'L3-INFO-B', name:'L3 Info — Group B',  branch:'Computer Science', students:26, year:'2024-25' },
  { id:'M1-IA',     name:'M1 AI & Data',       branch:'Computer Science', students:22, year:'2024-25' },
  { id:'L2-MATH',   name:'L2 Mathematics',     branch:'Mathematics',      students:31, year:'2024-25' },
  { id:'L1-PHYS',   name:'L1 Physics',         branch:'Physics',          students:34, year:'2024-25' },
];

const BRANCHES = [
  { code:'CS',   name:'Computer Science',    head:'Prof. L. Bennani',  students:168, groups:7, color:'#5FA83C' },
  { code:'MATH', name:'Mathematics',         head:'Prof. R. Taibi',    students:94,  groups:4, color:'#7CB342' },
  { code:'PHYS', name:'Physics',             head:'Prof. M. Chafiq',   students:112, groups:5, color:'#7C3AED' },
  { code:'BUS',  name:'Business & Management',head:'Dr. F. Hakkaoui',  students:203, groups:8, color:'#F59E0B' },
];

const STUDENTS = [
  { id:'S-2401', name:'Yassine Idrissi',   group:'L3-INFO-A', avg:15.8, att:96, status:'active',  init:'YI', color:'#5FA83C' },
  { id:'S-2402', name:'Soukaina Bennis',   group:'L3-INFO-A', avg:17.2, att:98, status:'active',  init:'SB', color:'#7CB342' },
  { id:'S-2403', name:'Omar Cherkaoui',    group:'L3-INFO-A', avg:12.4, att:78, status:'at-risk', init:'OC', color:'#DC2626' },
  { id:'S-2404', name:'Nadia El Ouali',    group:'L3-INFO-B', avg:14.6, att:92, status:'active',  init:'NE', color:'#7C3AED' },
  { id:'S-2405', name:'Mehdi Alami',       group:'L3-INFO-B', avg:10.1, att:64, status:'at-risk', init:'MA', color:'#F59E0B' },
  { id:'S-2406', name:'Fatima Zahra',      group:'M1-IA',     avg:18.4, att:99, status:'active',  init:'FZ', color:'#0891B2' },
  { id:'S-2407', name:'Hamza Tazi',        group:'M1-IA',     avg:13.9, att:85, status:'active',  init:'HT', color:'#059669' },
  { id:'S-2408', name:'Imane Boukili',     group:'L2-MATH',   avg:15.1, att:91, status:'active',  init:'IB', color:'#DB2777' },
  { id:'S-2409', name:'Zakaria Hmidi',     group:'L2-MATH',   avg:11.8, att:72, status:'at-risk', init:'ZH', color:'#EA580C' },
  { id:'S-2410', name:'Salma Rachidi',     group:'L1-PHYS',   avg:16.3, att:94, status:'active',  init:'SR', color:'#5FA83C' },
  { id:'S-2411', name:'Karim Nassiri',     group:'L1-PHYS',   avg:14.2, att:88, status:'active',  init:'KN', color:'#7C3AED' },
  { id:'S-2412', name:'Lina Berrada',      group:'L3-INFO-A', avg:13.5, att:82, status:'active',  init:'LB', color:'#7CB342' },
];

const PAYMENTS = [
  { id:'INV-24001', student:'Yassine Idrissi',  group:'L3-INFO-A', type:'Tuition Q2',    amount:12500, status:'paid',    date:'Oct 08, 2024', method:'Bank transfer' },
  { id:'INV-24002', student:'Soukaina Bennis',  group:'L3-INFO-A', type:'Tuition Q2',    amount:12500, status:'paid',    date:'Oct 12, 2024', method:'Card' },
  { id:'INV-24003', student:'Omar Cherkaoui',   group:'L3-INFO-A', type:'Tuition Q2',    amount:12500, status:'overdue', date:'Oct 15, 2024', method:'—' },
  { id:'INV-24004', student:'Nadia El Ouali',   group:'L3-INFO-B', type:'Tuition Q2',    amount:12500, status:'partial', date:'Oct 20, 2024', method:'Bank transfer' },
  { id:'INV-24005', student:'Mehdi Alami',      group:'L3-INFO-B', type:'Tuition Q2',    amount:12500, status:'overdue', date:'Oct 15, 2024', method:'—' },
  { id:'INV-24006', student:'Fatima Zahra',     group:'M1-IA',     type:'Tuition Q2',    amount:14000, status:'paid',    date:'Oct 05, 2024', method:'Card' },
  { id:'INV-24007', student:'Hamza Tazi',       group:'M1-IA',     type:'Tuition Q2',    amount:14000, status:'pending', date:'Oct 22, 2024', method:'—' },
  { id:'INV-24008', student:'Imane Boukili',    group:'L2-MATH',   type:'Lab fees',      amount:800,   status:'paid',    date:'Sep 30, 2024', method:'Cash' },
  { id:'INV-24009', student:'Zakaria Hmidi',    group:'L2-MATH',   type:'Tuition Q2',    amount:11000, status:'overdue', date:'Oct 15, 2024', method:'—' },
  { id:'INV-24010', student:'Salma Rachidi',    group:'L1-PHYS',   type:'Tuition Q2',    amount:11000, status:'paid',    date:'Oct 11, 2024', method:'Bank transfer' },
];

const SESSIONS = [
  // Mon
  { day:0, start:8,  dur:2, mod:'CS301', grp:'L3-INFO-A', room:'B-204' },
  { day:0, start:10, dur:1.5, mod:'MA205', grp:'L2-MATH',  room:'A-110' },
  { day:0, start:14, dur:2, mod:'DB310', grp:'L3-INFO-B', room:'B-207' },
  // Tue
  { day:1, start:9,  dur:2, mod:'PH210', grp:'L1-PHYS',   room:'C-12 (Lab)' },
  { day:1, start:13, dur:1.5, mod:'EN150', grp:'L3-INFO-A', room:'A-305' },
  { day:1, start:15, dur:2, mod:'CS420', grp:'M1-IA',     room:'B-301' },
  // Wed
  { day:2, start:8,  dur:1.5, mod:'MA205', grp:'L2-MATH', room:'A-110' },
  { day:2, start:10, dur:2, mod:'CS301', grp:'L3-INFO-B', room:'B-204' },
  { day:2, start:14, dur:2, mod:'DB310', grp:'M1-IA',     room:'B-207' },
  // Thu
  { day:3, start:9,  dur:2, mod:'CS420', grp:'M1-IA',     room:'B-301' },
  { day:3, start:11, dur:1.5, mod:'EN150', grp:'L3-INFO-B', room:'A-305' },
  { day:3, start:14, dur:2, mod:'PH210', grp:'L1-PHYS',   room:'C-12 (Lab)' },
  // Fri
  { day:4, start:8,  dur:2, mod:'CS301', grp:'L3-INFO-A', room:'B-204' },
  { day:4, start:10, dur:2, mod:'MA205', grp:'L2-MATH',   room:'A-110' },
  { day:4, start:14, dur:1.5, mod:'EN150', grp:'M1-IA',   room:'A-305' },
  // Sat
  { day:5, start:9,  dur:2, mod:'DB310', grp:'L3-INFO-A', room:'B-207' },
];

const NOTIFICATIONS = [
  { id:1, type:'alert',    title:'Absence threshold exceeded', desc:'Mehdi Alami has missed 6 sessions this month (L3-INFO-B).', time:'12 min ago', read:false },
  { id:2, type:'success',  title:'Payment received',           desc:'Invoice INV-24010 — Salma Rachidi — 11,000 MAD confirmed.', time:'1h ago',    read:false },
  { id:3, type:'reminder', title:'Grade submission deadline',  desc:'Submit CS301 midterm grades by Friday Oct 25, 23:59.',      time:'3h ago',    read:false },
  { id:4, type:'info',     title:'Schedule update',            desc:'PH210 Tuesday session moved to Lab C-12 (from A-118).',    time:'Yesterday', read:true  },
  { id:5, type:'alert',    title:'4 overdue invoices',         desc:'Group L3-INFO-A has 4 overdue invoices totaling 48,500 MAD.',time:'Yesterday',read:true  },
  { id:6, type:'success',  title:'New group created',          desc:'L3-INFO-A has been successfully created for 2024-25.',     time:'2d ago',    read:true  },
  { id:7, type:'reminder', title:'Faculty meeting',            desc:'Computer Science department meeting — Mon Oct 28, 14:00.', time:'3d ago',    read:true  },
];

const USERS_LIST = [
  { id:'U-001', name:'Dr. Amira Saadi',       role:'admin',      email:'a.saadi@campus.edu',     branch:'—',                 status:'active',   init:'AS', color:'#5FA83C' },
  { id:'U-002', name:'Khalid El Amrani',      role:'scolarite',  email:'k.elamrani@campus.edu',  branch:'—',                 status:'active',   init:'KE', color:'#7C3AED' },
  { id:'U-003', name:'Prof. Leïla Bennani',   role:'enseignant', email:'l.bennani@campus.edu',   branch:'Computer Science',  status:'active',   init:'LB', color:'#7CB342' },
  { id:'U-004', name:'Prof. Rachid Taibi',    role:'enseignant', email:'r.taibi@campus.edu',     branch:'Mathematics',       status:'active',   init:'RT', color:'#F59E0B' },
  { id:'U-005', name:'Prof. Mehdi Chafiq',    role:'enseignant', email:'m.chafiq@campus.edu',    branch:'Physics',           status:'active',   init:'MC', color:'#DC2626' },
  { id:'U-006', name:'Prof. Omar Mansouri',   role:'enseignant', email:'o.mansouri@campus.edu',  branch:'Computer Science',  status:'inactive', init:'OM', color:'#0891B2' },
  { id:'U-007', name:'Ms. Jamila Alaoui',     role:'enseignant', email:'j.alaoui@campus.edu',    branch:'Languages',         status:'active',   init:'JA', color:'#DB2777' },
];

Object.assign(window, { ROLES, NAV_GROUPS, MODULES, GROUPS_LIST, BRANCHES, STUDENTS, PAYMENTS, SESSIONS, NOTIFICATIONS, USERS_LIST });
