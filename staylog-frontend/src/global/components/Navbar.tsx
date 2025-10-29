import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import Modal from "./Modal";
import type { ModalMode } from "../types/ModalMode";
import NotiCanvas from "../../domain/notification/pages/NotiCanvas";
import { useSelector } from "react-redux";
import type { RootState } from "../store/types";


function Navbar() {

   const nickname = useSelector((state: RootState) => {
	return state.userInfo?.nickname // 없을 수도 있으니 -> ?.
})

   // 모달 활성화 관리 상태값
   const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

   // 모달 모드 상태값
   const [modalMode, setModalMode] = useState<ModalMode>('login');

   // 모드값을 인자로 받고 모달창을 여는 함수
   function openModal(mode: ModalMode) {
      setModalMode(mode);
      setIsModalOpen(true);
   }

   // 모달창을 닫는 함수 (Modal 컴포넌트로 전달됨)
   function closeModal() {
      setIsModalOpen(false);
   }


   // 알림창 활성화 관리 상태값
   const [isNotiOpen, setIsNotiOpen] = useState<boolean>(false);

   // 알림창을 여는 함수
   function openNoti() {
      setIsNotiOpen(true);
   }

   // 모달창을 닫는 함수 (NotiCanvas 컴포넌트로 전달됨)
   function closeNoti() {
      setIsNotiOpen(false);
   }


   return (
      <>
         <nav className="navbar fixed-top navbar-expand-lg border-bottom border-1 border-secondary shadow-sm" style={{ backgroundColor: '#ebebebff' }}>
            <div className="container-fluid w-75">

               <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                  <span className="navbar-toggler-icon"></span>
               </button>

               <div className="collapse navbar-collapse" id="navbarSupportedContent">
                  <Link to="/" className="navbar-brand flex-fill fs-3 fw-normal">STAYLOG</Link>

                  <form className="d-flex flex-fill" role="search">
                     <input onClick={() => openModal("search")} className="form-control me-2 shadow-none" placeholder="Search" aria-label="Search" readOnly style={{ cursor: 'pointer' }} />
                  </form>

                  <ul className="navbar-nav flex-fill justify-content-center mb-2 mb-lg-0">
                     <li className="nav-item">
                        <NavLink to="/stay" className="nav-link" aria-current="page">STAY</NavLink>
                     </li>
                     <li className="nav-item">
                        <NavLink to="/community" className="nav-link">COMMUNITY</NavLink>
                     </li>
                     <li className="nav-item">
                        <NavLink to="/journal" className="nav-link">JOURNAL</NavLink>
                     </li>
                  </ul>

                  

                  <ul className="navbar-nav flex-fill justify-content-end mb-2 mb-lg-0 gap-4 align-items-center">
                     
                     {nickname && <span>{nickname}</span>}
                     <li onClick={() => openModal("login")} className="nav-item"><i className="bi bi-person-circle" style={{ fontSize: '32px', cursor: 'pointer' }}></i></li>
                     <li onClick={() => openNoti()} className="nav-item"><i className="bi bi-bell-fill" style={{ fontSize: '32px', cursor: 'pointer' }}></i></li>
                  </ul>
               </div>
            </div>
         </nav>

         {isModalOpen && <Modal
            isOpen={isModalOpen}
            onClose={closeModal}
            mode={modalMode} />}


         {isNotiOpen && <NotiCanvas
            isOpen={isNotiOpen}
            onClose={closeNoti} />}
      </>
   );
}

export default Navbar;