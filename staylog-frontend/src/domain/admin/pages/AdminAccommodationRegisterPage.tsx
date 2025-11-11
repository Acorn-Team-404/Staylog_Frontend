import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import ImageManager from '../../../global/components/ImageManager';
import QuillEditor from '../../../global/components/QuillEditor';
import api from '../../../global/api'; // 숙소 저장 API 호출을 위한 기본 api 인스턴스
import type { CommonCodeNameList } from '../types/CommonCodeNameList';
import AddressSearch from '../../../global/components/AddressSearch';
import { fetchDraftIdForTable } from '../../../global/api/commonApi'; // 공용 ID 발급 API

// 숙소 등록 폼 데이터 타입을 정의합니다.
interface AccommodationRegisterData {
  accommodationId: number | null;
  name: string;
  acType: string;
  regionCode: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  checkInTime: string;
  checkOutTime: string;
}

/**
 * 어드민 숙소 등록 페이지 컴포넌트
 */
const AdminAccommodationRegisterPage: React.FC = () => {
  const navigate = useNavigate();

  // 폼 데이터를 관리하는 상태
  const [formData, setFormData] = useState<AccommodationRegisterData>({
    accommodationId: null,
    name: '',
    acType: '',
    regionCode: '',
    address: '',
    latitude: null,
    longitude: null,
    checkInTime: '15:00', // 기본값 설정
    checkOutTime: '11:00', // 기본값 설정
  });

  // Quill Editor의 내용을 관리하는 상태
  const [description, setDescription] = useState<string>('');

  // ImageManager의 저장 트리거를 위한 상태
  const [imageUploadTrigger, setImageUploadTrigger] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);

  // 공통 코드 상태
  const [acTypeCodeList, setAcTypeCodeList] = useState<CommonCodeNameList[]>([]);
  const [regionCodeList, setRegionCodeList] = useState<CommonCodeNameList[]>([]);

  // 주소 검색 모달 상태
  const [showAddressModal, setShowAddressModal] = useState(false);

  // ID 사전 발급 및 공통 코드 로드 (컴포넌트 마운트 시 한 번만 실행)
  useEffect(() => {
    const initializePage = async () => {
      try {
        // 병렬로 데이터 로드
        const [draftId, acTypeRes, regionRes] = await Promise.all([
          fetchDraftIdForTable('ACCOMMODATION'),
          api.get<CommonCodeNameList[]>("/v1/commonCode", { params: { codeId: 'ACCOMMODATION_TYPE' } }),
          api.get<CommonCodeNameList[]>("/v1/commonCode", { params: { codeId: 'REGION_TYPE' } })
        ]);

        setFormData(prev => ({ ...prev, accommodationId: draftId }));
        setAcTypeCodeList(acTypeRes);
        setRegionCodeList(regionRes);
        // 기본값 설정
        if (acTypeRes.length > 0) setFormData(prev => ({ ...prev, acType: acTypeRes[0].codeId }));
        if (regionRes.length > 0) setFormData(prev => ({ ...prev, regionCode: regionRes[0].codeId }));

      } catch (error) {
        console.error('페이지 초기화 실패:', error);
        alert('숙소 등록 페이지를 여는 데 실패했습니다. 다시 시도해주세요.');
        navigate('/admin/accommodations');
      }
    };
    initializePage();
  }, [navigate]);

  // 폼 필드 변경 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 폼 제출 핸들러 - 2단계 저장의 첫 번째 단계
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (formData.accommodationId === null) {
      alert('숙소 ID가 아직 발급되지 않았습니다. 잠시 후 다시 시도해주세요.');
      setIsSubmitting(false);
      return;
    }

    try {
      // 1-1. 숙소 기본 정보를 서버에 저장
      const payload = { ...formData, description };

      // TODO: 백엔드에 숙소 등록 API(POST /v1/admin/accommodations)가 구현되어야 합니다.
      await api.post('/v1/admin/accommodations', payload);
      console.log('숙소 기본 정보 저장 성공:', payload);

      // 1-2. 이미지 저장을 트리거
      setImageUploadTrigger(prev => prev + 1);

    } catch (error) {
      console.error('숙소 기본 정보 저장 실패:', error);
      alert('숙소 정보 저장에 실패했습니다.');
      setIsSubmitting(false);
    }
  }, [formData, description]);

  // ImageManager 업로드 완료 콜백
  const handleImageUploadComplete = useCallback(() => {
    setIsSubmitting(false);
    alert('숙소 등록이 완료되었습니다!');
    navigate('/admin/accommodations');
  }, [navigate]);

  // ImageManager 업로드 에러 콜백
  const handleImageUploadError = useCallback((errorMsg: string) => {
    setIsSubmitting(false);
    setImageUploadError(errorMsg);
    alert('이미지 업로드 중 오류가 발생했습니다: ' + errorMsg);
  }, []);

  return (
    <Container fluid className="p-4">
      <h3 className="mb-4">새 숙소 등록</h3>
      <form onSubmit={handleSubmit}>
        {/* 데스크톱: 테이블 표시 */}
        <div className="d-none d-md-block">
          <table className="table table-bordered">
            <tbody>
              {/* 실제로 ID값은 노출되지 않습니다. */}
              {/*<tr>
              <th className="bg-light text-center" style={{ width: '20%' }}>숙소 ID</th>
              <td>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={formData.accommodationId || '발급 중...'}
                  readOnly
                />
              </td>
            </tr> */}
              <tr>
                <th className="bg-light text-center">숙소명</th>
                <td>
                  <input
                    type="text"
                    name="name"
                    className="form-control form-control-sm"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </td>
              </tr>
              <tr>
                <th className="bg-light text-center">유형</th>
                <td>
                  <select
                    name="acType"
                    className="form-select form-select-sm"
                    value={formData.acType}
                    onChange={handleChange}
                    required
                  >
                    {acTypeCodeList.map(item => (
                      <option key={item.codeId} value={item.codeId}>{item.codeName}</option>
                    ))}
                  </select>
                </td>
              </tr>
              <tr>
                <th className="bg-light text-center">지역</th>
                <td>
                  <select
                    name="regionCode"
                    className="form-select form-select-sm"
                    value={formData.regionCode}
                    onChange={handleChange}
                    required
                  >
                    {regionCodeList.map(item => (
                      <option key={item.codeId} value={item.codeId}>{item.codeName}</option>
                    ))}
                  </select>
                </td>
              </tr>
              <tr>
                <th className="bg-light text-center">주소</th>
                <td>
                  <div className='input-group input-group-sm'>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={formData.address}
                      placeholder="주소 검색 버튼을 클릭하세요"
                      readOnly
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => setShowAddressModal(true)}
                    >
                      주소 검색
                    </button>
                  </div>
                  <AddressSearch
                    show={showAddressModal}
                    onClose={() => setShowAddressModal(false)}
                    onAddressSelect={(address, coords) => {
                      setFormData(prev => ({ ...prev, address, latitude: coords.lat, longitude: coords.lng }));
                      setShowAddressModal(false);
                    }}
                  />
                </td>
              </tr>
              <tr>
                <th className="bg-light text-center">체크인/체크아웃</th>
                <td>
                  <div className="d-flex align-items-center">
                    <input
                      type="time"
                      name="checkInTime"
                      className="form-control form-control-sm me-2"
                      value={formData.checkInTime}
                      onChange={handleChange}
                    />
                    <span>~</span>
                    <input
                      type="time"
                      name="checkOutTime"
                      className="form-control form-control-sm ms-2"
                      value={formData.checkOutTime}
                      onChange={handleChange}
                    />
                  </div>
                </td>
              </tr>
              <tr>
                <th className="bg-light text-center align-middle">상세 설명</th>
                <td>
                  {formData.accommodationId ? (
                    <div className="mt-1 mb-5 pb-4 pb-md-0">
                      <QuillEditor
                        value={description}
                        onChange={setDescription}
                        style={{ height: '700px' }}
                        targetType="ACCOMMODATION"
                        targetId={formData.accommodationId}
                      />
                    </div>
                  ) : <p>ID 발급 중...</p>}
                </td>
              </tr>
              <tr>
                <th className="bg-light text-center align-middle">대표/갤러리 이미지</th>
                <td>
                  {formData.accommodationId ? (
                    <ImageManager
                      targetType="ACCOMMODATION"
                      targetId={formData.accommodationId}
                      uploadTrigger={imageUploadTrigger}
                      onUploadComplete={handleImageUploadComplete}
                      onUploadError={handleImageUploadError}
                    />
                  ) : <p>ID 발급 중...</p>}
                  {imageUploadError && <p className="text-danger mt-2">{imageUploadError}</p>}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 모바일: 블록 표시 */}
        <div className="d-md-none">
          <hr className="my-4" />

          <div className="mb-3">
            <label className="form-label fw-bold">숙소명</label>
            <input
              type="text"
              name="name"
              className="form-control"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold">유형</label>
            <select
              name="acType"
              className="form-select"
              value={formData.acType}
              onChange={handleChange}
              required
            >
              {acTypeCodeList.map(item => (
                <option key={item.codeId} value={item.codeId}>{item.codeName}</option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold">지역</label>
            <select
              name="regionCode"
              className="form-select"
              value={formData.regionCode}
              onChange={handleChange}
              required
            >
              {regionCodeList.map(item => (
                <option key={item.codeId} value={item.codeId}>{item.codeName}</option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold">주소</label>
            <div className='input-group'>
              <input
                type="text"
                className="form-control"
                value={formData.address}
                placeholder="주소 검색 버튼을 클릭하세요"
                readOnly
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowAddressModal(true)}
              >
                주소 검색
              </button>
            </div>
            <AddressSearch
              show={showAddressModal}
              onClose={() => setShowAddressModal(false)}
              onAddressSelect={(address, coords) => {
                setFormData(prev => ({ ...prev, address, latitude: coords.lat, longitude: coords.lng }));
                setShowAddressModal(false);
              }}
            />
          </div>

          <div className="mb-5">
            <label className="form-label fw-bold">체크인/체크아웃</label>
            <div className="d-flex align-items-center gap-2">
              <input
                type="time"
                name="checkInTime"
                className="form-control"
                value={formData.checkInTime}
                onChange={handleChange}
              />
              <span>~</span>
              <input
                type="time"
                name="checkOutTime"
                className="form-control"
                value={formData.checkOutTime}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="mb-3 pb-5">
            <label className="form-label fw-bold">상세 설명</label>
            {formData.accommodationId ? (
              <QuillEditor
                value={description}
                onChange={setDescription}
                style={{ height: '500px' }}
                targetType="ACCOMMODATION"
                targetId={formData.accommodationId}
              />
            ) : <p>ID 발급 중...</p>}
          </div>

          <div className="mb-3 pt-5">
            <label className="form-label fw-bold">대표/갤러리 이미지</label>
            {formData.accommodationId ? (
              <ImageManager
                targetType="ACCOMMODATION"
                targetId={formData.accommodationId}
                uploadTrigger={imageUploadTrigger}
                onUploadComplete={handleImageUploadComplete}
                onUploadError={handleImageUploadError}
              />
            ) : <p>ID 발급 중...</p>}
            {imageUploadError && <p className="text-danger mt-2">{imageUploadError}</p>}
          </div>
        </div>

        <div className="d-flex justify-content-end mt-3">
          <button type="submit" className="btn btn-primary" disabled={isSubmitting || formData.accommodationId === null}>
            {isSubmitting ? '등록 중...' : '숙소 등록'}
          </button>
          <button type="button" className="btn btn-secondary ms-2" onClick={() => navigate('/admin/accommodations')}>
            취소
          </button>
        </div>
      </form>
    </Container>
  );
};

export default AdminAccommodationRegisterPage;
