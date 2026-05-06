import type { Grade, GradePayload, GradeUpdatePayload } from '../types';
import { apiPost, apiRequest } from './apiClient';

export const getGrades = () => apiRequest<Grade[]>('/grades');

export const createGrade = (gradeData: GradePayload) => {
  return apiPost<Grade, GradePayload>('/grades', gradeData);
};

export const updateGrade = (gradeId: number, gradeData: GradeUpdatePayload) => {
  return apiRequest<Grade>(`/grades/${gradeId}`, {
    method: 'PUT',
    body: JSON.stringify(gradeData),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const deleteGrade = (gradeId: number) => {
  return apiRequest<{ ok: boolean }>(`/grades/${gradeId}`, {
    method: 'DELETE',
  });
};
