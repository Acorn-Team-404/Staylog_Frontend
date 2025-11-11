
import { Container, Carousel } from 'react-bootstrap';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../../../global/api';
import axios from 'axios';
import type { AdminAccommodation } from '../types/AdminAccommodationTypes';
import { formatKST } from '../../../global/utils/date';
import KakaoMap from '../../accommodation/components/KakaoMap';
import '../css/AdminDescriptionImg.css'
import ImageCarousel from '../../../global/components/ImageCarousel';
/*
    Carousel : 숙소 대표 이미지
    Accordion : 클릭 시 펼쳐지는 기능
*/

function AdminAccommodationDetail() {
    // 예비용 이미지
    const img1 = "https://picsum.photos/1400/500";
    const img2 = "https://picsum.photos/1400/500?grayscale";
    const img3 = "https://picsum.photos/200/300/?blur";
    const img4 = "https://picsum.photos/id/237/200/300";

    // 숙소의 번호  /admin/accommodations/:accommodationId  에서 accommodationId 경로 변수 얻어내기 
    const { accommodationId: accommodationIdStr } = useParams();
    // 경로 변수를 숫자로 변환
    const accommodationId = Number(accommodationIdStr);

    // 숙소 상세 데이터
    const [data, setData] = useState<AdminAccommodation | null>(null);
    // 로딩 상태
    const [loading, setLoading] = useState(true);
    // 에러 메세지
    const [error, setError] = useState<string | null>(null);
    // 페이지 이동
    const navigate = useNavigate();
    const location = useLocation();

    // 숙소 상세데이터를 가져오는 API 호출
    useEffect(() => {
        // 숙소 번호가 없다면
        if (!accommodationId) return;
        const fetchDetail = async () => {
            // 로딩 시작
            setLoading(true);

            try {
                const res = await api.get(`/v1/admin/accommodations/${accommodationId}`);
                // 데이터 상태 업데이트
                setData(res);
                // 확인용
                console.log(res);
            } catch (err) {
                // axios 에러 처리
                if (axios.isAxiosError(err)) {
                    setError(
                        err.response?.status === 404
                            ? '해당 숙소는 존재하지 않습니다.'
                            : `API 호출 실패: ${err.response?.status || '네트워크 오류'}`
                    );
                } else {
                    setError('알 수 없는 오류 발생');
                }
            } finally {
                // 로딩 종료
                setLoading(false);
            }
        };
        fetchDetail();
    }, [accommodationId, data?.deletedYn]);

    // 숙소 ID 가 없다면
    if (!accommodationId) {
        return <div>숙소 ID가 없습니다</div>;
    }

    // 페이지 로딩 중 표시
    if (loading) {
        return <div style={{ padding: "40px", textAlign: "center" }}> 숙소 정보 불러오는 중</div>;
    }

    // 에러 발생 표시
    if (error) {
        return <div style={{ padding: "40px", color: "#f00", textAlign: "center" }}> 데이터 불러오기 실패 {error}</div>;
    }

    // 데이터가 없다면 표시
    if (!data) {
        return <div style={{ padding: "40px", textAlign: "center" }}>숙소 정보를 찾을 수 없습니다</div>;
    }

    //숙소 수정 페이지 이동 핸들러
    const handleGoToUpdate = (accommodationId: number) => {
        navigate(`/admin/accommodations/${accommodationId}/update`);
    };

    //객실 목록 페이지 이동 핸들러
    const handleGoToRooms = (accommodationId: number) => {
        navigate(`/admin/accommodations/${accommodationId}/rooms`);
    };

    // 숙소 목록 페이지 이동 핸들러
    const handleGoToList = () => {
        if (location.state?.from) {
            // 저장된 검색 상태와 함께 목록으로 돌아가기
            navigate(`/admin/accommodations`, {
                state: {
                    searchParams: location.state.searchParams,
                    inputKeyword: location.state.inputKeyword
                }
            });
        } else {
            // 기본적으로 목록으로 돌아가기
            navigate('/admin/accommodations');
        }
    };

    // 상태 업데이트 API 호출 함수 (컴포넌트 외부에 정의하여 재사용)
    const updateAccommodationStatus = async (accommodationId: number, status: 'Y' | 'N') => {
        try {
            await api.patch(`/v1/admin/accommodations/${accommodationId}/status`, {
                deletedYn: status
            });
            setData(data => ({ ...data!, deletedYn: status })); // 상태 업데이트
            return true;
        } catch (err) {
            console.error(`숙소 ID ${accommodationId} 상태 업데이트 실패:`, err);
            return false;
        }
    };

    // 전체 화면 너비 사용 : Container fluid
    return <>
        <Container fluid className="p-0">
            {/* 헤더 */}
            <h3 className="justify-content-between d-flex align-items-end">
                <div>
                    {data.name}
                    <span className={`ms-2 badge ${data.deletedYn === 'N' ? 'bg-success' : 'bg-secondary'}`} style={{ fontSize: '0.8rem' }}>
                        {data.deletedYn === 'N' ? '활성화' : '비활성화'}
                    </span>
                </div>
                {data.avgRating ? (
                    <div style={{ fontSize: '1rem' }}>
                        <i title='평균별점' className="bi bi-star-fill text-warning me-1"></i> {data.avgRating}&nbsp;
                        (<i title='리뷰' className="bi bi-person"></i> {data.reviewCount}개)
                    </div>
                ) : (
                    <span style={{ fontSize: '1rem' }}>등록된 리뷰가 없습니다.</span>
                )}
            </h3>
            <div className="text-muted mb-3">
                <div className="d-flex flex-column flex-md-row gap-1 gap-md-2">
                    <span>등록일: {formatKST(data.createdAt)}</span>
                    <span>수정일: {data.updatedAt ? formatKST(data.updatedAt) : '-'}</span>
                </div>
            </div>

            {/* 버튼 그룹 */}
            <div className="d-flex flex-md-row justify-content-between gap-2 mt-4 mt-md-5 mb-4">
                <button
                    title="숙소목록으로 돌아가기"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={handleGoToList}
                >
                    <i className="bi bi-arrow-left"></i>
                    <span className="d-none d-sm-inline ms-1">뒤로가기</span>
                </button>

                <div className="d-flex gap-1">
                    <button
                        title="숙소 수정하기"
                        className="btn btn-sm btn-primary"
                        onClick={() => handleGoToUpdate(data.accommodationId!)}
                    >
                        <i className="bi bi-pencil"></i>
                        <span className="d-none d-sm-inline ms-1">수정</span>
                    </button>
                    {data.deletedYn === 'N' ? (
                        <button
                            title="비활성화하기"
                            className="btn btn-sm btn-danger text-white"
                            onClick={() => updateAccommodationStatus(data.accommodationId!, 'Y')}
                        >
                            <i className="bi bi-eye-slash"></i>
                            <span className="d-none d-sm-inline ms-1">비활성화</span>
                        </button>
                    ) : (
                        <button
                            title="활성화하기"
                            className="btn btn-sm btn-success"
                            onClick={() => updateAccommodationStatus(data.accommodationId!, 'N')}
                        >
                            <i className="bi bi-eye"></i>
                            <span className="d-none d-sm-inline ms-1">활성화</span>
                        </button>
                    )}
                    <button
                        title="객실 목록 보기"
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => handleGoToRooms(data.accommodationId!)}
                    >
                        <i className="bi bi-list"></i>
                        <span className="d-none d-sm-inline ms-1">객실목록</span>
                    </button>
                </div>
            </div>

            {/* 데스크톱: 테이블 */}
            <div className="d-none d-md-block">
                <table className="table table-bordered mt-2" style={{ tableLayout: 'fixed', width: '100%' }}>
                    <tbody>
                        <tr>
                            <th className="bg-light text-center" style={{ width: '25%' }}>유형</th>
                            <td>{data.typeName}</td>
                        </tr>
                        <tr>
                            <th className="bg-light text-center">지역</th>
                            <td>{data.regionName}</td>
                        </tr>
                        <tr>
                            <th className="bg-light text-center">주소</th>
                            <td>{data.address}</td>
                        </tr>
                        <tr>
                            <th className="bg-light text-center">체크인 / 체크아웃</th>
                            <td>
                                {data.checkInTime} ~ {data.checkOutTime}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* 모바일: 카드 형식 */}
            <div className="d-md-none">
                <div className="card mb-3">
                    <div className="card-body">
                        <h6 className="card-subtitle mb-2 text-muted">유형</h6>
                        <p className="card-text">{data.typeName}</p>
                    </div>
                </div>

                <div className="card mb-3">
                    <div className="card-body">
                        <h6 className="card-subtitle mb-2 text-muted">지역</h6>
                        <p className="card-text">{data.regionName}</p>
                    </div>
                </div>

                <div className="card mb-3">
                    <div className="card-body">
                        <h6 className="card-subtitle mb-2 text-muted">주소</h6>
                        <p className="card-text">{data.address}</p>
                    </div>
                </div>

                <div className="card mb-3">
                    <div className="card-body">
                        <h6 className="card-subtitle mb-2 text-muted">체크인 / 체크아웃</h6>
                        <p className="card-text">{data.checkInTime} ~ {data.checkOutTime}</p>
                    </div>
                </div>
            </div>
            <p className='fs-5 text-center my-4 border-top py-3 border bg-light rounded'>숙소 페이지 미리 보기</p>

            <div className="p-0">
                <div className="border p-4 rounded">
                    {/* 숙소 대표 이미지 영역 */}
                    <div className="images-slider mb-3">
                        <ImageCarousel
                            targetType='ACCOMMODATION'
                            targetId={accommodationId}
                            aspectRatio='21:9'
                            rounded={true}
                            arrowsOnHover={true}
                        />
                    </div>

                    {/* 숙소 기본 정보 */}
                    <h3 className="mb-1">{data.name}</h3>
                    <small className="text-muted">{data.regionName}</small>

                    {/* 숙소 상세 소개 */}
                    <div className="my-4">
                        <h5 className="mb-3 pb-2" style={{ borderBottom: '2px solid #dee2e6' }}>
                            숙소 소개
                        </h5>
                        <p
                            className="description-content"
                            style={{ fontSize: "0.85rem", lineHeight: "1.6", color: "#495057" }}
                            dangerouslySetInnerHTML={{ __html: data.description }}
                        />
                    </div>

                    {/* 숙소 위치 */}
                    <div className="my-4">
                        <h5 className="mb-3 pb-2" style={{ borderBottom: '2px solid #dee2e6' }}>
                            위치
                        </h5>
                        <p className="mb-3" style={{ fontSize: "0.9rem", color: "#495057" }}>
                            {data.address}
                        </p>
                        <div
                            className="rounded overflow-hidden"
                            style={{
                                height: "25rem",
                                border: '1px solid #dee2e6'
                            }}
                        >
                            <KakaoMap
                                latitude={Number(data.latitude)}
                                longitude={Number(data.longitude)}
                                height="25rem"
                                level={3}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </Container >
    </>
}

export default AdminAccommodationDetail;