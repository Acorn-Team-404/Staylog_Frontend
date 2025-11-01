import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../../global/store/types';
import { getAllCommonCodes } from '../api';

/**
 * 공통코드 초기화 및 관리 커스텀 훅
 *
 * 앱 실행 시 전체 공통코드를 한 번 조회하여 Redux store에 저장합니다.
 *
 * @author danjae
 */
function useCommonCodes() {
  const dispatch = useDispatch();
  const commonCodes = useSelector((state: RootState) => state.commonCodes);

  useEffect(() => {
    // 이미 공통코드가 로드되었으면 재호출하지 않음
    if (commonCodes) {
      return;
    }

    const fetchCommonCodes = async () => {
      try {
        console.log('[CommonCodes] 공통코드 조회 시작');
        const data = await getAllCommonCodes();

        dispatch({
          type: 'SET_COMMON_CODES',
          payload: data
        });

        console.log('[CommonCodes] 공통코드 조회 완료:', data);
      } catch (error) {
        console.error('[CommonCodes] 공통코드 조회 실패:', error);
        // 에러 발생 시에도 앱이 정상 동작하도록 빈 객체로 초기화
        dispatch({
          type: 'SET_COMMON_CODES',
          payload: null
        });
      }
    };

    fetchCommonCodes();
  }, [commonCodes, dispatch]);

  return commonCodes;
}

export default useCommonCodes;
