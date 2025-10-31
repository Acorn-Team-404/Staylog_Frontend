
import { Offcanvas } from 'react-bootstrap';
import React, { useEffect, useState } from 'react';
import NotificationCard from "../components/NotificationCard";
import type { NotificationCardState, responseNotification } from '../types/NotificationCardType';
import useGetLoginIdFromToken from '../../auth/hooks/useGetLoginIdFromToken';
import api from '../../../global/api';
import useGetUserIdFromToken from '../../auth/hooks/useGetUserIdFromToken';
import notificationFormatter from '../utils/NotificationFormatter';

export interface NotiCanvasProps {
   isOpen: boolean;
   onClose: () => void;
}

/**
 * 알림 모달
 * @author 이준혁
 * @param isOpen 알림 모달 활성화 여부
 * @param onClose 알림 모달을 닫기 위한 함수
 */
function NotiCanvas({ isOpen, onClose }: NotiCanvasProps) {


   // 알림 카드 리스트
   const [notiList, setNotiList] = useState<NotificationCardState[]>([])

   const userId: number | undefined = useGetUserIdFromToken();
   const loginId = useGetLoginIdFromToken();




   useEffect(() => {
      (async () => {
         if (!userId) {
            return
         }
         try {
            const response = await api.get(`/v1/notification/${userId}`)

            const rawDataList: responseNotification[] = response

            const processedList: NotificationCardState[] = rawDataList.map((rawItem) => {

               let details: any = {};
               try {
                  details = JSON.parse(rawItem.details)
               } catch (err) {
                  console.error("JSON parse error:", rawItem.details, err);
               }
               return notificationFormatter({ rawItem, details });
            })

            setNotiList(processedList)


         } catch (err) {
            console.log(err);
         }
      })()
   }, [userId])


   // 알림 삭제
   async function handleDelete(notiId: number) {
      if (confirm("알림을 삭제하시겠습니까?")) {
         try {
            // TODO: 삭제 로직 구현
         } catch (err) {
            console.log(err);
         }
      } else {
         return
      }


   }

   return (
      <Offcanvas show={isOpen} onHide={onClose} placement="end" scroll={true} style={{ "--bs-offcanvas-width": "450px" } as React.CSSProperties} id="offcanvasWithBothOptions" aria-labelledby="offcanvasWithBothOptionsLabel">
         <Offcanvas.Header closeButton>
            <Offcanvas.Title id="offcanvasWithBothOptionsLabel">{loginId}</Offcanvas.Title>
         </Offcanvas.Header>

         <Offcanvas.Body>
            {
               notiList.length > 0
                  ? (
                     notiList.map((noti) => (
                        <NotificationCard key={noti.notiId} {...noti} handleDelete={() => handleDelete(noti.notiId)} />
                     ))
                  )
                  : ("")
            }
         </Offcanvas.Body>
      </Offcanvas>
   );
}


export default NotiCanvas;