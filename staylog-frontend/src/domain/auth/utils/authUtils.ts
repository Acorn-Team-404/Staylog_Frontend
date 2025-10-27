import type { UserInfo } from '../types';

/**
 * 로컬스토리지에서 토큰 가져오기
 */
export const getAccessToken = (): string | null => {
  return localStorage.getItem('token');
};

/**
 * 토큰 저장
 * RefreshToken은 HttpOnly 쿠키로 관리됨
 */
export const setAccessToken = (tokenType: string, accessToken: string): void => {
  localStorage.setItem('token', `${tokenType} ${accessToken}`);
};

/**
 * 토큰 제거
 */
export const removeTokens = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('userInfo');
  // RefreshToken은 쿠키로 관리되므로 서버에서 제거 필요
};

/**
 * 사용자 정보 가져오기
 */
export const getUserInfo = (): UserInfo | null => {
  const userInfoStr = localStorage.getItem('userInfo');
  if (!userInfoStr) return null;

  try {
    return JSON.parse(userInfoStr);
  } catch (error) {
    console.error('사용자 정보 파싱 실패:', error);
    return null;
  }
};

/**
 * 로그인 상태 확인
 */
export const isAuthenticated = (): boolean => {
  const token = getAccessToken();
  const userInfo = getUserInfo();

  return !!(token && userInfo);
};
