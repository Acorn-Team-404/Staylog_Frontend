import { useOutlet } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-icons/font/bootstrap-icons.css';
import Navbar from "./global/components/Navbar"
import useAuthJwt from "./domain/auth/hooks/useAuthJwt";
import useGetNicknameFromToken from "./domain/auth/hooks/useGetNicknameFromToken";
import useGetLoginIdFromToken from "./domain/auth/hooks/useGetLoginIdFromToken";
import useGetUserIdFromToken from "./domain/auth/hooks/useGetUserIdFromToken";

function App() {
  const currentOutlet = useOutlet();

  useAuthJwt()

  
  console.log("닉네임은", useGetNicknameFromToken(), "입니다");
  console.log("아이디는", useGetLoginIdFromToken(), "입니다");
  console.log("PK는", useGetUserIdFromToken(), "입니다");

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