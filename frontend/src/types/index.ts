export type Role = 'Admin' | 'Scolarite' | 'Enseignant' | 'Etudiant';

export interface User {
  id: string; name: string; email: string; role: Role;
  branchId: string; telegramChatId?: string; createdAt: string;
  branch?: { id: string; name: string; location: string };
}

export interface Branch {
  id: string; name: string; location: string; createdAt: string;
  _count?: { users: number; modules: number; groups: number };
}

export interface Module {
  id: string; branchId: string; name: string; description?: string;
  createdAt: string; branch?: { id: string; name: string };
  _count?: { plannings: number; progress: number };
}

export interface Group {
  id: string; branchId: string; name: string; academicYear: string;
  createdAt: string; branch?: { id: string; name: string };
  _count?: { students: number; plannings: number };
}

export interface Planning {
  id: string; moduleId: string; groupId: string; teacherId: string;
  room: string; startTime: string; endTime: string;
  module?: { id: string; name: string };
  group?: { id: string; name: string };
  teacher?: { id: string; name: string; email: string };
  _count?: { absences: number };
}

export interface Absence {
  id: string; sessionId: string; studentId: string;
  status: 'Present' | 'Absent' | 'Late';
  justificationDocUrl?: string; createdAt: string;
  session?: { id: string; startTime: string; endTime: string; room: string; module?: { name: string } };
  student?: { id: string; name: string; email: string };
}

export interface Payment {
  id: string; studentId: string; planType: 'Inscription' | 'Mensualite';
  amount: string; status: 'Paid' | 'Partial' | 'Unpaid';
  dueDate: string; createdAt: string;
  student?: { id: string; name: string; email: string };
}

export interface Notification {
  id: string; userId: string; title: string; content: string;
  isRead: boolean; createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean; data: T; message?: string;
  meta?: { total: number; page: number; limit: number; pages: number };
}

export interface AuthTokens { accessToken: string; refreshToken: string; user: User; }
