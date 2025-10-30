
import { Offcanvas } from 'react-bootstrap';
import React from 'react';
import NotificationCard from "../components/NotificationCard";

export interface NotiCanvasProps {
   isOpen: boolean;
   onClose: () => void;
}

function NotiCanvas({ isOpen, onClose }: NotiCanvasProps) {

   return (
      <Offcanvas show={isOpen} onHide={onClose} placement="end" scroll={true} style={{ "--bs-offcanvas-width": "450px" } as React.CSSProperties} id="offcanvasWithBothOptions" aria-labelledby="offcanvasWithBothOptionsLabel">
         <Offcanvas.Header closeButton>
            <Offcanvas.Title id="offcanvasWithBothOptionsLabel">
               알림
            </Offcanvas.Title>
         </Offcanvas.Header>

         <Offcanvas.Body>
            <NotificationCard />
         </Offcanvas.Body>
      </Offcanvas>
   );
}

export default NotiCanvas;