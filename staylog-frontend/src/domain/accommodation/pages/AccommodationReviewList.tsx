import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Container, Row, Col, Button } from "react-bootstrap";
import type { AccommodationReviewListType } from "../types/AccommodationType";
import api from "../../../global/api";
import ReviewCard from "../components/ReviewCard";
import '../css/Accommodation.css';
import Pagination from "../../../global/components/Pagination";

const AccommodationReviewList = () => {
    // 숙소 고유 번호
    const { id } = useParams<{ id: string }>();

    // 숙소 정보 + 리뷰 통합 상태
    const [data, setData] = useState<{
        name: string;
        regionName: string;
        address: string;
        reviews: AccommodationReviewListType[];
    } | null>(null);

    // 현재 페이지
    const [pageNum, setPageNum] = useState(1);
    const reviewsPerPage = 10; // 한 페이지에 렌더링할 리뷰 수

    // 페이지 맨 위로 가기
    const [goToUp, setGoToUp] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!id) return;

        const fetchData = async () => {
            try {
                const [accomRes, reviewRes] = await Promise.all([
                    api.get(`/v1/accommodations/${id}`),
                    api.get(`/v1/accommodations/${id}/reviews`)
                ]);

                setData({
                    name: accomRes.name,
                    regionName: accomRes.regionName,
                    address: accomRes.address,
                    reviews: reviewRes
                });
            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
    }, [id]);

    // 스크롤 시 맨 위 버튼 표시
    useEffect(() => {
        const handleScroll = () => {
            setGoToUp(window.scrollY > 200);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    if (!id) return <div>숙소 ID가 없습니다</div>;
    if (!data) return <div style={{ padding: "2.5rem", textAlign: "center" }}>숙소 정보 불러오는 중</div>;

    // 페이지 단위로 리뷰 선택
    const totalPage = Math.ceil(data.reviews.length / reviewsPerPage);
    const startIdx = (pageNum - 1) * reviewsPerPage;
    const endIdx = startIdx + reviewsPerPage;
    const reviewsToRender = data.reviews.slice(startIdx, endIdx);

    return <>
        <Container className="mt-4">
            <Row>
                {/* 왼쪽 영역 : 이전 페이지로 이동 버튼, 간단한 숙소 지역과 주소 정보 */}
                <Col lg={4} className="fixLeft">
                    <div>
                        <Button className="mb-3" onClick={() => navigate(`/accommodations/${id}`)}
                            style={{
                                display: "inline-flex", alignItems: "center", padding: 0, margin: 0,
                                border: "none", backgroundColor: "transparent"
                            }}>
                            <i className="bi bi-arrow-left-circle-fill"
                                style={{ color: "#000", backgroundColor: "transparent", fontSize: "2.0rem" }}></i>
                        </Button>
                        <h5 className="mb-3" style={{ fontWeight: "bold" }}>{data.name}</h5>
                        <p>{data.regionName}</p>
                    </div>
                </Col>

                {/* 오른쪽 영역 : 리뷰 미리보기 목록 */}
                <Col lg={8}>
                    {reviewsToRender.length > 0 ? (
                        reviewsToRender.map(review => (
                            <ReviewCard key={review.boardId} review={{
                                ...review,
                                content: review.content.replace(/<[^>]+>/g, "").trim()
                            }} />
                        ))
                    ) : (
                        <div className="text-center">
                            <i className="bi bi-chat-square-dots" style={{ fontSize: "1.5rem", color: "#666e75ff" }}></i>
                            <p className="mt-2" style={{ color: "#666e75ff" }}>등록된 리뷰가 없습니다</p>
                        </div>
                    )}

                    {/* 페이지네이션 */}
                    {totalPage > 1 && (
                        <Pagination
                            page={{
                                pageNum,               // 현재 페이지
                                startPage: 1,          // 시작 페이지
                                endPage: totalPage,    // 끝 페이지
                                pageSize: reviewsPerPage,  // 한 페이지당 리뷰 수
                                totalPage,             // 총 페이지 수
                                totalCount: data.reviews.length, // 전체 리뷰 수
                                offset: (pageNum - 1) * reviewsPerPage
                            }}
                            onPageChange={(num) => setPageNum(num)}
                        />
                    )}
                </Col>
            </Row>

            {/* 맨 위로 가게 하는 버튼 */}
            {goToUp && (
                <Button size="sm" onClick={scrollToTop}
                    className="position-fixed me-2 mb-2 bottom-0 end-0 border-0 bg-transparent shadow-none">
                    <i className="bi bi-arrow-up-square-fill" style={{ fontSize: "2.5rem", color: "#252525ff" }}></i>
                </Button>
            )}
        </Container>
    </>;
};

export default AccommodationReviewList;