import type { AttendanceRecord } from '../types';
import { apiPost, apiRequest } from './apiClient';

export type AttendancePayload = {
  studentId: string;
  date: string;
  status: AttendanceRecord['status'];
};

export const getAttendance = () => apiRequest<AttendanceRecord[]>('/attendance');

export const createAttendance = (attendanceData: AttendancePayload) => {
  return apiPost<AttendanceRecord, AttendancePayload>('/attendance', attendanceData);
};
