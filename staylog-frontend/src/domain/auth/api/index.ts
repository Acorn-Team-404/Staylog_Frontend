import api from '../../../global/api';
import type { LoginRequest, LoginResponse, SignupRequest, SignupResponse } from '../types';

/**
 * 로그인 API 호출
 * 백엔드 엔드포인트: POST /auth/login
 */
export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = api.post<LoginResponse>('/v1/auth/login', data);
  return response;
};

/**
 * 로그아웃 API 호출
 * 백엔드 엔드포인트: POST /auth/logout
 */
export const logout = async (): Promise<void> => {
  await api.post('/v1/auth/logout');
};

/**
 * 토큰 갱신 API 호출
 * 백엔드 엔드포인트: POST /auth/refresh
 */
export const refreshToken = async (refreshToken: string): Promise<LoginResponse> => {
  const response = api.post<LoginResponse>('/v1/auth/refresh', { refreshToken });
  return response;
};
