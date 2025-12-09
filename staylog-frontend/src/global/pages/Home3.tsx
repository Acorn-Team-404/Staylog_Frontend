import HomeListSection from "../../domain/home/components/HomeListSection";
import { useCallback, useEffect, useRef, useState } from "react";
import ImageCarousel from "../components/ImageCarousel";

function Home3() {
  // 렌더할 섹션 정의 (원하는 만큼 추가 가능)
  const sections = [
    // 수도권 / 유명 지역 중심 상단
    { title: "전국 | 최신 등록 숙소", regionCode: "", sort: "latest", limit: 6 },
    { title: "전국 | 별점순", regionCode: "", sort: "rating", limit: 6 },
    { title: "푸른 자연 속 힐링, 강원 | 리뷰 많은 순", regionCode: "REGION_GANGWON", sort: "review", limit: 6 },
    { title: "쉼이 필요할 때, 제주 | 별점순", regionCode: "REGION_JEJU", sort: "rating", limit: 6 },
    { title: "바다 낭만 가득, 부산 | 리뷰 많은 순", regionCode: "REGION_BUSAN", sort: "review", limit: 6 },
    { title: "트렌드의 시작, 서울 | 별점순", regionCode: "REGION_SEOUL", sort: "rating", limit: 6 }

    // 인기 여행지 묶어서

    // 근교 / 여행지
  ];

  // 처음엔 3개만 보여주고, 스크롤 내려오면 3개씩 증가
  const [visibleCount, setVisibleCount] = useState(3);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lockRef = useRef(false); // 연속 발화 




  useEffect(() => {
    if (!sentinelRef.current) return;

    observerRef.current?.disconnect();
    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        if (lockRef.current) return;
        if (visibleCount >= sections.length) return;

        lockRef.current = true;
        setVisibleCount(prev => Math.min(prev + 3, sections.length));

        // 레이아웃 반영 후 잠깐 쉬고 락 해제
        requestAnimationFrame(() => {
          setTimeout(() => { lockRef.current = false; }, 300);
        });
      },
      { root: null, rootMargin: "600px 0px", threshold: 0 }
    );

    observerRef.current.observe(sentinelRef.current);
    return () => observerRef.current?.disconnect();
  }, [visibleCount, sections.length]);
  return (
    <>
      <div className="ratio mb-3">
        <ImageCarousel
          targetType="HOME"
          targetId={1}
          indicatorType="progressbar"
          aspectRatio="21:9"
          rounded={true}
        />
      </div>

      {/* 현재 visibleCount 만큼만 섹션 렌더 */}
      {sections.slice(0, visibleCount).map((sec, idx) => (
        <HomeListSection
          key={`${sec.title}-${idx}`}
          title={sec.title}
          regionCode={sec.regionCode as any}
          sort={sec.sort as any}
          limit={sec.limit}
        />
      ))}

      {/* 아직 남은 섹션이 있으면 센티넬 노출 */}
      {visibleCount < sections.length && (
        <div
          ref={sentinelRef}
          style={{ height: 1, margin: 0, padding: 0 }}
          aria-hidden
        />
      )}

    </>
  );
}

export default Home3;