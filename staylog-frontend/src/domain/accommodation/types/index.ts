// 숙소 리스트 아이템 (검색 결과)
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
