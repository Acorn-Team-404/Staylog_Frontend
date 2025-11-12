// 백엔드 API 요청/응답 타입 정의

/**
 * 로그인 요청 DTO
 * 백엔드: LoginRequest
 */
export interface LoginRequest {
  loginId: string;
  password: string;
}

/**
 * 로그인 응답 DTO
 * 백엔드: LoginResponse
 * RefreshToken은 HttpOnly 쿠키로 전달됨
 */
export interface LoginResponse {
  accessToken: string;
  tokenType: string; // "Bearer"
  expiresIn: number; // 토큰 만료 시간 
  user: UserInfo; // 사용자 정보
}

/**
 * 사용자 정보
 * 백엔드: LoginResponse.UserInfo
 */
export interface UserInfo {
  userId: number;
  loginId: string;
  nickname: string;
  profileImage?: string;
  role: string;
}

/**
 * 회원가입 요청 DTO
 * 백엔드: SignupRequest
 */
export interface SignupRequest {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

/**
 * 인증 상태
 */
export interface AuthState {
  isAuthenticated: boolean;
  user: UserInfo | null;
  accessToken: string | null;
  refreshToken: string | null;
}
