import { Button, Offcanvas } from 'react-bootstrap';
import React, { useEffect, useRef, useState } from 'react';
import NotificationCard from "../components/NotificationCard";
import type { responseNotificationsType } from '../types/NotificationCardType';
import useGetLoginIdFromToken from '../../auth/hooks/useGetLoginIdFromToken';
import api from '../../../global/api';
import useGetUserIdFromToken from '../../auth/hooks/useGetUserIdFromToken';
import { useDispatch } from 'react-redux';

export interface NotiCanvasProps {
   isOpen: boolean;
   onClose: () => void;
}

/**
 * 알림 모달
 * @author 이준혁
 */
function NotiCanvas({ isOpen, onClose }: NotiCanvasProps) {

   const NOTI_LOAD_COUNT = 10; // 가져올 알림 개수
   const dispatch = useDispatch();

   const userId = useGetUserIdFromToken();
   const loginId = useGetLoginIdFromToken();

   const [notiList, setNotiList] = useState<responseNotificationsType[]>([]);

   const [loading, setLoading] = useState(false); // 로딩 상태
   const [errorMsg, setErrorMsg] = useState<string | null>(null); // 에러 메시지
   const [hasMore, setHasMore] = useState(true); // 더 가져올 알림이 있는지 여부

   const scrollContainerRef = useRef<HTMLDivElement | null>(null); // 스크롤 객체


   // 초기화 및 첫 페이지 로드 (열릴 때마다 실행)
   useEffect(() => {
      if (isOpen && userId) {
         setLoading(true);
         setHasMore(true);
         setErrorMsg(null);
         setNotiList([]); // 기존 목록 초기화

         (async () => {
            try {
               // 최신 15개 요청
               const response: responseNotificationsType[] = await api.get(`/v1/notification/${userId}?limit=${NOTI_LOAD_COUNT}`);

               if (response) {
                  setNotiList(response);

                  if (response.length < NOTI_LOAD_COUNT) {
                     setHasMore(false); // NOTI_LOAD_COUNT보다 작다면 마지막 페이지
                  }
               }
            } catch (err) {
               console.error(err);
               setErrorMsg("알림 정보를 불러오지 못했습니다.");
            } finally {
               setLoading(false);
            }
         })();
      }
   }, [userId, isOpen]); // 열릴 때마다 실행


   // 추가 데이터 로드 (무한 스크롤)
   async function getNextNotiData() {
      // 로딩 중이거나, 유저 정보가 없거나, 더 가져올 알림이 없다면 return
      if (loading || !userId || !hasMore) {
         return;
      }

      // 알림 목록이 없다면 return
      if (notiList.length === 0) {
         return;
      }

      setLoading(true);

      try {
         // 마지막 알림을 기준으로 요청
         const lastNoti = notiList[notiList.length - 1];
         const lastCreatedAt = lastNoti.createdAt;
         const lastNotiId = lastNoti.notiId;

         const response: responseNotificationsType[] = await api.get(`/v1/notification/${userId}?lastCreatedAt=${lastCreatedAt}&lastNotiId=${lastNotiId}&limit=${NOTI_LOAD_COUNT}`);

         if (response && response.length > 0) {
            // 기존 알림 목록에 이어 붙이기
            setNotiList((prev) => [...prev, ...response]);

            if (response.length < NOTI_LOAD_COUNT) {
               setHasMore(false); // NOTI_LOAD_COUNT보다 작다면 마지막 페이지
            }
         } else {
            setHasMore(false);
         }
      } catch (err) {
         console.error(err);
         setErrorMsg("추가 알림을 불러오지 못했습니다.");
      } finally {
         setLoading(false);
      }
   }


   // 실시간 알림 이벤트 리스너 (SSE Hook에서 EVENT_NEW_NOTIFICATION으로 전달된다.)
   useEffect(() => {
      // 알림창이 닫혀있으면 return
      if (!isOpen) {
         return;
      }

      // 이벤트를 받아 상태값 변경
      const handleNewNotification = (event: Event) => {
         const customEvent = event as CustomEvent;
         const newNoti = customEvent.detail;

         console.log("실시간 알림 도착", newNoti);

         // 맨 앞에 새 알림 추가
         setNotiList((prev) => [newNoti, ...prev]);
      };

      // 이벤트 리스너 등록
      window.addEventListener('EVENT_NEW_NOTIFICATION', handleNewNotification);

      // 컴포넌트 언마운트 or 닫힐 때 리스너 해제
      return () => {
         window.removeEventListener('EVENT_NEW_NOTIFICATION', handleNewNotification);
      };
   }, [isOpen]); // isOpen이 true일 때만 작동




   // 스크롤 Y값 추적 함수
   function handleScroll() {
      const container = scrollContainerRef.current;
      if (container) {
         if (container.scrollTop + container.clientHeight >= container.scrollHeight - 5) {
            getNextNotiData();
         }
      }
   };



   // 알림 삭제
   async function handleDelete(notiId: number) {
      if (confirm("알림을 삭제하시겠습니까?")) {
         try {
            await api.delete(`/v1/notification/${notiId}/delete`);

            // 삭제하려는 알림이 '안 읽은' 상태였는지 확인
            const target = notiList.find(n => n.notiId === notiId);
            const isUnread = target && target.isRead === 'N';

            // 알림 목록에서 제거
            setNotiList((prev) => prev.filter((noti) => noti.notiId !== notiId));

            // 안 읽은 알림을 삭제했다면 전역 뱃지 카운트 감소
            if (isUnread) {
               dispatch({ type: "DECREASE_UNREAD_COUNT" });
            }

         } catch (err) {
            console.error(err);
         }
      }
   }

   
   // 전체 알림 삭제
   async function handelDeleteAll() {
      if (notiList.length === 0) return;
      if (confirm("모든 알림을 삭제하시겠습니까?")) {
         try {
            await api.delete(`/v1/notification/${userId}/delete-all`);

            // 알림 목록 초기화
            setNotiList([]);
            setHasMore(false);

            // 2. 전역 뱃지 카운트 0으로 초기화
            dispatch({ type: "RESET_UNREAD_COUNT" });

         } catch (err) {
            console.error(err);
         }
      }
   }


   // 단일 알림 읽음 처리
   async function handleReadOne(notiId: number) {
      try {
         // 이미 읽은 상태라면 API 호출 불필요
         const target = notiList.find(n => n.notiId === notiId);
         if (target && target.isRead === 'Y') {
            return;
         }

         await api.patch("/v1/notification/read-one", { "notiId": notiId });

         // 화면 반영
         setNotiList((prev) =>
            prev.map((noti) => noti.notiId === notiId ? { ...noti, isRead: 'Y' } : noti)
         );

         // 2. 전역 뱃지 카운트 감소
         dispatch({ type: "DECREASE_UNREAD_COUNT" });

      } catch (err) {
         console.error(err);
      }
   }

   // 모든 알림 읽음 처리
   async function handleReadAll(userId: number | undefined) {
      if (!userId || notiList.length === 0) return;
      try {
         await api.patch("/v1/notification/read-all", { "userId": userId });

         // 화면 반영:
         setNotiList((prev) => prev.map((noti) => ({ ...noti, isRead: 'Y' })));

         // 전역 뱃지 0으로 초기화
         dispatch({ type: "RESET_UNREAD_COUNT" });

      } catch (err) {
         console.error(err);
      }
   }


   return (
      <Offcanvas show={isOpen} onHide={onClose} placement="end" scroll={true} style={{ "--bs-offcanvas-width": "450px" } as React.CSSProperties}>
         <Offcanvas.Header className='ms-4' closeButton>
            <Offcanvas.Title className="fs-4 fw-medium text-dark">{loginId}</Offcanvas.Title>
            <Button size="sm" variant="secondary" className='ms-4' onClick={() => handleReadAll(userId)}>전체 확인</Button>
            <Button size="sm" variant="danger" className='ms-4' onClick={handelDeleteAll}>전체 삭제</Button>
         </Offcanvas.Header>

         <Offcanvas.Body ref={scrollContainerRef} onScroll={handleScroll}>
            {notiList.length > 0 ? (
               notiList.map((noti) => (
                  <NotificationCard
                     key={noti.notiId}
                     {...noti}
                     handleDelete={() => handleDelete(noti.notiId)}
                     handleReadOne={() => handleReadOne(noti.notiId)}
                     onClose={onClose}
                  />
               ))
            ) : (
               !loading && !errorMsg && (
                  <div className="text-center text-muted mt-3">알림이 없습니다.</div>
               )
            )}

            {loading && (
               <div className="d-flex align-items-center justify-content-center gap-2 text-muted py-3">
                  <div className="spinner-border spinner-border-sm" role="status" />
                  <span>불러오는 중…</span>
               </div>
            )}

            {errorMsg && (
               <div className="alert alert-danger mt-3" role="alert">{errorMsg}</div>
            )}
         </Offcanvas.Body>
      </Offcanvas>
   );
}

export default NotiCanvas;