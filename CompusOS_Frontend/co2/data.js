// CampusOps — mock data (cleaned: no emojis, realistic numbers)
const ROLES = {
  admin:      { id:'admin',      label:'Administrator', name:'Dr. Amira Saadi',     email:'a.saadi@campus.edu',    color:'#5FA83C' },
  scolarite:  { id:'scolarite',  label:'Scolarité',     name:'Khalid El Amrani',    email:'k.elamrani@campus.edu', color:'#7C3AED' },
  enseignant: { id:'enseignant', label:'Enseignant',    name:'Prof. Leïla Bennani', email:'l.bennani@campus.edu', color:'#7CB342', field:'Computer Science — Algorithms & Data Structures' },
  etudiant:   { id:'etudiant',   label:'Étudiant',      name:'Yassine Idrissi',     email:'y.idrissi@campus.edu',  color:'#F59E0B', group:'L3-INFO-A' },
};

// Lucide-style stroke icons (kept as svg paths; no emoji)
const ICONS = {
  dashboard:'<path d="M3 12l9-9 9 9M5 10v10h14V10" stroke="currentColor" stroke-width="1.7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  planning: '<rect x="3" y="4" width="18" height="17" rx="2" stroke="currentColor" stroke-width="1.7" fill="none"/><path d="M3 9h18M8 2v4M16 2v4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
  absences: '<path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  modules:  '<path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
  grades:   '<path d="M12 20h9M16.5 3.5a2.12 2.12 0 113 3L7 19l-4 1 1-4 12.5-12.5z" stroke="currentColor" stroke-width="1.7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  progress: '<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.7" fill="none"/><path d="M12 7v5l3 2" stroke="currentColor" stroke-width="1.7" fill="none" stroke-linecap="round"/>',
  payments: '<rect x="2" y="6" width="20" height="13" rx="2" stroke="currentColor" stroke-width="1.7" fill="none"/><path d="M2 10h20" stroke="currentColor" stroke-width="1.7"/>',
  users:    '<circle cx="9" cy="8" r="4" stroke="currentColor" stroke-width="1.7" fill="none"/><path d="M2 21c0-4 3-7 7-7s7 3 7 7M17 11h5M19.5 8.5v5" stroke="currentColor" stroke-width="1.7" fill="none" stroke-linecap="round"/>',
  groups:   '<circle cx="9" cy="8" r="3.5" stroke="currentColor" stroke-width="1.7" fill="none"/><circle cx="17" cy="9" r="2.5" stroke="currentColor" stroke-width="1.7" fill="none"/><path d="M3 20c0-3 2.5-5 6-5s6 2 6 5M15 20c0-2 2-3.5 4.5-3.5" stroke="currentColor" stroke-width="1.7" fill="none" stroke-linecap="round"/>',
  branches: '<path d="M12 2L3 7l9 5 9-5-9-5zM3 12l9 5 9-5M3 17l9 5 9-5" stroke="currentColor" stroke-width="1.7" fill="none" stroke-linejoin="round"/>',
  notifications: '<path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9M14 21a2 2 0 01-4 0" stroke="currentColor" stroke-width="1.7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  settings: '<circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.7" fill="none"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.65 1.65 0 005 15a1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09A1.65 1.65 0 005 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 5a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09A1.65 1.65 0 0015 5a1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06A1.65 1.65 0 0019 9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z" stroke="currentColor" stroke-width="1.5" fill="none"/>',
  search:   '<circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.8" fill="none"/><path d="M21 21l-4.3-4.3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
  bell:     '<path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9M14 21a2 2 0 01-4 0" stroke="currentColor" stroke-width="1.7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  sun:      '<circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.7" fill="none"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
  moon:     '<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" stroke-width="1.7" fill="none" stroke-linejoin="round"/>',
  close:    '<path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
  check:    '<path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  alert:    '<path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01" stroke="currentColor" stroke-width="1.7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  info:     '<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.7" fill="none"/><path d="M12 16v-4M12 8h.01" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
  clock:    '<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.7" fill="none"/><path d="M12 7v5l3 2" stroke="currentColor" stroke-width="1.7" fill="none" stroke-linecap="round"/>',
  lock:     '<rect x="4" y="11" width="16" height="10" rx="2" stroke="currentColor" stroke-width="1.7" fill="none"/><path d="M8 11V7a4 4 0 118 0v4" stroke="currentColor" stroke-width="1.7" fill="none"/>',
  palette:  '<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.7" fill="none"/><circle cx="7.5" cy="10.5" r="1.2" fill="currentColor"/><circle cx="12" cy="7.5" r="1.2" fill="currentColor"/><circle cx="16.5" cy="10.5" r="1.2" fill="currentColor"/><circle cx="14.5" cy="15" r="1.2" fill="currentColor"/>',
  device:   '<rect x="3" y="3" width="18" height="14" rx="2" stroke="currentColor" stroke-width="1.7" fill="none"/><path d="M8 21h8M12 17v4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
  edit:     '<path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="1.7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  trash:    '<path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" stroke="currentColor" stroke-width="1.7" fill="none" stroke-linecap="round"/>',
  eye:      '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="1.7" fill="none"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.7" fill="none"/>',
  plus:     '<path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
  logout:   '<path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" stroke-width="1.7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  chevron:  '<path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round"/>',
};

const NAV_GROUPS = [
  { label:'Academic', items:[
    { id:'dashboard',     label:'Dashboard',     icon:'dashboard', roles:['admin','scolarite','enseignant','etudiant'] },
    { id:'planning',      label:'Planning',      icon:'planning',  roles:['admin','scolarite','enseignant','etudiant'] },
    { id:'absences',      label:'Attendance',    icon:'absences',  roles:['admin','scolarite','enseignant','etudiant'] },
    { id:'modules',       label:'Modules',       icon:'modules',   roles:['admin','scolarite','enseignant','etudiant'] },
    { id:'grades',        label:'Grades',        icon:'grades',    roles:['admin','scolarite','enseignant','etudiant'] },
  ]},
  { label:'Personal', items:[
    { id:'progress',      label:'Progress',      icon:'progress',  roles:['admin','scolarite','enseignant','etudiant'] },
    { id:'payments',      label:'Payments',      icon:'payments',  roles:['admin','scolarite','etudiant'] },
  ]},
  { label:'Administration', items:[
    { id:'users',         label:'Users',         icon:'users',     roles:['admin'] },
    { id:'groups',        label:'Groups',        icon:'groups',    roles:['admin','scolarite'] },
    { id:'branches',      label:'Branches',      icon:'branches',  roles:['admin'] },
    { id:'notifications', label:'Notifications', icon:'notifications', roles:['admin','scolarite','enseignant','etudiant'] },
  ]},
];

const MODULES = [
  { code:'CS301', name:'Algorithms & Data Structures', color:'#5FA83C', teacher:'Prof. L. Bennani' },
  { code:'MA205', name:'Linear Algebra',               color:'#7CB342', teacher:'Prof. R. Taibi' },
  { code:'PH210', name:'Quantum Physics',              color:'#7C3AED', teacher:'Prof. M. Chafiq' },
  { code:'EN150', name:'Business English',             color:'#F59E0B', teacher:'Ms. J. Alaoui' },
  { code:'CS420', name:'Distributed Systems',          color:'#DC2626', teacher:'Prof. O. Mansouri' },
  { code:'DB310', name:'Database Systems',             color:'#0891B2', teacher:'Prof. S. Laghmari' },
];

const GROUPS_LIST = [
  { id:'L3-INFO-A', name:'L3 Info — Group A',  branch:'Computer Science', students:28, year:'2024-25' },
  { id:'L3-INFO-B', name:'L3 Info — Group B',  branch:'Computer Science', students:26, year:'2024-25' },
  { id:'M1-IA',     name:'M1 AI & Data',       branch:'Computer Science', students:22, year:'2024-25' },
  { id:'L2-MATH',   name:'L2 Mathematics',     branch:'Mathematics',      students:31, year:'2024-25' },
  { id:'L1-PHYS',   name:'L1 Physics',         branch:'Physics',          students:34, year:'2024-25' },
];

const BRANCHES = [
  { code:'CS',   name:'Computer Science',     head:'Prof. L. Bennani', students:168, groups:7, color:'#5FA83C', founded:2008, faculty:24, description:'Software engineering, algorithms, AI, distributed systems and data science.' },
  { code:'MATH', name:'Mathematics',          head:'Prof. R. Taibi',   students:94,  groups:4, color:'#7CB342', founded:1995, faculty:14, description:'Pure and applied mathematics, statistics, numerical analysis.' },
  { code:'PHYS', name:'Physics',              head:'Prof. M. Chafiq',  students:112, groups:5, color:'#7C3AED', founded:1995, faculty:18, description:'Classical mechanics, quantum physics, optics, condensed matter and lab work.' },
  { code:'BUS',  name:'Business & Management',head:'Dr. F. Hakkaoui',  students:203, groups:8, color:'#F59E0B', founded:2002, faculty:22, description:'Management, finance, marketing, entrepreneurship and operations.' },
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
  { id:'INV-24001', student:'Yassine Idrissi',  group:'L3-INFO-A', type:'Tuition Q2', amount:12500, status:'paid',    date:'Oct 08, 2024', method:'Bank transfer' },
  { id:'INV-24002', student:'Soukaina Bennis',  group:'L3-INFO-A', type:'Tuition Q2', amount:12500, status:'paid',    date:'Oct 12, 2024', method:'Card' },
  { id:'INV-24003', student:'Omar Cherkaoui',   group:'L3-INFO-A', type:'Tuition Q2', amount:12500, status:'overdue', date:'Oct 15, 2024', method:'—' },
  { id:'INV-24004', student:'Nadia El Ouali',   group:'L3-INFO-B', type:'Tuition Q2', amount:12500, status:'partial', date:'Oct 20, 2024', method:'Bank transfer' },
  { id:'INV-24005', student:'Mehdi Alami',      group:'L3-INFO-B', type:'Tuition Q2', amount:12500, status:'overdue', date:'Oct 15, 2024', method:'—' },
  { id:'INV-24006', student:'Fatima Zahra',     group:'M1-IA',     type:'Tuition Q2', amount:14000, status:'paid',    date:'Oct 05, 2024', method:'Card' },
  { id:'INV-24007', student:'Hamza Tazi',       group:'M1-IA',     type:'Tuition Q2', amount:14000, status:'pending', date:'Oct 22, 2024', method:'—' },
  { id:'INV-24008', student:'Imane Boukili',    group:'L2-MATH',   type:'Lab fees',   amount:800,   status:'paid',    date:'Sep 30, 2024', method:'Cash' },
  { id:'INV-24009', student:'Zakaria Hmidi',    group:'L2-MATH',   type:'Tuition Q2', amount:11000, status:'overdue', date:'Oct 15, 2024', method:'—' },
  { id:'INV-24010', student:'Salma Rachidi',    group:'L1-PHYS',   type:'Tuition Q2', amount:11000, status:'paid',    date:'Oct 11, 2024', method:'Bank transfer' },
];

const SESSIONS = [
  { day:0, start:8,  dur:2,   mod:'CS301', grp:'L3-INFO-A', room:'B-204',     teacher:'Prof. L. Bennani' },
  { day:0, start:10, dur:1.5, mod:'MA205', grp:'L2-MATH',   room:'A-110',     teacher:'Prof. R. Taibi' },
  { day:0, start:14, dur:2,   mod:'DB310', grp:'L3-INFO-B', room:'B-207',     teacher:'Prof. S. Laghmari' },
  { day:1, start:9,  dur:2,   mod:'PH210', grp:'L1-PHYS',   room:'C-12 (Lab)',teacher:'Prof. M. Chafiq' },
  { day:1, start:13, dur:1.5, mod:'EN150', grp:'L3-INFO-A', room:'A-305',     teacher:'Ms. J. Alaoui' },
  { day:1, start:15, dur:2,   mod:'CS420', grp:'M1-IA',     room:'B-301',     teacher:'Prof. O. Mansouri' },
  { day:2, start:8,  dur:1.5, mod:'MA205', grp:'L2-MATH',   room:'A-110',     teacher:'Prof. R. Taibi' },
  { day:2, start:10, dur:2,   mod:'CS301', grp:'L3-INFO-B', room:'B-204',     teacher:'Prof. L. Bennani' },
  { day:2, start:14, dur:2,   mod:'DB310', grp:'M1-IA',     room:'B-207',     teacher:'Prof. S. Laghmari' },
  { day:3, start:9,  dur:2,   mod:'CS420', grp:'M1-IA',     room:'B-301',     teacher:'Prof. O. Mansouri' },
  { day:3, start:11, dur:1.5, mod:'EN150', grp:'L3-INFO-B', room:'A-305',     teacher:'Ms. J. Alaoui' },
  { day:3, start:14, dur:2,   mod:'PH210', grp:'L1-PHYS',   room:'C-12 (Lab)',teacher:'Prof. M. Chafiq' },
  { day:4, start:8,  dur:2,   mod:'CS301', grp:'L3-INFO-A', room:'B-204',     teacher:'Prof. L. Bennani' },
  { day:4, start:10, dur:2,   mod:'MA205', grp:'L2-MATH',   room:'A-110',     teacher:'Prof. R. Taibi' },
  { day:4, start:14, dur:1.5, mod:'EN150', grp:'M1-IA',     room:'A-305',     teacher:'Ms. J. Alaoui' },
  { day:5, start:9,  dur:2,   mod:'DB310', grp:'L3-INFO-A', room:'B-207',     teacher:'Prof. S. Laghmari' },
];

const NOTIFICATIONS = [
  { id:1, type:'alert',    title:'Absence threshold exceeded', desc:'Mehdi Alami has missed 6 sessions this month (L3-INFO-B).', time:'12 min ago', read:false, actions:['View student','Contact'] },
  { id:2, type:'success',  title:'Payment received',           desc:'Invoice INV-24010 — Salma Rachidi — 11,000 MAD confirmed.', time:'1h ago',     read:false, actions:['View invoice'] },
  { id:3, type:'reminder', title:'Grade submission deadline',  desc:'Submit CS301 midterm grades by Friday Oct 25, 23:59.',      time:'3h ago',     read:false, actions:['Open grades'] },
  { id:4, type:'info',     title:'Schedule update',            desc:'PH210 Tuesday session moved to Lab C-12 (from A-118).',    time:'Yesterday',  read:true },
  { id:5, type:'alert',    title:'4 overdue invoices',         desc:'Group L3-INFO-A has 4 overdue invoices totaling 48,500 MAD.',time:'Yesterday', read:true,  actions:['Review payments'] },
  { id:6, type:'success',  title:'New group created',          desc:'L3-INFO-A has been successfully created for 2024-25.',     time:'2d ago',     read:true },
  { id:7, type:'reminder', title:'Faculty meeting',            desc:'Computer Science department meeting — Mon Oct 28, 14:00.', time:'3d ago',     read:true },
];

const USERS_LIST = [
  { id:'U-001', name:'Dr. Amira Saadi',     role:'admin',      email:'a.saadi@campus.edu',    branch:'—',                status:'active',   init:'AS', color:'#5FA83C' },
  { id:'U-002', name:'Khalid El Amrani',    role:'scolarite',  email:'k.elamrani@campus.edu', branch:'—',                status:'active',   init:'KE', color:'#7C3AED' },
  { id:'U-003', name:'Prof. Leïla Bennani', role:'enseignant', email:'l.bennani@campus.edu',  branch:'Computer Science', status:'active',   init:'LB', color:'#7CB342' },
  { id:'U-004', name:'Prof. Rachid Taibi',  role:'enseignant', email:'r.taibi@campus.edu',    branch:'Mathematics',      status:'active',   init:'RT', color:'#F59E0B' },
  { id:'U-005', name:'Prof. Mehdi Chafiq',  role:'enseignant', email:'m.chafiq@campus.edu',   branch:'Physics',          status:'active',   init:'MC', color:'#DC2626' },
  { id:'U-006', name:'Prof. Omar Mansouri', role:'enseignant', email:'o.mansouri@campus.edu', branch:'Computer Science', status:'inactive', init:'OM', color:'#0891B2' },
  { id:'U-007', name:'Ms. Jamila Alaoui',   role:'enseignant', email:'j.alaoui@campus.edu',   branch:'Languages',        status:'active',   init:'JA', color:'#DB2777' },
];

// Realistic scolarité dashboard stats (toned down from inflated numbers)
const SCOLARITE_STATS = {
  totalStudents:    577,
  totalGroups:      24,
  attendanceRate:   89.4,
  collectionRate:   76.2,
  pendingPayments:  18,
  activeRequests:   7,
};

// Sample student grades (realistic French scale 0-20)
const STUDENT_GRADES = [
  { module:'CS301', name:'Algorithms & Data Structures', exam:14.5, hw:16, participation:15, average:15.1 },
  { module:'MA205', name:'Linear Algebra',               exam:13,   hw:14.5, participation:13, average:13.6 },
  { module:'PH210', name:'Quantum Physics',              exam:11.5, hw:13, participation:12, average:12.2 },
  { module:'EN150', name:'Business English',             exam:17,   hw:16, participation:18, average:16.9 },
  { module:'CS420', name:'Distributed Systems',          exam:15.5, hw:14, participation:15, average:14.9 },
  { module:'DB310', name:'Database Systems',             exam:16,   hw:17, participation:16, average:16.4 },
];

// Per-period averages for student dashboard chart
const STUDENT_GRADE_HISTORY = {
  labels:['Sep','Oct','Nov','Dec','Jan','Feb','Mar','Apr'],
  series:[
    { module:'CS301', color:'#5FA83C', values:[14.0, 14.4, 15.1, 15.0, 15.3, 15.5, 15.1, 15.4] },
    { module:'MA205', color:'#7C3AED', values:[12.5, 13.0, 13.2, 13.6, 13.4, 13.7, 13.6, 13.9] },
    { module:'EN150', color:'#F59E0B', values:[16.0, 16.5, 16.8, 16.7, 16.9, 17.0, 16.9, 17.1] },
    { module:'DB310', color:'#0891B2', values:[15.5, 15.8, 16.1, 16.3, 16.4, 16.5, 16.4, 16.6] },
  ],
};

// i18n strings
const I18N = {
  en: {
    'app.brand':'CampusOps','app.tagline':'University OS',
    'nav.Dashboard':'Dashboard','nav.Planning':'Planning','nav.Attendance':'Attendance','nav.Modules':'Modules',
    'nav.Grades':'Grades','nav.Progress':'Progress','nav.Payments':'Payments','nav.Users':'Users','nav.Groups':'Groups',
    'nav.Branches':'Branches','nav.Notifications':'Notifications','nav.Settings':'Settings','nav.Academic':'Academic','nav.Personal':'Personal','nav.Administration':'Administration',
    'tb.search':'Search students, groups, modules…','tb.profile':'Profile','tb.settings':'Settings','tb.logout':'Sign out','tb.notifications':'Notifications',
    'btn.viewAll':'View all','btn.markAllRead':'Mark all read','btn.viewDetails':'View details','btn.edit':'Edit','btn.save':'Save changes','btn.cancel':'Cancel','btn.close':'Close','btn.create':'Create','btn.delete':'Delete','btn.export':'Export','btn.filter':'Filter','btn.today':'Today',
    'view.day':'Day','view.week':'Week','view.month':'Month',
    'att.present':'Present','att.late':'Late','att.absent':'Absent','att.excused':'Excused',
    'pay.paid':'Paid','pay.pending':'Pending','pay.overdue':'Overdue','pay.partial':'Partial',
    'set.account':'Account','set.security':'Security','set.appearance':'Appearance','set.notifications':'Notifications','set.sessions':'Sessions','set.language':'Language',
    'set.lightMode':'Light','set.darkMode':'Dark','set.system':'System',
    'set.changePassword':'Change password','set.2fa':'Two-factor authentication','set.activeSessions':'Active sessions','set.signOutAll':'Sign out everywhere',
    'grade.viewOnly':'You have view-only access. Grades are managed by teachers.',
    'grade.exam':'Exam','grade.homework':'Homework','grade.participation':'Participation','grade.average':'Average','grade.overall':'Overall average','grade.module':'Module',
    'login.signIn':'Sign in','login.email':'Email','login.password':'Password','login.role':'Role','login.welcome':'Welcome back',
  },
  fr: {
    'app.brand':'CampusOps','app.tagline':'OS Universitaire',
    'nav.Dashboard':'Tableau de bord','nav.Planning':'Planning','nav.Attendance':'Présences','nav.Modules':'Modules',
    'nav.Grades':'Notes','nav.Progress':'Progression','nav.Payments':'Paiements','nav.Users':'Utilisateurs','nav.Groups':'Groupes',
    'nav.Branches':'Filières','nav.Notifications':'Notifications','nav.Settings':'Paramètres','nav.Academic':'Académique','nav.Personal':'Personnel','nav.Administration':'Administration',
    'tb.search':'Rechercher étudiants, groupes, modules…','tb.profile':'Profil','tb.settings':'Paramètres','tb.logout':'Déconnexion','tb.notifications':'Notifications',
    'btn.viewAll':'Tout voir','btn.markAllRead':'Tout marquer lu','btn.viewDetails':'Voir détails','btn.edit':'Modifier','btn.save':'Enregistrer','btn.cancel':'Annuler','btn.close':'Fermer','btn.create':'Créer','btn.delete':'Supprimer','btn.export':'Exporter','btn.filter':'Filtrer','btn.today':'Aujourd\'hui',
    'view.day':'Jour','view.week':'Semaine','view.month':'Mois',
    'att.present':'Présent','att.late':'Retard','att.absent':'Absent','att.excused':'Excusé',
    'pay.paid':'Payé','pay.pending':'En attente','pay.overdue':'En retard','pay.partial':'Partiel',
    'set.account':'Compte','set.security':'Sécurité','set.appearance':'Apparence','set.notifications':'Notifications','set.sessions':'Sessions','set.language':'Langue',
    'set.lightMode':'Clair','set.darkMode':'Sombre','set.system':'Système',
    'set.changePassword':'Changer le mot de passe','set.2fa':'Authentification à deux facteurs','set.activeSessions':'Sessions actives','set.signOutAll':'Déconnecter partout',
    'grade.viewOnly':'Accès en lecture seule. Les notes sont gérées par les enseignants.',
    'grade.exam':'Examen','grade.homework':'Devoirs','grade.participation':'Participation','grade.average':'Moyenne','grade.overall':'Moyenne générale','grade.module':'Module',
    'login.signIn':'Se connecter','login.email':'Email','login.password':'Mot de passe','login.role':'Rôle','login.welcome':'Bon retour',
  }
};

// i18n hook + helpers
function useI18n(){
  const [lang, setLangState] = React.useState(()=> localStorage.getItem('co2_lang') || 'en');
  React.useEffect(()=>{
    const onChange = ()=> setLangState(localStorage.getItem('co2_lang') || 'en');
    window.addEventListener('co2_lang_change', onChange);
    return ()=> window.removeEventListener('co2_lang_change', onChange);
  },[]);
  const setLang = (l)=> { localStorage.setItem('co2_lang', l); window.dispatchEvent(new Event('co2_lang_change')); };
  const t = (key, fallback)=> (I18N[lang] && I18N[lang][key]) || fallback || key;
  return { lang, setLang, t };
}

function Icon({ name, size }){
  const path = ICONS[name];
  if(!path) return null;
  return <svg width={size||18} height={size||18} viewBox="0 0 24 24" dangerouslySetInnerHTML={{__html:path}} />;
}

Object.assign(window, { ROLES, ICONS, NAV_GROUPS, MODULES, GROUPS_LIST, BRANCHES, STUDENTS, PAYMENTS, SESSIONS, NOTIFICATIONS, USERS_LIST, SCOLARITE_STATS, STUDENT_GRADES, STUDENT_GRADE_HISTORY, I18N, useI18n, Icon });
