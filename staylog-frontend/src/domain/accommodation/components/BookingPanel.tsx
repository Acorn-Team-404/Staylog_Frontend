import { useEffect, useMemo, useRef, useState } from "react";
import { Button, Card, Form } from "react-bootstrap";
import DatePicker from "react-datepicker";
import { ko } from "date-fns/locale";
import type { AccommodationRoomListType } from "../types/AccommodationType";
import { getImageUrl } from "../../../global/hooks/getImageUrl";

// 예약 정보 타입
export interface BookingData {
  roomId: number;
  checkInStr: string;   // YYYY-MM-DD (로컬 기준)
  checkOutStr: string;  // YYYY-MM-DD
  adults: number;
  children: number;
  infants: number;
  totalPrice: number;
  nights: number;

}
type Props = {
  // 상단 탭
  onClickSchedule?: () => void;
  onClickGuests?: () => void;
  // 객실 정보
  name: string;
  imageUrl?: string | null;
  rooms?: AccommodationRoomListType[];
  onReserve?: (bookingData: BookingData) => void; // 예약 정보 전달
  // 예약 불가일
  disabledDates?: string[];
  onSelectRoom?: (room: AccommodationRoomListType) => void;
  // 객실 상세 페이지에서는 객실 목록 숨기기
  showRoomSelect?: boolean;

};

/** 상단 날짜 탭 표시 */
const formatDate = (date: Date | null): string =>
  !date ? "" : `${date.getMonth() + 1}.${date.getDate()}`;


// 금액 원화 형식으로 표시
const formatCurrency = (amount: number): string => {
  return amount.toLocaleString("ko-KR");
};

function BookingPanel({
  rooms = [],
  onReserve,
  disabledDates = [],
  onSelectRoom,
  showRoomSelect = true,
}: Props) {

  //달력 열림 닫힘 상태
  const [openCalendar, setOpenCalendar] = useState(false);
  // 인원 열림 닫힘 상태
  const [openGuest, setOpenGuest] = useState(false);

  // 체크인 체크아웃 날짜 상태
  const [[checkIn, checkOut], setRange] = useState<[Date | null, Date | null]>([null, null]);

  //화면의 가로폭에 따라 1개월 보일지 2개월 보일지 결정
  const [monthsShown, setMonthsShown] = useState(2);

  // 인원 수 상태 (성인, 어린이, 유아 순서)
  const [adultCount, setAdultCount] = useState(1);
  const [childCount, setChildCount] = useState(0);
  const [infantCount, setInfantCount] = useState(0);

  const [maxEndDate, setMaxEndDate] = useState<Date | null>(null);

  // 선택된 객실 (첫 번째 객실을 기본으로 표시)
  const [selectedRoom, setSelectedRoom] = useState<AccommodationRoomListType | null>(
    rooms.length > 0 ? rooms[0] : null
  );

  // 커스텀한 객실 드롭다운 상태
  const [openRoomDropdown, setOpenRoomDropdown] = useState(false);
  const roomWrapRef = useRef<HTMLDivElement>(null);

  // 래퍼(항상 DOM에 있음) & 팝업(열릴 때만 DOM에 생김)
  const wrapRef = useRef<HTMLDivElement>(null); // 달력과 인원 팝업을 감싸는 컨테이너
  const popRef = useRef<HTMLDivElement>(null);  // 달력과 팝업 자체를 참조

  // 달력 토글 핸들러
  const handleClickSchedule = () => setOpenCalendar(e => !e);


  /*블락 징검다리 제한 */

  // --- 유틸 추가 ---

  const toLocalMidnight = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

  const ymd = (d: Date) =>
    `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${String(d.getDate()).padStart(2, '0')}`;

  const addDays = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };

  const parseYmd = (s: string) => {
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, m - 1, d); // 로컬 자정
  };

  // 2) 선택 결과를 문자열 상태로 보관
  const [checkInStr, setCheckInStr] = useState<string | null>(null);
  const [checkOutStr, setCheckOutStr] = useState<string | null>(null);

  // ---- 예약 불가일 준비 ----
  // 문자열 세트(빠른 포함 체크) + 로컬 Date 정렬본(다음 블락 찾기용)
  // 예약불가일: 빠른 조회용 Set + 정렬 리스트
  const blockedSet = useMemo(() => new Set(disabledDates ?? []), [disabledDates]);

  const blockedDatesLocal = useMemo(
    () => (disabledDates ?? []).map(parseYmd).sort((a, b) => +a - +b),
    [disabledDates]
  );

  // 체크인 이후 "다음 블락 시작일" 찾기

  const nextBlockedAfter = (d: Date | null) => {
    if (!d) return null;
    for (const b of blockedDatesLocal) if (+b > +d) return b;
    return null;
  };

  // 오늘(로컬 자정) 계산
  const todayLocal = useMemo(() => {
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), t.getDate()); // 00:00
  }, []);

  // 날짜 선택 가능 여부(블락 + 징검다리)
  const filterDate = (date: Date) => {
    const s = ymd(date);            // ← toISOString() 금지(UTC로 하루 밀림)
    const today = new Date();
    const today0 = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    if (+date < +today0) return false;

    // 체크인만 선택된 상태라면: 체크아웃 선택 단계
    if (checkInStr && !checkOutStr) {
      const ci = parseYmd(checkInStr);
      if (+date <= +ci) return false;

      const nb = nextBlockedAfter(ci);
      if (nb) {
        const sNb = ymd(nb);

        //특수 케이스: 다음 블락 당일은 "체크아웃" 용도로 허용
        if (s === sNb) return true;

        // nb 이후는 차단
        if (+date > +nb) return false;
      }

      // 체크아웃 선택 단계에서는 블락셋이더라도 nb 이전일은 통과
      // (시작일이 정해져 있으므로 중간 블락은 서버가 애초에 안 주는 전제)
    } else {
      // 시작일 선택 단계에서는 블락일은 막는다
      if (blockedSet.has(s)) return false;
    }

    return true;
  };

  // nights 계산(정확히 일수)
  const nights = useMemo(() => {
    if (!checkInStr || !checkOutStr) return 0;
    const start = parseYmd(checkInStr);
    const end = parseYmd(checkOutStr);
    const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    return diff > 0 ? Math.round(diff) : 0;
  }, [checkInStr, checkOutStr]);

  // 총 인원/가격
  const totalGuests = adultCount + childCount + infantCount;
  const roomPrice = selectedRoom ? selectedRoom.price : 0;
  const totalPrice = roomPrice > 0 ? Math.round(roomPrice * nights) : 0;

  // 객실 변경
  const handleRoomChange = (roomId: number) => {
    const room = rooms.find((r) => r.roomId === roomId) || null;
    setSelectedRoom(room);
    onSelectRoom?.(room!);
  };

  const roomImageUrl = getImageUrl("ROOM", selectedRoom?.roomId ?? 0);

  // 블락 데이터가 바뀌면 징검다리 한계 재계산
  useEffect(() => {
    if (checkInStr) {
      const ci = parseYmd(checkInStr);
      const nb = nextBlockedAfter(ci);
      setMaxEndDate(nb ?? null);

      // 이미 고른 체크아웃이 한계를 넘으면 잘라줌
      if (checkOutStr) {
        const co = parseYmd(checkOutStr);
        if (nb && +co > +nb) {
            const capped = nb;
            setCheckOutStr(ymd(capped));
            setRange([ci, capped]);
     
        }
      }
    } else {
      setMaxEndDate(null);
    }
  }, [disabledDates]);


  // “밖 클릭” 한 번만 등록해서 팝업들 닫기
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      // 달력/인원 영역
      if (wrapRef.current && !wrapRef.current.contains(target)) {
        setOpenCalendar(false);
        setOpenGuest(false);
      }
      // 객실 드롭다운
      if (roomWrapRef.current && !roomWrapRef.current.contains(target)) {
        setOpenRoomDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);


  /*블락 징검다리 제한 */

  const parseYmdNoShift = (s: string) => {
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, m - 1, d, 12, 0, 0, 0); // 로컬 정오
  };


  // 화면 넓이에 따라 1/2개월 자동 전환
  useEffect(() => {
    const recalc = () => {
      const w = window.innerWidth;
      setMonthsShown(w < 1432 ? 1 : 2);
    };
    recalc();

    window.addEventListener("resize", recalc);
    return () => window.removeEventListener("resize", recalc);
  }, []);

  // // 달력이 열릴 때도 한 번 보정 (초기 렌더 오차 방지)
  // useEffect(() => {
  //   if (!openCalendar) return;
  //   const el = wrapRef.current;
  //   if (!el) return;
  //   const w = el.offsetWidth || window.innerWidth;
  //   setMonthsShown(w < 1100 ? 1 : 2);
  // }, [openCalendar]);

  return <>
    <Card className="bg-white">
      {/* 일정과 인원 탭*/}
      <Card.Header className="p-0 border-0">
        <div className="border-bottom bg-white d-flex" style={{ position: "relative" }}>
          {/* 일정 */}
          <div className="w-50 p-3 d-flex align-items-center justify-content-center cursor-pointer"
            onClick={handleClickSchedule} style={{ borderRight: "1px solid #dee2e6" }}>
            <i className="bi bi-calendar-event me-2 fs-5 text-secondary" />
            <span className="fw-bold">{checkIn && checkOut ? `${formatDate(checkIn)} - ${formatDate(checkOut)}` : "날짜 선택"}</span>
          </div>

          {/* 인원 */}
          <div
            className="w-50 p-3 d-flex align-items-center justify-content-center cursor-pointer"
            onClick={() => setOpenGuest(v => !v)}>
            <i className="bi bi-people me-2 fs-5 text-secondary" />
            <span className="fw-bold">{totalGuests}인</span>
          </div>

          {/* 달력과 인원 팝업 영역 */}
          <div ref={wrapRef} style={{ position: "absolute", top: "100%", left: 0, width: '100%', zIndex: 2000 }}>
            {/* 달력 날짜 선택 */}
            {openCalendar && (
              <div ref={popRef}
                className="border rounded bg-white shadow mt-1 p-2 d-inline-block"
                style={{ zIndex: 2000, width: "max-content", maxWidth: "90vw" }}>
                <DatePicker
                  inline
                  locale={ko}
                  selectsRange
                  startDate={checkIn}
                  endDate={checkOut}
                  monthsShown={monthsShown}
                  shouldCloseOnSelect={false}
                  filterDate={filterDate}
                  minDate={new Date()}
                  onChange={(v) => {
                    const [start, end] = v as [Date | null, Date | null];

                    // 선택 시각 상태(시각적)도 갱신해야 달력에 범위가 표시됨
                    setRange([start, end ?? null]);

                    if (start && !end) {
                      const startStr = ymd(start);
                      setCheckInStr(startStr);
                      setCheckOutStr(null);

                      // 다음 블락 전날까지 체크아웃 허용
                      const nb = nextBlockedAfter(start);
                      setMaxEndDate(nb ?? null);
                      return;
                    }

                    if (start && end) {
                      // 징검다리 한계 넘으면 컷
                      let cappedEnd = end;
                      if (maxEndDate && +end > +maxEndDate) {
                        cappedEnd = maxEndDate;
                        setRange([start, cappedEnd]);
                      }
                      setCheckInStr(ymd(start));
                      setCheckOutStr(ymd(cappedEnd));
                    }


                  }}
                />
                <div className="text-end mt-2">
                  <Button className="btn btn-dark" size="sm" variant="primary" onClick={() => setOpenCalendar(false)}>확인</Button>
                </div>
              </div>
            )}

            {/* 인원 선택 */}
            {openGuest && (
              <div className="position-absolute bg-white border rounded p-3 shadow-lg mt-1"
                style={{ zIndex: 2000, right: 0, minWidth: "15.7rem" }}>
                {[
                  { label: "성인", count: adultCount, setCount: setAdultCount, min: 1 },
                  { label: "어린이", count: childCount, setCount: setChildCount, min: 0 },
                  { label: "유아", count: infantCount, setCount: setInfantCount, min: 0 },
                ].map((item) => (
                  <div key={item.label} className="d-flex align-items-center justify-content-between mb-2">
                    <span>{item.label}</span>
                    <div>
                      <Button className="p-0 border-0" size="sm" variant="outline-secondary"
                        style={{ width: "30px", height: "30px" }}
                        onClick={() => item.setCount(c => Math.max(item.min, c - 1))}>
                        <i className="bi bi-dash"></i>
                      </Button>
                      <span className="mx-2 fw-bold">{item.count}</span>
                      <Button className="p-0 border-0" size="sm" variant="outline-secondary"
                        style={{ width: "1.8rem", height: "1.8rem" }}
                        onClick={() => {
                          const total = adultCount + childCount + infantCount;
                          const maxGuest = selectedRoom?.maxGuest ?? 10;
                          if (total < maxGuest) {
                            item.setCount(c => c + 1);
                          } else {
                            alert(`이 객실의 최대 인원은 ${maxGuest}명입니다`);
                          }
                        }}>
                        <i className="bi bi-plus"></i>
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="text-end mt-3">
                  <Button className="btn btn-dark" size="sm" variant="primary" onClick={() => setOpenGuest(false)}>확인</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card.Header>

      <Card.Body className="p-4">
        {/* 객실 정보 및 가격 표시 */}
        {selectedRoom && (
          <div className="mb-4 d-flex align-items-start">
            <div className="rounded me-3 bg-light d-flex justify-content-center align-items-center"
              style={{ width: "5rem", height: "5rem" }}>
              <img src={roomImageUrl} alt={selectedRoom.name} style={{ width: "5rem", height: "5rem", objectFit: "cover", borderRadius: "8px" }}
                className="fs-4" />

            </div>

            <div className="flex-grow-1">
              <div className="fw-bold mb-1" style={{ fontSize: "1.13rem" }}>{selectedRoom.name}</div>
              <p className="text-muted mb-2" style={{ fontSize: "0.8rem" }}>
                기본형 / 최대 {selectedRoom.maxGuest}명
              </p>

              <div className="d-flex align-items-center">
                <span className="fw-bold text-primary" style={{ fontSize: "1.1rem" }}>
                  ₩{formatCurrency(roomPrice)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 해당 숙소에 등록된 객실이 존재하지 않는다면 해당 내용 표시 */}
        {rooms.length === 0 && (
          <div className="mb-4 text-center p-3 border rounded bg-light">
            등록된 객실이 없습니다
          </div>
        )}

        {/* 객실 선택 커스텀 드롭다운 */}
        {rooms.length > 1 && showRoomSelect && (
          <div className="mb-4" ref={roomWrapRef}>
            <p className="fw-bold mb-2" style={{ fontSize: "1.0rem" }}>객실 선택</p>
            <div className="border rounded position-relative">
              <div className="p-2 d-flex justify-content-between align-items-center cursor-pointer"
                onClick={() => setOpenRoomDropdown(v => !v)}>
                <span>{selectedRoom?.name || "객실을 선택하세요"}</span>
                <i className={`bi ${openRoomDropdown ? "bi-chevron-up" : "bi-chevron-down"}`}></i>
              </div>
              {openRoomDropdown && (
                <div className="position-absolute bg-white border rounded w-100 mt-1 shadow-lg" style={{ zIndex: 2000 }}>
                  {rooms.map(room => (
                    <div key={room.roomId} className="roomSelect p-2 cursor-pointer"
                      onClick={() => {
                        handleRoomChange(room.roomId);
                        setOpenRoomDropdown(false);
                      }}>
                      {room.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 총액 계산 및 예약 버튼 */}
        {nights > 0 && selectedRoom && (
          <div className="p-3 border-top pt-4">
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">객실 요금</span>
              <span className="fw-bold">
                ₩{formatCurrency(roomPrice)} <i className="bi bi-x"></i> {nights} 박
              </span>
            </div>
            <div className="d-flex justify-content-between align-items-end mt-3">
              <span className="fs-5 fw-bold">총액</span>
              <span className="text-dark fw-bolder" style={{ fontSize: "1.5rem" }}>
                ₩{formatCurrency(totalPrice)}
              </span>
            </div>
          </div>
        )}

        {/* 예약 버튼 */}
        {/* <Button className="w-100 py-3 mt-2 fw-bold" variant="dark" style={{ fontSize: "1.1rem" }}
          onClick={() => {
            if (selectedRoom && checkInStr && checkOutStr && nights > 0) {
              onReserve?.({
                roomId: selectedRoom.roomId,
                checkInStr: checkInStr!,   // 혹은 API에 바로 문자열 전달
                checkOutStr: checkOutStr,
                adults: adultCount,
                children: childCount,
                infants: infantCount,
                totalPrice,
                nights,
                
              });
            }
          }}
          disabled={!selectedRoom || nights === 0}>
          예약하기
        </Button> */}
        <Button className="w-100 py-3 mt-2 fw-bold" variant="dark" style={{ fontSize: "1.1rem" }}
          onClick={() => {
            if (selectedRoom && checkInStr && checkOutStr && nights > 0) {

              // 💡최종 예약 데이터 콘솔 로그
              const finalBookingData: BookingData = {
                roomId: selectedRoom.roomId,
                checkInStr: checkInStr!,
                checkOutStr: checkOutStr,
                adults: adultCount,
                children: childCount,
                infants: infantCount,
                totalPrice,
                nights,
              };


              onReserve?.(finalBookingData);
            }
          }}
          disabled={!selectedRoom || nights === 0}>
          예약하기
        </Button>
      </Card.Body>
    </Card>
  </>
}

export default BookingPanel;