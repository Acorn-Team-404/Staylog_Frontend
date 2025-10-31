// 검색 요청 파라미터
export interface SearchAccommodationsRequest {
  regionCodes?: string[];  // 지역 코드 배열
  people?: number;         // 총 인원수 (성인 + 어린이 + 유아)
  checkIn?: string;        // 체크인 날짜 (yyyy-MM-dd)
  checkOut?: string;       // 체크아웃 날짜 (yyyy-MM-dd)
  order?: 'lowPrice' | 'highPrice' | 'new' | 'popular';  // 정렬 방식
  lastAccomId?: number;    // 무한스크롤 마지막 ID
}

// 숙소 리스트 응답
export interface AccommodationListItem {
  accommodationId: number;
  accommodationName: string;
  regionName: string;
  minCapacity: number;
  maxCapacity: number;
  basePrice: number;
  reservationCount: number;
  mainImg: string[];  // 대표 이미지 배열 (캐러셀용)
}

// 인원 수 정보
export interface GuestCount {
  adults: number;    // 성인
  children: number;  // 어린이
  infants: number;   // 영유아
}

// 지역 정보
export interface Region {
  code: string;
  name: string;
}

// 정렬 옵션
export interface SortOption {
  value: 'lowPrice' | 'highPrice' | 'new' | 'popular';
  label: string;
}
