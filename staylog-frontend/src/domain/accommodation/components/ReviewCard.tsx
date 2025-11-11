import { Card, Col, Image, Row } from "react-bootstrap";
import type { AccommodationReviewListType } from "../types/AccommodationType";
import { useNavigate } from "react-router-dom";

const ReviewCard = ({ review }: { review: AccommodationReviewListType }) => {
    const navigate = useNavigate();

    // 게시글 상세보기로 이동
    const handleClick = () => {
        // boardType: review, boardId: review.boardId
        navigate(`/board/${review.boardId}`);
    };

    // 리뷰 대표 이미지 (백엔드에서 준 값)
    const reviewImage = review.contentUrl;

    // 텍스트 추출 (태그 제거)
    const parser = new DOMParser();
    const doc = parser.parseFromString(review.content, "text/html");
    const textContent = doc.body.innerText.trim();

    return (
        <Card className="mb-4" onClick={handleClick}
            style={{ 
                border: "none", 
                backgroundColor: "rgba(249, 249, 249, 1)",
                boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
                cursor: "pointer"
            }}>

            <Row className="g-2">
                {/* 리뷰 대표 이미지 */}
                <Col xs={4} md={3} className="d-flex"
                    style={{
                        borderRadius : "0.25rem",
                        overflow : "hidden",
                        aspectRatio : "1 / 1"
                    }}>
                    {reviewImage ? (
                        <Image src={reviewImage} style={{ width: "100%", height: "100%", objectFit: "cover" }}/>
                        ) : (
                        <div className="rounded d-flex justify-content-center align-items-center"
                            style={{ width: "100%", aspectRatio: "1 / 1", backgroundColor: "#f1f1f1" }}>
                            <i className="bi bi-house-door text-muted" style={{ fontSize: "3rem" }}></i>
                        </div>
                    )}
                </Col>

                {/* 게시글 미리보기 제목, 내용, 작성자, 등록일 표시 */}
                <Col xs={8} md={9} className="d-flex flex-column justify-content-between mt-3" style={{ borderRadius: "0.25rem" }}>
                    <div>
                        <strong className="reviewTitle" style={{ color: "#333333ff" }}>{review.title}</strong>
                        <p className="reviewCardContent mt-1">{textContent}</p>
                    </div>
                    
                    <div className="mb-2" style={{ color: "#6d6d6dff" }}>
                        <span className="me-2" style={{ fontSize: "0.8rem" }}>{review.nickname}</span>
                        <span style={{ fontSize: "0.8rem" }}>
                            {new Date(review.createdAt).toLocaleDateString().replace(/\.$/, "")}
                        </span>
                    </div>
                </Col>
            </Row>
        </Card>
    );
};

export default ReviewCard;