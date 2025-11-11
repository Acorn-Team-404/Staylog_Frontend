import { Card, Row, Col, Image, Button } from "react-bootstrap";
import type { AccommodationReviewListType } from "../types/AccommodationType";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface ReviewListProps {
  reviews : AccommodationReviewListType[];
  accommodationId : number;
}

const ReviewList = ({ reviews, accommodationId }: ReviewListProps) => {

    // 리뷰 글 펼침 상태
    const [openReviews, setOpenReviews] = useState<Record<number,boolean>>({});
    // 리뷰 글 펼침 토글
    const toggleContent = (boardId: number) => {
        setOpenReviews(prev => ({
            ...prev,
            [boardId]: !prev[boardId],
        }));
    };
    // 페이지 이동
    const navigate = useNavigate();

    return <>
         <div className="d-flex justify-content-end">
            <Button className="p-0"
                onClick={() => navigate(`/accommodations/${accommodationId}/reviews`)}
                style={{
                    fontSize : "0.8rem",
                    color : "#5c6369ff",
                    textDecoration : "none",
                    backgroundColor : "transparent",
                    border : "none",
                    boxShadow : "none",
                }}>
                전체 리뷰 더보기
                <i className="bi bi-chevron-right" style={{ fontSize: "0.8rem", marginLeft: "0.2rem" }}></i>
            </Button>
        </div>
        {/* 리뷰 목록 */}
        {reviews.map((review) => {
            // HTML 파싱
            const parser = new DOMParser();
            const doc = parser.parseFromString(review.content, "text/html");

            // 이미지 src 전부 추출
            const imageTags = Array.from(doc.querySelectorAll("img"));
            const images = imageTags.map(img => img.src);

            // 이미지 제거 후 텍스트만 추출
            imageTags.forEach(img => img.remove());
            const textContent = doc.body.innerText.trim(); // 순수 텍스트

            const isOpened = openReviews[review.boardId] || false;
            return <>
                <Card key={review.boardId} className="border-0 border-bottom">
                    <Card.Body>
                        {/* 상단 프로필 + 이름 + 객실타입 */}
                        <div className="d-flex align-items-center">
                            {review.profileUrl ? (
                                <Image src={review.profileUrl} width={40} height={40} roundedCircle style={{ objectFit: "cover" }}/>
                            ) : (
                                <i className="bi bi-person-circle" style={{ fontSize: 40, color: "#2e2e2e" }}></i>
                            )}
                            <strong style={{ fontSize: "1.0rem", marginLeft: "0.5rem" }}>
                                {review.nickname}
                            </strong>
                        </div>

                        {/* 별점 표시 */}
                        <div className="mb-2" style={{ color:"#ffbe26ff" }}>
                            {Array.from({ length:5 }).map((_, index) => (
                                <i key={index}
                                    className={`bi ${
                                        index < review.rating ? "bi-star-fill" : "bi-star"
                                    } me-1`}>    
                                </i>
                            ))}
                        </div>

                        {/* 리뷰 이미지 4개 고정*/}
                        <Row className="g-2 mb-2">
                            {images.slice(0, 4).map((src, i) => (
                                <Col key={i} xs={3}>
                                    <div style={{ width: "100%", aspectRatio: "1 / 1", overflow: "hidden", borderRadius: "0.5rem" }}>
                                        <Image src={src} fluid
                                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                            alt={`review-img-${i}`}/>
                                    </div>
                                </Col>
                            ))}
                        </Row>

                        {/* 리뷰 내용 */}
                        <div className="mb-2" 
                            style={{ 
                                whiteSpace : "pre-wrap",
                                display : "-webkit-box",
                                WebkitLineClamp : isOpened ? undefined : 5,
                                WebkitBoxOrient : "vertical",
                                overflow : "hidden",
                                fontSize : "0.85rem"
                            }}>
                            {textContent}
                        </div>

                        {/* 🔹 리뷰 내용 더보기, 닫기 버튼 오른쪽 위치, 화살표 아이콘*/}
                        {textContent.length > 200 && (
                            <div className="d-flex justify-content-end">
                                <Button className="p-0 d-flex align-items-center"
                                    onClick={() => toggleContent(review.boardId)}
                                    onFocus={(e) => e.currentTarget.blur()} // 포커스 제거
                                    style={{
                                        fontSize : "0.9rem",
                                        color : "#000",
                                        fontWeight : 600,
                                        textDecoration : "none",
                                        backgroundColor : "transparent", // 기본 배경 색상 없애기
                                        border : "none", // 테두리 없애기
                                        boxShadow : "none" // 클릭시 생기는 그림자 제거
                                    }}>
                                    {isOpened ? "닫기 " : "더보기 "}
                                    <i className={`bi ${isOpened ? "bi-chevron-up" : "bi-chevron-down"}`} style={{ color: "#000" }}></i>
                                </Button>
                            </div>
                        )}

                        {/* 작성일 */}
                        <div className="text-muted mb-2" style={{ fontSize: "0.8rem", marginTop: "0.5rem" }}>
                            작성일 : {new Date(review.createdAt).toLocaleDateString().replace(/\.$/, "")}
                        </div>
                    </Card.Body>
                </Card>
            </>
        })}
    </>
};

export default ReviewList;