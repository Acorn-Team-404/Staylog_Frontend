import { useEffect, useRef, useState } from "react";
import { Button, Card } from "react-bootstrap";
import DatePicker from "react-datepicker";
import { ko } from "date-fns/locale";


type Props = {
  // 상단 탭
  onClickSchedule?: () => void;
  onClickGuests?: () => void;

  // 객실 정보
  imageUrl?: string;
  name: string;

  // 금액 영역
  pricePerNight: number;      // 1박 기준가 (할인 적용가)
  nights: number;             // 숙박일수

  onReserve?: () => void;

  disabledDates?: string[];   //예약 불가일
};

function BookingPanel({
  onClickGuests,
  name,
  pricePerNight,
  nights,
  onReserve,
  disabledDates = []
}: Props) {

  const total = pricePerNight * nights;

  //달력 열림 닫힘 상태
  const [openCalendar, setOpenCalendar] = useState(false);

  //체크인, 체크아웃 상태
  const [[checkIn, checkOut], setRange] = useState<[Date | null, Date | null]>([null, null]);

  //달력 버튼 클릭 시 탈력 토굴
  const handleClickSchedule = () => {
    setOpenCalendar((v) => !v);
  };

  //바깥 부분 클릭 시 닫기
  const calRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (calRef.current && !calRef.current.contains(e.target as Node)) {
        setOpenCalendar(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // 예약 불가일 -> Date 배열
  const excludeDates = disabledDates.map((d) => new Date(d + "T00:00:00"));

  return <>
    <Card>
      <div>
        <Button onClick={handleClickSchedule}>
          <i className="bi bi-calendar-event me-2" />
          일정
        </Button>
        <Button onClick={onClickGuests}>
          <i className="bi bi-people me-2" />
          인원
        </Button>

        {/* 달력  */}
                {openCalendar && (
          <div
            ref={calRef}
            className="border rounded bg-white shadow position-absolute mt-1 p-2 d-inline-block"
            style={{ zIndex: 999, top: "56px", left: 0, height:"0px" }}
          >
            <DatePicker
              inline
              locale={ko}
              selectsRange
              startDate={checkIn}
              endDate={checkOut}
              onChange={(v) => setRange(v as [Date | null, Date | null])}
              minDate={new Date()}
              monthsShown={2}
              dateFormat="yyyy.MM.dd"
              excludeDates={excludeDates}
              
            />
            <div className="text-end">
              <Button size="sm" variant="primary" onClick={() => setOpenCalendar(false)}>
                확인
              </Button>
            </div>
          </div>
        )}
      </div>
      <Card.Body>
        <div>
          {name}
        </div>

        <div>
          {pricePerNight}
        </div>

        <div>
          <div>{pricePerNight * nights}</div>
        </div>

        <Button className="w-100" variant="dark" size="lg" onClick={onReserve}>
          예약하기
        </Button>
      </Card.Body>
    </Card>
  </>
}

export default BookingPanel;