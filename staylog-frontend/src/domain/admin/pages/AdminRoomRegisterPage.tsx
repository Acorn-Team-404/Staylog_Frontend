import React, { useState, useEffect, useCallback } from 'react';
import { Container } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../../global/api';
import ImageManager from '../../../global/components/ImageManager';
import QuillEditor from '../../../global/components/QuillEditor';
import { fetchDraftIdForTable } from '../../../global/api/commonApi';
import type { CommonCodeNameList } from '../types/CommonCodeNameList';
import type { AdminRoom } from '../types/AdminRoomTypes'; // AdminRoom 타입을 참고하여 폼 데이터 정의
import type { AdminAccommodation } from '../types/AdminAccommodationTypes';

// 객실 등록 폼 데이터 타입을 정의합니다.
interface RoomRegisterData {
  roomId: number | null;
  accommodationId: number; // URL에서 가져오므로 항상 존재
  accommodationName: string;
  name: string;
  rmType: string;
  price: number;
  maxAdult: number;
  maxChildren: number;
  maxInfant: number;
  singleBed: number;
  doubleBed: number;
  queenBed: number;
  kingBed: number;
  area: number;
  checkIn: string; // 체크인 시간
  checkOut: string; // 체크아웃 시간
}

/**
 * 어드민 객실 등록 페이지 컴포넌트
 */
const AdminRoomRegisterPage: React.FC = () => {
  const { accommodationId: accommodationIdStr } = useParams();
  const accommodationId = Number(accommodationIdStr);
  const navigate = useNavigate();

  // 폼 데이터를 관리하는 상태
  const [formData, setFormData] = useState<RoomRegisterData>({
    roomId: null, // 초기 ID는 null, 백엔드에서 발급받을 예정
    accommodationId: accommodationId,
    accommodationName: '',
    name: '',
    rmType: '',
    price: 0,
    maxAdult: 2,
    maxChildren: 0,
    maxInfant: 0,
    singleBed: 0,
    doubleBed: 0,
    queenBed: 0,
    kingBed: 0,
    area: 0,
    checkIn: '15:00',
    checkOut: '11:00',
  });

  // Quill Editor의 내용을 관리하는 상태
  const [description, setDescription] = useState<string>('');

  // ImageManager의 저장 트리거를 위한 상태
  const [imageUploadTrigger, setImageUploadTrigger] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);

  // 공통 코드 상태
  const [rmTypeCodeList, setRmTypeCodeList] = useState<CommonCodeNameList[]>([]);

  // 컴포넌트 리셋을 위한 트리거 상태 추가
  const [resetTrigger, setResetTrigger] = useState<number>(0);

  // ID 사전 발급 및 공통 코드 로드 (컴포넌트 마운트 시 한 번만 실행)
  useEffect(() => {
    if (!accommodationId || isNaN(accommodationId)) {
      alert('올바른 숙소 ID가 없습니다. 숙소 목록으로 돌아갑니다.');
      navigate('/admin/accommodations');
      return;
    }

    const initializePage = async () => {
      try {
        // 병렬로 데이터 로드
        const [draftRoomId, rmTypeRes, accommodationDetailRes] = await Promise.all([
          fetchDraftIdForTable('ROOM'), // 'ROOM' 테이블의 ID 발급 요청
          api.get<CommonCodeNameList[]>("/v1/commonCode", { params: { codeId: 'ROOM_TYPE' } }),
          api.get<AdminAccommodation>(`/v1/admin/accommodations/${accommodationId}`) // 숙소 상세정보 API 호출
        ]);

        setFormData(prev => ({
          ...prev,
          roomId: draftRoomId,
          accommodationName: accommodationDetailRes.name
        }));
        setRmTypeCodeList(rmTypeRes);
        // 기본값 설정
        if (rmTypeRes.length > 0) setFormData(prev => ({ ...prev, rmType: rmTypeRes[0].codeId }));

      } catch (err) {
        console.error('페이지 초기화 실패:', err);
        alert('객실 등록 페이지를 여는 데 실패했습니다. 다시 시도해주세요.');
        navigate(`/admin/accommodations/${accommodationId}/rooms`);
      }
    };
    initializePage();
  }, [accommodationId, navigate]);

  // 폼 필드 변경 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'price' || name === 'maxAdult' || name === 'maxChildren' || name === 'maxInfant' || name === 'singleBed' || name === 'doubleBed' || name === 'queenBed' || name === 'kingBed' || name === 'area' ? Number(value) : value }));
  };

  // 폼 제출 핸들러 - 2단계 저장의 첫 번째 단계
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (formData.roomId === null) {
      alert('객실 ID가 아직 발급되지 않았습니다. 잠시 후 다시 시도해주세요.');
      setIsSubmitting(false);
      return;
    }

    try {
      // 1-1. 객실 기본 정보를 서버에 저장
      const payload = { ...formData, description };

      // 객실 등록
      await api.post(`/v1/admin/accommodations/${accommodationId}/rooms`, payload);
      console.log('객실 기본 정보 저장 성공:', payload);

      // 1-2. 이미지 저장을 트리거
      setImageUploadTrigger(prev => prev + 1);

    } catch (err) {
      console.error('객실 기본 정보 저장 실패:', err);
      alert('객실 정보 저장에 실패했습니다.');
      setIsSubmitting(false);
    }
  }, [formData, description, accommodationId]);

  // ImageManager 업로드 완료 콜백
  const handleImageUploadComplete = useCallback(() => {
    setIsSubmitting(false);
    alert('객실 등록이 완료되었습니다!');
    navigate(`/admin/accommodations/${accommodationId}/rooms`);
  }, [navigate, accommodationId]);

  // ImageManager 업로드 에러 콜백
  const handleImageUploadError = useCallback((errorMsg: string) => {
    setIsSubmitting(false);
    setImageUploadError(errorMsg);
    alert('이미지 업로드 중 오류가 발생했습니다: ' + errorMsg);
  }, []);

  return (
    <Container fluid className="p-4">
      <h3 className="mb-4">새 객실 등록 (숙소명: {formData.accommodationName || '로딩 중...'})</h3>
      <form onSubmit={handleSubmit}>
        {/* 데스크톱: 테이블 표시 */}
        <div className="d-none d-md-block">
          <table className="table table-bordered">
            <tbody>
              {/* <tr>
              <th className="bg-light text-center" style={{ width: '20%' }}>객실 ID</th>
              <td>
                <input
                  type="text"
                  className="form-control form-control-sm text-muted"
                  value={formData.roomId || '발급 중...'}
                  readOnly
                />
              </td>
            </tr> */}
              <tr>
                <th className="bg-light text-center align-middle">객실명</th>
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
                <th className="bg-light text-center align-middle">유형</th>
                <td>
                  <select
                    name="rmType"
                    className="form-select form-select-sm"
                    value={formData.rmType}
                    onChange={handleChange}
                    required
                  >
                    {rmTypeCodeList.map(item => (
                      <option key={item.codeId} value={item.codeId}>{item.codeName}</option>
                    ))}
                  </select>
                </td>
              </tr>
              <tr>
                <th className="bg-light text-center align-middle">가격</th>
                <td className='d-flex align-items-center'>
                  <input
                    type="number"
                    name="price"
                    className="form-control form-control-sm w-25 me-2 text-end pe-0"
                    value={formData.price}
                    onChange={handleChange}
                    required
                  />
                  <span>원</span>
                </td>
              </tr>
              <tr>
                <th className="bg-light text-center align-middle" style={{ width: '30%' }}>최대 인원</th>
                <td>
                  <table className="table table-sm mb-0" style={{ width: '50%' }}>
                    <tbody>
                      <tr>
                        <th style={{ width: '50%' }}>성인</th>
                        <td className='d-flex align-items-center'>
                          <input
                            type="number"
                            name="maxAdult"
                            className="form-control form-control-sm me-2 text-end pe-0"
                            value={formData.maxAdult}
                            onChange={handleChange}
                            required
                          />
                          <span>명</span>
                        </td>
                      </tr>
                      <tr>
                        <th>어린이</th>
                        <td className='d-flex align-items-center'>
                          <input
                            type="number"
                            name="maxChildren"
                            className="form-control form-control-sm me-2 text-end pe-0"
                            value={formData.maxChildren}
                            onChange={handleChange}
                          />
                          <span>명</span>
                        </td>
                      </tr>
                      <tr>
                        <th>유아</th>
                        <td className='d-flex align-items-center'>
                          <input
                            type="number"
                            name="maxInfant"
                            className="form-control form-control-sm me-2 text-end pe-0"
                            value={formData.maxInfant}
                            onChange={handleChange}
                          />
                          <span>명</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
              <tr>
                <th className="bg-light text-center align-middle">침대</th>
                <td>
                  <table className="table table-sm mb-0" style={{ width: '50%' }}>
                    <tbody>
                      <tr>
                        <th style={{ width: '50%' }}>싱글</th>
                        <td className='d-flex align-items-center'>
                          <input
                            type="number"
                            name="singleBed"
                            className="form-control form-control-sm me-2 text-end pe-0"
                            value={formData.singleBed}
                            onChange={handleChange}
                          />
                          <span>개</span>
                        </td>
                      </tr>
                      <tr>
                        <th>더블</th>
                        <td className='d-flex align-items-center'>
                          <input
                            type="number"
                            name="doubleBed"
                            className="form-control form-control-sm me-2 text-end pe-0"
                            value={formData.doubleBed}
                            onChange={handleChange}
                          />
                          <span>개</span>
                        </td>
                      </tr>
                      <tr>
                        <th>퀸</th>
                        <td className='d-flex align-items-center'>
                          <input
                            type="number"
                            name="queenBed"
                            className="form-control form-control-sm me-2 text-end pe-0"
                            value={formData.queenBed}
                            onChange={handleChange}
                          />
                          <span>개</span>
                        </td>
                      </tr>
                      <tr>
                        <th>킹</th>
                        <td className='d-flex align-items-center'>
                          <input
                            type="number"
                            name="kingBed"
                            className="form-control form-control-sm me-2 text-end pe-0"
                            value={formData.kingBed}
                            onChange={handleChange}
                          />
                          <span>개</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
              <tr>
                <th className="bg-light text-center align-middle">면적</th>
                <td className='d-flex align-items-center'>
                  <input
                    type="number"
                    name="area"
                    className="form-control form-control-sm w-25 me-2 text-end pe-0"
                    value={formData.area}
                    onChange={handleChange}
                  />
                  <span>m²</span>
                </td>
              </tr>
              <tr>
                <th className="bg-light text-center align-middle">상세 설명</th>
                <td>
                  {formData.roomId ? (
                    <div className="mt-1 mb-5">
                      <QuillEditor
                        key={`quill-${resetTrigger}`} // 리셋 트리거 적용
                        value={description}
                        onChange={setDescription}
                        style={{ height: '700px' }}
                        targetType="ROOM"
                        targetId={formData.roomId}
                      />
                    </div>
                  ) : <p>ID 발급 중...</p>}
                </td>
              </tr>
              <tr>
                <th className="bg-light text-center align-middle">대표/갤러리 이미지</th>
                <td>
                  {formData.roomId ? (
                    <ImageManager
                      key={`image-manager-${resetTrigger}`} // 리셋 트리거 적용
                      targetType="ROOM"
                      targetId={formData.roomId}
                      isEditMode={false} // 등록 모드
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
        <hr className="my-4" />

        <div className="d-md-none">
          <div className="mb-3">
            <label className="form-label fw-bold">객실명</label>
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
              name="rmType"
              className="form-select"
              value={formData.rmType}
              onChange={handleChange}
              required
            >
              {rmTypeCodeList.map(item => (
                <option key={item.codeId} value={item.codeId}>{item.codeName}</option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold">가격</label>
            <div className="input-group">
              <input
                type="number"
                name="price"
                className="form-control text-end"
                value={formData.price}
                onChange={handleChange}
                required
              />
              <span className="input-group-text">원</span>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold">최대 인원</label>
            <div className="row g-2">
              <div className="col-4">
                <label className="form-label small">성인</label>
                <div className="input-group">
                  <input
                    type="number"
                    name="maxAdult"
                    className="form-control text-end"
                    value={formData.maxAdult}
                    onChange={handleChange}
                    required
                  />
                  <span className="input-group-text">명</span>
                </div>
              </div>
              <div className="col-4">
                <label className="form-label small">어린이</label>
                <div className="input-group">
                  <input
                    type="number"
                    name="maxChildren"
                    className="form-control text-end"
                    value={formData.maxChildren}
                    onChange={handleChange}
                  />
                  <span className="input-group-text">명</span>
                </div>
              </div>
              <div className="col-4">
                <label className="form-label small">유아</label>
                <div className="input-group">
                  <input
                    type="number"
                    name="maxInfant"
                    className="form-control text-end"
                    value={formData.maxInfant}
                    onChange={handleChange}
                  />
                  <span className="input-group-text">명</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold">침대</label>
            <div className="row g-2">
              <div className="col-6">
                <label className="form-label small">싱글</label>
                <div className="input-group">
                  <input
                    type="number"
                    name="singleBed"
                    className="form-control text-end"
                    value={formData.singleBed}
                    onChange={handleChange}
                  />
                  <span className="input-group-text">개</span>
                </div>
              </div>
              <div className="col-6">
                <label className="form-label small">더블</label>
                <div className="input-group">
                  <input
                    type="number"
                    name="doubleBed"
                    className="form-control text-end"
                    value={formData.doubleBed}
                    onChange={handleChange}
                  />
                  <span className="input-group-text">개</span>
                </div>
              </div>
              <div className="col-6">
                <label className="form-label small">퀸</label>
                <div className="input-group">
                  <input
                    type="number"
                    name="queenBed"
                    className="form-control text-end"
                    value={formData.queenBed}
                    onChange={handleChange}
                  />
                  <span className="input-group-text">개</span>
                </div>
              </div>
              <div className="col-6">
                <label className="form-label small">킹</label>
                <div className="input-group">
                  <input
                    type="number"
                    name="kingBed"
                    className="form-control text-end"
                    value={formData.kingBed}
                    onChange={handleChange}
                  />
                  <span className="input-group-text">개</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-5">
            <label className="form-label fw-bold">면적</label>
            <div className="input-group">
              <input
                type="number"
                name="area"
                className="form-control text-end"
                value={formData.area}
                onChange={handleChange}
              />
              <span className="input-group-text">m²</span>
            </div>
          </div>

          <div className="mb-3 pb-5">
            <label className="form-label fw-bold">상세 설명</label>
            {formData.roomId ? (
              <QuillEditor
                key={`quill-${resetTrigger}`}
                value={description}
                onChange={setDescription}
                style={{ height: '500px' }}
                targetType="ROOM"
                targetId={formData.roomId}
              />
            ) : <p>ID 발급 중...</p>}
          </div>

          <div className="mb-3 pt-5">
            <label className="form-label fw-bold">대표/갤러리 이미지</label>
            {formData.roomId ? (
              <ImageManager
                key={`image-manager-${resetTrigger}`}
                targetType="ROOM"
                targetId={formData.roomId}
                isEditMode={false}
                uploadTrigger={imageUploadTrigger}
                onUploadComplete={handleImageUploadComplete}
                onUploadError={handleImageUploadError}
              />
            ) : <p>ID 발급 중...</p>}
            {imageUploadError && <p className="text-danger mt-2">{imageUploadError}</p>}
          </div>
        </div>

        <div className="d-flex justify-content-end mt-3">
          <button type="submit" className="btn btn-primary" disabled={isSubmitting || formData.roomId === null}>
            {isSubmitting ? '등록 중...' : '객실 등록'}
          </button>
          <button type="button" className="btn btn-secondary ms-2" onClick={() => navigate(`/admin/accommodations/${accommodationId}/rooms`)}>
            취소
          </button>
        </div>
      </form>
    </Container>
  );
};

export default AdminRoomRegisterPage;
