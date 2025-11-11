// src/domain/payment/types/index.ts

/**
 * 결제 준비 요청 (POST /v1/payments/prepare)
 */
export interface PreparePaymentRequest {
  bookingId: number;
  method: string;              // "PAY_CARD", "PAY_VIRTUAL_ACCOUNT", "PAY_BANK_TRANSFER" 등
  amount: number;              // 할인 전 원래 금액
  couponId?: number;           // 쿠폰 ID (선택 사항)
}

/**
 * 결제 준비 응답
 */
export interface PreparePaymentResponse {
  paymentId: number;
  orderId: string;             // bookingNum (Toss에 전달할 주문번호)
  amount: number;              // 최종 결제 금액 (쿠폰 할인 후)
  method: string;
  clientKey: string;           // Toss SDK 초기화용 클라이언트 키
  customerName: string;
}

/**
 * 결제 승인 요청 (POST /v1/payments/confirm)
 */
export interface ConfirmPaymentRequest {
  paymentKey: string;          // Toss에서 발급한 결제 키
  orderId: string;             // bookingNum (주문번호)
  amount: number;              // 검증용 금액
}

/**
 * 결제 결과 응답
 */
export interface PaymentResultResponse {
  paymentId: number;
  paymentKey: string;
  bookingId : number;
  orderId: string;
  amount: number;
  method: string;
  paymentStatus: string;       // "PAY_PAID", "PAY_FAILED"
  reservationStatus: string;   // "RES_CONFIRMED", "RES_CANCELED"
  requestedAt: string;
  approvedAt: string;
  failureReason?: string;      // 실패 사유 (실패 시)

  // 가상계좌 정보 (가상계좌인 경우 Toss 응답에 포함)
  virtualAccount?: {
    accountType: string;       // 계좌 타입
    accountNumber: string;     // 계좌번호
    bank: string;              // 은행명 (예: "신한")
    customerName: string;      // 예금주 (입금할 사람 이름)
    dueDate: string;           // 입금 기한 (ISO 8601)
    settlementStatus: string;  // 정산 상태
  };
}

