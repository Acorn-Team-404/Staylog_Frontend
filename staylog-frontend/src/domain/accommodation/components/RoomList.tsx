import type { RoomList as RoomType } from '../types/accommodation';
import '../css/RoomList.css';

interface RoomListProps {
  rooms: RoomType[];
  onSelect: (room: RoomType) => void;
}

const RoomList = ({ rooms, onSelect }: RoomListProps) => {
  return (
    <div className="roomListContainer">
      {rooms.map(room => (
        <div
          key={room.roomId}
          className="roomListItem"
          onClick={() => onSelect(room)}
        >
          {/* 이미지 영역 */}
          <div className="roomImageArea">
            <img
              src={`https://placehold.co/150x100/F0F3F7/99AAB5?text=${encodeURIComponent(room.name)}`}
              alt={`${room.name} 이미지`}
              className="roomImage"
            />
          </div>

          {/* 정보 + 가격 영역 */}
          <div className="roomBodyContent">
            {/* 이름, 상세 정보 */}
            <div className="roomInfoArea">
              <div className="roomName">{room.name}</div>
              <div className="roomDetails">
                최대 {room.maxGuest}명 | 유형: {room.rmTypeName}
              </div>
            </div>

            {/* 가격 + 선택 버튼 */}
            <div className="roomPriceArea">
              <div className="roomPriceWrapper">
                <span className="roomPrice">
                  <strong>{room.price.toLocaleString()}원</strong>
                  <small className="priceUnit">/ 1박</small>
                </span>
              </div>
              <button className="selectBtn">객실 선택</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RoomList;
