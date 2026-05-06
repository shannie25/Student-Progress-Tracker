import type { AppUser, LoginPayload, MessageResponse, PasswordResetPayload, RegistrationPayload } from '../types';
import { apiPost, apiRequest } from './apiClient';

type LogoutResponse = {
  ok: boolean;
};

export const getSession = () => apiRequest<AppUser>('/session');

export const loginUser = (loginData: LoginPayload) => {
  return apiPost<AppUser, LoginPayload>('/login', loginData);
};

export const registerUser = (registrationData: RegistrationPayload) => {
  return apiPost<AppUser, RegistrationPayload>('/register', registrationData);
};

export const requestPasswordReset = (resetData: PasswordResetPayload) => {
  return apiPost<MessageResponse, PasswordResetPayload>('/password-reset/request', resetData);
};

export const logoutUser = () => {
  return apiPost<LogoutResponse, Record<string, never>>('/logout', {});
};
