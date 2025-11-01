import { useOutlet } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-icons/font/bootstrap-icons.css';
import Navbar from "./global/components/Navbar"
import useAuthJwt from "./domain/auth/hooks/useAuthJwt";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ko';

function App() {
  const currentOutlet = useOutlet();

  useAuthJwt()

  // relativeTime 플러그인 활성화
  dayjs.extend(relativeTime);

  // 전역 로케일을 한국어로 설정
  dayjs.locale('ko');

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