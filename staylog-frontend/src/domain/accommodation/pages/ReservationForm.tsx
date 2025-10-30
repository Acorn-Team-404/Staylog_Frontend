// src/domain/accommodation/components/ReservationForm.tsx
import React, { useState } from "react";
import type { RoomList } from "../types/accommodation";

interface ReservationFormProps {
  accommodationId: number;
  rooms?: RoomList[]; // 부모에서 전달받은 객실 목록
  selectedRoomId?: number; // 선택된 객실 ID
  onSelectRoom?: (room: RoomList) => void; // 객실 선택 시 부모로 전달
  onReserve?: (data: { roomId: number; date: string; guests: number }) => void;
}

const ReservationForm: React.FC<ReservationFormProps> = ({
  accommodationId,
  rooms = [],
  selectedRoomId,
  onSelectRoom,
  onReserve
}) => {
  const [date, setDate] = useState("");
  const [guests, setGuests] = useState(1);
  const [roomId, setRoomId] = useState<number | undefined>(selectedRoomId);

  const handleRoomChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = Number(e.target.value);
    setRoomId(selectedId);
    const room = rooms.find(r => r.roomId === selectedId);
    if (room && onSelectRoom) onSelectRoom(room);
  };

  const handleReserve = () => {
    if (!date) {
      alert("날짜를 선택해주세요.");
      return;
    }
    if (!roomId) {
      alert("객실을 선택해주세요.");
      return;
    }

    if (onReserve) onReserve({ roomId, date, guests });
    console.log(`숙소 ${accommodationId} 예약 시도: 객실ID: ${roomId}, 날짜: ${date}, 인원: ${guests}`);
  };

  return (
    <div style={{ padding: 0 }}>
      <h3 style={{ marginBottom: '20px', fontSize: '1.3em' }}>예약 정보 입력</h3>

      <div style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '15px', borderRadius: '4px' }}>
        {/* 객실 선택 */}
        <label style={{ display: 'block', marginBottom: '10px' }}>
          객실 선택:
          <select
            value={roomId ?? ""}
            onChange={handleRoomChange}
            style={{ marginLeft: '10px', padding: '5px' }}
          >
            <option value="">-- 선택 --</option>
            {rooms.map(r => (
              <option key={r.roomId} value={r.roomId}>
                {r.name} (최대 {r.maxGuest}명)
              </option>
            ))}
          </select>
        </label>

        {/* 날짜 선택 */}
        <label style={{ display: 'block', marginBottom: '10px' }}>
          날짜 선택:
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{ marginLeft: '10px', padding: '5px' }}
          />
        </label>

        {/* 인원 선택 */}
        <label style={{ display: 'block' }}>
          인원:
          <input
            type="number"
            min={1}
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            style={{ marginLeft: '10px', padding: '5px', width: '60px' }}
          />
        </label>
      </div>

      <button
        onClick={handleReserve}
        style={{
          width: '100%',
          padding: '18px',
          backgroundColor: '#FF5A5F',
          border: 'none',
          color: 'white',
          fontSize: '1.1em',
          cursor: 'pointer',
          borderRadius: '8px',
          fontWeight: 'bold'
        }}
      >
        예약 가능 여부 확인
      </button>
    </div>
  );
};

export default ReservationForm;
