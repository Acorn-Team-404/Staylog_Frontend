// src/domain/mypage/pages/ReviewSection.tsx
import { useEffect, useState } from "react";
import { getReviewList } from "../api/mypageApi";
import useGetUserIdFromToken from "../../auth/hooks/useGetUserIdFromToken";
import { Button, Card, Table } from "react-bootstrap";
import { formatKST } from "../../../global/utils/date";
import type { Reviews } from "../types/mypageTypes";
import { useNavigate } from "react-router-dom";
import MypagePagination from "../components/MypagePagination";

function ReviewSection() {
    const userId = useGetUserIdFromToken();
    const navigate = useNavigate();
    
    const [reviews, setReviews] = useState<Reviews[]>([]);
    const [type, setType] = useState("availableToWrite");

    // --- 페이지네이션 상태 추가 ---
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        if (userId) {
            getReviewList(userId, type)
                .then((res) => {
                    setReviews(res || []);
                    setCurrentPage(1); // 데이터 변경 시 1페이지로 초기화
                })
                .catch((err) => {
                    console.error("리뷰 내역 조회 실패:", err);
                    setReviews([]);
                });
        }
    }, [userId, type]);

    const handleTypeChange = (newType: string) => {
        if(type === newType) return;
        setReviews([]);
        setType(newType);
    };

    // --- 페이징 계산 로직 추가 ---
    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    const currentItems = reviews.slice(indexOfFirst, indexOfLast);

    const renderFilterButtons = () => (
        <div className="d-flex justify-content-center gap-2 mb-4">
            <Button
                size="sm"
                variant={type === "availableToWrite" ? "dark" : "outline-secondary"}
                onClick={() => handleTypeChange("availableToWrite")}
                style={{ whiteSpace: "nowrap" }}
                className="text-nowrap"
            >
                작성 가능한 리뷰
            </Button>
            <Button
                size="sm"
                variant={type === "myWrittenReview" ? "dark" : "outline-secondary"}
                onClick={() => handleTypeChange("myWrittenReview")}
                style={{ whiteSpace: "nowrap"}}
                className="text-nowrap"
            >
                내가 쓴 리뷰
            </Button>
        </div>
    );

    // PC - 작성 가능한 리뷰 (테이블)
    const renderAvailableReviewsTable = () => (
        <div className="d-none d-lg-block">
            <Table bordered hover responsive className="align-middle text-center">
                <thead className="table-light">
                    <tr>
                        <th>예약 번호</th>
                        <th>숙소명</th>
                        <th>체크인</th>
                        <th>체크아웃</th>
                        <th>리뷰 작성</th>
                    </tr>
                </thead>
                <tbody>
                    {currentItems.length > 0 ? (
                        currentItems.map((review) => (
                            <tr key={review.bookingId}>
                                <td>{review.bookingNum}</td>
                                <td>{review.accommodationName}</td>
                                <td>{review.checkIn ? formatKST(review.checkIn).split("T")[0] : 'N/A'}</td>
                                <td>{review.checkOut ? formatKST(review.checkOut).split("T")[0] : 'N/A'}</td>
                                <td>
                                    <Button variant="outline-primary" size="sm" onClick={() => navigate('/form/review', { state: { booking: review } })} className="text-nowrap">
                                        작성하기
                                    </Button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr><td colSpan={5} className="text-muted py-4">작성 가능한 리뷰가 없습니다.</td></tr>
                    )}
                </tbody>
            </Table>
        </div>
    );

    // 모바일 - 작성 가능한 리뷰 (카드)
    const renderAvailableReviewsCards = () => (
        <div className="d-lg-none">
            {currentItems.length > 0 ? (
                currentItems.map((review) => (
                    <Card key={review.bookingId} className="mb-3">
                        <Card.Header className="fw-bold">{review.bookingNum}</Card.Header>
                        <Card.Body>
                            <div className="p-3">
                                <Card.Title>{review.accommodationName}</Card.Title>
                                <div className="d-flex justify-content-between text-sm text-muted">
                                    <span><strong>체크인</strong> {review.checkIn ? formatKST(review.checkIn).split("T")[0] : "—"}</span>
                                </div>
                                <div className="d-flex justify-content-between text-sm text-muted">    
                                    <span><strong>체크아웃</strong> {review.checkOut ? formatKST(review.checkOut).split("T")[0] : "—"}</span>
                                </div>
                                <Button variant="outline-primary" size="sm" className="w-100 mt-3 text-nowrap" onClick={() => navigate('/form/review', { state: { booking: review } })}>
                                    작성하기
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                ))
            ) : (
                <div className="text-center text-muted py-4">작성 가능한 리뷰가 없습니다.</div>
            )}
        </div>
    );

    // PC - 내가 쓴 리뷰 (테이블)
    const renderMyReviewsTable = () => (
        <div className="d-none d-lg-block">
            <Table bordered hover responsive className="align-middle text-center">
                <thead className="table-light">
                    <tr className="text-nowrap">
                        <th>예약 번호</th>
                        <th>숙소명</th>
                        <th>제목</th>
                        <th>별점</th>
                        <th>작성일</th>
                        <th>리뷰 보기</th>
                    </tr>
                </thead>
                <tbody>
                    {currentItems.length > 0 ? (
                        currentItems.map((review) => (
                            <tr key={review.reviewId}>
                                <td>{review.bookingNum}</td>
                                <td>{review.accommodationName}</td>
                                <td style={{ textAlign: 'left' }}>{review.title}</td>
                                <td>{review.rating}</td>
                                <td>{review.createdAt ? formatKST(review.createdAt).split("T")[0] : 'N/A'}</td>
                                <td>
                                    <Button variant="outline-primary" size="sm" onClick={() => navigate(`/board/${review.reviewId}`)} className="text-nowrap">
                                        리뷰 보기
                                    </Button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr><td colSpan={6} className="text-muted py-4">작성한 리뷰가 없습니다.</td></tr>
                    )}
                </tbody>
            </Table>
        </div>
    );

    // 모바일 - 내가 쓴 리뷰 (카드)
    const renderMyReviewsCards = () => (
        <div className="d-lg-none">
            {currentItems.length > 0 ? (
                currentItems.map((review) => (
                    <Card key={review.reviewId} className="mb-3">
                        <Card.Header className="d-flex justify-content-between align-items-center">
                            <span className="fw-bold">{review.bookingNum}</span>
                            <span className="text-nowrap">⭐ {review.rating}</span>
                        </Card.Header>
                        <Card.Body>
                            <div className="p-3">
                                <Card.Title>{review.title}</Card.Title>
                                <Card.Text className="text-muted">{review.accommodationName}</Card.Text>
                                <Button variant="outline-primary" size="sm" className="w-100 mt-2 text-nowrap" onClick={() => navigate(`/review/${review.reviewId}`)}>
                                    리뷰 보기
                                </Button>
                            </div>
                        </Card.Body>
                        <Card.Footer className="text-muted text-end text-sm">
                            {review.createdAt ? formatKST(review.createdAt).split("T")[0] : 'N/A'}
                        </Card.Footer>
                    </Card>
                ))
            ) : (
                <div className="text-center text-muted py-4">작성한 리뷰가 없습니다.</div>
            )}
        </div>
    );

    return (
        <Card className="shadow-sm border-0 w-100 mypage-section">
            <Card.Body className="p-0 p-lg-4">
                <div className="mb-3 text-center">
                    <h4 className="fw-bold">리뷰 내역</h4>
                    <hr className="mb-4" />
                </div>
                {renderFilterButtons()}
                
                {type === "availableToWrite" ? (
                    <>
                        {renderAvailableReviewsTable()}
                        {renderAvailableReviewsCards()}
                    </>
                ) : (
                    <>
                        {renderMyReviewsTable()}
                        {renderMyReviewsCards()}
                    </>
                )}

                <MypagePagination
                    totalItems={reviews.length}
                    itemsPerPage={itemsPerPage}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                />
            </Card.Body>
        </Card>
    );
}

export default ReviewSection;