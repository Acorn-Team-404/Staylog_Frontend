import api from '../../../global/api';
import type { CommonCodeDto, CommonCodeGroupResponse } from '../types';

/**
 * 전체 공통코드를 그룹별로 조회
 * GET /v1/common-codes/all
 */
export const getAllCommonCodes = async (): Promise<CommonCodeGroupResponse> => {
  const response = await api.get<CommonCodeGroupResponse>('/v1/common-codes/all');
  return response;
};

/**
 * 부모 코드로 자식 코드 목록 조회
 * GET /v1/common-codes?parentId=REGION_TYPE
 */
export const getCodesByParentId = async (parentId: string): Promise<CommonCodeDto[]> => {
  const response = await api.get<CommonCodeDto[]>('/v1/common-codes', {
    params: { parentId }
  });
  return response;
};
