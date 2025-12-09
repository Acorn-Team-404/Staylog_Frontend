// src/global/store/types.ts
import type { CommonCodeGroupResponse } from '../../domain/common/types';
import type { responseNotificationsType } from '../../domain/notification/types/NotificationCardType';

// 로그인한 유저의 정보 설계도
export interface UserInfo {
   userId: number;
   loginId: string;
   nickname: string;
   profileImage: string | null | undefined
   role:string;
}

// 닉네임 업데이트 액션 
// 마이페이지의 닉네임 수정 시, 네비바에서 보여지는 닉네임도 바로 업데이트가 되도록 한다.
export interface UpdateNicknameAction {
   type: 'UPDATE_NICKNAME';
   payload: string; // 변경된 닉네임
}

// 프로필 이미지 업데이트 액션
export interface UpdateProfileImageAction {
   type: 'UPDATE_PROFILE_IMAGE';
   payload: string | null | undefined ; // 새로운 프로필 이미지 URL
}   

// Redux store에 저장되는 모든 데이터를 정의하는 마스터 설계도
// Redux는 모든 전역 상태를 단 하나의 큰 객체인 RootState 안에 저장한다.
export interface RootState {
   userInfo: UserInfo | null;
   logoutTimer: NodeJS.Timeout | null; // 자동 로그아웃 타이머의 ID를 저장
   token: string | null;
   commonCodes: CommonCodeGroupResponse | null; // 공통코드 전역 상태
   notiList: responseNotificationsType[]; // 알림 목록
   notiUnreadCount: number; // 안읽은 알림 수
   getNotiData: boolean; // 알림 데이터를 요청했는지 유무
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

export interface SetLogoutTimerAction {
   type: 'SET_LOGOUT_TIMER';
   payload: NodeJS.Timeout | null;
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

// ==================================
// 알림 액션

// 안 읽은 알림 수 초기 설정 (로그인/새로고침 시)
export interface SetUnreadCountAction {
   type: 'SET_UNREAD_COUNT';
   payload: number;
}

// 안 읽은 수 1 증가 (새 알림 도착 시)
export interface IncrementUnreadCountAction {
   type: 'INCREMENT_UNREAD_COUNT';
}

// 안 읽은 수 1 감소 (읽음 처리/삭제 시)
export interface DecreaseUnreadCountAction {
   type: 'DECREASE_UNREAD_COUNT';
}

// 안 읽은 수 0으로 초기화 (전체 읽음/전체 삭제 시)
export interface ResetUnreadCountAction {
   type: 'RESET_UNREAD_COUNT';
}



export type AppAction =
   SetUserInfoAction
   | LogoutAction
   | SetLogoutTimerAction
   | SetTokenAction
   | SetCommonCodesAction
   | SetUnreadCountAction
   | IncrementUnreadCountAction
   | DecreaseUnreadCountAction
   | ResetUnreadCountAction
   | UpdateNicknameAction //사람아이콘 왼쪽의 닉네임 업데이트 추가
   | UpdateProfileImageAction; // 프로필 이미지 업데이트 액션 추가