// src/global/router/index.tsx
import { createHashRouter, type RouteObject } from "react-router-dom";
import Home from "../pages/Home";
import LoginForm from "../../domain/auth/pages/LoginForm";
import App from "../../App";
import SignupForm from "../../domain/auth/pages/SignupForm";
import RoomDetail from "../../domain/accommodation/pages/RoomDetail";
import AdminLayout from "../../domain/admin/components/AdminLayout";
import AdminUserPage from "../../domain/admin/pages/AdminUserPage";
import AdminAccommodationPage from "../../domain/admin/pages/AdminAccommodationPage";
import AdminReservationPage from "../../domain/admin/pages/AdminReservationPage";
import AdminRoomPage from "../../domain/admin/pages/AdminRoomPage";
// import { ReservationProvider } from "../../domain/accommodation/hooks/useReservation"; // 사용되지 않아 주석 유지
import AccommodationDetail from "../../domain/accommodation/pages/AccommodationDetail";
// 게시판 관련 페이지
import BoardDetail from "../../domain/board/pages/BoardDetail";
import BoardForm from "../../domain/board/pages/BoardForm";
import BoardForm2 from "../../domain/board/pages/BoardForm2";
import Board from "../../domain/board/pages/Board";
import AccommodationListPage from "../../domain/accommodation/pages/AccommodationListPage";
import AdminAccommodationDetail from "../../domain/admin/pages/AdminAccommodationDetail";
import AdminRoomDetail from "../../domain/admin/pages/AdminRoomDetail";
import AdminAccommodationUpdate from "../../domain/admin/pages/AdminAccommodationUpdate";
import MyPage from "../../domain/mypage/pages/MyPageLayout";
import MemberInfoSection from "../../domain/mypage/pages/MemberInfoSection";
import ReservationSection from "../../domain/mypage/pages/ReservationSection";
import ReviewSection from "../../domain/mypage/pages/ReviewSection";
import TestForm from "../pages/TestForm"; // Import TestForm
import TestLoadImage from "../pages/TestLoadImage";
import CommentsPage from "../../domain/board/components/comment/CommentsPage";
import AdminBoardPage from "../../domain/admin/pages/AdminBoardPage";
import AdminBoardDetail from "../../domain/admin/pages/AdminBoardDetail";
import Boards from "../../domain/board/pages/Boards";
import CheckoutForm from "../../domain/payment/pages/CheckoutForm";
import PaymentCompletePage from "../../domain/payment/pages/PaymentCompletePage";
import AdminCouponPage from "../../domain/admin/pages/AdminCouponPage";
import AdminRoomUpdate from "../../domain/admin/pages/AdminRoomUpdate";
import TestEditorPage from "../pages/TestEditorPage";
import Home2 from "../pages/Home2";
import AccommodationReviewList from "../../domain/accommodation/pages/AccommodationReviewList";
import AdminAccommodationRegisterPage from "../../domain/admin/pages/AdminAccommodationRegisterPage";
import AdminRoomRegisterPage from "../../domain/admin/pages/AdminRoomRegisterPage";

import CarouselTestPage from "../pages/CarouselTestPage";
import AdminHomeManagement from "../../domain/admin/pages/AdminHomeManagement";



// routes 배열: 중첩되지 않는 최상위 경로만 포함 (Admin, Mypage 라우트 객체는 분리)
const routes: RouteObject[] = [
  { path: "/index.html", element: <Home /> }, // spring boot 최초 실행 정보 추가
  { path: "/", element: <Home /> },
  { path: "/login", element: <LoginForm /> },
  { path: "/:boardType", element: <Boards /> },
  { path: "/form/:boardType", element: <BoardForm /> },
  { path: "/form/:boardType/:boardId", element: <BoardForm /> },
  { path: "/board/:boardId", element: <BoardDetail /> },
  { path: "/signup", element: <SignupForm /> },
  { path: "/accommodations", element: <AccommodationListPage /> }, // 숙소 리스트 페이지
  { path: "/accommodations/:id", element: <AccommodationDetail />},
  { path: "/accommodations/:id/reviews", element: <AccommodationReviewList/> },
  { path: "/room/:roomId", element: <RoomDetail />},
  { path: "/test-form", element: <TestForm /> },
  { path: "/test-load", element: <TestLoadImage /> },
  { path: "/quill", element: <BoardForm2/>}, //에디터 테스트
  { path: "/bord", element: <Board/>},//에디터 테스트
  { path: "/checkout", element: <CheckoutForm/>}, // 결제 페이지
  { path: "/payment/complete", element: <PaymentCompletePage/>}, // 결제 완료 페이지
  { path: "/comments/:boardId", element: <CommentsPage /> },
  { path: "/testEditor", element: <TestEditorPage /> },
  { path: "/home", element: <Home2 />},
  { path: "/testCarousel", element: <CarouselTestPage />},
];

// Admin 중첩 라우트 객체를 별도로 정의
const adminRoute: RouteObject = {
    path: "admin", // 부모 경로는 상대 경로로 사용
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminUserPage /> },  // /admin 기본 페이지
      { path: "user", element: <AdminUserPage /> },  // /admin/user
      { path: "accommodations", element: <AdminAccommodationPage /> },  // /admin/accommodations
      { path: "accommodations/new", element: <AdminAccommodationRegisterPage /> }, // /admin/accommodations/new
      { path: "accommodations/:accommodationId", element: <AdminAccommodationDetail /> },  // /admin/accommodations/:accommodationId
      { path: "accommodations/:accommodationId/update", element: <AdminAccommodationUpdate /> },  // /admin/accommodations/:accommodationId/update
      { path: "accommodations/:accommodationId/rooms", element: <AdminRoomPage /> },  // /admin/accommodations/:accommodationId/rooms
      { path: "accommodations/:accommodationId/rooms/new", element: <AdminRoomRegisterPage /> },  // /admin/accommodations/:accommodationId/rooms/new
      { path: "accommodations/:accommodationId/rooms/:roomId", element: <AdminRoomDetail /> },  // /admin/accommodations/:accommodationId/rooms/:roomId
      { path: "accommodations/:accommodationId/rooms/:roomId/update", element: <AdminRoomUpdate /> },  // /admin/accommodations/:accommodationId/rooms/:roomId/update
      { path: "reservations", element: <AdminReservationPage /> },  // /admin/reservations
      { path: "boards", element: <AdminBoardPage /> },  // /admin/boards
      { path: "boards/:boardId", element: <AdminBoardDetail /> },  // /admin/boards/:boardId
      { path: "coupon", element: <AdminCouponPage /> },  // /admin/coupon
      { path: "home", element: <AdminHomeManagement /> }, // /admin/home
    ],
};

// 마이페이지 - 중첩 라우트 객체를 별도로 정의 (부모/자식 라우트 구조)
const mypageRoute: RouteObject = {  
    path: "mypage",
    element: <MyPage />,
    children: [
        { index: true, element: <MemberInfoSection /> }, 
        { path: "member", element: <MemberInfoSection /> },
        { path: "reservations", element: <ReservationSection /> },
        { path: "reviews", element: <ReviewSection /> },
    ],
};


// router 객체 생성 시, 모든 경로를 <App />의 children으로 통합하여 매핑
const router = createHashRouter([{
    path: "/",
    element: <App />, // <App />을 최상위 레이아웃으로 설정
    children: [
        // 일반 경로 매핑
        ...routes.map((route) => ({
            // path가 "/"인 경우 index: true로 처리하고, path는 제거합니다.
            index: route.path === "/",
            path: route.path === "/" ? undefined : route.path?.startsWith('/') ? route.path.substring(1) : route.path, // / 제거하고 상대 경로로 변환
            element: route.element,
        })),
        // 중첩 Admin 경로 추가
        adminRoute,
        mypageRoute

    ]
}]);

export default router;