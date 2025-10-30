
import { useParams } from 'react-router-dom';
import '../css/AccommodationDetail.css';

import RoomList from '../components/RoomList'; // RoomList 임포트
import { useAcDetail } from '../hooks/useAccommodationDetail';
import { useState } from 'react';
import type { RoomList as RoomType, AccommodationDetail as AcDetailType } from '../types/accommodation';
import ReservationForm from './ReservationForm';

// 시간 포맷팅 헬퍼
const formatTime = (isoString: string | undefined) => {
    if (!isoString) return '정보 없음';
    return isoString.substring(11, 16);
}

function AccommodationDetail() {
    const { id: idString } = useParams<{ id: string }>();
    const accommodationId = idString ? parseInt(idString) : undefined;

    if (!accommodationId) return <div>숙소 ID가 없습니다.</div>;

    const { data, isLoading, error } = useAcDetail(accommodationId);

    // 선택된 객실 상태 관리
    const [selectedRoom, setSelectedRoom] = useState<RoomType | null>(null);

    // 예약 폼에서 예약 버튼 클릭 시 호출
    const handleReservation = (reservationData: { roomId: number; date: string; guests: number }) => {
        console.log(`[Detail Page] 예약 시도: 숙소 ID ${accommodationId}, 객실 ID ${reservationData.roomId}, 날짜: ${reservationData.date}, 인원: ${reservationData.guests}`);
        alert(`예약 정보 확인: 객실 ${reservationData.roomId}, 날짜: ${reservationData.date}, ${reservationData.guests}명`);
    };

    // 객실 선택 시
    const handleSelectRoom = (room: RoomType) => {
        setSelectedRoom(room);
    };

    if (isLoading) {
        return <div style={{ padding: '40px', textAlign: 'center', fontSize: '1.2em' }}>⏳ 숙소 정보를 불러오는 중입니다...</div>;
    }
    if (error) {
        return <div style={{ padding: '40px', color: 'red', textAlign: 'center', fontSize: '1.2em' }}>⚠️ 데이터 로드 실패: {error}</div>;
    }
    if (!data) {
        return <div style={{ padding: '40px', textAlign: 'center', fontSize: '1.2em' }}>정보 없음: 숙소 정보를 찾을 수 없습니다.</div>;
    }

    return (
        <div className="accommodation-detail-container">
            <h1>{data.name}</h1>
            <p style={{ color: '#555', marginBottom: '20px' }}>{data.typeName} | 평점: ⭐(추후 추가)</p>
            
            <div className="image-slider-area">
                <p>**[영역 1]** 이미지 슬라이더 (ImageSlider.tsx)</p>
            </div>
            
            <div className="detail-grid">
                {/* 왼쪽 상세 내용 */}
                <div>
                    <h2>📝 숙소 소개</h2>
                    <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', color: '#333' }}>{data.description}</p>
                    
                    <h3 className="section-title">체크인 / 체크아웃 시간</h3>
                    <p className="check-time-info"><strong>체크인:</strong> {formatTime(data.checkInTime)}</p>
                    <p className="check-time-info"><strong>체크아웃:</strong> {formatTime(data.checkOutTime)}</p>
                    
                    <h2 className="section-title">🛏️ 객실 목록</h2>
                    
                    {/* <ul> 목록 대신 RoomList 컴포넌트 사용 */}
                    {data.rooms && data.rooms.length > 0 ? (
                        <RoomList 
                            rooms={data.rooms} 
                            onSelect={handleSelectRoom} 
                        />
                    ) : (
                        <div className="placeholder-box">
                            <p>등록된 객실이 없습니다.</p>
                        </div>
                    )}
                    
                    <h2 className="section-title">🗣️ 리뷰</h2>
                    <div className="placeholder-box">
                        <p>**[영역 9]** 리뷰 목록 (ReviewList.tsx)</p>
                    </div>
                    
                    <h3 className="section-title" style={{ marginTop: '40px' }}>🗺️ 숙소 위치</h3>
                    <p style={{ color: '#555' }}>{data.address} ({data.regionName})</p>
                    
                    <div className="map-area">
                        <p>**[영역 15]** 지도 컴포넌트</p>
                    </div>
                    
                    <h2 className="section-title">안내 사항</h2>
                    <div className="placeholder-box">
                        <p>**[영역 8]** 이용안내, 환불 규정 등</p>
                    </div>
                </div>

                {/* 오른쪽 예약 섹션 */}
                <div className="sidebar">
                    {/* ReservationForm으로 선택된 객실 ID/정보 전달 */}
                    <ReservationForm 
                        accommodationId={data.accommodationId!} 
                        rooms={data.rooms} 
                        selectedRoomId={selectedRoom?.roomId}
                        onSelectRoom={handleSelectRoom} // RoomList가 선택하면, 폼도 업데이트 되도록 연결
                        onReserve={handleReservation} 
                    />
                </div>
            </div>
        </div>
    );
}

export default AccommodationDetail;