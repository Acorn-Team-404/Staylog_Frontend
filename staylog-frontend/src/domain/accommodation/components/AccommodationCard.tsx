import { useState } from 'react';
import { Carousel } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import type { AccommodationListItem } from '../types';

interface AccommodationCardProps {
  accommodation: AccommodationListItem;
}

function AccommodationCard({ accommodation }: AccommodationCardProps) {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);

  const handleSelect = (selectedIndex: number) => {
    setActiveIndex(selectedIndex);
  };

  const handleCardClick = () => {
    navigate(`/accommodation/${accommodation.accommodationId}`);
  };

  return (
    <div
      className="card h-100 shadow-sm"
      style={{ cursor: 'pointer', borderRadius: '12px', overflow: 'hidden' }}
    >
      {/* 이미지 캐러셀 */}
      <div onClick={handleCardClick} style={{ position: 'relative' }}>
        {accommodation.mainImg && accommodation.mainImg.length > 0 ? (
          <Carousel
            activeIndex={activeIndex}
            onSelect={handleSelect}
            interval={null}
            indicators={accommodation.mainImg.length > 1}
            controls={accommodation.mainImg.length > 1}
          >
            {accommodation.mainImg.map((img, index) => (
              <Carousel.Item key={index}>
                <img
                  src={img}
                  alt={`${accommodation.accommodationName} ${index + 1}`}
                  className="d-block w-100"
                  style={{
                    height: '240px',
                    objectFit: 'cover',
                  }}
                />
              </Carousel.Item>
            ))}
          </Carousel>
        ) : (
          <div
            className="bg-secondary d-flex align-items-center justify-content-center"
            style={{ height: '240px' }}
          >
            <span className="text-white">이미지 없음</span>
          </div>
        )}

        {/* 인원 수 표시 (우측 하단) */}
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            right: '10px',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            color: 'white',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '14px',
          }}
        >
          <i className="bi bi-people-fill me-1"></i>
          {accommodation.minCapacity}~{accommodation.maxCapacity}명
        </div>
      </div>

      {/* 숙소 정보 */}
      <div className="card-body" onClick={handleCardClick}>
        <h6 className="card-title fw-bold mb-2">{accommodation.accommodationName}</h6>
        <p className="card-text text-muted small mb-2">
          <i className="bi bi-geo-alt-fill me-1"></i>
          {accommodation.regionName}
        </p>
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <span className="text-primary fw-bold fs-5">
              ₩{accommodation.basePrice.toLocaleString()}
            </span>
            <span className="text-muted small"> / 박</span>
          </div>
          <div className="text-muted small">
            <i className="bi bi-star-fill text-warning me-1"></i>
            예약 {accommodation.reservationCount}건
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccommodationCard;
