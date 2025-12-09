
import { Col, Container, Card, Form, Row} from 'react-bootstrap';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../../../global/api';
import axios from 'axios';
import { formatKST } from '../../../global/utils/date';
import type { AdminRoom } from '../types/AdminRoomTypes';
import '../css/AdminDescriptionImg.css';
import ImageCarousel from '../../../global/components/ImageCarousel';

/*
    Carousel : 객실 대표 이미지
    Accordion : 클릭 시 펼쳐지는 기능
*/

function AdminRoomDetail() {
    // 예비용 이미지
    const img1 = "https://picsum.photos/1400/500";
    const img2 = "https://picsum.photos/1400/500?grayscale";
    const img3 = "https://picsum.photos/200/300/?blur";
    const img4 = "https://picsum.photos/id/237/200/300";

    // 숙소, 객실의 번호  /admin/accommodations/:accommodationId/rooms/:roomId  에서 accommodationId, roomId 경로 변수 얻어내기
    const { accommodationId: accommodationIdStr, roomId: roomIdStr } = useParams();
    // 경로 변수를 숫자로 변환
    const accommodationId = Number(accommodationIdStr);
    const roomId = Number(roomIdStr);

    // 객실 상세 데이터
    const [data, setData] = useState<AdminRoom | null>(null);
    // 로딩 상태
    const [loading, setLoading] = useState(true);
    // 에러 메세지
    const [error, setError] = useState<string | null>(null);

    // 페이지 이동
    const navigate = useNavigate();
    const location = useLocation();

    // 객실 상세데이터를 가져오는 API 호출
    useEffect(() => {
        // 숙소, 객실 번호가 없다면
        if (!accommodationId || !roomId) return;
        const fetchDetail = async () => {
            // 로딩 시작
            setLoading(true);

            try {
                const res = await api.get(`/v1/admin/accommodations/${accommodationId}/rooms/${roomId}`);
                // 데이터 상태 업데이트
                setData(res);
                // 확인용
                console.log(res);
            } catch (err) {
                // axios 에러 처리
                if (axios.isAxiosError(err)) {
                    setError(
                        err.response?.status === 404
                            ? '해당 객실은 존재하지 않습니다.'
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
    }, [accommodationId, roomId, data?.deletedYn]);

    // 객실 ID 가 없다면
    if (!roomId) {
        return <div>객실 ID가 없습니다</div>;
    }

    // 페이지 로딩 중 표시
    if (loading) {
        return <div style={{ padding: "40px", textAlign: "center" }}> 객실 정보 불러오는 중</div>;
    }

    // 에러 발생 표시
    if (error) {
        return <div style={{ padding: "40px", color: "#f00", textAlign: "center" }}> 데이터 불러오기 실패 {error}</div>;
    }

    // 데이터가 없다면 표시
    if (!data) {
        return <div style={{ padding: "40px", textAlign: "center" }}>객실 정보를 찾을 수 없습니다</div>;
    }

    // 상태 업데이트 API 호출 함수
    const updateRoomStatus = async (roomId: number, status: 'Y' | 'N') => {
        try {
            await api.patch(`/v1/admin/accommodations/${accommodationId}/rooms/${roomId}/status`, {
                deletedYn: status
            });
            setData(data => ({ ...data!, deletedYn: status })); // 상태 업데이트
            return true;
        } catch (err) {
            console.error(`객실 ID ${roomId} 상태 업데이트 실패:`, err);
            return false;
        }
    };

    // 객실 목록 페이지 이동 핸들러
    const handleGoToList = () => {
        if (location.state?.from) {
            // 저장된 검색 상태와 함께 목록으로 돌아가기
            navigate(`/admin/accommodations/${accommodationId}/rooms`, {
                state: {
                    searchParams: location.state.searchParams,
                    inputKeyword: location.state.inputKeyword
                }
            });
        } else {
            // state가 없으면 그냥 뒤로가기
            navigate(-1);
        }
    };

    //객실 수정 페이지 이동 핸들러
    const handleGoToUpdate = (roomId: number) => {
        navigate(`/admin/accommodations/${accommodationId}/rooms/${roomId}/update`);
    }


    // 전체 화면 너비 사용 : Container fluid
    return <>
        <Container fluid className="p-0">
            {/* 헤더 */}
            <h3 className="justify-content-start d-flex align-items-end">
                {data.name}
                <span className={`ms-2 badge ${data.deletedYn === 'N' ? 'bg-success' : 'bg-secondary'}`} style={{ fontSize: '0.8rem' }}>
                    {data.deletedYn === 'N' ? '활성화' : '비활성화'}
                </span>
            </h3>
            <div className="text-muted mb-3">
                <div className="d-flex flex-column flex-md-row gap-md-3">
                    <span>등록일: {formatKST(data.createdAt)}</span>
                    <span>수정일: {data.updatedAt ? formatKST(data.updatedAt) : '-'}</span>
                </div>
            </div>

            {/* 버튼 그룹 */}
            <div className="d-flex flex-md-row justify-content-between gap-2 mt-4 mt-md-5 mb-4">
                <div>
                    <button
                        title="객실목록으로 돌아가기"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={handleGoToList}
                    >
                        <i className="bi bi-arrow-left"></i>
                        <span className="d-none d-sm-inline ms-1">뒤로가기</span>
                    </button>
                </div>
                <div className="d-flex gap-1">
                    <button
                        title="객실 수정하기"
                        className="btn btn-sm btn-primary"
                        onClick={() => handleGoToUpdate(data.roomId!)}
                    >
                        <i className="bi bi-pencil"></i>
                        <span className="d-none d-sm-inline ms-1">수정</span>
                    </button>
                    {data.deletedYn === 'N' ? (
                        <button
                            title="비활성화하기"
                            className="btn btn-sm btn-danger text-white"
                            onClick={() => updateRoomStatus(data.roomId!, 'Y')}
                        >
                            <i className="bi bi-eye-slash"></i>
                            <span className="d-none d-sm-inline ms-1">비활성화</span>
                        </button>
                    ) : (
                        <button
                            title="활성화하기"
                            className="btn btn-sm btn-success"
                            onClick={() => updateRoomStatus(data.roomId!, 'N')}
                        >
                            <i className="bi bi-eye"></i>
                            <span className="d-none d-sm-inline ms-1">활성화</span>
                        </button>
                    )}
                </div>
            </div>

            <Card className="mb-3">
                <Card.Body>
                    {/* 숙소정보 */}
                    <Form.Group as={Row} className="mb-3">
                        <Form.Label column xs={12} md={3} lg={2} className="fw-bold">
                            숙소정보
                        </Form.Label>
                        <Col xs={12} md={9} lg={10}>
                            <Form.Control
                                plaintext
                                readOnly
                                value={data.accommodationName}
                                className="form-control-sm"
                            />
                        </Col>
                    </Form.Group>

                    {/* 유형 */}
                    <Form.Group as={Row} className="mb-3">
                        <Form.Label column xs={12} md={3} lg={2} className="fw-bold">
                            유형
                        </Form.Label>
                        <Col xs={12} md={9} lg={10}>
                            <Form.Control
                                plaintext
                                readOnly
                                value={data.typeName}
                                className="form-control-sm"
                            />
                        </Col>
                    </Form.Group>

                    {/* 가격 */}
                    <Form.Group as={Row} className="mb-3">
                        <Form.Label column xs={12} md={3} lg={2} className="fw-bold">
                            가격
                        </Form.Label>
                        <Col xs={12} md={9} lg={10}>
                            <Form.Control
                                plaintext
                                readOnly
                                value={`${data.price!.toLocaleString()} 원`}
                                className="form-control-sm"
                            />
                        </Col>
                    </Form.Group>

                    {/* 최대 인원 */}
                    <Form.Group as={Row} className="mb-3">
                        <Form.Label column xs={12} md={3} lg={2} className="fw-bold">
                            최대 인원
                        </Form.Label>
                        <Col xs={12} md={9} lg={10}>
                            <div className="d-none d-md-block">
                                <Card style={{ maxWidth: '400px' }}>
                                    <Card.Body className="gap-2 d-flex flex-column">
                                        <Form.Group className='d-flex justify-content-between'>
                                            <Form.Label className='fw-bold'>성인</Form.Label>
                                            <div className="d-flex align-items-center">
                                                <Form.Control
                                                    type="text"
                                                    name='maxAdult'
                                                    size="sm"
                                                    className="text-end"
                                                    value={data.maxAdult}
                                                    readOnly
                                                />
                                                <span className="ms-2">명</span>
                                            </div>
                                        </Form.Group>

                                        <Form.Group className="d-flex justify-content-between">
                                            <Form.Label className='fw-bold'>어린이</Form.Label>
                                            <div className="d-flex align-items-center">
                                                <Form.Control
                                                    type="text"
                                                    name='maxChildren'
                                                    size="sm"
                                                    className="text-end"
                                                    value={data.maxChildren}
                                                    readOnly
                                                />
                                                <span className="ms-2">명</span>
                                            </div>
                                        </Form.Group>
                                        <Form.Group className="d-flex justify-content-between">
                                            <Form.Label className='fw-bold'>유아</Form.Label>
                                            <div className="d-flex align-items-center">
                                                <Form.Control
                                                    type="text"
                                                    name='maxInfant'
                                                    size="sm"
                                                    className="text-end"
                                                    value={data.maxInfant}
                                                    readOnly
                                                />
                                                <span className="ms-2">명</span>
                                            </div>
                                        </Form.Group>
                                    </Card.Body>
                                </Card>
                            </div>
                            <div className="d-flex gap-3 d-md-none mt-1">
                                {data.maxAdult !== 0 && <span>성인 {data.maxAdult}명</span>}
                                {data.maxChildren !== 0 && <span>어린이 {data.maxChildren}명</span>}
                                {data.maxInfant !== 0 && <span>유아 {data.maxInfant}명</span>}
                            </div>
                        </Col>
                    </Form.Group>

                    {/* 침대 */}
                    <Form.Group as={Row} className="mb-3">
                        <Form.Label column xs={12} md={3} lg={2} className="fw-bold">
                            침대
                        </Form.Label>
                        <Col xs={12} md={9} lg={10}>
                            <div className="d-none d-md-block">
                                <Card style={{ maxWidth: '400px' }}>
                                    <Card.Body className="gap-2 d-flex flex-column">
                                        <Form.Group className="d-flex justify-content-between">
                                            <Form.Label className='fw-bold'>싱글</Form.Label>
                                            <div className="d-flex align-items-center">
                                                <Form.Control
                                                    type="text"
                                                    name="singleBed"
                                                    size="sm"
                                                    className="text-end"
                                                    value={data.singleBed}
                                                />
                                                <span className="ms-2">개</span>
                                            </div>
                                        </Form.Group>
                                        <Form.Group className='d-flex justify-content-between'>
                                            <Form.Label className='fw-bold'>더블</Form.Label>
                                            <div className="d-flex align-items-center">
                                                <Form.Control
                                                    type="text"
                                                    name="doubleBed"
                                                    size="sm"
                                                    className="text-end"
                                                    value={data.doubleBed}
                                                    readOnly
                                                />
                                                <span className="ms-2">개</span>
                                            </div>
                                        </Form.Group>
                                        <Form.Group className="d-flex justify-content-between">
                                            <Form.Label className='fw-bold'>퀸</Form.Label>
                                            <div className="d-flex align-items-center">
                                                <Form.Control
                                                    type="text"
                                                    name="queenBed"
                                                    size="sm"
                                                    className="text-end"
                                                    value={data.queenBed}
                                                    readOnly
                                                />
                                                <span className="ms-2">개</span>
                                            </div>
                                        </Form.Group>
                                        <Form.Group className="d-flex justify-content-between">
                                            <Form.Label className='fw-bold'>킹</Form.Label>
                                            <div className="d-flex align-items-center">
                                                <Form.Control
                                                    type="text"
                                                    name="kingBed"
                                                    size="sm"
                                                    className="text-end"
                                                    value={data.kingBed}
                                                    readOnly
                                                />
                                                <span className="ms-2">개</span>
                                            </div>
                                        </Form.Group>
                                    </Card.Body>
                                </Card>
                            </div>
                            <div className="d-flex gap-3 d-md-none mt-1">
                                {data.singleBed !== 0 && <span>싱글 {data.singleBed}개</span>}
                                {data.doubleBed !== 0 && <span>더블 {data.doubleBed}개</span>}
                                {data.queenBed !== 0 && <span>퀸 {data.queenBed}개</span>}
                                {data.kingBed !== 0 && <span>킹 {data.kingBed}개</span>}
                            </div>
                        </Col>
                    </Form.Group>

                    {/* 면적 */}
                    <Form.Group as={Row} className="mb-0">
                        <Form.Label column xs={12} md={3} lg={2} className="fw-bold">
                            면적
                        </Form.Label>
                        <Col xs={12} md={9} lg={10}>
                            <Form.Control
                                plaintext
                                readOnly
                                value={`${data.area} m²`}
                                className="form-control-sm"
                            />
                        </Col>
                    </Form.Group>
                </Card.Body>
            </Card>

            {/* 객실 페이지 미리 보기 */}
            <p className='fs-5 text-center my-4 border-top py-3 border bg-light rounded'>객실 페이지 미리 보기</p>

            <div className="my-4 accommodationAll pb-3">
                <div className="border p-4 rounded">
                    <ImageCarousel
                        targetType='ROOM'
                        targetId={roomId}
                        aspectRatio='21:9'
                        rounded={true}
                        arrowsOnHover={true}
                        indicatorType='numbers-only'
                    />

                    <h4 className="fw-bold">{data.name}</h4>

                    <section className="md-4">
                        <div className="room-rule-box">
                            <h5>객실 규정</h5>
                            <ul className="room-rules">
                                <li>체크인 {data.checkInTime} / 체크아웃 {data.checkOutTime}</li>
                                <li>기준 {data.maxAdult} 명 (최대 {data.maxAdult! + data.maxChildren! + data.maxInfant!} 명)</li>
                            </ul>
                        </div>

                        <div className="room-price">
                            ₩{data.price}
                        </div>

                        <section className="mt-4">
                            <h3 className="h5 mb-3">편의시설</h3>
                            <div className="d-flex flex-wrap gap-4 fs-6">
                                <div className="d-flex align-items-center gap-1">
                                    <i className="bi bi-wifi fs-4"></i>
                                    <span>와이파이</span>
                                </div>
                                <div className="d-flex align-items-center gap-1">
                                    <i className="bi bi-cup-hot fs-4"></i>
                                    <span>커피머신</span>
                                </div>
                                <div className="d-flex align-items-center gap-1">
                                    <i className="bi bi-webcam fs-4"></i>
                                    <span>CCTV</span>
                                </div>
                                <div className="d-flex align-items-center gap-1">
                                    <i className="bi bi-p-square fs-4"></i>
                                    <span>주차가능</span>
                                </div>
                                <div className="d-flex align-items-center gap-1">
                                    <i className="bi bi-water fs-4"></i>
                                    <span>수영장</span>
                                </div>
                            </div>
                        </section>
                        <hr />
                        <div className="room-description my-4 description-content" dangerouslySetInnerHTML={{ __html: data.description }} />
                        <hr />
                    </section>
                </div>
            </div>
        </Container>
    </>
}

export default AdminRoomDetail;