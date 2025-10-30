import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import Modal from "./Modal";
import type { ModalMode } from "../types/ModalMode";
import NotiCanvas from "../../domain/notification/pages/NotiCanvas";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../store/types";
import { logout } from "../../domain/auth/api";


function Navbar() {
   const dispatch = useDispatch();
   const navigate = useNavigate();

   const nickname = useSelector((state: RootState) => {
	return state.userInfo?.nickname // 없을 수도 있으니 -> ?.
})
   /** 로그아웃 api 호출 (refreshToken만 삭제됨, dispath LOGOUT (localstorage의 AccessToken삭제)로 프론트 상태 초기화 */
   const handleLogout = async () => {
    try {
      await logout(); //  백엔드에서는 refreshToken만 삭제됨

      dispatch({ type: 'LOGOUT' }); // 프론트 상태 초기화 

      navigate('/'); // 홈으로 리다이렉트
    } catch (err) {
      console.error('로그아웃 실패:', err);
    }
  };

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
                  {/* 로그인 상태 */}
                  {nickname ? (
                     <>
                        {/* 닉네임 표시 */}
                        <span className="fw-semibold">{nickname}</span>
                        {/* 항상 사람 아이콘은 항상 표시 */}
                        <li
                        className="nav-item"
                        onClick={() => openModal("login")}
                        style={{ cursor: 'pointer' }}
                        >
                        <i className="bi bi-person-circle" style={{ fontSize: '32px' }}></i>
                        </li>

                        {/* 알림 아이콘 (로그인 시만 표시하기) */}
                        <li onClick={openNoti} className="nav-item">
                        <i className="bi bi-bell-fill" style={{ fontSize: '32px', cursor: 'pointer' }}></i>
                        </li>

                        {/* 로그아웃 버튼 */}
                        <li className="nav-item">
                        <button
                           className="btn btn-outline-dark px-3 py-1"
                           onClick={handleLogout}
                         >
                           LOGOUT
                        </button>
                        </li>
                     </>
                  ) : (
                     // 로그인 안 했을 때는 사람 아이콘만 표시
                     <li
                        className="nav-item"
                        onClick={() => openModal("login")}
                        style={{ cursor: 'pointer' }}
                     >
                        <i className="bi bi-person-circle" style={{ fontSize: '32px' }}></i>
                     </li>
                     )}
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