import React, { useState, useEffect, useCallback } from 'react';
import { Container } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../../global/api';
import axios from 'axios';
import type { CommonCodeNameList } from '../types/CommonCodeNameList';
import type { AdminAccommodation } from '../types/AdminAccommodationTypes';
import AddressSearch from '../../../global/components/AddressSearch';
import ImageManager from '../../../global/components/ImageManager';
import QuillEditor from '../../../global/components/QuillEditor';

const AdminAccommodationUpdate: React.FC = () => {
    const { accommodationId: accommodationIdStr } = useParams();
    const accommodationId = Number(accommodationIdStr);
    const navigate = useNavigate();

    // 폼 데이터 상태
    const [data, setData] = useState<Omit<AdminAccommodation, 'description'> | null>(null);
    // Quill Editor 내용은 별도 상태로 관리
    const [description, setDescription] = useState<string>('');
    // 롤백용 원본 데이터
    const [originalData, setOriginalData] = useState<AdminAccommodation | null>(null);

    // 컴포넌트 리셋을 위한 트리거 상태
    const [resetTrigger, setResetTrigger] = useState<number>(0);

    // ImageManager의 저장 트리거 및 상태
    const [imageUploadTrigger, setImageUploadTrigger] = useState<number>(0);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [imageUploadError, setImageUploadError] = useState<string | null>(null);

    // 기타 상태
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [acTypeCodeList, setAcTypeCodeList] = useState<CommonCodeNameList[]>([]);
    const [regionCodeList, setRegionCodeList] = useState<CommonCodeNameList[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 데이터 로딩 useEffect
    useEffect(() => {
        if (!accommodationId) return;
        const fetchDetail = async () => {
            setLoading(true);
            try {
                const [detailRes, acTypeRes, regionRes] = await Promise.all([
                    api.get<AdminAccommodation>(`/v1/admin/accommodations/${accommodationId}`),
                    api.get<CommonCodeNameList[]>("/v1/commonCode", { params: { codeId: 'ACCOMMODATION_TYPE' } }),
                    api.get<CommonCodeNameList[]>("/v1/commonCode", { params: { codeId: 'REGION_TYPE' } })
                ]);

                const { description, ...restData } = detailRes;
                setData(restData);
                setDescription(description || '');
                setOriginalData(detailRes); // 원본 데이터는 description 포함하여 저장
                setAcTypeCodeList(acTypeRes);
                setRegionCodeList(regionRes);
            } catch (err) {
                if (axios.isAxiosError(err)) {
                    setError(err.response?.status === 404 ? '해당 숙소는 존재하지 않습니다.' : `API 호출 실패: ${err.response?.status || '네트워크 오류'}`);
                } else {
                    setError('알 수 없는 오류 발생');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [accommodationId]);

    // 폼 제출 핸들러 (2단계 저장)
    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!data) return;
        setIsSubmitting(true);

        try {
            // 1. 텍스트 정보 수정
            const payload = { ...data, description };
            await api.patch(`/v1/admin/accommodations/${accommodationId}`, payload);
            console.log('숙소 기본 정보 수정 성공:', payload);

            // 2. 이미지 저장을 트리거
            setImageUploadTrigger(prev => prev + 1);
        } catch (err) {
            console.error('숙소 정보 수정 실패:', err);
            alert('숙소 정보 수정에 실패했습니다.');
            setIsSubmitting(false);
        }
    }, [data, description, accommodationId]);

    // ImageManager 업로드 완료 콜백
    const handleImageUploadComplete = useCallback(() => {
        setIsSubmitting(false);
        alert('숙소 정보가 성공적으로 수정되었습니다!');
        navigate(`/admin/accommodations/${accommodationId}`);
    }, [navigate, accommodationId]);

    // ImageManager 업로드 에러 콜백
    const handleImageUploadError = useCallback((errorMsg: string) => {
        setIsSubmitting(false);
        setImageUploadError(errorMsg);
        alert(`이미지 업로드 중 오류가 발생했습니다: ${errorMsg}`);
    }, []);

    // 초기화 핸들러
    const handleReset = () => {
        // confirm 대화상자를 띄워 사용자 확인을 받습니다.
        if (window.confirm("정말 초기화하시겠습니까?")) {
            if (originalData) {
                const { description, ...restData } = originalData;
                setData(restData);
                setDescription(description || '');
                setResetTrigger(prev => prev + 1);
                alert('입력 내용이 초기화되었습니다.'); // 확인 시에만 알림 표시
            }
        }
    };

    // 로딩 및 에러 처리 UI (기존과 동일)
    if (loading) return <Container fluid className="p-5 text-center"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div></Container>;
    if (error) return <Container fluid className="p-4 text-center"><div className="alert alert-danger">{error}</div></Container>;
    if (!data) return <Container fluid className="p-4 text-center"><div className="alert alert-info">숙소 정보를 찾을 수 없습니다.</div></Container>;

    return (
        <Container fluid className="p-4">
            <h3 className="mb-4">
                {data.name} 수정폼
                <span className={`ms-2 badge ${data.deletedYn === 'N' ? 'bg-success' : 'bg-secondary'}`} style={{ fontSize: '0.8rem' }}>
                    {data.deletedYn === 'N' ? '활성화' : '비활성화'}
                </span>
            </h3>
            <form onSubmit={handleSubmit}>
                {/* 데스크톱: 테이블 표시 */}
                <div className="d-none d-md-block">
                    <table className="table table-bordered">
                        <tbody>
                            {/* 숙소명, 유형, 지역, 주소, 체크인/아웃 등 기존 필드들 */}
                            <tr>
                                <th className="bg-light text-center" style={{ width: '20%' }}>숙소명</th>
                                <td>
                                    <input type="text" className="form-control form-control-sm" value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} required />
                                </td>
                            </tr>
                            <tr>
                                <th className="bg-light text-center">유형</th>
                                <td>
                                    <select name="acType" className="form-select form-select-sm" value={data.acType} onChange={(e) => setData({ ...data, acType: e.target.value })} required>
                                        {acTypeCodeList.map(item => <option key={item.codeId} value={item.codeId}>{item.codeName}</option>)}
                                    </select>
                                </td>
                            </tr>
                            <tr>
                                <th className="bg-light text-center">지역</th>
                                <td>
                                    <select name="regionCode" className="form-select form-select-sm" value={data.regionCode} onChange={(e) => setData({ ...data, regionCode: e.target.value })} required>
                                        {regionCodeList.map(item => <option key={item.codeId} value={item.codeId}>{item.codeName}</option>)}
                                    </select>
                                </td>
                            </tr>
                            <tr>
                                <th className="bg-light text-center">주소</th>
                                <td>
                                    <div className='input-group input-group-sm'>
                                        <input type="text" className="form-control form-control-sm" value={data.address} readOnly />
                                        <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setShowAddressModal(true)}>주소 검색</button>
                                    </div>
                                    <AddressSearch show={showAddressModal} onClose={() => setShowAddressModal(false)} onAddressSelect={(address, coords) => { setData({ ...data, address, latitude: coords.lat, longitude: coords.lng }); setShowAddressModal(false); }} />
                                </td>
                            </tr>
                            <tr>
                                <th className="bg-light text-center">체크인/체크아웃</th>
                                <td>
                                    <div className="d-flex align-items-center">
                                        <input type="time" name="checkInTime" className="form-control form-control-sm me-2" value={data.checkInTime} onChange={(e) => setData({ ...data, checkInTime: e.target.value })} />
                                        <span>~</span>
                                        <input type="time" name="checkOutTime" className="form-control form-control-sm ms-2" value={data.checkOutTime} onChange={(e) => setData({ ...data, checkOutTime: e.target.value })} />
                                    </div>
                                </td>
                            </tr>
                            {/* 상세 설명 (QuillEditor) */}
                            <tr>
                                <th className="bg-light text-center align-middle">상세 설명</th>
                                <td>
                                    <div className="mt-1 mb-5">
                                        <QuillEditor
                                            key={`quill-${resetTrigger}`}
                                            value={description}
                                            onChange={setDescription}
                                            style={{ height: '700px' }}
                                            targetType="ACCOMMODATION"
                                            targetId={accommodationId}
                                        />
                                    </div>
                                </td>
                            </tr>
                            {/* 대표/갤러리 이미지 (ImageManager) */}
                            <tr>
                                <th className="bg-light text-center align-middle">대표/갤러리 이미지</th>
                                <td>
                                    <ImageManager
                                        key={`image-manager-${resetTrigger}`}
                                        targetType="ACCOMMODATION"
                                        targetId={accommodationId}
                                        isEditMode={true} // 수정 모드 활성화
                                        uploadTrigger={imageUploadTrigger}
                                        onUploadComplete={handleImageUploadComplete}
                                        onUploadError={handleImageUploadError}
                                    />
                                    {imageUploadError && <p className="text-danger mt-2">{imageUploadError}</p>}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* 모바일: 카드형 표시 */}
                <div className="d-md-none">
                    <hr className="my-4" />

                    <div className="mb-3">
                        <label className="form-label fw-bold">숙소명</label>
                        <input
                            type="text"
                            className="form-control"
                            value={data.name}
                            onChange={(e) => setData({ ...data, name: e.target.value })}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-bold">유형</label>
                        <select
                            name="acType"
                            className="form-select"
                            value={data.acType}
                            onChange={(e) => setData({ ...data, acType: e.target.value })}
                            required
                        >
                            {acTypeCodeList.map(item => <option key={item.codeId} value={item.codeId}>{item.codeName}</option>)}
                        </select>
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-bold">지역</label>
                        <select
                            name="regionCode"
                            className="form-select"
                            value={data.regionCode}
                            onChange={(e) => setData({ ...data, regionCode: e.target.value })}
                            required
                        >
                            {regionCodeList.map(item => <option key={item.codeId} value={item.codeId}>{item.codeName}</option>)}
                        </select>
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-bold">주소</label>
                        <div className='input-group'>
                            <input type="text" className="form-control" value={data.address} readOnly />
                            <button type="button" className="btn btn-outline-secondary" onClick={() => setShowAddressModal(true)}>
                                주소 검색
                            </button>
                        </div>
                        <AddressSearch
                            show={showAddressModal}
                            onClose={() => setShowAddressModal(false)}
                            onAddressSelect={(address, coords) => {
                                setData({ ...data, address, latitude: coords.lat, longitude: coords.lng });
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
                                value={data.checkInTime}
                                onChange={(e) => setData({ ...data, checkInTime: e.target.value })}
                            />
                            <span>~</span>
                            <input
                                type="time"
                                name="checkOutTime"
                                className="form-control"
                                value={data.checkOutTime}
                                onChange={(e) => setData({ ...data, checkOutTime: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="mb-3 pb-5">
                        <label className="form-label fw-bold">상세 설명</label>
                        <QuillEditor
                            key={`quill-${resetTrigger}`}
                            value={description}
                            onChange={setDescription}
                            style={{ height: '500px' }}
                            targetType="ACCOMMODATION"
                            targetId={accommodationId}
                        />
                    </div>

                    <div className="mb-3 pt-5">
                        <label className="form-label fw-bold">대표/갤러리 이미지</label>
                        <ImageManager
                            key={`image-manager-${resetTrigger}`}
                            targetType="ACCOMMODATION"
                            targetId={accommodationId}
                            isEditMode={true}
                            uploadTrigger={imageUploadTrigger}
                            onUploadComplete={handleImageUploadComplete}
                            onUploadError={handleImageUploadError}
                        />
                        {imageUploadError && <p className="text-danger mt-2">{imageUploadError}</p>}
                    </div>
                </div>

                <div className="d-flex justify-content-end mt-3">
                    <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                        {isSubmitting ? '수정 중...' : '수정 완료'}
                    </button>
                    <button type="button" className="btn btn-danger ms-2" onClick={handleReset}>
                        초기화
                    </button>
                    <button type="button" className="btn btn-secondary ms-2" onClick={() => navigate(`/admin/accommodations/${accommodationId}`)}>
                        취소
                    </button>
                </div>
            </form>
        </Container>
    );
};

export default AdminAccommodationUpdate;