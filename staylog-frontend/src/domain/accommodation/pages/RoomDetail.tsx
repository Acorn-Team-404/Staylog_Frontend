import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Container, Row, Col, Card, Button, Form, Spinner, Offcanvas } from "react-bootstrap";
import type { RoomDetailDto } from "../types/RoomDetailDto";
import api from "../../../global/api";

import BookingPanel from "../components/BookingPanel";
import useIsMobile from "../hooks/useIsMobile";
import FloatingReserveBubble from "../components/FloatingReserveBubble";


function RoomDetail() {

  const { roomId } = useParams(); // ← URL에서 roomId 추출
  const [roomDetail, setRoomDetail] = useState<RoomDetailDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [openReserve, setOpenReserve] = useState(false);
  const isMobile = useIsMobile(); //모바일 크기일 때 true

  //숙소정보
  const featchRoom = () => {
    if (!roomId) {
      setError("유효하지 않은 객실 경로입니다.");
      return;
    }
    api.get<RoomDetailDto>(`/v1/room/${roomId}`)
      .then(res => {
        setRoomDetail(res)
        setError(null)
      })
      .catch((err) => {
        console.error(err)
        setError("객실 정보를 불러오지 못했습니다.");
      }
      )
  }

  //블락할 날짜 가져오기
  useEffect(() => {
    if (!roomId) return;

    const today = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(today.getMonth() + 2); // 예: 2개월치만 조회

    const from = today.toISOString().split("T")[0];
    const to = nextMonth.toISOString().split("T")[0];


    api.get<string[]>(`/v1/${roomId}/blocked`, {
      params: { from, to },
    })
      .then(res => {
        setBlockedDates(res)
        setError(null)
      })
      .catch((err) => {
        console.error(err)
      })
  }, [roomId])


  const handleReserve = () => {
    alert("예약하기");
  };

  useEffect(() => {
    featchRoom();
  }, [roomId])

  //지도 가져가기 => 채린이 숙소 상세에 넣을거



  if (!roomDetail) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" /> 로딩 중...
      </div>
    );
  }



  return <>

    <Container className="my-4">
      <Card className="mb-4">
        <Card.Img variant="top"
          src={"https://picsum.photos/1200/500"}
          alt="숙소 이미지">
        </Card.Img>
      </Card>

      <Row>
        <Col lg={7}>
          <h2>객실명 : {roomDetail.name}</h2>
          <section className="md-4">
            <h3>객실 규정</h3>
            <ul>
              <li>체크인 시간 : {roomDetail.checkInTime}</li>
              <li>체크아웃 시간 : {roomDetail.checkOutTime}</li>
              <li>기준 인원 : 성인 {roomDetail.maxAdult}, 어린이 {roomDetail.maxChildren}, 영유아 {roomDetail.maxInfant}</li>
            </ul>
            <h3>편의시설</h3>
            <section className="mt-4">
              <h3 className="h5 mb-3">편의시설</h3>
              <div className="d-flex flex-wrap gap-4 fs-6">
                <div className="d-flex align-items-center gap-1">
                  <i className="bi bi-wifi fs-4"></i>
                  <span>와이파이</span>
                </div>
                <div className="d-flex align-items-center gap-1">
                  <i className="bi bi-cup-hot fs-4"></i>
                  <span>커피머신</span>
                </div>
                <div className="d-flex align-items-center gap-1">
                  <i className="bi bi-webcam fs-4"></i>
                  <span>CCTV</span>
                </div>
                <div className="d-flex align-items-center gap-1">
                  <i className="bi bi-p-square fs-4"></i>
                  <span>주차가능</span>
                </div>
                <div className="d-flex align-items-center gap-1">
                  <i className="bi bi-water fs-4"></i>
                  <span>수영장</span>
                </div>
              </div>
            </section>





          </section>

        </Col>

        {/* 데스크탑(>=lg)에서는 오른쪽 고정, 모바일(<lg)에서는 숨김 */}
        <Col lg={5} className="d-none d-lg-block">
          <div style={{ position: "sticky", top: 16 }}>
            <BookingPanel
              name="INSIDE (2F)"
              pricePerNight={184000}
              nights={2}
              onReserve={() => alert("예약하기")}
            />
          </div>
        </Col>
      </Row>
    </Container>

    {/* 모바일: 말풍선 버튼 */}
    {isMobile && <FloatingReserveBubble onClick={() => setOpenReserve(true)} />}

    {/* 모바일: 바텀시트 Offcanvas */}
    <Offcanvas
      show={openReserve}
      onHide={() => setOpenReserve(false)}
      placement="bottom"
      className="d-lg-none"
      style={{ height: "75vh" }} // 바텀시트 높이
      aria-labelledby="reserve-panel-title"
    >
      <Offcanvas.Header closeButton>
        <Offcanvas.Title id="reserve-panel-title">예약</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <BookingPanel
          name={roomDetail.name}
          pricePerNight={184000}
          nights={2}
          onReserve={() => {
            setOpenReserve(false);
            handleReserve();
          }}
          disabledDates={blockedDates}
        />
      </Offcanvas.Body>
    </Offcanvas>
    <Container></Container>

  </>
}

export default RoomDetail;