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
         return { ...state, userInfo: { ...state.userInfo, nickname: action.payload, }
         };
      // 프로필 이미지만 즉시 업데이트
      case 'UPDATE_PROFILE_IMAGE':
         if (!state.userInfo) return state;
         return { ...state, userInfo: { ...state.userInfo, profileImage: action.payload }
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
      
      // 알림 리스트 조회
      case 'SET_NOTIFICATION_LIST':
         return {
            ...state,
            notiList: action.payload,
            getNotiData: true // 조회 유무를 true로 변경하여 리소스 절약
         };

      // 새 알림 1개를 목록에 추가
      case 'PUSH_NOTIFICATION':
         // 맨 앞에 추가
         return {
            ...state,
            notiList: [action.payload, ...state.notiList],
         };

      // 안읽은 알림 개수 가져오기
      case 'SET_UNREAD_COUNT':
         return {
            ...state,
            notiUnreadCount: action.payload,
         };

      // 안 읽은 개수 1 증가
      case 'INCREMENT_UNREAD_COUNT':
         return {
            ...state,
            notiUnreadCount: state.notiUnreadCount + 1,
         };

      // 단일 알림 읽음 처리 및 안 읽은 개수 1 감소
      case 'READ_ONE': {
         const notiIdToMark = action.payload;

         // 읽음 처리하려는 알림이 안 읽은 상태였는지 확인
         const targetNoti = state.notiList.find(noti => noti.notiId === notiIdToMark);
         const wasUnread = targetNoti && targetNoti.isRead === 'N';

         return {
            ...state,
            // 안 읽은 알림을 읽음 처리한 거라면 카운트 1 감소
            notiUnreadCount: wasUnread ? state.notiUnreadCount - 1 : state.notiUnreadCount,

            // map을 돌려서 해당 notiId의 isRead만 Y로 변경
            notiList: state.notiList.map(noti =>
               noti.notiId === notiIdToMark ? { ...noti, isRead: 'Y' } : noti
            ),
         };
      }

      // 모두 읽음 처리
      case 'READ_ALL':
         return {
            ...state,
            notiUnreadCount: 0,
            notiList: state.notiList.map(noti => ({ ...noti, isRead: 'Y' })),
         };

      // 알림 삭제
      case 'DELETE_NOTIFICATION': { // 변수 스코프 분리
         const notiIdToDelete = action.payload;

         // 삭제하려는 알림이 안 읽은 상태였는지 확인
         const targetNoti = state.notiList.find(noti => noti.notiId === notiIdToDelete);
         const wasUnread = targetNoti && targetNoti.isRead === 'N';

         return {
            ...state,
            // 안 읽은 알림을 삭제했다면 카운트 1 감소
            notiUnreadCount: wasUnread ? state.notiUnreadCount - 1 : state.notiUnreadCount,

            // filter로 해당 notiId를 제외한 새 배열을 생성
            notiList: state.notiList.filter(noti => noti.notiId !== notiIdToDelete),
         };
      }

      case 'DELETE_NOTIFICATION_ALL' :
         return {
            ...state,
            notiList: initState.notiList,
            notiUnreadCount: 0
         };

      
      default:
         return state;
   }
}

export default reducer;