
import { useEffect, useRef } from "react";
import { Offcanvas } from 'bootstrap';

export interface NotiCanvasProps {
   isOpen: boolean;
   onClose: () => void;
}

function NotiCanvas({ isOpen, onClose }: NotiCanvasProps) {
   const offcanvasRef = useRef<HTMLDivElement>(null);

   useEffect(() => {
      if (!offcanvasRef.current || !Offcanvas) {
         return;
      }
      const bsOffcanvas = Offcanvas.getOrCreateInstance(offcanvasRef.current);
      if (isOpen) {
         bsOffcanvas.show();
      } else {
         bsOffcanvas.hide();
      }
      const handleClose = () => {
         onClose();
      };
      const currentRef = offcanvasRef.current;
      currentRef.addEventListener('hidden.bs.offcanvas', handleClose);
      return () => {
         currentRef.removeEventListener('hidden.bs.offcanvas', handleClose);
      };
   }, [isOpen, onClose]);



   return (
      <div
         ref={offcanvasRef} className="offcanvas offcanvas-end" data-bs-scroll="true" tabIndex={-1} id="offcanvasWithBothOptions" aria-labelledby="offcanvasWithBothOptionsLabel">
         <div className="offcanvas-header">
            <h5 className="offcanvas-title" id="offcanvasWithBothOptionsLabel">알림</h5>
            <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
         </div>
         <div className="offcanvas-body">
            <p>알림 내용이 여기에 표시됩니다.</p>
         </div>
      </div>
   );
}

export default NotiCanvas;