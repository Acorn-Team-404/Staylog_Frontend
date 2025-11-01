/**
 * 공통코드 단일 항목 DTO
 */
export interface CommonCodeDto {
  codeId: string;           // CODE_ID (예: REGION_SEOUL)
  parentId: string;         // PARENT_ID (예: REGION_TYPE)
  codeName: string;         // CODE_NAME (한글명: 서울)
  codeNameEn: string;       // CODE_NAME_EN (영문명: Seoul)
  description?: string;     // DESCRIPTION
  depth: number;            // DEPTH
  displayOrder: number;     // DISPLAY_ORDER
  useYn: string;            // USE_YN
  attr1?: string;           // ATTR1 (추가 속성)
  attr2?: string;           // ATTR2
  attr3?: string;           // ATTR3
  attr4?: string;           // ATTR4
  attr5?: string;           // ATTR5
}

/**
 * 그룹별 공통코드 응답 DTO
 */
export interface CommonCodeGroupResponse {
  regions: CommonCodeDto[];              // 지역 코드
  accommodationTypes: CommonCodeDto[];   // 숙소 타입
  roomTypes: CommonCodeDto[];            // 객실 타입
  roomStatus: CommonCodeDto[];           // 객실 상태
  reservationStatus: CommonCodeDto[];    // 예약 상태
  paymentStatus: CommonCodeDto[];        // 결제 상태
  paymentMethods: CommonCodeDto[];       // 결제 수단
  refundStatus: CommonCodeDto[];         // 환불 상태
  refundTypes: CommonCodeDto[];          // 환불 유형
  notificationTypes: CommonCodeDto[];    // 알림 유형
  boardTypes: CommonCodeDto[];           // 게시판 유형
  imageTypes: CommonCodeDto[];           // 이미지 타입
  userRoles: CommonCodeDto[];            // 사용자 권한
  userStatus: CommonCodeDto[];           // 사용자 상태
  sortOptions: CommonCodeDto[];          // 정렬 옵션
}

/**
 * 개별 공통코드 조회 요청
 */
export interface CommonCodeRequest {
  parentId: string;  // 부모 코드 ID (예: REGION_TYPE)
}
