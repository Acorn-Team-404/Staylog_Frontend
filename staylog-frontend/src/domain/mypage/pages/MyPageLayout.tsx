// src/domain/mypage/pages/MyPageLayout.tsx
import { useEffect, useState } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { fetchMemberInfo } from "../api/mypageApi";
import type { MemberInfo } from "../types/mypageTypes";
import type { RootState } from "../../../global/store/types";
import useGetUserIdFromToken from "../../auth/hooks/useGetUserIdFromToken";
import { useSelector } from "react-redux";
import { Outlet, useLocation, NavLink } from "react-router-dom";
import '../css/mypage.css';

function MyPageLayout() {
   // 모든 훅은 컴포넌트 최상단에서 선언
   // 토큰에서 userId 가져오기
   const userId = useGetUserIdFromToken();
   
   // Redux에서 로그인한 상태의 닉네임 가져오기 (isLoggedIn은 MyPage에서 직접 사용하지 않음)
   const reduxNickname = useSelector((state: RootState) => state.userInfo?.nickname);   
   
   // 회원정보 상태값
   const [member, setMember] = useState<MemberInfo | null>(null);
   
   // --- 반응형 UI를 위한 상태 및 훅 추가 ---
   const location = useLocation();
   const [isMenuOpen, setIsMenuOpen] = useState(false);

   // 회원정보 조회 (userId가 유효할 때만 재조회)
   useEffect(() => {
      if (!userId) {
         // userId가 없으면 회원 정보를 불러올 수 없으므로 member 상태를 초기화
         setMember(null);
         return;
      }
      // Access Token은 api.interceptors.request에서 자동 추가됨
      fetchMemberInfo(userId)
         .then((data) => setMember(data))
         .catch((err) => {
            console.error("회원정보 조회 실패:", err);
            // 이 alert는 전역 인증 처리 훅에서 담당하므로 여기서는 제거
            // alert("회원 정보를 불러올 수 없습니다. 다시 로그인해주세요.");
            setMember(null); // 에러 발생 시 member 상태 초기화
      });
   }, [userId]); // userId 변경 시에만 실행

   // --- 메뉴 아이템 정의 (AdminLayout.tsx 패턴 참고) ---
   const menuItems = [
      { path: "member", label: "회원 정보" },
      { path: "reservations", label: "예약 정보" },
      { path: "reviews", label: "리뷰 내역" },
   ];

   // NavLink의 active 스타일을 위한 함수
   const navLinkClass = ({ isActive }: { isActive: boolean }) =>
      `nav-link py-3 px-4 text-start rounded-0 border-bottom ${isActive ? 'fw-bold bg-dark text-white' : 'text-dark'}`;

   // 모바일 뷰에서 현재 메뉴 이름 표시를 위한 함수
   const getCurrentMenuLabel = () => {
      const currentPath = location.pathname.split('/mypage/')[1] || 'member';
      const currentItem = menuItems.find(item => currentPath.startsWith(item.path));
      return currentItem?.label || '회원 정보';
   };

   // userId가 없으면 (로그인되지 않은 상태), 아무것도 렌더링하지 않고 전역 인증 훅이 리디렉션하도록 맡김
   if (!userId) {
      return null;
   }

   // userId는 있지만 member 정보가 아직 로딩 중일 때
   if (!member) {
      return <p className="text-center mt-5">회원 정보를 불러오는 중...</p>;
   }

   return (
      <Container fluid className="pb-5 px-lg-0" style={{maxWidth: "1100px"}}>
         {/* 상단 인삿말 영역 */}
         <Card className="shadow-sm border-0 w-100 mb-4">
            <Card.Body className="p-4">
               <div className="text-center">
                  <h4 className="fw-bold"> {reduxNickname || member.nickname} 님 반가워요 👋 </h4>
                  <p className="text-muted mb-0">
                     {new Date(member.createdAt).getFullYear()}년부터 StayLog를 함께하고 있어요.
                  </p>
               </div>
            </Card.Body>
         </Card>

         {/* --- 반응형 레이아웃 시작 --- */}
         {/* 모바일용 상단 네비게이션 (lg 사이즈 미만에서 보임) */} 
         <div className="d-lg-none sticky-top w-100" style={{ top: "56px", zIndex: 1020 }}> 
            <div className="bg-white border rounded mb-3">
               <button 
                  className="btn btn-light w-100 text-start d-flex justify-content-between align-items-center p-3"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
               >
                  <span className="fw-bold fs-5">{getCurrentMenuLabel()}</span>
                  <i className={`bi bi-chevron-${isMenuOpen ? 'up' : 'down'}`}></i>
               </button>
               
               {isMenuOpen && (
                  <div className="border-top">
                     <ul className="nav flex-column">
                        {menuItems.map((item) => (
                           <li key={item.path} className="nav-item">
                              <NavLink 
                                    to={item.path} 
                                    className={navLinkClass}
                                    onClick={() => setIsMenuOpen(false)}
                              >
                                    {item.label}
                              </NavLink>
                           </li>
                        ))}
                     </ul>
                  </div>
               )}
            </div>
         </div>

         {/* PC 및 모바일 공통 레이아웃 */}
         <Row>
            {/* PC용 사이드바 (lg 사이즈 이상에서 보임) */}
            <Col lg={2} className="d-none d-lg-block px-0">
               <Card className="shadow-sm border-0">
                  <h5 className="fw-bold text-center py-3 border-bottom mb-0">마이페이지</h5>
                  <ul className="nav flex-column">
                     {menuItems.map((item) => (
                        <li key={item.path} className="nav-item">
                           <NavLink to={item.path} className={navLinkClass}>
                              {item.label}
                           </NavLink>
                        </li>
                     ))}
                  </ul>
               </Card>
            </Col>

            {/* 오른쪽 콘텐츠 영역 */}
            <Col lg={10} className="px-0">
               <Outlet />  
            </Col>
         </Row>
      </Container>
   );
}

export default MyPageLayout;