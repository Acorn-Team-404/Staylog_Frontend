import { createHashRouter } from "react-router-dom";
import Home from "../pages/Home";
import LoginForm from "../../domain/auth/pages/LoginForm";
import App from "../../App";
import SignupForm from "../../domain/auth/pages/SignupForm";
import RoomDetail from "../../domain/accommodation/pages/RoomDetail";

import AccommodationDetail from "../../domain/accommodation/pages/AccommodationDetail";
import { ReservationProvider } from "../../domain/accommodation/hooks/useReservation";


const routes = [
  { path: "/index.html", element: <Home /> }, // spring boot 최초 실행 정보 추가
  { path: "/", element: <Home /> },
  { path: "/login", element: <LoginForm /> },
  { path: "/signup", element: <SignupForm /> },
  { path: "/room/:roomId", element: <RoomDetail />},
  { path: "/accommodations/:id", element:<AccommodationDetail />}

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