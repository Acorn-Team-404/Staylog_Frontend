import { Card, Row, Col, Image, Button } from "react-bootstrap";
import type { AccommodationReviewList } from "../types/accommodation";

interface ReviewListProps {
  reviews: AccommodationReviewList[];
}

const ReviewList = ({ reviews }: ReviewListProps) => {
    return <>
        <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="mb-0">
                방문자 리뷰{" "}
                <small style = {{ color: "rgba(101, 101, 101, 1)" }}>
                    ({reviews.length})
                </small>
            </h4>
            <Button style = {{ textDecoration:"none", color:"#6c757d" }} variant="link" className="p-0">
                리뷰 더보기
            </Button>
        </div>

        {/* 리뷰 목록 */}
        {reviews.map((review) => (
            // border-0 border-bottom : 하단에만 회색 선 표시
            <Card key={review.boardId} className="mb-2 pb-4 border-0 border-bottom">
                <Card.Body>
                    {/* 상단 프로필 + 이름 + 객실타입 */}
                    <Row className="align-items-center mb-2">
                        <Col xs="auto">
                            {review.profileImage ? (
                                <Image src={review.profileImage} width={55} height={55} roundedCircle/>
                            ) : (
                                <i className="bi bi-person-circle" style={{ fontSize:55, color:"#2e2e2e" }}></i>
                            )}
                        </Col>
                        <Col>
                            <strong style={{ display:"block", fontSize:"1.05rem" }}>
                                {review.nickname}
                            </strong>
                            <span className="text-muted" style={{ fontSize:"0.9rem" }}>
                                객실 Type
                            </span>
                        </Col>
                    </Row>

                    {/* 별점 표시 */}
                    <div className="mb-2" style={{ color:"#ffbe26ff" }}>
                        {/* 별 5개 생성 */}
                        {Array.from({ length:5 }).map((_, index) => (
                            <i key={index}
                                // i < review.rating : 해당 인덱스가 평점보다 작으면 채워진 별, 아니면 빈 별
                                className={`bi ${
                                    index < review.rating ? "bi-star-fill" : "bi-star"
                                } me-1`} // me-1 : 별 사이의 여백
                            ></i>
                        ))}
                    </div>

                    {/* 리뷰 이미지 3개 */}
                    <Row className="g-2 mb-3">
                        {[0, 1, 2].map((i) => (
                            <Col key={i} xs={4}>
                                <Image
                                    src = {`https://picsum.photos/300/200?random=${
                                    i + review.boardId
                                }`}
                                className = "w-100"
                                style={{ height:"180px", objectFit:"cover" }}
                                />
                            </Col>
                        ))}
                    </Row>

                    {/* 리뷰 내용 */}
                    <div className="mb-2" style={{ whiteSpace: "pre-wrap" }}>
                        {review.content}
                    </div>

                    {/* 작성일 */}
                    <div className="text-muted" style={{ fontSize: "0.85rem" }}>
                        작성일 : {new Date(review.createdAt).toLocaleDateString()}
                    </div>
                </Card.Body>
            </Card>
        ))}
    </>
};

export default ReviewList;
