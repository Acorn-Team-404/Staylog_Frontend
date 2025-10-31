import { createHashRouter } from "react-router-dom";
import App from "../../App";
import LoginForm from "../../domain/auth/pages/LoginForm";
import Home from "../pages/Home";

import AccommodationDetail from "../../domain/accommodation/pages/AccommodationDetail";
import RoomDetail from "../../domain/accommodation/pages/RoomDetail";
import SignupForm from "../../domain/auth/pages/SignupForm";
import Journal from "../../domain/board/pages/Journal";
import Review from "../../domain/board/pages/Review";

import AccommodationListPage from "../../domain/accommodation/pages/AccommodationListPage";
import { ReservationProvider } from "../../domain/accommodation/hooks/useReservation";
import AdminPage from "../../domain/admin/pages/AdminPage";
import BoardForm from "../../domain/board/pages/BoardForm";



const routes = [
  { path: "/index.html", element: <Home /> }, // spring boot 최초 실행 정보 추가
  { path: "/", element: <Home /> },
  { path: "/login", element: <LoginForm /> },

  { path: "/review", element: <Review /> },
  { path: "/journal", element: <Journal /> },
  { path: "/boardForm", element: <BoardForm /> },


  { path: "/signup", element: <SignupForm /> },
  { path: "/accommodations", element: <AccommodationListPage /> }, // 숙소 리스트 페이지
  { path: "/accommodations/:id", element:<AccommodationDetail />},
  { path: "/room/:roomId", element: <RoomDetail />},
  { path: "/admin", element: <AdminPage /> },

];

// router 객체
const router = createHashRouter([{
  path: "/",
  element: <App />,
  children: routes.map((route) => {
    return {
        index: route.path === "/", // 자식의 path 가 "/" 면 index 페이지 역활을 하게 하기
        path: route.path === "/" ? undefined : route.path, // path 에 "/" 두개가 표시되지 않게
        element: route.element // 어떤 컴포넌트를 활성화 할것인지
    }
  })
}]);

export default router;