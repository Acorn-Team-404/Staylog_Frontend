import { Container, Row, Col, Carousel, Nav, Button, Image, Accordion, Card, Offcanvas, } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import type { AccommodationDetailType, AccommodationRoomListType } from '../types/AccommodationType';
import { useEffect, useState } from 'react';
import api from '../../../global/api';
import axios from 'axios';
import RoomList from '../components/RoomList';
import ReviewList from '../components/ReviewList';
import '../css/Accommodation.css';
import BookingPanel, { type BookingData } from '../components/BookingPanel';
import useIsMobile from '../hooks/useIsMobile';
import FloatingReserveBubble from '../components/FloatingReserveBubble';
import KakaoMap from '../components/KakaoMap';
import AccommodationInfo from '../components/AccommodationInfo';
import { createBooking } from '../../booking/api';
import type { CreateBookingRequest } from '../../booking/types';
import { formatDateToYYYYMMDD } from '../../../global/utils/date';
import ImageCarousel from '../../../global/components/ImageCarousel';
import { useModal } from '../../../global/hooks/useModal';
import type { ModalMode } from '../../../global/types';
import Modal from '../../../global/components/Modal';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../global/store/types';

/*
    Carousel : 숙소 대표 이미지
    Accordion : 클릭 시 펼쳐지는 기능
*/

function AccommodationDetail() {
  // 예비용 이미지
  const img1 = "https://picsum.photos/2100/900"; // 21:9 비율
  const img2 = "https://picsum.photos/2100/900/?grayscale";

  // URL 파라미터에서 숙소 ID 추출
  const { id: idString } = useParams<{ id: string }>();
  console.log("useParams 결과:", useParams()); // 무엇이 찍히는지 확인
  console.log("idString 값:", idString);      // idString이 무엇인지 확인
  const accommodationId = idString ? parseInt(idString) : undefined;

  // 숙소 상세 데이터
  const [data, setData] = useState<AccommodationDetailType | null>(null);
  // 로딩 상태
  const [loading, setLoading] = useState(true);
  // 에러 메세지
  const [error, setError] = useState<string | null>(null);
  // 선택된 객실
  const [selectedRoom, setSelectedRoom] = useState<AccommodationRoomListType | null>(null);
  // 페이지 이동
  const navigate = useNavigate();
  // 메뉴 탭 기본값을 summary 로 설정
  const [activeTab, setActiveTab] = useState("summary");
  // 모바일 체크
  const isMobile = useIsMobile(); // hook으로 모바일 체크
  const [openReserve, setOpenReserve] = useState(false);
  // 예약폼에서 선택된 객실
  const [bookingSelectedRoom, setBookingSelectedRoom] = useState<AccommodationRoomListType | null>(null);
  // 예약폼에서 해당 객실의 예약 불가 날짜
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  // 로그인 폼 모달
  const { isModalOpen, modalMode, openModal, closeModal } = useModal<ModalMode>('login');
  // 회원의 로그인 여부 (로그인이 되어 있으면 id 를 반환, 아니면 null)
  const userId = useSelector((state: RootState) => state.userInfo?.userId)

  // 숙소 상세데이터를 가져오는 API 호출
  useEffect(() => {
    // 숙소 번호가 없다면
    if (!accommodationId) return;

    const fetchDetail = async () => {
      // 로딩 시작
      setLoading(true);

      try {
        const res = await api.get(`/v1/accommodations/${accommodationId}`);
        // 데이터 상태 업데이트
        setData(res);
        // 확인용
        console.log(res);
      } catch (err) {
        // axios 에러 처리
        if (axios.isAxiosError(err)) {
          setError(
            err.response?.status === 404
              ? '해당 숙소는 존재하지 않습니다.'
              : `API 호출 실패: ${err.response?.status || '네트워크 오류'}`
          );
        } else {
          setError('알 수 없는 오류 발생');
        }
      } finally {
        // 로딩 종료
        setLoading(false);
      }
    };
    fetchDetail();
  }, [accommodationId]);

  // 해당 탭 메뉴로 스크롤 이동
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    const menuTab = document.querySelector('.menuTab') as HTMLElement;
    if (element) {
      // 상단 네비바 고정값
      const navHeight = 56;
      // 메뉴 탭 높이
      const menuHeight = menuTab?.offsetHeight || 0;
      // 탭 소제목 사이 간격
      const extraOffset = 10;
      // 브라우저 뷰포트 기준 섹션 상단 위치
      const elementPosition = element.getBoundingClientRect().top;
      // 최종 스크롤 위치 = 현재 스크롤 + 섹션 위치 - (네비바 높이 + 메뉴탭 높이 + 여백)
      const offsetPosition = elementPosition + window.scrollY - navHeight - menuHeight - extraOffset;
      // 계산된 위치로 부드럽게 자동 스크롤
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
      // 해당 메뉴 클릭 시 상태 업데이트
      setActiveTab(id);
    }
  };

  // 객실 선택 시 상태 업데이트와 페이지 이동
  const selectRoom = (room: AccommodationRoomListType) => {
    setSelectedRoom(room);
    navigate(`/room/${room.roomId}`)
  }

  // 예약하기 버튼 클릭 핸들러
  const handleReserve = async (bookingData: BookingData) => {
    if (!userId) {
        openModal('login');
        return;
    }

    try {
      // 예약 생성 요청 데이터 구성
      const request: CreateBookingRequest = {
        roomId: bookingData.roomId,
        checkIn: bookingData.checkInStr,
        checkOut: bookingData.checkOutStr,
        amount: bookingData.totalPrice,
        adults: bookingData.adults,
        children: bookingData.children,
        infants: bookingData.infants,
      };

      // 예약 생성 API 호출
      const booking = await createBooking(request);

      // 예약 성공 시 결제 페이지로 이동 (예약 정보 전달)
      navigate('/checkout', { state: { booking } });
    } catch (err) {
      console.error('예약 생성 실패:', err);
      alert('예약 생성에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // 데이터 로딩 직후 기본값으로 선택되는 객실의 블락 날짜를 표시해준다
  useEffect(() => {
    if (!data?.rooms?.length) return;
    setBookingSelectedRoom(data.rooms[0]);
  }, [data]);

  // 선택된 객실이 바뀔 때마다 블락 날짜 조회
  useEffect(() => {
    if (!bookingSelectedRoom) return;

    const today = new Date();
    const to = new Date();
    to.setMonth(today.getMonth() + 2);

    api.get<string[]>(`/v1/${bookingSelectedRoom.roomId}/blocked`, {
      params: {
        from: formatDateToYYYYMMDD(today),
        to: formatDateToYYYYMMDD(to),
      },
    })
      .then(res => setBlockedDates(res))
      .catch(() => setBlockedDates([]));
  }, [bookingSelectedRoom]);

  // 숙소 ID 가 없다면
  if (!accommodationId) {
    return <div>숙소 ID가 없습니다</div>;
  }

  // 페이지 로딩 중 표시
  if (loading) {
    return <div style={{ padding: "2.5rem", textAlign: "center" }}> 숙소 정보 불러오는 중</div>;
  }

  // 에러 발생 표시
  if (error) {
    return <div style={{ padding: "2.5rem", color: "#f00", textAlign: "center" }}> 데이터 불러오기 실패 {error}</div>;
  }

  // 데이터가 없다면 표시
  if (!data) {
    return <div style={{ padding: "2.5rem", textAlign: "center" }}>숙소 정보를 찾을 수 없습니다</div>;
  }

  // 전체 화면 너비 사용 : Container fluid
  return <>
    
    {/* 숙소 대표 이미지 영역 */}
    <div className="accommodationImages ratio mb-3">
      <ImageCarousel
        targetType='ACCOMMODATION'
        targetId={accommodationId}
        aspectRatio='21:9'
        rounded={false}
        arrowsOnHover={true}
        indicatorType='numbers-only'
      />
    </div>

    <Container className="p-0 accommodationAll">
      {/* 숙소 상세 내용, 객실 목록, 리뷰 목록, 위치 지도, 안내사항, 예약폼 영역 */}
      <Container className="mb-5 mt-0">
        <Row>
          {/* 왼쪽 : 숙소 상세페이지 영역*/}
          <Col lg={8}>
            <div className="left">
              <h3>{data.name}</h3>
              <small>{data.regionName}</small>

              {/* 메뉴 탭 버튼 영역*/}
              <div className="menuTab mb-5">
                <div className={`navItem ${activeTab === "summary" ? "active" : ""}`}
                  onClick={() => scrollToSection("summary")}>
                  소개
                </div>
                <div className={`navItem ${activeTab === "roomList" ? "active" : ""}`}
                  onClick={() => scrollToSection("roomList")}>
                  객실 선택
                </div>
                <div className={`navItem ${activeTab === 'reviewList' ? 'active' : ""}`}
                  onClick={() => scrollToSection("reviewList")}>
                  리뷰
                </div>
                <div className={`navItem ${activeTab === "locationMap" ? "active" : ""}`}
                  onClick={() => scrollToSection('locationMap')}>
                  위치
                </div>
                <div className={`navItem ${activeTab === "infoAccordion" ? "active" : ""}`}
                  onClick={() => scrollToSection('infoAccordion')}>
                  안내 사항
                </div>
              </div>

              {/* 숙소 상세 소개 */}
              <div className="accommodationDetail mb-5" id="summary">
                <h5 className="mb-3">숙소 소개</h5>
                {/* Quill 에디터로 등록한 가진과 내용을 출력 (html 요소 빼고) */}
                <p dangerouslySetInnerHTML={{ __html: data.description }} />
              </div>

              {/* 해당 숙소 객실 목록 컴포넌트 */}
              <div className="accommodationRoomList mb-4" id="roomList">
                <h5 className="mb-3">객실 목록</h5>
                {data.rooms && data.rooms.length > 0 ? (
                  <RoomList rooms={data.rooms} onSelect={selectRoom} />
                ) : (
                  <div className="placeholder-box"><p>등록된 객실이 없습니다</p></div>
                )}
              </div>

              {/* 해당 숙소 리뷰 목록 컴포넌트 */}
              <div className="accommodationReviewList mb-4" id="reviewList">
                <h5 className="mb-0">
                  방문자 리뷰 <small style={{ fontSize: "0.8rem", color: "rgba(101, 101, 101, 1)" }}>({data.reviews?.length || 0})</small>
                </h5>
                {data.reviews && data.reviews.length > 0 ? (
                  <ReviewList reviews={data.reviews.slice(0, 7)} accommodationId={Number(accommodationId)} />
                ) : (
                  <div className="placeholder-box mt-3"><p>등록된 리뷰가 없습니다</p></div>
                )}
              </div>

              {/* 숙소 위치 */}
              <div className="mb-4" id="locationMap">
                <h5 className="mb-3">위치</h5>
                <p style={{ fontSize: "0.9rem" }}>{data.address}</p>
                <div className="mapApi border bg-light" style={{ height: "25rem" }}>
                  <KakaoMap
                    latitude={data.latitude}
                    longitude={data.longitude}
                    height="25rem"
                    level={3}
                  />
                </div>
              </div>

              {/* 안내 사항 */}
              <AccommodationInfo />
            </div>
          </Col>

          {/* 오른쪽 : 예약폼 영역 */}
          <Col lg={4} className="d-none d-lg-block pt-lg-4">
            <div className="right sticky-top panelTop">
              <BookingPanel
                name={data.name}
                rooms={data.rooms || []}
                onReserve={(bookingData) => {
                  if (!userId) {
                      openModal('login'); // 로그인 모달 띄워줌
                      return;
                  }
                
                  handleReserve(bookingData); // 실제 예약 처리
                }}
                onClickGuests={() => alert("인원 선택창 열림")}
                showRoomSelect={true}
                disabledDates={blockedDates} // 선택된 객실 기준 블락 날짜 전달
                // 객실 선택 시 블락 날짜 업데이트
                onSelectRoom={(room) => setBookingSelectedRoom(room)} />
            </div>
          </Col>
        </Row>
      </Container>
    </Container>

    {/* 모바일 : 말풍선 버튼 */}
    {isMobile && !openReserve && (
      <FloatingReserveBubble onClick={() => setOpenReserve(true)} />
    )}

    {/* 모바일 : 예약폼 */}
    {isMobile && (
      <Offcanvas
        show={openReserve}
        onHide={() => setOpenReserve(false)}
        placement="bottom"
        className="d-lg-none"
        style={{ maxHeight: "70vh", minHeight: "fit-content" }}
        aria-labelledby="reserve-panel-title">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title id="reserve-panel-title">예약</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <BookingPanel
            name={data.name}
            rooms={data.rooms}
            onReserve={(bookingData) => {
              if (!userId) {
                openModal('login'); // 로그인 모달 띄우기
                return;
              }
              setOpenReserve(false); // 모바일에서 예약폼 닫기
              handleReserve(bookingData); // 실제 예약 처리
            }}
            onClickGuests={() => alert("인원 선택창 열림")}
            showRoomSelect={true} // 모바일에도 객실 선택 표시
            disabledDates={blockedDates} // 블락 날짜 전달
            onSelectRoom={(room) => setBookingSelectedRoom(room)} />
        </Offcanvas.Body>
      </Offcanvas>
    )}
    {isModalOpen && <Modal
            isOpen={isModalOpen}
            onClose={closeModal}
            mode={modalMode} />
         }
  </>
}

export default AccommodationDetail;