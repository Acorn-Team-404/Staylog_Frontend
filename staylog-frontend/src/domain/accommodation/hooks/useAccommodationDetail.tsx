import { useEffect, useState } from 'react';
import axios from 'axios';
import type { AccommodationDetail } from '../types/accommodation';
import api from '../../../global/api';

// 전달받는 데이터 타입
interface UseAcDetail { // Api 호출 상태
    data : AccommodationDetail|null; // 숙소의 상세 정보 (성공 : 객체, 실패 or 로딩 : null)
    isLoading : boolean; // Api 호출 상태
    error : string|null; // 오류 메시지
}

// 숙소 고유 번호를 받아 UseAcDetail 타입으로 반환
export const useAcDetail = (accommodationId:number) : UseAcDetail => {
    // 숙소 상세 정보 관리
    const [data, setData] = useState<AccommodationDetail|null>(null);
    // 데이터 로딩 관리
    const [isLoading, setIsLoading] = useState(true); 
    // 오류 메세지 관리
    const [error, setError] = useState<string|null>(null);

    useEffect(() => {
        // 서버와 통신
        const getAcDetail = async () => {
            // 로딩 시작 & 에러 초기화
            setIsLoading(true); 
            setError(null);
            
            try {
                const res = await api.get<AccommodationDetail>(`/v1/accommodations/${accommodationId}`); 
                // 성공
                setData(res.data);
            } catch (err) {
                // API 호출 오류 발생
                if (axios.isAxiosError(err)) {
                    const status = err.response?.status;
                    
                    // 404
                    const msg = status === 404 
                        ? "해당 숙소는 존재하지 않습니다" 
                        : `API 호출 실패: 상태 코드 ${status || '네트워크 오류'}`;
                    setError(msg);
                } else {
                    // 기타 오류
                    setError("알 수 없는 오류 발생");
                }
                setData(null); // 오류 발생 : 데이터 값 null 로 처리
            } finally {
                // 통신 완료 후 로딩 상태 종료
                setIsLoading(false);
            }
        };
        getAcDetail();
    }, [accommodationId]); 
    
    return { data, isLoading, error };
};