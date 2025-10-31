
import { Offcanvas } from 'react-bootstrap';
import React, { useState } from 'react';
import NotificationCard from "../components/NotificationCard";
import type { NotificationCardType } from '../types/NotificationCardType';
import useGetLoginIdFromToken from '../../auth/hooks/useGetLoginIdFromToken';

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

   // 알림 카드 상태값
   const [cardState, setCardState] = useState<NotificationCardType>({
      imageUrl: "",
      date: "",
      title: "",
      typeName: "",
      message: "",
      timeAgo: ""
   })

   const loginId = useGetLoginIdFromToken();

   return (
      <Offcanvas show={isOpen} onHide={onClose} placement="end" scroll={true} style={{ "--bs-offcanvas-width": "450px" } as React.CSSProperties} id="offcanvasWithBothOptions" aria-labelledby="offcanvasWithBothOptionsLabel">
         <Offcanvas.Header closeButton>
            <Offcanvas.Title id="offcanvasWithBothOptionsLabel">{loginId}</Offcanvas.Title>
         </Offcanvas.Header>

         <Offcanvas.Body>
            <NotificationCard imageUrl={cardState.imageUrl} date={cardState.date} title={cardState.title} typeName={cardState.typeName} message={cardState.message} timeAgo={cardState.timeAgo} />
         </Offcanvas.Body>
      </Offcanvas>
   );
}

export default NotiCanvas;