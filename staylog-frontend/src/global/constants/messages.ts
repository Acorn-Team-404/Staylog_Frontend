/**
 * 응답 코드별 메시지 매핑
 * 백엔드의 messages.properties와 동일한 메시지 체계를 사용합니다.
 */

import { SuccessCode, ErrorCode } from './ResponseCode';

/**
 * 성공 메시지 매핑
 * 백엔드: src/main/resources/messages.properties의 success.* 항목과 매칭
 */
export const SUCCESS_MESSAGES: Record<SuccessCode, string> = {
  // 일반 성공 메시지
  [SuccessCode.SUCCESS]: '요청이 성공적으로 처리되었습니다.',
  [SuccessCode.CREATED]: '생성이 완료되었습니다.',
  [SuccessCode.UPDATED]: '수정이 완료되었습니다.',
  [SuccessCode.DELETED]: '삭제가 완료되었습니다.',

  // Auth 도메인
  [SuccessCode.SIGNUP_SUCCESS]: '회원가입이 완료되었습니다.',
  [SuccessCode.LOGIN_SUCCESS]: '로그인되었습니다.',
  [SuccessCode.LOGOUT_SUCCESS]: '로그아웃되었습니다.',
  [SuccessCode.EMAIL_VERIFICATION_SENT]: '인증 이메일이 발송되었습니다.',
  [SuccessCode.EMAIL_VERIFICATION_SUCCESS]: '이메일 인증이 완료되었습니다.',
  [SuccessCode.PASSWORD_RESET_SUCCESS]: '비밀번호가 재설정되었습니다.',
  [SuccessCode.TOKEN_REFRESH_SUCCESS]: '토큰이 갱신되었습니다.',

  // User 도메인
  [SuccessCode.USER_PROFILE_UPDATED]: '프로필이 업데이트되었습니다.',
  [SuccessCode.USER_INFO_RETRIEVED]: '사용자 정보를 조회했습니다.',

  // Accommodation 도메인
  [SuccessCode.ACCOMMODATION_SEARCH_SUCCESS]: '숙소 검색이 완료되었습니다.',
  [SuccessCode.ACCOMMODATION_DETAIL_RETRIEVED]: '숙소 상세 정보를 조회했습니다.',

  // Booking 도메인
  [SuccessCode.BOOKING_CREATED]: '예약이 완료되었습니다.',
  [SuccessCode.BOOKING_RETRIEVED]: '예약 정보를 조회했습니다.',
  [SuccessCode.BOOKING_CANCELLED]: '예약이 취소되었습니다.',

  // Payment 도메인
  [SuccessCode.PAYMENT_PREPARED]: '결제 준비가 완료되었습니다.',
  [SuccessCode.PAYMENT_CONFIRMED]: '결제가 완료되었습니다.',
  [SuccessCode.PAYMENT_CANCELLED]: '결제가 취소되었습니다.',

  // Review 도메인
  [SuccessCode.REVIEW_CREATED]: '리뷰가 작성되었습니다.',
  [SuccessCode.REVIEW_UPDATED]: '리뷰가 수정되었습니다.',
  [SuccessCode.REVIEW_DELETED]: '리뷰가 삭제되었습니다.',
  [SuccessCode.COMMENT_CREATED]: '댓글이 작성되었습니다.',
  [SuccessCode.COMMENT_DELETED]: '댓글이 삭제되었습니다.',

  // Journal 도메인
  [SuccessCode.JOURNAL_CREATED]: '저널이 작성되었습니다.',
  [SuccessCode.JOURNAL_UPDATED]: '저널이 수정되었습니다.',
  [SuccessCode.JOURNAL_DELETED]: '저널이 삭제되었습니다.',

  // Search 도메인
  [SuccessCode.SEARCH_SUCCESS]: '검색이 완료되었습니다.',

  // Notification 도메인
  [SuccessCode.NOTIFICATION_RETRIEVED]: '알림을 조회했습니다.',
  [SuccessCode.NOTIFICATION_READ]: '알림을 읽음 처리했습니다.',
};

/**
 * 에러 메시지 매핑
 * 백엔드: src/main/resources/messages.properties의 error.* 항목과 매칭
 */
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  // 일반 에러 메시지
  [ErrorCode.BAD_REQUEST]: '잘못된 요청입니다.',
  [ErrorCode.UNAUTHORIZED]: '인증이 필요합니다. 로그인 후 이용해주세요.',
  [ErrorCode.FORBIDDEN]: '접근 권한이 없습니다.',
  [ErrorCode.NOT_FOUND]: '요청한 리소스를 찾을 수 없습니다.',
  [ErrorCode.METHOD_NOT_ALLOWED]: '허용되지 않은 요청 방식입니다.',
  [ErrorCode.CONFLICT]: '요청이 충돌했습니다.',
  [ErrorCode.INTERNAL_SERVER_ERROR]: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  [ErrorCode.SERVICE_UNAVAILABLE]: '서비스를 일시적으로 사용할 수 없습니다.',
  [ErrorCode.INVALID_INPUT]: '입력값이 올바르지 않습니다.',
  [ErrorCode.VALIDATION_FAILED]: '입력값 검증에 실패했습니다.',

  // Auth 도메인 에러
  [ErrorCode.DUPLICATE_LOGIN_ID]: '이미 사용 중인 아이디입니다.',
  [ErrorCode.DUPLICATE_EMAIL]: '이미 사용 중인 이메일입니다.',
  [ErrorCode.INVALID_CREDENTIALS]: '아이디 또는 비밀번호가 올바르지 않습니다.',
  [ErrorCode.EMAIL_VERIFICATION_FAILED]: '이메일 인증에 실패했습니다.',
  [ErrorCode.EMAIL_SEND_FAILED]: '이메일 발송에 실패했습니다.',
  [ErrorCode.VERIFICATION_CODE_EXPIRED]: '인증 코드가 만료되었습니다.',
  [ErrorCode.INVALID_VERIFICATION_CODE]: '인증 코드가 올바르지 않습니다.',
  [ErrorCode.PASSWORD_MISMATCH]: '비밀번호가 일치하지 않습니다.',
  [ErrorCode.WEAK_PASSWORD]: '비밀번호는 영문, 숫자, 특수문자를 포함한 8자 이상이어야 합니다.',
  [ErrorCode.TOKEN_EXPIRED]: '토큰이 만료되었습니다. 다시 로그인해주세요.',
  [ErrorCode.INVALID_TOKEN]: '유효하지 않은 토큰입니다.',
  [ErrorCode.REFRESH_TOKEN_NOT_FOUND]: '리프레시 토큰을 찾을 수 없습니다.',

  // User 도메인 에러
  [ErrorCode.USER_NOT_FOUND]: '존재하지 않는 사용자입니다.',
  [ErrorCode.USER_ALREADY_EXISTS]: '이미 존재하는 사용자입니다.',
  [ErrorCode.INVALID_USER_INFO]: '사용자 정보가 올바르지 않습니다.',
  [ErrorCode.USER_UPDATE_FAILED]: '사용자 정보 수정에 실패했습니다.',

  // Accommodation 도메인 에러
  [ErrorCode.ACCOMMODATION_NOT_FOUND]: '숙소를 찾을 수 없습니다.',
  [ErrorCode.ROOM_NOT_FOUND]: '객실을 찾을 수 없습니다.',
  [ErrorCode.ROOM_NOT_AVAILABLE]: '선택한 날짜에 예약 가능한 객실이 없습니다.',
  [ErrorCode.INVALID_SEARCH_PARAMS]: '검색 조건이 올바르지 않습니다.',

  // Booking 도메인 에러
  [ErrorCode.BOOKING_NOT_FOUND]: '예약 정보를 찾을 수 없습니다.',
  [ErrorCode.BOOKING_ALREADY_EXISTS]: '이미 예약이 존재합니다.',
  [ErrorCode.BOOKING_CANNOT_BE_CANCELLED]: '예약을 취소할 수 없습니다.',
  [ErrorCode.INVALID_BOOKING_DATE]: '예약 날짜가 올바르지 않습니다.',
  [ErrorCode.BOOKING_DATE_CONFLICT]: '선택한 날짜에 이미 예약이 존재합니다.',

  // Payment 도메인 에러
  [ErrorCode.PAYMENT_NOT_FOUND]: '결제 정보를 찾을 수 없습니다.',
  [ErrorCode.PAYMENT_ALREADY_PROCESSED]: '이미 처리된 결제입니다.',
  [ErrorCode.PAYMENT_FAILED]: '결제에 실패했습니다.',
  [ErrorCode.PAYMENT_AMOUNT_MISMATCH]: '결제 금액이 일치하지 않습니다.',
  [ErrorCode.PAYMENT_CANCELLED]: '결제가 취소되었습니다.',
  [ErrorCode.TOSS_PAYMENT_ERROR]: '토스 결제 처리 중 오류가 발생했습니다.',

  // Review 도메인 에러
  [ErrorCode.REVIEW_NOT_FOUND]: '리뷰를 찾을 수 없습니다.',
  [ErrorCode.REVIEW_ALREADY_EXISTS]: '이미 리뷰를 작성했습니다.',
  [ErrorCode.REVIEW_PERMISSION_DENIED]: '리뷰 수정 권한이 없습니다.',
  [ErrorCode.COMMENT_NOT_FOUND]: '댓글을 찾을 수 없습니다.',
  [ErrorCode.COMMENT_PERMISSION_DENIED]: '댓글 수정 권한이 없습니다.',

  // Journal 도메인 에러
  [ErrorCode.JOURNAL_NOT_FOUND]: '저널을 찾을 수 없습니다.',
  [ErrorCode.JOURNAL_PERMISSION_DENIED]: '저널 수정 권한이 없습니다.',

  // Search 도메인 에러
  [ErrorCode.SEARCH_FAILED]: '검색에 실패했습니다.',
  [ErrorCode.INVALID_SEARCH_QUERY]: '검색어가 올바르지 않습니다.',

  // Notification 도메인 에러
  [ErrorCode.NOTIFICATION_NOT_FOUND]: '알림을 찾을 수 없습니다.',
  [ErrorCode.NOTIFICATION_SEND_FAILED]: '알림 발송에 실패했습니다.',
};

/**
 * 클라이언트 측 유효성 검증 메시지
 * (백엔드에서 처리하지 않는 프론트엔드 전용 검증 메시지)
 */
export const VALIDATION_MESSAGES = {
  // 공통
  REQUIRED_FIELD: '필수 입력 항목입니다.',

  // Auth
  LOGIN_ID_REQUIRED: '아이디를 입력해주세요.',
  PASSWORD_REQUIRED: '비밀번호를 입력해주세요.',
  PASSWORD_MIN_LENGTH: '비밀번호는 최소 8자 이상이어야 합니다.',
  PASSWORD_CONFIRM_REQUIRED: '비밀번호 확인을 입력해주세요.',
  PASSWORD_CONFIRM_MISMATCH: '비밀번호가 일치하지 않습니다.',
  EMAIL_REQUIRED: '이메일을 입력해주세요.',
  EMAIL_INVALID_FORMAT: '올바른 이메일 형식이 아닙니다.',
  NAME_REQUIRED: '이름을 입력해주세요.',
  PHONE_REQUIRED: '전화번호를 입력해주세요.',
  PHONE_INVALID_FORMAT: '올바른 전화번호 형식이 아닙니다.',

  // Booking
  CHECK_IN_REQUIRED: '체크인 날짜를 선택해주세요.',
  CHECK_OUT_REQUIRED: '체크아웃 날짜를 선택해주세요.',
  CHECK_OUT_BEFORE_CHECK_IN: '체크아웃 날짜는 체크인 날짜 이후여야 합니다.',
  GUEST_COUNT_REQUIRED: '투숙객 수를 입력해주세요.',
  GUEST_COUNT_MIN: '투숙객 수는 최소 1명 이상이어야 합니다.',

  // Review
  RATING_REQUIRED: '평점을 선택해주세요.',
  REVIEW_CONTENT_REQUIRED: '리뷰 내용을 입력해주세요.',
  REVIEW_CONTENT_MIN_LENGTH: '리뷰 내용은 최소 10자 이상 작성해주세요.',
} as const;
