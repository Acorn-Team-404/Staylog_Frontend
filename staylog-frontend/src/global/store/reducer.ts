// src/global/store/reducer.ts

import type { AppAction, RootState } from "./types";

const initState: RootState = {
   userInfo: null,
   token: null,
   logoutTimer: null,
   commonCodes: null,
   notiList: [],
   notiUnreadCount: 0,
   getNotiData: false
};


/**
 * 리듀서 함수
 * Dispacth 값 추가해서 스토어에 저장 가능
 * @author 이준혁
 * @param state 기본 null 값 state
 * @param action 받을 액션의 종류
 * @returns 
 */
function reducer(state: RootState = initState, action: AppAction): RootState {
   switch (action.type) {
      case 'USER_INFO':
         return { ...state, userInfo: action.payload };
      // 변경된 닉네임만 즉시 업데이트 (마이페이지 수정 시)
      case 'UPDATE_NICKNAME':
         if (!state.userInfo) return state; // userInfo가 null이면 아무 작업 안함
         return {
            ...state, userInfo: { ...state.userInfo, nickname: action.payload, }
         };
      // 프로필 이미지만 즉시 업데이트
      case 'UPDATE_PROFILE_IMAGE':
         if (!state.userInfo) return state;
         return {
            ...state, userInfo: { ...state.userInfo, profileImage: action.payload }
         };

      case 'SET_TOKEN':
         return { ...state, token: action.payload };
      case 'SET_COMMON_CODES':
         return { ...state, commonCodes: action.payload };
      case 'SET_LOGOUT_TIMER':
         return { ...state, logoutTimer: action.payload };
      case 'LOGOUT':
         if (state.logoutTimer) {
            clearTimeout(state.logoutTimer);
         }
         localStorage.removeItem("token");
         return { ...initState };



      // ==================================
      // 알림 로직

      // 안 읽은 알림 수 초기값 설정
      case 'SET_UNREAD_COUNT':
         return {
            ...state,
            notiUnreadCount: action.payload,
         };

      // 새로운 알림 푸시 시 안 읽은 알림 수 증가
      case 'INCREMENT_UNREAD_COUNT':
         return {
            ...state,
            notiUnreadCount: state.notiUnreadCount + 1,
         };

      // 읽음, 삭제 시 안 읽은 알림 수 감소
      case 'DECREASE_UNREAD_COUNT':
         return {
            ...state,
            notiUnreadCount: state.notiUnreadCount > 0 ? state.notiUnreadCount - 1 : 0,
         };

      // 초기화 (전체 읽음/삭제)
      case 'RESET_UNREAD_COUNT':
         return {
            ...state,
            notiUnreadCount: 0,
         };


      default:
         return state;
   }
}

export default reducer;