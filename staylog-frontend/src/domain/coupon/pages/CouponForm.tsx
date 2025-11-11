import { useEffect, useState } from 'react';
import { Tabs, Tab, Alert, Badge } from 'react-bootstrap';
import useGetUserIdFromToken from '../../auth/hooks/useGetUserIdFromToken';
import api from '../../../global/api';
import UnavailableCouponCard from '../../coupon/components/UnavailableCouponCard';
import AvailableCouponCard from '../../coupon/components/AvailableCouponCard';
import type { couponType } from '../types/couponTypes';
// 💡 공통 타입 import

interface CouponFormProps {
   onClose?: () => void; // 모달 닫기 콜백
   // 💡 'view': 마이페이지(조회), 'select': 결제창(선택)
   mode?: 'coupon' | undefined;
   onUseCoupon?: (coupon: couponType) => void
}

// 💡 props에 mode와 onSelect 추가, mode의 기본값은 'view'
function CouponForm({ onClose, mode, onUseCoupon }: CouponFormProps) {

   const userId = useGetUserIdFromToken();

   const [availableCoupon, setAvailableCoupon] = useState<couponType[]>([]);
   const [unavailableCoupon, setUnavailableCoupon] = useState<couponType[]>([]);


   // 로딩 / 에러 메시지 상태 관리 
   const [loading, setLoading] = useState(true);
   const [errorMsg, setErrorMsg] = useState<string | null>(null);

   // 쿠폰 목록 조회
   useEffect(() => {
      setLoading(true)
      if (!userId) {
         return;
      }
      (async () => {
         try {
            const availableResponse = await api.get<couponType[]>(`v1/coupon/${userId}/available`);
            setAvailableCoupon(availableResponse);

            // const unavailableResponse = await api.get<couponType[]>(`v1/coupon/${userId}/unavailable`);
            // setUnavailableCoupon(unavailableResponse);
         } catch (err) {
            console.log(err);
            setErrorMsg("쿠폰 정보를 불러오지 못했습니다.")
         } finally {
            setLoading(false)
         }
      })()
   }, [userId]);



   async function getUnavailableCouponList() {
      try {
         const unavailableResponse = await api.get<couponType[]>(`v1/coupon/${userId}/unavailable`);
         setUnavailableCoupon(unavailableResponse);
      } catch (err) {
         console.log(err);
      }
   }


   return (
      <div className="coupon-container p-3" style={{ backgroundColor: '#f8f9fa' }}>

         <Tabs defaultActiveKey="available" id="coupon-tabs" className="mb-3" fill>

            {/* 로딩 / 에러 상태 */}
            {loading && (
               <div className="d-flex align-items-center gap-2 text-muted">
                  <div className="spinner-border spinner-border-sm" role="status" />
                  <span>불러오는 중…</span>
               </div>
            )}
            {!loading && errorMsg && (
               <div className="alert alert-danger" role="alert">
                  {errorMsg}
               </div>
            )}

            {/* 1. 사용 가능 쿠폰 탭 */}
            <Tab
               eventKey="available"
               title={
                  <span className='text-semiblack'>
                     <i className="bi bi-ticket-perforated"></i> 사용 가능 쿠폰{' '}
                     <Badge pill bg="primary">{availableCoupon.length}</Badge>
                  </span>
               }
            >
               <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                  {availableCoupon.length === 0 ? (
                     <Alert variant="secondary" className="text-center mt-3 text-semiblack">
                        <i className="bi bi-emoji-frown"></i> 사용 가능한 쿠폰이 없습니다.
                     </Alert>
                  ) : (
                     availableCoupon.map((item) => (
                        <AvailableCouponCard
                           key={item.couponId}
                           coupon={item}
                           onUseCoupon={onUseCoupon}
                        />
                     ))
                  )}
               </div>
            </Tab>


            {/* 2. 사용 완료 / 만료 탭 */}
            <Tab
               eventKey="used"
               title={
                  <span onClick={getUnavailableCouponList}>
                     <i className="bi bi-archive"></i> 사용 완료·만료{' '}
                     {/* <Badge pill bg="secondary">{unavailableCoupon.length}</Badge> */}
                  </span>
               }
            >
               <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                  {unavailableCoupon.length === 0 ? (
                     <Alert variant="secondary" className="text-center mt-3">
                        <i className="bi bi-info-circle"></i> 사용 완료/만료된 쿠폰이 없습니다.
                     </Alert>
                  ) : (
                     unavailableCoupon.map((item) => (
                        <UnavailableCouponCard
                           key={item.couponId}
                           coupon={item}
                        />
                     ))
                  )}
               </div>
            </Tab>
         </Tabs>

      </div>
   );
}

export default CouponForm;