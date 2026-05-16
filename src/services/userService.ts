import type { AppUser } from '../types';
import { apiRequest } from './apiClient';

export const getUsers = () => apiRequest<AppUser[]>('/users');

export const updateProfilePicture = (profilePicture: string) => {
  return apiRequest<AppUser>('/profile-picture', {
    method: 'PUT',
    body: JSON.stringify({ profilePicture }),
  });
};
