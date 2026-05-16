import { useEffect, useState, type ReactNode } from 'react';
import { createGrade, getGrades, updateGrade } from '../services/gradeService';
import { getUsers, updateProfilePicture as updateProfilePictureService } from '../services/userService';
import { getSession, loginUser, logoutUser, registerUser, requestPasswordReset as requestPasswordResetService } from '../services/authService';
import { getTeacherAssignments } from '../services/adminService';
import type { AppUser, ClassAnalytics, Grade, GradePayload, GradeUpdatePayload, RegistrationPayload, TeacherAssignment, UserRole } from '../types';
import { AuthContext } from './authContext';
import { apiRequest } from '../services/apiClient';

type AuthProviderProps = {
  children: ReactNode;
};

const getErrorMessage = (error: unknown, fallback: string) => {
  return error instanceof Error && error.message ? error.message : fallback;
};

const isUnauthorizedSession = (error: unknown) => {
  return error instanceof Error && error.message === 'Unauthorized';
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [teacherAssignments, setTeacherAssignments] = useState<TeacherAssignment[]>([]);
  const [classAnalytics, setClassAnalytics] = useState<ClassAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAppData = async () => {
    try {
      setLoading(true);
      setError('');

      const sessionUser = await getSession();
      setUser(sessionUser);

      const analyticsRequest = sessionUser.role === 'student'
        ? Promise.resolve(null)
        : apiRequest<ClassAnalytics>('/analytics/class').catch(() => null);
      const [usersData, gradesData, assignmentData, analyticsData] = await Promise.all([
        getUsers(),
        getGrades(),
        getTeacherAssignments().catch(() => []),
        analyticsRequest,
      ]);

      setUsers(usersData);
      setGrades(gradesData);
      setTeacherAssignments(assignmentData);
      setClassAnalytics(analyticsData);
    } catch (err) {
      setError(isUnauthorizedSession(err) ? '' : getErrorMessage(err, 'Unable to connect to the server'));
      setUser(null);
      setUsers([]);
      setGrades([]);
      setTeacherAssignments([]);
      setClassAnalytics(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppData();
  }, []);

  const login = async (identifier: string, password: string, role: UserRole, rememberMe = false) => {
    try {
      const loggedInUser = await loginUser({ identifier, password, role, rememberMe });
      setUser(loggedInUser);
      await loadAppData();
      return true;
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to reach the server'));
      return false;
    }
  };

  const addGrade = async (gradeData: GradePayload) => {
    const savedGrade = await createGrade(gradeData);
    setGrades((currentGrades) => [savedGrade, ...currentGrades]);
    return savedGrade;
  };

  const editGrade = async (gradeId: number, gradeData: GradeUpdatePayload) => {
    const savedGrade = await updateGrade(gradeId, gradeData);
    setGrades((currentGrades) => currentGrades.map((grade) => (grade.id === savedGrade.id ? savedGrade : grade)));
    return savedGrade;
  };

  const register = async (registrationData: RegistrationPayload) => {
    const responseData = await registerUser(registrationData);
    setUsers((currentUsers) => [...currentUsers, responseData]);
    return responseData;
  };

  const requestPasswordReset = async (identifier: string, role: UserRole) => {
    return requestPasswordResetService({ identifier, role });
  };

  const updateProfilePicture = async (profilePicture: string) => {
    const updatedUser = await updateProfilePictureService(profilePicture);

    setUser(updatedUser);
    setUsers((currentUsers) => currentUsers.map((currentUser) => (currentUser.id === updatedUser.id ? updatedUser : currentUser)));

    return updatedUser;
  };

  const logout = () => {
    logoutUser().catch(() => undefined);

    setUser(null);
    setUsers([]);
    setGrades([]);
    setTeacherAssignments([]);
  };

  return (
    <AuthContext.Provider
      value={{ user, users, grades, teacherAssignments, classAnalytics, loading, error, login, logout, addGrade, editGrade, register, requestPasswordReset, updateProfilePicture, reloadData: loadAppData }}
    >
      {children}
    </AuthContext.Provider>
  );
};
