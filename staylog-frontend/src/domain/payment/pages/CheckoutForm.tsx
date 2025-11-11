import {
   Container,
   Row,
   Col,
   Form,
   Button,
   Card,
   ListGroup,
   InputGroup // 쿠폰 버튼을 위해 추가
} from 'react-bootstrap';
import { loadTossPayments } from '@tosspayments/payment-sdk';
import Modal from '../../../global/components/Modal';
import type { ModalMode } from '../../../global/types';
import { useModal } from '../../../global/hooks/useModal';
import { useEffect, useState } from 'react';
import type { couponType } from '../../coupon/types/couponTypes';
import { useLocation, useNavigate } from 'react-router-dom';
import type { BookingDetailResponse } from '../../booking/types';
import { preparePayment } from '../api';
import type { PreparePaymentRequest } from '../types';
import useGetNicknameFromToken from '../../auth/hooks/useGetNicknameFromToken';
import useCommonCodeSelector from '../../common/hooks/useCommonCodeSelector';

/**
 * 백엔드 결제 수단 코드를 Toss Payments SDK v2 결제 수단으로 매핑
 *
 * ⚠️ 중요: Toss Payments SDK v2는 영문 대문자 코드를 사용합니다!
 * https://docs.tosspayments.com/guides/v2/payment-window
 *
 * @param method - 백엔드 결제 수단 코드 (PAY_CARD, PAY_VIRTUAL_ACCOUNT 등)
 * @returns Toss Payments SDK v2 결제 수단 ('CARD', 'VIRTUAL_ACCOUNT', 'TRANSFER' 등)
 */
function mapPaymentMethodToToss(method: string): string {
   const mapping: Record<string, string> = {
      'PAY_CARD': 'CARD',                        // 신용/체크카드
      '가상계좌': 'VIRTUAL_ACCOUNT',  // 가상계좌
      'PAY_BANK_TRANSFER': 'TRANSFER',           // 실시간 계좌이체
      'PAY_KAKAOPAY': 'KAKAOPAY',                // 간편결제
      'PAY_NAVERPAY': 'NAVERPAY',                // 간편결제
      'PAY_TOSS': 'TOSSPAY',                     // 간편결제
      'PAY_EASY': 'EASY_PAY',                    // 간편결제 (일반)
      'PAY_MOBILE': 'MOBILE',                    // 휴대폰결제
   };
   return mapping[method] || 'CARD'; // 기본값: CARD
}

function CheckoutForm() {
   const location = useLocation();
   const navigate = useNavigate();
   const nickname = useGetNicknameFromToken();

   // location state에서 예약 정보 받기
   const booking = location.state?.booking as BookingDetailResponse | undefined;

   // CommonCodes에서 결제 수단 목록 가져오기
   const paymentMethodCodes = useCommonCodeSelector('paymentMethods');

   const {isModalOpen, modalMode, openModal, closeModal} = useModal<ModalMode>('none')

   const [couponInfo, setCouponInfo] = useState<couponType | null>(null)
   const [paymentMethod, setPaymentMethod] = useState<string>('PAY_CARD'); // 결제 수단
   const [isProcessing, setIsProcessing] = useState(false); // 결제 처리 중

   // 약관 동의 state
   const [agreements, setAgreements] = useState({
      all: false,
      terms: false,      // 필수: 이용규칙 및 취소/환불 규정
      privacy: false,    // 필수: 개인정보 수집 및 이용
      marketing: false   // 선택: 마케팅 정보 수신
   });

   // 🆕 URL 파라미터로 전달된 결제 실패 정보 확인
   useEffect(() => {
      const searchParams = new URLSearchParams(window.location.search);
      const errorCode = searchParams.get('code');
      const errorMessage = searchParams.get('message');

      if (errorCode && errorMessage) {
         alert(`결제 실패\n에러 코드: ${errorCode}\n메시지: ${decodeURIComponent(errorMessage)}`);
         console.error('[결제 실패]', { errorCode, errorMessage: decodeURIComponent(errorMessage) });

         // URL에서 에러 파라미터 제거 (다시 alert가 뜨지 않도록)
         window.history.replaceState({}, '', window.location.pathname + window.location.hash.split('?')[0]);
      }
   }, []);

   function handleApplyCoupon(coupon: couponType) {
      setCouponInfo(coupon); // 쿠폰 정보 state 설정
      closeModal();          // 로직 처리 후 모달 닫기
   }

   // 약관 동의 핸들러
   const handleAgreementChange = (type: 'all' | 'terms' | 'privacy' | 'marketing') => {
      if (type === 'all') {
         const newValue = !agreements.all;
         setAgreements({
            all: newValue,
            terms: newValue,
            privacy: newValue,
            marketing: newValue
         });
      } else {
         const newAgreements = {
            ...agreements,
            [type]: !agreements[type]
         };
         // 개별 체크 시 전체 동의 자동 업데이트
         newAgreements.all = newAgreements.terms && newAgreements.privacy && newAgreements.marketing;
         setAgreements(newAgreements);
      }
   };

   // 필수 약관 모두 동의했는지 확인
   const isRequiredAgreementsChecked = agreements.terms && agreements.privacy;

   useEffect(() => {
      // couponInfo가 들어오는지 확인
      console.log(couponInfo);

   }, [couponInfo])

   // 예약 정보가 없으면 홈으로 리다이렉트
   useEffect(() => {
      if (!booking) {
         alert('예약 정보가 없습니다.');
         navigate('/');
      }
   }, [booking, navigate]);

   // 쿠폰 할인 계산
   const discountAmount = couponInfo ? Math.round(booking!.amount * couponInfo.discount / 100) : 0;
   const finalAmount = booking ? booking.amount - discountAmount : 0;

   // 결제 처리 핸들러
   const handlePayment = async () => {
      if (!booking) return;

      // 필수 약관 동의 확인
      if (!isRequiredAgreementsChecked) {
         alert('필수 약관에 모두 동의해주세요.');
         return;
      }

      setIsProcessing(true);
      try {
         console.log('[결제 시작]', {
            bookingId: booking.bookingId,
            paymentMethod,
            amount: booking.amount,
            couponId: couponInfo?.couponId,
            discountAmount,
            finalAmount,
         });

         // 결제 준비 요청
         const request: PreparePaymentRequest = {
            bookingId: booking.bookingId,
            method: paymentMethod,
            amount: booking.amount, // 할인 전 금액
            couponId: couponInfo?.couponId,
         };

         console.log('[API 요청] /v1/payments/prepare', request);

         const prepareResponse = await preparePayment(request);

         console.log('[API 응답] /v1/payments/prepare', prepareResponse);

         // Toss Payments SDK v2 로드 (npm 패키지)
         console.log('[Toss SDK v2] loadTossPayments 호출 시작');
         const tossPayments = await loadTossPayments(prepareResponse.clientKey);
         console.log('[Toss SDK v2] 초기화 완료, clientKey:', prepareResponse.clientKey?.substring(0, 20) + '...');

         // 백엔드 결제 수단 코드를 Toss v2 API 형식으로 변환
         const tossPaymentMethod = mapPaymentMethodToToss(paymentMethod);

         console.log('🔍 [디버깅] paymentMethod:', paymentMethod);
         console.log('🔍 [디버깅] tossPaymentMethod:', tossPaymentMethod);

         // v2 결제 요청 파라미터 구성
         const requestParams: any = {
            method: tossPaymentMethod,                    // 'CARD', 'VIRTUAL_ACCOUNT' 등
            amount: prepareResponse.amount,               // 숫자로 전달
            orderId: prepareResponse.orderId,
            orderName: `${booking.accommodationName} - ${booking.roomName}`,
            customerName: prepareResponse.customerName,
            successUrl: `${window.location.origin}/#/payment/complete`,
            failUrl: `${window.location.origin}/#/checkout`,
         };

         // 가상계좌인 경우 validHours 추가
         if (paymentMethod === 'VIRTUAL_ACCOUNT') { mapPaymentMethodToToss
            requestParams.validHours = 24;  // 입금 유효 시간 (24시간)
         }

         console.log('[Toss SDK v2] requestPayment 호출', JSON.stringify(requestParams, null, 2));

         // Toss Payments v2 결제 요청
         await tossPayments.requestPayment(requestParams);

         console.log('[Toss SDK] requestPayment 완료 (successUrl로 리다이렉트됨)');
         
      } catch (error: any) {
         console.error('[결제 실패]', error);
         console.error('[에러 상세]', {
            message: error?.message,
            code: error?.code,
            response: error?.response?.data,
         });
         alert(`결제 준비에 실패했습니다.\n\n에러: ${error?.message || '알 수 없는 오류'}`);
      } finally {
         setIsProcessing(false);
      }
   };

   if (!booking) {
      return null;
   }

   return (
      <Container className="my-5">
         <h1 className="mb-4 h2">예약 확인 및 결제</h1>

         <Row>
            <Col lg={7}>
               {/* ----- 예약자 정보 ----- */}
               <Card className="mb-4">
                  <Card.Header as="h5">예약자 정보</Card.Header>
                  <Card.Body>
                     <Form.Group as={Row} className="mb-3">
                        <Form.Label column sm={3}>
                           예약자명
                        </Form.Label>
                        <Col sm={9}>
                           <Form.Control type="text" value={booking.guestName || nickname} readOnly />
                        </Col>
                     </Form.Group>

                     <Form.Group as={Row} className="mb-3">
                        <Form.Label column sm={3}>
                           성인:
                        </Form.Label>
                        <Col sm={9}>
                           <Form.Control type="text" value={`${booking.adults}명`} readOnly />
                        </Col>
                     </Form.Group>

                     <Form.Group as={Row} className="mb-3">
                        <Form.Label column sm={3}>
                           어린이:
                        </Form.Label>
                        <Col sm={9}>
                           <Form.Control type="text" value={`${booking.children}명`} readOnly />
                        </Col>
                     </Form.Group>

                     <Form.Group as={Row} className="mb-3">
                        <Form.Label column sm={3}>
                           영유아:
                        </Form.Label>
                        <Col sm={9}>
                           <Form.Control type="text" value={`${booking.infants}명`} readOnly />
                        </Col>
                     </Form.Group>

                     <Form.Group as={Row} className="mb-0">
                        <Form.Label column sm={3}>
                           총인원:
                        </Form.Label>
                        <Col sm={9}>
                           <Form.Control type="text" value={`${booking.totalGuestCount}명`} readOnly />
                        </Col>
                     </Form.Group>
                  </Card.Body>
               </Card>

               {/* ----- 결제 수단 ----- */}
               <Card className="mb-4">
                  <Card.Header as="h5">결제 수단 선택</Card.Header>
                  <Card.Body>
                     {/* 결제 수단 버튼 (세로 나열) */}
                     <div className="d-grid gap-3">
                        {/* 카드 결제 */}
                        <Button
                           variant={paymentMethod === 'PAY_CARD' ? 'primary' : 'outline-secondary'}
                           size="lg"
                           className="text-start py-3"
                           onClick={() => setPaymentMethod('PAY_CARD')}
                        >
                           카드 결제
                        </Button>

                        {/* 가상계좌 */}
                        <Button
                           variant={paymentMethod === 'VIRTUAL_ACCOUNT' ? 'primary' : 'outline-secondary'}
                           size="lg"
                           className="text-start py-3"
                           onClick={() => setPaymentMethod('VIRTUAL_ACCOUNT')}
                        >
                           가상계좌
                        </Button>

                        {/* 계좌이체 */}
                        <Button
                           variant={paymentMethod === 'PAY_BANK_TRANSFER' ? 'primary' : 'outline-secondary'}
                           size="lg"
                           className="text-start py-3"
                           onClick={() => setPaymentMethod('PAY_BANK_TRANSFER')}
                        >
                           계좌이체
                        </Button>

                        {/* 간편결제 */}
                        <Button
                           variant={paymentMethod === 'PAY_EASY' ? 'primary' : 'outline-secondary'}
                           size="lg"
                           className="text-start py-3"
                           onClick={() => setPaymentMethod('PAY_EASY')}
                        >
                           간편결제
                        </Button>

                        {/* 휴대폰결제 */}
                        <Button
                           variant={paymentMethod === 'PAY_MOBILE' ? 'primary' : 'outline-secondary'}
                           size="lg"
                           className="text-start py-3"
                           onClick={() => setPaymentMethod('PAY_MOBILE')}
                        >
                           휴대폰결제
                        </Button>
                     </div>
                  </Card.Body>
               </Card>

               {/* ----- 약관 동의 ----- */}
               <Card className="mb-4">
                  <Card.Header as="h5">약관 동의</Card.Header>
                  <Card.Body>
                     <Form.Check
                        type="checkbox"
                        id="terms-all"
                        label="전체 동의"
                        className="fw-bold mb-2"
                        checked={agreements.all}
                        onChange={() => handleAgreementChange('all')}
                     />
                     <hr />
                     <Form.Check
                        type="checkbox"
                        id="terms-1"
                        label="숙소 이용규칙 및 취소/환불 규정 동의 (필수)"
                        className="mb-2"
                        checked={agreements.terms}
                        onChange={() => handleAgreementChange('terms')}
                     />
                     <Form.Check
                        type="checkbox"
                        id="terms-2"
                        label="개인정보 수집 및 이용 동의 (필수)"
                        className="mb-2"
                        checked={agreements.privacy}
                        onChange={() => handleAgreementChange('privacy')}
                     />
                     <Form.Check
                        type="checkbox"
                        id="terms-3"
                        label="마케팅 정보 수신 동의 (선택)"
                        checked={agreements.marketing}
                        onChange={() => handleAgreementChange('marketing')}
                     />
                  </Card.Body>
               </Card>
            </Col>



            <Col lg={5}>
               {/* ----- 예약 숙소 정보 ----- */}
               <Card className="mb-4 position-sticky" style={{ top: '20px' }}>
                  <Card.Header as="h5">예약 숙소</Card.Header>
                  <Card.Body>
                     <Card.Title>{booking.accommodationName}</Card.Title>
                     <Card.Text>
                        {booking.roomName} ({booking.totalGuestCount}인 기준)
                     </Card.Text>
                     <Card.Text className="text-muted">
                        {booking.checkIn} - {booking.checkOut}
                     </Card.Text>
                  </Card.Body>

                  <ListGroup variant="flush">
                     {/* ----- 결제 금액 ----- */}
                     <ListGroup.Item>
                        <h5 className="mb-3">결제 금액</h5>
                        <div className="d-flex justify-content-between mb-2">
                           <span>총 숙박 금액</span>
                           <span>{booking.amount.toLocaleString()}원</span>
                        </div>

                        {/* ----- 쿠폰 사용 ----- */}
                        <div className="d-flex justify-content-between mb-2">
                           <span>쿠폰 할인</span>
                           <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => openModal('coupon')}
                           >
                              쿠폰 사용
                           </Button>
                        </div>

                        {/* 쿠폰 적용 시 보일 UI */}
                        {couponInfo && (
                           <div className="d-flex justify-content-between mb-2 text-danger">
                              <span className="ms-3">ㄴ {couponInfo.name}</span>
                              <span>-{discountAmount.toLocaleString()}원</span>
                           </div>
                        )}

                        <div className="d-flex justify-content-between mb-3">
                           <span>수수료</span>
                           <span>0원</span>
                        </div>

                        <hr />

                        <div className="d-flex justify-content-between fw-bold h5">
                           <span>최종 결제 금액</span>
                           <span>{finalAmount.toLocaleString()}원</span>
                        </div>
                     </ListGroup.Item>

                     {/* ----- 최종 결제 버튼 ----- */}
                     <ListGroup.Item>
                        <Button
                           variant="primary"
                           size="lg"
                           className="w-100"
                           onClick={handlePayment}
                           disabled={isProcessing || !isRequiredAgreementsChecked}
                        >
                           {isProcessing ? '처리 중...' : `${finalAmount.toLocaleString()}원 결제하기`}
                        </Button>
                        {!isRequiredAgreementsChecked && (
                           <small className="text-muted d-block mt-2 text-center">
                              필수 약관에 동의해주세요
                           </small>
                        )}
                     </ListGroup.Item>
                  </ListGroup>
               </Card>
            </Col>
         </Row>

         {isModalOpen && <Modal
            isOpen={isModalOpen}
            onClose={closeModal}
            mode={modalMode} 
            onUseCoupon={handleApplyCoupon}
            />
        }
      </Container>
   );
}

export default CheckoutForm;