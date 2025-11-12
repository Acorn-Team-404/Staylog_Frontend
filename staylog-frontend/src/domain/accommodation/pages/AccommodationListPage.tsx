import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Container, Row, Col, Button, Spinner, Alert } from 'react-bootstrap';
import AccommodationCard from '../components/AccommodationCard';
import SortModal from '../../../global/components/SortModal';
import type { SortOption } from '../../../global/components/SortModal';
import { searchAccommodations } from '../../search/api';

import type { SearchAccommodationsRequest } from '../../search/types';
import useCommonCodeSelector from '../../common/hooks/useCommonCodeSelector';
import useInfiniteScroll from '../hooks/useInfiniteScroll';
import type { AccommodationSearchListItem } from '../types/AccommodationType';

function AccommodationListPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // 공통코드에서 정렬 옵션 가져오기
  const sortCodeList = useCommonCodeSelector('sortOptions');

  // 공통코드를 SortOption 형태로 변환
  const SORT_OPTIONS: SortOption<'popular' | 'new' | 'lowPrice' | 'highPrice'>[] = useMemo(() => {
    if (!sortCodeList || sortCodeList.length === 0) {
      // Fallback: 공통코드 로딩 전 기본값
      return [
        { value: 'popular', label: '인기순' },
        { value: 'new', label: '신규 오픈순' },
        { value: 'lowPrice', label: '낮은 가격순' },
        { value: 'highPrice', label: '높은 가격순' },
      ];
    }

    // 공통코드의 codeId를 value로, codeName을 label로 사용
    return sortCodeList.map((code) => ({
      value: code.codeId as 'popular' | 'new' | 'lowPrice' | 'highPrice',
      label: code.codeName,
    }));
  }, [sortCodeList]);

  // 상태
  const [accommodations, setAccommodations] = useState<AccommodationSearchListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [lastAccomId, setLastAccomId] = useState<number | undefined>(undefined);

  // 정렬 모달
  const [isSortModalOpen, setIsSortModalOpen] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'popular' | 'new' | 'lowPrice' | 'highPrice'>('popular');

  // URL에서 검색 조건 파싱
  const getSearchParamsFromUrl = (): SearchAccommodationsRequest => {
    const regionCodes = searchParams.getAll('regionCodes');
    const people = searchParams.get('people');
    const checkIn = searchParams.get('checkIn');
    const checkOut = searchParams.get('checkOut');
    const order = searchParams.get('order');

    return {
      regionCodes: regionCodes.length > 0 ? regionCodes : undefined,
      people: people ? Number(people) : undefined,
      checkIn: checkIn || undefined,
      checkOut: checkOut || undefined,
      order: (order as any) || sortBy,
    };
  };

  // 초기 숙소 검색 (검색 조건 변경 시)
  const fetchAccommodations = async () => {
    try {
      setLoading(true);
      setError(null);
      setAccommodations([]); // 기존 데이터 초기화
      setLastAccomId(undefined);
      setHasMore(true);

      const params = getSearchParamsFromUrl();
      const data = await searchAccommodations(params);

      setAccommodations(data);

      // 받아온 데이터가 20개 미만이면 더 이상 없음
      setHasMore(data.length >= 20);

      // 마지막 숙소 ID 저장
      if (data.length > 0) {
        setLastAccomId(data[data.length - 1].accommodationId);
      }
    } catch (err: any) {
      console.error('숙소 검색 실패:', err);
      setError(err.message || '숙소 목록을 불러오는데 실패했습니다.');
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  // 추가 숙소 로드 (무한 스크롤)
  const loadMoreAccommodations = async () => {
    if (loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);

      const params = getSearchParamsFromUrl();
      // lastAccomId 추가
      const data = await searchAccommodations({
        ...params,
        lastAccomId,
      });

      // 기존 데이터에 추가
      setAccommodations((prev) => [...prev, ...data]);

      // 받아온 데이터가 20개 미만이면 더 이상 없음
      setHasMore(data.length >= 20);

      // 마지막 숙소 ID 업데이트
      if (data.length > 0) {
        setLastAccomId(data[data.length - 1].accommodationId);
      }
    } catch (err: any) {
      console.error('추가 숙소 로드 실패:', err);
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  };

  // 초기 로드 및 검색 조건 변경 시 재검색
  useEffect(() => {
    fetchAccommodations();
  }, [searchParams]);

  // 무한 스크롤 훅
  const observerTarget = useInfiniteScroll({
    loading: loadingMore,
    hasMore,
    onLoadMore: loadMoreAccommodations,
    threshold: 0.5, // 타겟의 50%가 보이면 트리거
  });

  // 정렬 변경
  const handleSortChange = (newSort: 'popular' | 'new' | 'lowPrice' | 'highPrice') => {
    setSortBy(newSort);

    // URL 파라미터 업데이트
    const newParams = new URLSearchParams(searchParams);
    newParams.set('order', newSort);
    setSearchParams(newParams);
  };

  // 검색 조건 표시용
  const getSearchSummary = () => {
    const regions = searchParams.getAll('regionCodes');
    const people = searchParams.get('people');
    const checkIn = searchParams.get('checkIn');
    const checkOut = searchParams.get('checkOut');

    const parts: string[] = [];
    if (regions.length > 0) {
      parts.push(`지역: ${regions.join(', ')}`);
    }
    if (people) {
      parts.push(`인원: ${people}명`);
    }
    if (checkIn && checkOut) {
      parts.push(`${checkIn} ~ ${checkOut}`);
    }

    return parts.length > 0 ? parts.join(' · ') : '전체 숙소';
  };

  return (
    <Container fluid className="py-5" style={{ marginTop: '80px' }}>
      <Container>
        {/* 헤더 */}
        <Row className="mb-4">
          <Col>
            <h3 className="fw-bold">{getSearchSummary()}</h3>
            <p className="text-muted">
              총 <span className="fw-semibold text-primary">{accommodations.length}</span>개의 숙소
            </p>
          </Col>
          <Col xs="auto" className="d-flex align-items-center">
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => setIsSortModalOpen(true)}
              className="d-flex align-items-center gap-2"
            >
              <span>{SORT_OPTIONS.find((opt) => opt.value === sortBy)?.label}</span>
              <i className="bi bi-chevron-down"></i>
            </Button>
          </Col>
        </Row>

        {/* 로딩 상태 */}
        {loading && (
          <div className="text-center py-5">
            <Spinner animation="border" role="status" variant="primary">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            <p className="mt-3 text-muted">숙소를 검색하는 중...</p>
          </div>
        )}

        {/* 에러 상태 */}
        {error && (
          <Alert variant="danger" className="mb-4">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
          </Alert>
        )}

        {/* 숙소 목록 */}
        {!loading && !error && (
          <>
            {accommodations.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-search" style={{ fontSize: '64px', color: '#ccc' }}></i>
                <p className="mt-3 text-muted">검색 결과가 없습니다.</p>
              </div>
            ) : (
              <>
                <Row xs={1} sm={2} md={3} lg={4} className="g-4">
                  {accommodations.map((accommodation) => (
                    <Col key={accommodation.accommodationId}>
                      <AccommodationCard accommodation={accommodation} />
                    </Col>
                  ))}
                </Row>

                {/* 무한 스크롤 트리거 타겟 */}
                <div ref={observerTarget} style={{ height: '20px', margin: '40px 0' }}>
                  {loadingMore && (
                    <div className="text-center">
                      <Spinner animation="border" role="status" size="sm" variant="primary">
                        <span className="visually-hidden">Loading...</span>
                      </Spinner>
                      <p className="mt-2 text-muted small">더 많은 숙소를 불러오는 중...</p>
                    </div>
                  )}
                  {!hasMore && accommodations.length > 0 && (
                    <div className="text-center text-muted small">
                      <p>모든 숙소를 불러왔습니다.</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </Container>

      {/* 정렬 모달 */}
      <SortModal
        isOpen={isSortModalOpen}
        onClose={() => setIsSortModalOpen(false)}
        options={SORT_OPTIONS}
        selectedValue={sortBy}
        onSelectSort={handleSortChange}
        title="정렬"
      />
    </Container>
  );
}

export default AccommodationListPage;
