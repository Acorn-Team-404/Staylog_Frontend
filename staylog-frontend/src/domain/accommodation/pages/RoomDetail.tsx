import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Container, Row, Col, Card, Button, Form, Spinner } from "react-bootstrap";
import type { RoomDetailDto } from "../types/RoomDetailDto";
import api from "../../../global/api";

import BookingPanel from "../components/BookingPanel";

function RoomDetail() {

  const { roomId } = useParams(); // ← URL에서 roomId 추출
  const [roomDetail, setRoomDetail] = useState<RoomDetailDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [openCalender, setOpenCalender] = useState(false);
  const [openGuestCount, setOpenGuestCount] = useState(false);


  //숙소정보
  const featchRoom = () => {
    if (!roomId) {
      setError("유효하지 않은 객실 경로입니다.");
      return;
    }
    api.get<RoomDetailDto>(`/v1/room/${roomId}`)
      .then(res => {
        setRoomDetail(res.data)
        setError(null)
      })
      .catch(err => console.error(err))
  }

  useEffect(() => {
    featchRoom();
  }, [roomId])


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
            <div className="d-flex gap-4">
              <p>
                <i className="bi bi-wifi fs-4"></i> 와이파이
              </p>
              <p>
                <i className="bi bi-cup-hot fs-4"></i> 커피머신
              </p>
              <p>
                <i className="bi bi-webcam fs-4"></i> CCTV
              </p>
              <p>
                <i className="bi bi-p-square fs-4"></i> 주차가능
              </p>
              <p>
                <i className="bi bi-water fs-4"></i> 수영장
              </p>
            </div>




          </section>

        </Col>
        <Col lg={5}>
          <BookingPanel
            name="INSIDE (2F)"
            pricePerNight={184000}
            nights={2}
            onReserve={() => alert("예약하기")}
          />

        </Col>
      </Row>

    </Container>

    <Container></Container>

  </>
}

export default RoomDetail;