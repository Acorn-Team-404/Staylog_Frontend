import type { AccommodationRoomList } from '../types/accommodation';
import { Card, Row, Col, Button, Image } from 'react-bootstrap';

interface RoomListProps {
    rooms:AccommodationRoomList[];
    onSelect:(room:AccommodationRoomList) => void;
}

const RoomList = ({ rooms, onSelect } : RoomListProps) => {
    return <>
        <div>
            {rooms.map(room => (
                <Card key={room.roomId} className="mb-4 shadow-sm border-0" onClick={() => onSelect(room)} 
                    style={{ cursor:"pointer", overflow:"hidden", borderRadius:"16px" }}>
                    <Row className="g-0 align-items-stretch">
                        {/* 이미지 영역 */}
                        <Col md={5} style={{ padding:0 }}>
                            <Image
                                src={`https://placehold.co/200x150/F0F3F7/99AAB5?text=${encodeURIComponent(room.name)}`}
                                alt={`${room.name} 이미지`}
                                fluid
                                style={{ height:"220px", width:"100%", objectFit:"cover" }}
                            />
                        </Col>

                        {/* 객실 정보 영역 */}
                        <Col md={7}>
                            <Card.Body className="d-flex flex-column justify-content-between" style={{ height: '100%' }}>
                                {/* 객실명, 객실 최대 인원수, 객실 타입*/}
                                <div>
                                    <Card.Title>{room.name}</Card.Title>
                                    <Card.Text>
                                        최대 {room.maxGuest}명 | {room.rmTypeName}
                                    </Card.Text>
                                </div>

                                {/* 객실 가격, 버튼*/}
                                <div className="d-flex justify-content-between align-items-center">
                                    <span style={{ fontWeight: 800, fontSize: "1.2em", color: "#000" }}>
                                        {room.price.toLocaleString()}원
                                    </span>
                                    <Button variant="dark" onClick={(e) => { e.stopPropagation(); onSelect(room); }}>
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

export default RoomList;
