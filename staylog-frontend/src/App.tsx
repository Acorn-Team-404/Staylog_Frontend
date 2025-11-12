import { useOutlet, useSearchParams } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-icons/font/bootstrap-icons.css';
import Navbar from "./global/components/Navbar"
import useAuthJwt from "./domain/auth/hooks/useAuthJwt";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ko';
import useCommonCodes from "./domain/common/hooks/useCommonCodes";
import useNotificationInitializer from "./domain/notification/hooks/useNotificationInitializer";
import BottomTabBar from "./global/components/BottomTabBar";
// 모달 추가
import Modal from "./global/components/Modal";
import { useEffect } from "react";
import Footer from "./global/components/Footer";


function App() {
  const currentOutlet = useOutlet();

  // JWT 토큰 검증 및 자동 로그아웃 타이머 설정
  useAuthJwt()

  // relativeTime 플러그인 활성화
  dayjs.extend(relativeTime);

  // 전역 로케일을 한국어로 설정
  dayjs.locale('ko');
  // 앱 실행 시 공통코드 조회 및 Redux에 저장
  useCommonCodes()

  // 앱 실행 시 SSE 구독 및 unreadCount 조회
  useNotificationInitializer()
  
  // 하단 탭바에서 쿠폰 버튼 클릭 시 모달을 제어하기 위한 전역
  const [params, setParams] = useSearchParams();
  const modal = params.get("modal"); // "coupon" | "login" | null
  const isOpen = modal === "coupon" || modal === "login";
  const mode = (modal === "coupon" ? "coupon" : "login") as "coupon" | "login";

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleCloseModal = () => {
    params.delete("modal");
    setParams(params, { replace: true });
  };
  return (
    <>
      <Navbar></Navbar>
      <div className="container" style={{ paddingTop: '82px' }}>
        {currentOutlet}
      </div>
      <BottomTabBar />
      <Modal isOpen={isOpen} onClose={handleCloseModal} mode={mode} />
      <Footer />
    </>
  );
}

export default App;