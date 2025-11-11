import { useEffect, useRef, useState, useCallback } from "react";
import api from "../../../global/api";
import type { HomeAccommodationListRequest } from "../types/home";
import type { HomeAccommodationListResponse } from "../types/homeList";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { Card } from "react-bootstrap";
import "swiper/css";
import "swiper/css/navigation";
import { useNavigate } from "react-router-dom";
import { getImageUrl } from "../../../global/hooks/getImageUrl";
import "../css/HomeListSection.css";

type HomeListSectionProps = HomeAccommodationListRequest & {
  title?: string;
};

function HomeListSection({
  regionCode,
  sort,
  offset = 0,
  limit = 3,
  title,
}: HomeListSectionProps) {
  const [list, setList] = useState<HomeAccommodationListResponse>([]);
  const [pageOffset, setPageOffset] = useState(offset);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const inFlight = useRef(false);
  const navigate = useNavigate();

  // 별 렌더
  const renderStars = (ratingNum: number = 0) => {
    const full = Math.floor(ratingNum);
    const hasHalf = ratingNum - full >= 0.5;
    return Array.from({ length: 5 }).map((_, index) => {
      if (index < full) return <i key={index} className="bi bi-star-fill me-1" />;
      if (index === full && hasHalf) return <i key={index} className="bi bi-star-half me-1" />;
      return <i key={index} className="bi bi-star me-1" />;
    });
  };

  // 이미지
  const AccommodationImage = ({ id }: { id: number }) => {
    const src = getImageUrl("ACCOMMODATION", id);
    return (
      <Card.Img
        variant="top"
        src={src}
        onError={(e) => {
          (e.target as HTMLImageElement).src =
            "https://placehold.co/1200x800/F0F3F7/99AAB5?text=No+Image";
        }}
        style={{ height: 300, objectFit: "cover", width: "100%" }}
        className="border-0"
        loading="lazy"
      />
    );
  };

  const fetchPage = useCallback(
    async (nextOffset: number) => {
      if (loading || inFlight.current || !hasMore) return;
      inFlight.current = true;
      setLoading(true);
      try {
        // 백엔드는 한 개의 엔드포인트만 쓰자: /v1/home
        const params = {
          regionCode,
          sort,
          offset: nextOffset,
          limit,
        };
        const data: HomeAccommodationListResponse = await api.get("v1/home", { params });
        // 첫 페이지면 교체, 그 외엔 이어붙이기
        setList((prev) => (nextOffset === 0 ? data : [...prev, ...data]));
        // 다음 페이지 가능 여부
        if (!Array.isArray(data) || data.length < limit) {
          setHasMore(false);
        }
      } catch (err: any) {
        // 500 대응: 콘솔만 찍고 더 이상 진행 X
        console.error("Home list fetch error:", err?.response ?? err);
      } finally {
        setLoading(false);
        inFlight.current = false;
      }
    },
    [regionCode, sort, limit, loading, hasMore]
  );

  // regionCode/sort 바뀌면 리셋 후 1페이지 로드
  useEffect(() => {
    setList([]);
    setPageOffset(0);
    setHasMore(true);
  }, [regionCode, sort, limit]);

  // 오프셋 변경 시 데이터 로드
  useEffect(() => {
    fetchPage(pageOffset);
  }, [pageOffset, fetchPage]);

  // 스와이퍼 끝에 닿았을 때
  const handleReachEnd = () => {
    if (loading || !hasMore) return;
    setPageOffset((prev) => prev + limit);
  };

  return (
    <>
      {title && <h3 className="mb-3">{title}</h3>}
      <Swiper
        modules={[Navigation]}
        spaceBetween={16}
        navigation
        grabCursor={true}
        slidesPerGroup={3}
        loop={false}
        onReachEnd={handleReachEnd}
        className="mb-5"
        breakpoints={{
          0: { slidesPerView: 1, slidesPerGroup: 1, spaceBetween: 12 },
          576: { slidesPerView: 2, slidesPerGroup: 2, spaceBetween: 14 },
          992: { slidesPerView: 3, slidesPerGroup: 3, spaceBetween: 16 },
        }}
      >
        {list.map((item) => (
          <SwiperSlide key={item.accommodationId}>
            <Card
              className="home-card border-0"
              onClick={() => navigate(`/accommodations/${item.accommodationId}`)}
            >
              <AccommodationImage id={item.accommodationId} />
              <Card.Body>
                <Card.Title>{item.name}</Card.Title>
                <Card.Text as="div">
                  <div className="mb-2" style={{ color: "#ffbe26ff" }}>
                    {renderStars(item.ratingAvg ?? 0)}
                    <span>{item.reviewCnt}</span>
                  </div>
                </Card.Text>
                <div className="d-flex">
                  <Card.Text as="div" style={{ fontWeight: 700, color: "#202020ff" }}>
                    <p>{item.minPrice?.toLocaleString()}원 / 박</p>
                  </Card.Text>
                  <Card.Text as="div">
                    <p className="ms-4">{item.regionName}</p>
                  </Card.Text>
                </div>
              </Card.Body>
            </Card>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* 간단 로딩/끝 UI (선택) */}
      {loading && <div className="text-muted">불러오는 중…</div>}
      {!hasMore && list.length > 0 && (
        <div className="text-muted">마지막 페이지입니다.</div>
      )}
    </>
  );
}

export default HomeListSection;
