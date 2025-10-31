import { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import GuestSelector from './GuestSelector';
import type { GuestCount, Region } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// 지역 데이터 
const REGIONS: Region[] = [
  { code: '전체', name: '전체' },
  { code: '서울', name: '서울' },
  { code: '경기', name: '경기' },
  { code: '제주', name: '제주' },
  { code: '강원', name: '강원' },
  { code: '인천', name: '인천' },
  { code: '부산', name: '부산' },
  { code: '충청', name: '충청' },
  { code: '광주', name: '광주' },
  { code: '강남', name: '강남' },
  { code: '경주', name: '경주' },
  { code: '속초', name: '속초' },
  { code: '남원', name: '남원' },
  { code: '양평', name: '양평' },
  { code: '전주', name: '전주' },
  { code: '가평', name: '가평' },
  { code: '김천', name: '김천' },
  { code: '충북', name: '충북' },
];

function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const navigate = useNavigate();

  // 선택된 지역 코드들
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);

  // 날짜 선택
  const [checkInDate, setCheckInDate] = useState<Date | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(null);

  // 인원수
  const [guestCount, setGuestCount] = useState<GuestCount>({
    adults: 2,
    children: 0,
    infants: 0,
  });
  const [totalGuests, setTotalGuests] = useState<number>(2);

  // GuestSelector 초기화를 위한 key
  const [resetKey, setResetKey] = useState<number>(0);

  // 지역 선택/해제
  const toggleRegion = (regionCode: string) => {
    if (regionCode === '전체') {
      // "전체" 선택 시 모든 지역 해제
      setSelectedRegions([]);
    } else {
      setSelectedRegions((prev) =>
        prev.includes(regionCode)
          ? prev.filter((code) => code !== regionCode)
          : [...prev, regionCode]
      );
    }
  };

  // 인원수 변경 핸들러
  const handleGuestChange = (guests: GuestCount, total: number) => {
    setGuestCount(guests);
    setTotalGuests(total);
  };

  // 초기화
  const handleReset = () => {
    setSelectedRegions([]);
    setCheckInDate(null);
    setCheckOutDate(null);
    setGuestCount({ adults: 2, children: 0, infants: 0 });
    setTotalGuests(2);
    // GuestSelector 강제 리렌더링을 위해 key 변경
    setResetKey(prev => prev + 1);
  };

  // 검색
  const handleSearch = () => {
    // 쿼리 파라미터 생성
    const params = new URLSearchParams();

    // 지역 코드 추가
    if (selectedRegions.length > 0) {
      selectedRegions.forEach((code) => {
        params.append('regionCodes', code);
      });
    }

    // 날짜 추가
    if (checkInDate) {
      params.append('checkIn', format(checkInDate, 'yyyy-MM-dd'));
    }
    if (checkOutDate) {
      params.append('checkOut', format(checkOutDate, 'yyyy-MM-dd'));
    }

    // 인원수 추가
    params.append('people', totalGuests.toString());

    // 숙소 리스트 페이지로 이동
    navigate(`/accommodations?${params.toString()}`);
    onClose();
  };

  return (
    <Modal show={isOpen} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>숙소 검색</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* 날짜 선택 */}
        <div className="mb-4">
          <label className="form-label fw-semibold mb-3">
            <i className="bi bi-calendar-event me-2"></i>
            날짜
          </label>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label text-muted small">체크인</label>
              <DatePicker
                selected={checkInDate}
                onChange={(date) => setCheckInDate(date)}
                selectsStart
                startDate={checkInDate}
                endDate={checkOutDate}
                minDate={new Date()}
                dateFormat="yyyy-MM-dd"
                locale={ko}
                className="form-control"
                placeholderText="체크인 날짜"
              />
            </div>
            <div className="col-md-6">
              <label className="form-label text-muted small">체크아웃</label>
              <DatePicker
                selected={checkOutDate}
                onChange={(date) => setCheckOutDate(date)}
                selectsEnd
                startDate={checkInDate}
                endDate={checkOutDate}
                minDate={checkInDate || new Date()}
                dateFormat="yyyy-MM-dd"
                locale={ko}
                className="form-control"
                placeholderText="체크아웃 날짜"
              />
            </div>
          </div>
        </div>

        {/* 인원 선택 */}
        <div className="mb-4">
          <label className="form-label fw-semibold mb-3">
            <i className="bi bi-people-fill me-2"></i>
            인원
          </label>
          <GuestSelector
            key={resetKey}
            onGuestChange={handleGuestChange}
            initialGuests={guestCount}
          />
        </div>

        {/* 지역 선택 */}
        <div className="mb-4">
          <label className="form-label fw-semibold mb-3">
            <i className="bi bi-geo-alt-fill me-2"></i>
            지역
          </label>
          <div className="row g-2">
            {REGIONS.map((region) => (
              <div key={region.code} className="col-6 col-sm-4 col-md-3">
                <button
                  type="button"
                  className={`btn w-100 ${
                    region.code === '전체'
                      ? selectedRegions.length === 0
                        ? 'btn-dark'
                        : 'btn-outline-dark'
                      : selectedRegions.includes(region.code)
                      ? 'btn-dark'
                      : 'btn-outline-dark'
                  }`}
                  onClick={() => toggleRegion(region.code)}
                  style={{
                    borderRadius: '20px',
                    padding: '12px 20px',
                    fontSize: '0.95rem',
                    fontWeight: '500'
                  }}
                >
                  {region.name}
                </button>
              </div>
            ))}
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer className="d-flex justify-content-between">
        <Button variant="outline-dark" onClick={handleReset}>
          초기화
        </Button>
        <Button variant="dark" onClick={handleSearch}>
          검색
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default SearchModal;
