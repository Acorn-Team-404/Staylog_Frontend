import LoginForm from "../../domain/auth/pages/LoginForm";
import type { ModalProps } from "../types/ModalMode";


function Modal({ isOpen, onClose, mode }: ModalProps) {

   // 배경 클릭시 모달창 비활성화
   function handleBackgroundClick(e: React.MouseEvent<HTMLDivElement>) {
      if (e.target === e.currentTarget) {
         onClose();
      }
   }

   // 모달 활성화 상태값이 false라면 비활성화
   if (!isOpen) {
      return null;
   }
   // 모달 활성화 상태값이 true라면 활성화
   return (
      <div
         onClick={handleBackgroundClick} className='modal fade show d-block' tabIndex={-1}
         style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}>
         <div className='modal-dialog modal-dialog-centered modal-md'>
            <div className='modal-content rounded-lg shadow-lg'>
               <div className="modal-header border-0 pb-0">
                  <button onClick={onClose} type="button" className="btn-close" aria-label="Close"
                  ></button>
               </div>
               <div className="modal-body p-4 pt-0">

                  {/* 타입이 추가될 때마다 항목 추가해서 사용하면 됩니다. */}
                  {mode == 'login' && <LoginForm onClose={onClose} />}

               </div>
            </div>
         </div>
      </div>
   );
}

export default Modal;