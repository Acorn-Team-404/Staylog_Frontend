import { useNavigate } from "react-router-dom";
import api from "../api";
import Comments from "../../domain/board/components/comment/Comments";
import ImageCarousel from "../components/ImageCarousel";
// import ImageUploader from "../components/ImageUploader"; // ImageUploader moved to TestForm


function Home() {
    const boardId = 1; // ← 여기에 선언
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

  // 업로드가 완료된 후 실행될 함수 (이제 TestForm에서 처리)
  // const handleUploadComplete = () => {
  //   alert('업로드 완료!');
  //   // 이 데이터를 사용하여 페이지 상태를 업데이트하거나, 사용자에게 피드백을 줄 수 있습니다.
  // };

  return (
    <>
    <div className="container">
      <ImageCarousel
        targetType="HOME"
        targetId={1}
        indicatorType="progressbar"
        aspectRatio="21:9"
        rounded={true}
      />
    </div>
    <div className="container">
      <h1>집나간 나영이 찾습니다</h1>
      <h3>빨리 숙소 목록 띄워주세요</h3>
    </div>
      <button onClick={handleSubmit}>Api 연결 Test</button>

      <button onClick={goToAccommodationDetail}>
        숙소 상세 페이지 테스트 (ID:2)
      </button>
      <button onClick={()=>navigate("/admin")}>관리자 페이지</button>
      <button onClick={()=>navigate("/test-form")}>이미지 업로드 폼으로 이동</button>
      <button onClick={()=>navigate("/test-load")}>이미지 로드 페이지로 이동</button>
      <button onClick={()=>navigate("/testEditor")}>Quill 테스트</button>
      <button onClick={() => navigate("/comments/1")}>
        댓글 페이지로 이동
      </button>
      <button onClick={(()=>navigate("/home"))}>Home</button>
      <button onClick={(()=>navigate("/testCarousel"))}>캐러셀 테스트</button>
    </>
  );
}

export default Home;