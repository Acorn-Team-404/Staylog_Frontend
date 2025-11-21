import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "../../../global/store";
import type { RootState } from "../../../global/store/types";
import { useEffect } from "react";
import api from "../../../global/api";
import { EventSourcePolyfill } from "event-source-polyfill";


/**
 * 최상위 컴포넌트에서 사용할 SSE 연결 훅
 * @author 이준혁
 */
let eventSource: EventSourcePolyfill | null = null;
function useNotificationInitializer() {

   const dispatch = useDispatch<AppDispatch>();

   const token = useSelector((state: RootState) => state.token);
   const userId = useSelector((state: RootState) => state.userInfo?.userId);


   // SSE 연결
   useEffect(() => {
      if (!token || !userId) {
         return
      }

      (async () => {
         try {
            const response = await api.get(`v1/notification/${userId}/unread-count`)
            dispatch({
               type: "SET_UNREAD_COUNT",
               payload: response
            })
         } catch (err) {
            console.log(err);
         }
      })()
   }, [userId, token, dispatch])


   // 새 알림 추가
   useEffect(() => {
      // 토큰 없으면 연결 종료
      if (!token) {
         if (eventSource) {
            eventSource.close();
            eventSource = null;
            console.log('SSE Hook 연결 종료 (로그아웃)');
         }
         return;
      }

      // 토큰이 있는데 아직 연결이 안 됐다면
      if (token && !eventSource) {
         console.log('SSE Hook 연결 시도...');

         const es = new EventSourcePolyfill(`api/v1/notification/subscribe`, {
            headers: {
               'Authorization': token
            },
            heartbeatTimeout: 120000 // 2분마다 Heartbeat
         });
         eventSource = es; // 인스턴스 저장

         es.onopen = () => console.log('SSE Hook 연결 성공');

         // Polyfill은 error 객체에서 HTTP status를 확인할 수 있다.
         es.onerror = (error) => {
            // @ts-ignore 타입 예외 처리
            if (error.status === 401 || error.status === 403) {
               console.error('[SSE Hook] 인증 실패 (401/403). 재연결 중지.');
               es.close(); // 토큰이 만료됐을 때는 재시도를 막는다.
               eventSource = null;
            } else {
               console.error('SSE Hook 에러 발생, 자동 재연결 시도...', error);
            }
         };

         // 새로운 알림 추가 시 발생하는 이벤트
         es.addEventListener('new-notification', (event) => {
            try {
               const messageEvent = event as MessageEvent;
               const newNoti = JSON.parse(messageEvent.data);

               // 안읽은 알림 수 증가 액션
               dispatch({
                  type: 'INCREMENT_UNREAD_COUNT'
               });

               const customEvent = new CustomEvent('EVENT_NEW_NOTIFICATION', {
                  detail: newNoti
               });
               window.dispatchEvent(customEvent);

            } catch (e) {
               console.error('[SSE Hook] 새 알림 파싱 실패', e);
            }
         });
      }

      // React 컴포넌트가 언마운트될 때
      return () => {
         if (eventSource) {
            eventSource.close();
            eventSource = null;
            console.log('SSE Hook 종료로 연결 해제');
         }
      };

   }, [token, dispatch]);
}

export default useNotificationInitializer;