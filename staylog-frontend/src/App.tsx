import { useOutlet } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-icons/font/bootstrap-icons.css';
import Navbar from "./global/components/Navbar"
import useAuthJwt from "./domain/auth/hooks/useAuthJwt";
import useCommonCodes from "./domain/common/hooks/useCommonCodes";

function App() {
  const currentOutlet = useOutlet();

  // JWT 토큰 검증 및 자동 로그아웃 타이머 설정
  useAuthJwt()

  // 앱 실행 시 공통코드 조회 및 Redux에 저장
  useCommonCodes()

  return (
    <>
      <Navbar></Navbar>
      <div className="container" style={{ paddingTop: '82px' }}>
        {currentOutlet}
      </div>
    </>
  );
}

export default App;