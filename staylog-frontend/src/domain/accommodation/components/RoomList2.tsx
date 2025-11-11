import { getImageUrl } from '../../../global/hooks/getImageUrl';
import type { AccommodationRoomListType } from '../types/AccommodationType';
import { Card, Row, Col, Button, Image } from 'react-bootstrap';

interface RoomListProps {
  rooms: AccommodationRoomListType[];
  onSelect: (room: AccommodationRoomListType) => void;
  currentRoomId?: number; 
}

const RoomList2 = ({ rooms, onSelect, currentRoomId}: RoomListProps) => {

  const filteredRooms = rooms.filter(room => room.roomId !== currentRoomId);
  return <>
    <div>
      {filteredRooms.map(room => (
        <Card key={room.roomId} className="mb-4 shadow-sm border-0" onClick={() => onSelect(room)}
          style={{ cursor: "pointer", overflow: "hidden", borderRadius: "0.3rem" }}>
          <Row className="g-0 align-items-stretch">
            {/* 이미지 영역 */}
            <Col md={6} style={{ padding: 0 }}>
              <Image
                src={getImageUrl("ROOM", room.roomId)}
                alt={`${room.name} 이미지`}
                fluid
                style={{ height: "13.5rem", width: "100%", objectFit: "cover" }}
              />
            </Col>

            {/* 객실 정보 영역 */}
            <Col md={6}>
              <Card.Body className="d-flex flex-column justify-content-between" style={{ height: '100%' }}>
                {/* 객실명, 객실 최대 인원수, 객실 타입*/}
                <div>
                  <Card.Title style={{ fontSize: "1.15rem", fontWeight: 700 }}>{room.name}</Card.Title>
                  <Card.Text style={{ fontSize: "0.8rem" }}>
                    최대 {room.maxGuest}명 | {room.rmTypeName}
                  </Card.Text>
                </div>

                {/* 객실 가격, 버튼*/}
                <div className="d-flex justify-content-between align-items-center">
                  <span style={{ fontWeight: 800, fontSize: "1.2rem", color: "#000" }}>
                    {room.price.toLocaleString()}원
                  </span>
                  <Button variant="dark"
                    onClick={(e) => { e.stopPropagation(); onSelect(room); }}
                    style={{ fontSize: "0.9rem", fontWeight: 700 }}>
                    객실 선택
                  </Button>
                </div>
              </Card.Body>
            </Col>
          </Row>
        </Card>
      ))}
    </div>
  </>
};

export default RoomList2;
