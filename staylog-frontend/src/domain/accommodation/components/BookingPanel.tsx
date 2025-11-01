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

  //달력 열림 닫힘 상태
  const [openCalendar, setOpenCalendar] = useState(false);

  //체크인, 체크아웃 상태
  const [[checkIn, checkOut], setRange] = useState<[Date | null, Date | null]>([null, null]);

  //화면의 가로폭에 따라 1개월 보일지 2개월 보일지 결정
  const [monthsShown, setMonthsShown] = useState(2);


  //달력 버튼 클릭 시 탈력 토굴
  const handleClickSchedule = () => {
    setOpenCalendar((v) => !v);
  };

  // 래퍼(항상 DOM에 있음) & 팝업(열릴 때만 DOM에 생김)
  const wrapRef = useRef<HTMLDivElement>(null);
  const popRef  = useRef<HTMLDivElement>(null);

    //넓이에 따라 1/2개월 자동 전환
    useEffect(() => {
      const recalc = () => {
        const w = window.innerWidth;
        setMonthsShown(w < 1100 ? 1 : 2); // ✅ 브레이크포인트를 1100~1200px쯤으로
      };

      recalc();
      window.addEventListener("resize", recalc);
      return () => window.removeEventListener("resize", recalc);
    }, []);



  // 2) 달력이 열릴 때도 한 번 보정 (초기 렌더 오차 방지)
  useEffect(() => {
    if (!openCalendar) return;
    const el = wrapRef.current;
    if (!el) return;
    const w = el.offsetWidth || window.innerWidth;
    setMonthsShown(w < 660 ? 1 : 2);
  }, [openCalendar]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
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
      <div ref={wrapRef} style={{ position: "relative" }}>
        <div className="d-flex gap-2 mb-2">
          <Button variant="light" className="flex-fill" onClick={handleClickSchedule}>
            <i className="bi bi-calendar-event me-2" /> 일정
          </Button>
          <Button variant="light" className="flex-fill" onClick={onClickGuests}>
            <i className="bi bi-people me-2" /> 인원
          </Button>
        </div>

        {openCalendar && (
          <div
            ref={popRef}
            className="border rounded bg-white shadow position-absolute mt-1 p-2 d-inline-block"
            style={{
              zIndex: 2000,
              top: "56px",
              left: 0,
              width: "max-content",
              maxWidth: "90vw",
            }}
          >
            <DatePicker
              key={monthsShown}
              inline
              locale={ko}
              selectsRange
              startDate={checkIn}
              endDate={checkOut}
              onChange={(v) => setRange(v as [Date | null, Date | null])}
              minDate={new Date()}
              monthsShown={monthsShown}
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