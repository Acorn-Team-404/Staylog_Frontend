import type { CommonCodeGroupResponse } from '../../domain/common/types';

// 로그인한 유저의 정보 설계도
export interface UserInfo {
   userId: number;
   loginId: string;
   nickname: string;
   // profileImageUrl: string | null
}

// Redux store에 저장되는 모든 데이터를 정의하는 마스터 설계도
// Redux는 모든 전역 상태를 단 하나의 큰 객체인 RootState 안에 저장한다.
export interface RootState {
   userInfo: UserInfo | null;
   logoutTimer: NodeJS.Timeout | null; // 자동 로그아웃 타이머의 ID를 저장
   token: string | null;
   commonCodes: CommonCodeGroupResponse | null; // 공통코드 전역 상태
}

// 로그인 시 유저 정보를 store에 저장하는 용도의 액션
export interface SetUserInfoAction {
   type: 'USER_INFO';
   payload: UserInfo | null;
}

// 로그아웃 액션
export interface LogoutAction {
   type: 'LOGOUT';
}

// 토큰 저장용 액션
export interface SetTokenAction {
   type: 'SET_TOKEN';
   payload: string | null;
}

// 공통코드 저장용 액션
export interface SetCommonCodesAction {
   type: 'SET_COMMON_CODES';
   payload: CommonCodeGroupResponse | null;
}

// 하나로 통합해서 export
export type AppAction = SetUserInfoAction | LogoutAction | SetTokenAction | SetCommonCodesAction;