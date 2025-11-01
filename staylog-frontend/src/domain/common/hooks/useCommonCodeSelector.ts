import { useSelector } from 'react-redux';
import type { RootState } from '../../../global/store/types';
import type { CommonCodeDto } from '../types';

/**
 * 공통코드 Selector 커스텀 훅
 *
 * Redux store에 저장된 공통코드를 쉽게 조회할 수 있는 헬퍼 훅입니다.
 *
 * @example
 * // 전체 공통코드 조회
 * const commonCodes = useCommonCodeSelector();
 *
 * // 특정 그룹 조회
 * const regions = useCommonCodeSelector('regions');
 * const accommodationTypes = useCommonCodeSelector('accommodationTypes');
 *
 * @author danjae
 */
function useCommonCodeSelector(): ReturnType<typeof useSelector<RootState, RootState['commonCodes']>>;
function useCommonCodeSelector(group: 'regions'): CommonCodeDto[];
function useCommonCodeSelector(group: 'accommodationTypes'): CommonCodeDto[];
function useCommonCodeSelector(group: 'roomTypes'): CommonCodeDto[];
function useCommonCodeSelector(group: 'roomStatus'): CommonCodeDto[];
function useCommonCodeSelector(group: 'reservationStatus'): CommonCodeDto[];
function useCommonCodeSelector(group: 'paymentStatus'): CommonCodeDto[];
function useCommonCodeSelector(group: 'paymentMethods'): CommonCodeDto[];
function useCommonCodeSelector(group: 'refundStatus'): CommonCodeDto[];
function useCommonCodeSelector(group: 'refundTypes'): CommonCodeDto[];
function useCommonCodeSelector(group: 'notificationTypes'): CommonCodeDto[];
function useCommonCodeSelector(group: 'boardTypes'): CommonCodeDto[];
function useCommonCodeSelector(group: 'imageTypes'): CommonCodeDto[];
function useCommonCodeSelector(group: 'userRoles'): CommonCodeDto[];
function useCommonCodeSelector(group: 'userStatus'): CommonCodeDto[];
function useCommonCodeSelector(group: 'sortOptions'): CommonCodeDto[];
function useCommonCodeSelector(group?: keyof NonNullable<RootState['commonCodes']>) {
  const commonCodes = useSelector((state: RootState) => state.commonCodes);

  if (!group) {
    return commonCodes;
  }

  return commonCodes?.[group] || [];
}

export default useCommonCodeSelector;
