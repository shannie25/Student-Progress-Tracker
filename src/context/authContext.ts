import { createContext } from 'react';
import type { AppUser, AttendanceRecord, ClassAnalytics, Grade, GradePayload, GradeUpdatePayload, MessageResponse, RegistrationPayload, TeacherAssignment, UserRole } from '../types';

export type AuthContextValue = {
  user: AppUser | null;
  users: AppUser[];
  grades: Grade[];
  attendance: AttendanceRecord[];
  teacherAssignments: TeacherAssignment[];
  classAnalytics: ClassAnalytics | null;
  loading: boolean;
  error: string;
  login: (identifier: string, password: string, role: UserRole, rememberMe?: boolean) => Promise<boolean>;
  logout: () => void;
  addGrade: (gradeData: GradePayload) => Promise<Grade>;
  editGrade: (gradeId: number, gradeData: GradeUpdatePayload) => Promise<Grade>;
  register: (registrationData: RegistrationPayload) => Promise<AppUser>;
  requestPasswordReset: (identifier: string, role: UserRole) => Promise<MessageResponse>;
  reloadData: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
