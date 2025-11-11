import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, InputGroup } from 'react-bootstrap';
import api from '../../../global/api';

interface couponStateType {
   targetType: 'all' | 'one'
   userId: number
   couponName: string
   discount: number
   expiredAt: string
}

interface couponBoolean {
   userId: boolean
   couponName: boolean
   discount: boolean
   expiredAt: boolean
}

const initialCouponState: couponStateType = {
   targetType: 'one',
   userId: 0,
   couponName: '',
   discount: 0,
   expiredAt: ''
};

const initialBooleanState: couponBoolean = {
   userId: false,
   couponName: false,
   discount: false,
   expiredAt: false
};

function AdminCouponPage() {

   const [couponState, setCouponState] = useState<couponStateType>(initialCouponState);
   const [valid, setValid] = useState<couponBoolean>(initialBooleanState);
   const [dirty, setDirty] = useState<couponBoolean>(initialBooleanState);

   // 유효성검사
   useEffect(() => {
      const newValidState = { ...initialBooleanState };

      // 쿠폰 이름: 1~20자
      newValidState.couponName = couponState.couponName.trim().length > 0 && couponState.couponName.length <= 20;

      // 할인율: 1~100
      newValidState.discount = couponState.discount >= 1 && couponState.discount <= 50;

      // 만료일: 오늘 날짜 이후
      const today = new Date().toISOString().split('T')[0];
      newValidState.expiredAt = couponState.expiredAt >= today + 1;

      // 회원 번호: one일 때만 0보다 큰 숫자
      if (couponState.targetType === 'all') {
         newValidState.userId = true; // 'all'일 땐 userId 유효성 통과
      } else {
         newValidState.userId = couponState.userId > 0;
      }

      setValid(newValidState);

   }, [couponState]);




   function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
      const { name, value } = e.target;

      if (name === 'targetType') {
         const targetType = value as 'all' | 'one';
         setCouponState(prevState => ({
            ...prevState,
            targetType: targetType,
            userId: targetType === 'all' ? 0 : prevState.userId // all 선택 시 userId 리셋
         }));
      } else {
         // 일반 입력 필드
         setCouponState(prevState => ({
            ...prevState,
            [name]: (name === 'discount' || name === 'userId') ? Number(value) : value
         }));
      }
   }

   // Dirty 상태 관리
   function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
      const { name } = e.target;
      setDirty(prevState => ({
         ...prevState,
         [name]: true
      }));
   }


   async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault(); // 폼 새로고침 방지

      // 제출 시 모든 필드를 dirty로 만듦 (에러 메시지 표시)
      setDirty({
         userId: true,
         couponName: true,
         discount: true,
         expiredAt: true
      });

      // 폼 전체 유효성 최종 확인
      const isFormValid = valid.couponName && valid.discount && valid.expiredAt &&
         (couponState.targetType === 'all' || valid.userId);

      if (!isFormValid) {
         console.log("폼 유효성 검사 실패, 제출 중단");
         alert('입력값을 확인해주세요.');
         return;
      }

      // 유효성 통과 시 API 요청
      console.log(couponState.targetType, "로 요청");
      if (couponState.targetType === 'all') {
         try {
            const payload = {
               name: couponState.couponName,
               discount: couponState.discount,
               expiredAt: couponState.expiredAt
            };
            await api.post("/v1/coupon/all", payload);
            console.log("API all 요청:", payload);
            alert('모든 사용자에게 쿠폰이 발급되었습니다.');
         } catch (err) {
            console.log(err);
            alert('발급 실패');
         }
      } else if (couponState.targetType === 'one') {
         try {
            const payload = {
               userId: couponState.userId,
               name: couponState.couponName,
               discount: couponState.discount,
               expiredAt: couponState.expiredAt
            };
            await api.post("/v1/coupon", payload);
            console.log("API one 요청:", payload);
            alert(`쿠폰이 발급되었습니다.`);
         } catch (err) {
            console.log(err);
            alert('발급 실패');
         }
      }
   }

   // 버튼 활성화 여부 실시간 계산
   const isFormValid = valid.couponName && valid.discount && valid.expiredAt &&
      (couponState.targetType === 'all' || valid.userId);


   return (
      <Container className="my-4">
         <Row className="justify-content-center">
            <Col lg={11} xl={10}>
               <Card className="shadow-sm">
                  <Card.Header as="h3" className="text-center p-3">
                     관리자 쿠폰 발급
                  </Card.Header>
                  <Card.Body className="p-4 p-md-4">

                     <Form noValidate onSubmit={handleSubmit}>
                        <Row>
                           <Col md={5} className="border-end-md pe-md-4">
                              <Form.Group as="fieldset" className="mb-4 mb-md-0">
                                 <Form.Label as="legend" column sm={12} className="fw-bold fs-5 mb-3">
                                    발급 대상
                                 </Form.Label>
                                 <Form.Check
                                    type="radio"
                                    label="모든 사용자에게 발급"
                                    name="targetType"
                                    id="all"
                                    value="all"
                                    checked={couponState.targetType === 'all'}
                                    onChange={handleChange}
                                 />
                                 <Form.Check
                                    type="radio"
                                    label="특정 사용자에게 발급"
                                    name="targetType"
                                    id="one"
                                    className="mb-2"
                                    value="one"
                                    checked={couponState.targetType === 'one'}
                                    onChange={handleChange}
                                 />

                                 {couponState.targetType === 'one' && (
                                    <>
                                       <Form.Control
                                          type="number"
                                          placeholder="회원 번호를 입력하세요."
                                          name='userId'
                                          value={couponState.userId === 0 ? '' : couponState.userId}
                                          onChange={handleChange}
                                          onBlur={handleBlur}
                                          isInvalid={dirty.userId && !valid.userId}
                                       />
                                       <Form.Control.Feedback type="invalid">
                                          유효한 회원 번호를 입력해주세요.
                                       </Form.Control.Feedback>
                                    </>
)}
                                 </Form.Group>
                              </Col>

                           <Col md={7} className="ps-md-4 mt-4 mt-md-0">
                              <h4 className="fw-bold fs-5 mb-3">쿠폰 정보</h4>

                              <Form.Group className="mb-3" controlId="couponName">
                                 <Form.Label>쿠폰 이름</Form.Label>
                                 <Form.Control
                                    type="text"
                                    placeholder="예: 10월 가을맞이 할인 쿠폰"
                                    required
                                    name='couponName'
                                    value={couponState.couponName}
                                    onChange={handleChange}
                                    onBlur={handleBlur} // ⬅️ onBlur 추가
                                    isInvalid={dirty.couponName && !valid.couponName}
                                 />
                                 <Form.Control.Feedback type="invalid">
                                    쿠폰 이름은 1자 이상 20자 이하로 입력해주세요.
                                 </Form.Control.Feedback>
                              </Form.Group>

                              <Row>
                                 <Col sm={6}>
                                    <Form.Group className="mb-3" controlId="couponDiscount">
                                       <Form.Label>할인율</Form.Label>
                                       <InputGroup>
                                          <Form.Control
                                             type="number"
                                             placeholder="예: 10"
                                             min="1"
                                             max="100"
                                             required
                                             name='discount'
                                             value={couponState.discount === 0 ? '' : couponState.discount}
                                             onChange={handleChange}
                                             onBlur={handleBlur} // ⬅️ onBlur 추가
                                             isInvalid={dirty.discount && !valid.discount}
                                          />
                                          <InputGroup.Text>%</InputGroup.Text>
                                          <Form.Control.Feedback type="invalid">
                                             1에서 50 사이의 숫자를 입력해주세요.
                                          </Form.Control.Feedback>
                                       </InputGroup>
                                    </Form.Group>
                                 </Col>
                                 <Col sm={6}>
                                    <Form.Group className="mb-3" controlId="couponExpiry">
                                       <Form.Label>만료 기간</Form.Label>
                                       <Form.Control
                                          type="date"
                                          required
                                          name='expiredAt'
                                          value={couponState.expiredAt}
                                          onChange={handleChange}
                                          onBlur={handleBlur}
                                          isInvalid={dirty.expiredAt && !valid.expiredAt}
                                       />
                                       <Form.Control.Feedback type="invalid">
                                          오늘 날짜 이후로 선택해주세요.
                                          </Form.Control.Feedback>
                                       </Form.Group>
                                 </Col>
                              </Row>

                              <div className="d-grid mt-3">
                                 {/* 6. disabled 속성 추가, onClick 제거 */}
                                 <Button variant="primary" size="lg" type="submit" disabled={!isFormValid}>
                                    쿠폰 발급하기
                                 </Button>
                              </div>
                              </Col>

                           </Row>
                     </Form>

                     </Card.Body>
               </Card>
            </Col>
         </Row>
      </Container>
   );
}

export default AdminCouponPage;