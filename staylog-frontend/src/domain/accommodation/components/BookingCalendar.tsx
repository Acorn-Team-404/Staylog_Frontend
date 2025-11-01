import { useEffect, useState } from "react";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_blue.css";
import { Korean } from "flatpickr/dist/l10n/ko";

// API 에서 받아오는 예약된 날짜 범위
interface BookedRange {
    startDate:string;
    endDate:string;
}

// Flatpickr의 disable 옵션에 사용될 날짜 범위
interface DisabledRange {
    from:string|Date;
    to:string|Date;
}

// BookingCalendar 컴포넌트가 받을 props
interface BookingCalendarProps {
    accommodationId:number; // 현재 숙소의 고유 번호
    roomId:number; // 현재 선택된 객실의 고유 번호
    onSelectRange:(checkIn: string, checkOut: string) => void;
}

const BookingCalendar = ({ roomId, onSelectRange }: BookingCalendarProps) => {
    // 해당 숙소의 해당 객실의 예약된 날짜 범위 목록을 저장
    const [bookedRanges, setBookedRanges] = useState<BookedRange[]>([]);
    // 고객이 캘린터에서 선택한 체크인과 체크아웃 날짜를 저장
    const [selectedDates, setSelectedDates] = useState<Date[]>([]);

    useEffect(() => {
        // 객실의 예약된 날짜 조회
        fetch(`/v1/rooms/${roomId}/booked-dates`)
            .then(res => res.json())
            .then((data: BookedRange[]) => {
                // 예약된 날짜 목록을 받아와서 저장
                setBookedRanges(data);
            }
        )
        .catch(err => console.error("예약 날짜 조회 실패:", err));
        }, [roomId]);

        // 예약된 구간 Flatpickr용 변환
        const disabledRanges: DisabledRange[] = bookedRanges.map(r => ({
            from : r.startDate,
            to : r.endDate,
        })
    );

    return <>
        <div className="calendar-container">
            <Flatpickr
                options={{
                    mode: "range", // 날짜 선택 모드 : 범위로 선택 (체크인, 체크아웃)
                    minDate: "today", // 오늘 이전 날짜는 선택할 수 없도록 비활성화
                    dateFormat: "Y-m-d", // 날짜 형식 :  "년-월-일"
                    locale: Korean, // 언어 : 한국어
                    disable: disabledRanges, // 조회된 예약 범위(disabledRanges)를 선택 불가 설정
                }}
                value={selectedDates} // 캘린더에 표시될 현재 선택된 날짜 값
                onChange={(dates: Date[]) => {
                    setSelectedDates(dates); // 선택된 날짜를 상태에 저장하여 캘린더를 업데이트
                    if (dates.length === 2) { // 체크인과 체크아웃 날짜가 모두 선택되었을 때만 실행
                        const [checkIn, checkOut] = dates.map(d =>
                        d.toISOString().slice(0, 10) // "YYYY-MM-DD" 형식의 문자열로 변환
                        );
                        onSelectRange(checkIn, checkOut); // 부모 컴포넌트로 선택된 날짜 범위를 전달
                    }
                }}
            />
        </div>
    </>
};

export default BookingCalendar;
