export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const USER_ROLES = {
  admin: 'admin',
  teacher: 'teacher',
  student: 'student',
} as const;

export const ROUTES = {
  dashboard: '/dashboard',
  studentLogin: '/student',
  teacherLogin: '/teacher',
  adminLogin: '/admin',
  register: '/register',
  addGrades: '/add-grades',
  gradesManagement: '/grades-management',
  students: '/students',
  attendance: '/attendance',
  reports: '/generate-report',
  manageUsers: '/manage-users',
} as const;

export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  pattern: '(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}',
  title: 'Use at least 8 characters with one uppercase letter, one number, and one special character.',
} as const;
