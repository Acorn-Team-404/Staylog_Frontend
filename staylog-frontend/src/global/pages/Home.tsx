import { useNavigate } from "react-router-dom";
import api from "../api";

function Home() {
  async function handleSubmit() {

      try {
        const res = await api.get("/v1/test")
        console.log(res.data);
      } catch (err) {
        console.log(err);
      }
  }

  const navigate = useNavigate();

  const goToAccommodationDetail = () => {
    // 숙소 ID 1로 상세 페이지 이동
    navigate("/accommodations/1");
  };

  return (
    <>
      <button onClick={handleSubmit}>Api 연결 Test</button>

      <button onClick={goToAccommodationDetail}>
        숙소 상세 페이지 테스트 (ID:2)
      </button>
      <button onClick={()=>navigate("/admin")}>관리자 페이지</button>
    </>
  );
}

export default Home;