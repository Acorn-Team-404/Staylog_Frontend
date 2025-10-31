import api from '../../../global/api';
import type { SearchAccommodationsRequest, AccommodationListItem } from '../types';

/**
 * 숙소 검색 API
 * GET /v1/search/accommodations
 */
export const searchAccommodations = async (
  params: SearchAccommodationsRequest
): Promise<AccommodationListItem[]> => {
  const response = await api.get<AccommodationListItem[]>('/v1/search/accommodations', {
    params,
    paramsSerializer: {
      indexes: null, // regionCodes[] 배열을 ?regionCodes=경기&regionCodes=서울 형식으로 직렬화.
    },
  });
  return response;
};
