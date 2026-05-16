export type UserRole = 'admin' | 'teacher' | 'student';

export type AppUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  course?: string;
  schoolYear?: string;
  semester?: string;
  profilePicture?: string;
};

export type Grade = {
  id: number;
  studentId: string;
  subject: string;
  score: number;
  feedback: string;
  teacherId?: string | null;
  schoolYear?: string;
  semester?: string;
  term?: string;
};

export type GradePayload = {
  studentId: string;
  subject: string;
  score: number;
  feedback?: string;
  schoolYear?: string;
  semester?: string;
  term?: string;
};

export type GradeUpdatePayload = {
  subject: string;
  score: number;
  feedback?: string;
  schoolYear?: string;
  semester?: string;
  term?: string;
};

export type LoginPayload = {
  identifier: string;
  password: string;
  role: UserRole;
  rememberMe?: boolean;
};

export type RegistrationPayload = {
  studentId: string;
  email: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  password: string;
  confirmPassword: string;
  role: Extract<UserRole, 'student' | 'teacher'>;
};

export type PasswordResetPayload = {
  identifier: string;
  role: UserRole;
};

export type MessageResponse = {
  message: string;
};

export type ClassAnalytics = {
  classAverage: number;
  distribution: Record<'A' | 'B' | 'C' | 'D' | 'F', number>;
  topPerformers: Array<{ studentId: string; average: number }>;
  bottomPerformers: Array<{ studentId: string; average: number }>;
};

export type TeacherAssignment = {
  id?: number;
  teacherId: string;
  studentId: string;
  subject: string;
  course?: string;
  section?: string;
  schoolYear?: string;
  semester?: string;
};

export type Course = {
  id?: number;
  code: string;
  name: string;
  description?: string;
  schedule?: string;
  schoolYear?: string;
  semester?: string;
  teacherId?: string | null;
};

export type Subject = {
  id?: number;
  name: string;
  teacherId: string;
};

export type GradeScale = {
  id?: number;
  label: string;
  minScore: number;
  maxScore: number;
  description?: string;
};

export type AuditLog = {
  id: number;
  adminId?: string | null;
  action: string;
  tableName: string;
  recordId: string;
  oldValue?: string | null;
  newValue?: string | null;
  changedAt: string;
};
