import { Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";


export default function JournalCard({ board }: { board: any }) {
  const navigate = useNavigate();

  console.log("📦:", board.boardId, board.imageUrl);

  const imageUrl =
    board?.imageUrl && board.imageUrl.trim() !== "" 
      ? board.imageUrl
      : "/default-thumbnail.jpg";


  return (
    <Card
      className="shadow-sm h-100 journal-card border-0"
      // style={{ cursor: "pointer", transition: "transform 0.2s ease" }}
      onClick={() => navigate(`/board/${board.boardId}`)}
      // onMouseEnter={(e) =>
      //   (e.currentTarget.style.transform = "translateY(-4px)")
      // }
      // onMouseLeave={(e) =>
      //   (e.currentTarget.style.transform = "translateY(0)")
      // }
    >
      {/* 이미지 */}
      <div className="image-container position-relative">
      <Card.Img
        variant="top"
        src={imageUrl}
        alt="thumbnail"
        className="journal-image"
        onError={(e) => {
          // 이미지가 깨졌거나 로드 실패했을 때 대체 이미지로 변경
          e.currentTarget.src = "/default-thumbnail.jpg";
        }}
      />

      {/* 오버레이 정보 */}
      <div className="overlay">
        <div className="overlay-content text-center">
          <div className="d-flex justify-content-center align-items-center gap-2">
            {/* 조회수 */}
            <div className="d-flex align-items-center gap-1">
              <i className="bi bi-eye"></i>
              <span>{board.viewsCount ?? 0}</span>
            </div>
            {/* 좋아요 */}
            <div className="d-flex align-items-center gap-1">
              <i className="bi bi-heart-fill text-danger"></i>
              <span>{board.likesCount ?? 0}</span>
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* 본문 */}
      <Card.Body className="d-flex flex-column justify-content-between">
        <Card.Title className="fw-bold text-truncate mb-2">
          {board.title}
        </Card.Title>
        <Card.Text className="text-muted small mb-2">
          {board.regionName} | {board.userNickName}
        </Card.Text>
      </Card.Body>
    </Card>
  );
}
