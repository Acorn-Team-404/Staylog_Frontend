// src/domain/payment/pages/PaymentCompletePage.tsx
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Card, Button, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { confirmPayment } from '../api';
import { getBooking } from '../../booking/api';
import type { PaymentResultResponse } from '../types';
import type { BookingDetailResponse } from '../../booking/types';
import useCommonCodeSelector from '../../common/hooks/useCommonCodeSelector';

function PaymentCompletePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  /* 결제가 잘 됐는지 결제 정보를 저장하는 상태 */
  const [paymentResult, setPaymentResult] = useState<PaymentResultResponse | null>(null); 
  /* 결제 완료시 선택한 옵션 보여주는 상세 정보*/
  const [booking, setBooking] = useState<BookingDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // CommonCodes에서 결제 상태 및 결제 수단 코드 가져오기
  const paymentStatusCodes = useCommonCodeSelector('paymentStatus');
  const paymentMethodCodes = useCommonCodeSelector('paymentMethods');

  //  Hash Router 호환: URL 파라미터 파싱
  // Toss는 successUrl에 쿼리를 붙이는데, Hash Router에서는 # 앞이나 뒤에 올 수 있음
  const getUrlParams = () => {
    // 1. useSearchParams로 시도 (# 뒤에 쿼리가 있는 경우)
    let paymentKey = searchParams.get('paymentKey');
    let orderId = searchParams.get('orderId');
    let amount = searchParams.get('amount');

    // 2. 못 찾으면 window.location.search에서 시도 (# 앞에 쿼리가 있는 경우)
    if (!paymentKey || !orderId || !amount) {
      const params = new URLSearchParams(window.location.search);
      paymentKey = params.get('paymentKey');
      orderId = params.get('orderId');
      amount = params.get('amount');
    }

    console.log('[결제 완료 페이지] URL 파라미터:', { paymentKey, orderId, amount });
    console.log('[결제 완료 페이지] window.location.href:', window.location.href);

    return { paymentKey, orderId, amount };
  };

  const { paymentKey, orderId, amount } = getUrlParams();

  useEffect(() => {
    const processPayment = async () => {
      // 필수 파라미터 검증
      if (!paymentKey || !orderId || !amount) {
        setError('결제 정보가 없습니다.');
        setLoading(false);
        return;
      }

      try {
        // 결제 승인 API 호출
        // ✅ bookingId는 백엔드가 orderId로 Payment를 찾아서 자동으로 처리
        const result = await confirmPayment({
          paymentKey,
          orderId,
          amount: Number(amount),
        });
        console.log('[결제 승인 성공]', result);
        setPaymentResult(result);

        // 예약 정보 조회
        // confirmPayment 응답에 포함된 bookingId를 사용하여 예약 정보 조회
        if (!result.bookingId) {
          throw new Error('결제 응답에 예약 정보가 없습니다.');
        }

        const bookingData = await getBooking(result.bookingId);
        setBooking(bookingData);

      } catch (err: any) {
        console.error('결제 승인 실패:', err);
        console.error('에러 응답 데이터:', err.response?.data);

        const errorMessage = err.response?.data?.message || '결제 승인에 실패했습니다.';
        const errorCode = err.response?.data?.code;

        setError(`${errorMessage}${errorCode ? ` (코드: ${errorCode})` : ''}`);
      } finally {
        setLoading(false);
      }
    };

    processPayment();
  }, [paymentKey, orderId, amount]);

  // 로딩 중
  if (loading) {
    return (
      <Container className="my-5 text-center">
        <Spinner animation="border" role="status" variant="primary" />
        <p className="mt-3">결제 처리 중...</p>
      </Container>
    );
  }

  // 결제 성공 여부 확인 (CommonCodes 기반)
  const isPaid = paymentResult?.paymentStatus &&
    paymentStatusCodes.some(code =>
      code.codeId === paymentResult.paymentStatus &&
      (code.codeId === 'PAY_PAID' || code.codeName.includes('결제완료'))
    );
  console.log('결제 결과 : ', paymentStatusCodes);
  console.log('결제 결과 : ', paymentResult?.paymentStatus);
  console.log("isPaid :", isPaid);

  // 에러 발생 또는 결제 실패
  if (error || !paymentResult || !isPaid) {
    return (
      <Container className="my-5">
        <Card className="text-center">
          <Card.Body className="py-5">
            <i className="bi bi-x-circle text-danger" style={{ fontSize: '4rem' }}></i>
            <h2 className="mt-4">결제 실패</h2>
            <p className="text-muted mt-3">
              {error || paymentResult?.failureReason || '알 수 없는 오류가 발생했습니다.'}
            </p>
            <Button variant="primary" className="mt-4" onClick={() => navigate('/')}>
              홈으로
            </Button>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  // 결제 성공
  return (
    <Container className="my-5">
      <Card>
        <Card.Body className="p-4">
          {/* 제목 */}
          <h2 className="text-center mb-4">
            {paymentResult.virtualAccount ? '가상계좌가 발급되었습니다.' : '결제가 완료되었습니다.'}
          </h2>

          {/* 예약자 성함 */}
          <div className="mb-4 text-center">
            <h5>예약자 성함: <span className="fw-bold">{booking?.guestName || '테스트1'}</span></h5>
          </div>

          {/* 예약 정보 카드 */}
          <Card className="mb-4 border">
            <Card.Body>
              <Row className="mb-3">
                <Col sm={6}>
                  <div className="mb-2">
                    <strong>체크인:</strong> {booking?.checkIn || '2025년 11월 07일'}
                  </div>
                </Col>
                <Col sm={6}>
                  <div className="mb-2">
                    <strong>체크아웃:</strong> {booking?.checkOut || '2025년 11월 11일'}
                  </div>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col sm={6}>
                  <div className="mb-2">
                    <strong>숙소명:</strong> {booking?.accommodationName || '신비호텔'}
                  </div>
                </Col>
                <Col sm={6}>
                  <div className="mb-2">
                    <strong>객실명:</strong> {booking?.roomName || 'Panorama spa'}
                  </div>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col sm={4}>
                  <div className="mb-2">
                    <strong>성인:</strong> {booking?.adults || 2}
                  </div>
                </Col>
                <Col sm={4}>
                  <div className="mb-2">
                    <strong>아이:</strong> {booking?.children || 0}
                  </div>
                </Col>
                <Col sm={4}>
                  <div className="mb-2">
                    <strong>영유아:</strong> {booking?.infants || 0}
                  </div>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col>
                  <div className="mb-2">
                    <strong>총 인원:</strong> {booking?.totalGuestCount || 2}
                  </div>
                </Col>
              </Row>

            </Card.Body>
          </Card>

          {/* 결제 정보 */}
          <Card className="mb-4 border">
            <Card.Body>
              <div className="mb-3">
                <strong>결제 수단:</strong>{' '}
                {paymentMethodCodes.find(code => code.codeId === paymentResult.method)?.codeName || paymentResult.method}
              </div>
              <div className="mb-3">
                <strong>최종 결제 금액:</strong>{' '}
                <span className="text-primary fs-5 fw-bold">
                  {paymentResult.amount.toLocaleString()}원
                </span>
              </div>
            </Card.Body>
          </Card>

          {/* 가상계좌 정보 (가상계좌인 경우에만 표시) */}
          {paymentResult.virtualAccount && (
            <>
              <Alert variant="warning" className="mb-4">
                <div className="d-flex align-items-center">
                  <i className="bi bi-exclamation-triangle-fill me-2" style={{ fontSize: '1.5rem' }}></i>
                  <div>
                    <strong>입금 기한: {new Date(paymentResult.virtualAccount.dueDate).toLocaleString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}</strong>
                    <div className="mt-1">입금 기한 내에 입금하지 않으면 예약이 자동 취소됩니다.</div>
                  </div>
                </div>
              </Alert>

              <Card className="mb-4 border border-primary">
                <Card.Body>
                  <h5 className="mb-3 text-primary">입금 계좌 정보</h5>

                  <Row className="mb-3">
                    <Col sm={3}>
                      <strong>은행:</strong>
                    </Col>
                    <Col sm={9}>
                      <span className="fs-5">{paymentResult.virtualAccount.bank}</span>
                    </Col>
                  </Row>

                  <Row className="mb-3">
                    <Col sm={3}>
                      <strong>계좌번호:</strong>
                    </Col>
                    <Col sm={9}>
                      <div className="d-flex align-items-center">
                        <span className="fs-5 me-2 font-monospace">{paymentResult.virtualAccount.accountNumber}</span>
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(paymentResult.virtualAccount!.accountNumber);
                            alert('복사되었습니다.');
                          }}
                        >
                          <i className="bi bi-clipboard"></i> 복사
                        </Button>
                      </div>
                    </Col>
                  </Row>

                  <Row className="mb-3">
                    <Col sm={3}>
                      <strong>예금주:</strong>
                    </Col>
                    <Col sm={9}>
                      <span className="fs-5">{paymentResult.virtualAccount.customerName}</span>
                    </Col>
                  </Row>

                  <Row>
                    <Col sm={3}>
                      <strong>입금금액:</strong>
                    </Col>
                    <Col sm={9}>
                      <div className="d-flex align-items-center">
                        <span className="fs-4 fw-bold text-primary me-2">
                          {paymentResult.amount.toLocaleString()}원
                        </span>
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(paymentResult.amount.toString());
                            alert('복사되었습니다.');
                          }}
                        >
                          <i className="bi bi-clipboard"></i> 복사
                        </Button>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* 안내 사항 */}
              <Card className="mb-4 bg-light">
                <Card.Body>
                  <h6 className="mb-3">안내 사항</h6>
                  <ul className="mb-0">
                    <li>입금 기한 내에 정확한 금액을 입금해주세요.</li>
                    <li>입금자명은 예약자명과 일치해야 합니다.</li>
                    <li>입금 확인은 보통 1~5분 정도 소요됩니다.</li>
                    <li>입금이 완료되면 알림 또는 이메일로 안내됩니다.</li>
                    <li>입금 기한이 지나면 예약이 자동 취소되며, 계좌는 사용할 수 없습니다.</li>
                  </ul>
                </Card.Body>
              </Card>
            </>
          )}

          {/* 버튼 */}
          <Row className="mt-4">
            <Col xs={6}>
              <Button
                variant="dark"
                size="lg"
                className="w-100"
                onClick={() => navigate('/')}
              >
                홈으로
              </Button>
            </Col>
            <Col xs={6}>
              <Button
                variant="primary"
                size="lg"
                className="w-100"
                onClick={() => navigate('/mypage/reservations')}
              >
                예약내역
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default PaymentCompletePage;
