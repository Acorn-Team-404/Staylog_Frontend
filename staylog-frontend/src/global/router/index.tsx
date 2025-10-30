import { createHashRouter } from "react-router-dom";
import Home from "../pages/Home";
import LoginForm from "../../domain/auth/pages/LoginForm";
import App from "../../App";
import Journal from "../../domain/journal/pages/Journal";
import SignupForm from "../../domain/auth/pages/SignupForm";
import Review from "../../domain/review/pages/Review";

const routes = [
  { path: "/index.html", element: <Home /> }, // spring boot 최초 실행 정보 추가
  { path: "/", element: <Home /> },
  { path: "/login", element: <LoginForm /> },
  { path: "/review", element: <Review /> },
  { path: "/journal", element: <Journal /> },
  { path: "/signup", element: <SignupForm /> }
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