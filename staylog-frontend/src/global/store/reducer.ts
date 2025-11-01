// reducer.ts

import type { AppAction, RootState } from "./types";

const initState: RootState = {
   userInfo: null,
   token: null,
   logoutTimer: null
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
      case 'SET_TOKEN':
         return { ...state, token: action.payload };
      case 'LOGOUT':
         if (state.logoutTimer) {
            clearTimeout(state.logoutTimer);
         }
         localStorage.removeItem("token");
         return { ...initState };
      default:
         return state;
   }
}

export default reducer;