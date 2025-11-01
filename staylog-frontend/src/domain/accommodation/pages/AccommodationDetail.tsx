
import { Container, Row, Col, Carousel, Nav, Button, Image, Accordion, Card,} from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import type { AccommodationDetail, AccommodationRoomList } from '../types/accommodation';
import { useEffect, useState } from 'react';
import api from '../../../global/api';
import axios from 'axios';
import RoomList from '../components/RoomList';
import ReviewList from '../components/ReviewList';
import '../css/Accommodation.css';
/*
    Carousel : 숙소 대표 이미지
    Accordion : 클릭 시 펼쳐지는 기능
*/

function AccommodationDetail() {
    // 예비용 이미지
    const img1 = "https://picsum.photos/1400/500";
    const img2 = "https://picsum.photos/1400/500?grayscale";
    const img3 = "https://picsum.photos/200/300/?blur";
    const img4 = "https://picsum.photos/id/237/200/300";

    // URL 파라미터에서 숙소 ID 추출
    const { id: idString } = useParams<{id:string}>();
    const accommodationId = idString ? parseInt(idString):undefined;

    // 숙소 상세 데이터
    const [data, setData] = useState<AccommodationDetail|null>(null);
    // 로딩 상태
    const [loading, setLoading] = useState(true);
    // 에러 메세지
    const [error, setError] = useState<string|null>(null);
    // 선택된 객실
    const [selectedRoom, setSelectedRoom] = useState<AccommodationRoomList|null>(null);
    // 페이지 이동
    const navigate = useNavigate();
    // 메뉴 탭 기본값을 summary 로 설정
    const [activeTab, setActiveTab] = useState("summary");

    // 숙소 상세데이터를 가져오는 API 호출
    useEffect(() => {
        // 숙소 번호가 없다면
        if (!accommodationId) return;

        const fetchDetail = async () => {
            // 로딩 시작
            setLoading(true);

            try {
                const res = await api.get(`/v1/accommodations/${accommodationId}`);
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
    }, [accommodationId]);

    // 해당 탭 메뉴로 스크롤 이동
    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            // 부드러운 스크롤 이동
            element.scrollIntoView({ behavior:"smooth", block:"start" }); 
            // 해당 메뉴 클릭 시 상태 업데이트
            setActiveTab(id); 
        }
    };
    
    // 객실 선택 시 상태 업데이트와 페이지 이동
    const selectRoom = (room:AccommodationRoomList) => {
        setSelectedRoom(room);
        navigate(`/room/${room.roomId}`)

    }

    // 숙소 ID 가 없다면
    if(!accommodationId){
        return <div>숙소 ID가 없습니다</div>;
    }

    // 페이지 로딩 중 표시
    if(loading){
        return <div style={{ padding:"40px", textAlign:"center" }}> 숙소 정보 불러오는 중</div>;
    }

    // 에러 발생 표시
    if(error){
        return <div style={{ padding:"40px", color:"#f00", textAlign:"center"}}> 데이터 불러오기 실패 {error}</div>;
    }

    // 데이터가 없다면 표시
    if(!data){
        return <div style={{ padding:"40px", textAlign:"center" }}>t숙소 정보를 찾을 수 없습니다</div>;
    }

    // 전체 화면 너비 사용 : Container fluid
    return <>
        <Container fluid className="p-0"> 
            {/* 1. 숙소 대표 이미지 영역 */}
            <div className="accommodationImages images-slider">
                <Carousel className="w-100"> 
                    <Carousel.Item>
                        {/* 이미지 비율에 맞게 나오게 함*/}
                        <Image src={img1} alt="숙소 이미지 1" className="d-block w-100" style={{height:"580px", objectFit:"cover"}}/> 
                    </Carousel.Item>
                    <Carousel.Item>
                        <Image src={img2} alt="숙소 이미지 2" className="d-block w-100" style={{height:"580px", objectFit:"cover"}}/> 
                    </Carousel.Item>
                </Carousel>
            </div>
        
            {/* 숙소 상세 내용, 객실 목록, 리뷰 목록, 위치 지도, 안내사항, 예약폼 영역 */}
            <Container className="mt-4 mb-5">
                <Row>
                    {/* 왼쪽 : 숙소 상세페이지 영역*/}
                    {/* 반응형 레이아웃*/}
                    <Col lg={8}> 
                        <div className="left">
                            <h2>{data.name}</h2>
                            <p>{data.regionName}</p> 

                            {/* 메뉴 탭 버튼 영역*/}
                            <div className="menuTab mb-5">
                                <div className={`navItem ${activeTab === "summary" ? "active" : ""}`}
                                    onClick={() => scrollToSection("summary")}>
                                    소개
                                </div>
                                <div className={`navItem ${activeTab === "roomList" ? "active" : ""}`}
                                    onClick={() => scrollToSection("roomList")}>
                                    객실 선택
                                </div>
                                <div className={`navItem ${activeTab === 'reviewList' ? 'active' : ""}`}
                                    onClick={() => scrollToSection("reviewList")}>
                                    리뷰
                                </div>
                                <div className={`navItem ${activeTab === "locationMap" ? "active" : ""}`}
                                    onClick={() => scrollToSection('locationMap')}>
                                    위치
                                </div>
                                <div className={`navItem ${activeTab === "infoAccordion" ? "active" : ""}`}
                                    onClick={() => scrollToSection('infoAccordion')}>
                                    안내 사항
                                </div>
                            </div>

                            {/* 숙소 상세 소개 */}
                            <div className="accommodationDetail mb-5" id="summary">
                                <h4 className="mb-3">숙소 소개</h4>
                                <div className="detailImages">
                                    <Image 
                                        src="https://placehold.co/100x500/F0F3F7/99AAB5"
                                        className="mb-3"
                                        fluid 
                                        style={{ objectFit: "cover", width: "100%", height: "500px" }} 
                                    />
                                    <Image 
                                        src="https://placehold.co/100x500/F0F3F7/99AAB5"
                                        className="mb-3"
                                        fluid 
                                        style={{ objectFit: "cover", width: "100%", height: "500px" }} 
                                    />
                                </div>
                                <p>{data.description}</p>
                            </div>

                            {/* 해당 숙소 객실 목록 컴포넌트 */}
                            <div className="accommodationRoomList mb-5" id="roomList">
                                <h4 className="mb-3">객실 목록</h4>
                                {data.rooms && data.rooms.length > 0 ? (
                                <RoomList rooms={data.rooms} onSelect={selectRoom}/> 
                                ) : (
                                    <div className="placeholder-box"><p>등록된 객실이 없습니다</p></div>
                                )}

                            </div>

                            {/* 해당 숙소 리뷰 목록 컴포넌트*/}   
                            <div className="accommodationReviewList mb-5" id="reviewList">
                                {data.reviews && data.reviews.length > 0 ? (
                                    <ReviewList reviews={data.reviews}/>
                                ) : (
                                    <div className="placeholder-box"><p>등록된 리뷰가 없습니다</p></div>
                                )}
                            </div>        

                            {/* 숙소 위치 */}
                            <div className="mb-5" id="locationMap"> {/* ID 추가: Nav Link 연결용 */}
                                <h4 className="mb-3">위치</h4>
                                    <p>{data.address}</p>
                                <div className="mapApi border bg-light" style={{ height:"400px" }}>
                                    <p className="text-center p-5 text-muted">지도 API 영역</p>
                                </div>
                            </div>

                            {/* 안내 사항 */}
                            <div className="info mb-5" id="infoAccordion">
                                <h4 className="mb-3">안내 사항</h4>
                                <Accordion alwaysOpen className="customAccordion">
                                    {/* 예약 안내 */}
                                    <Accordion.Item eventKey="0">
                                        <Accordion.Header>예약 안내</Accordion.Header>
                                        <Accordion.Body>
                                            <ul>
                                                <li>예약 가능 시간: 오전 9시 ~ 오후 6시</li>
                                                <li>객실별 최대 인원을 초과할 수 없습니다. (유아 포함)</li>
                                                <li>예약 확정 후 발송되는 알림을 확인해 주시면 최종 입실 정보를 확인할 수 있습니다.</li>
                                                <li>반려 동물 동반이 불가한 숙소입니다.</li>
                                            </ul>
                                        </Accordion.Body>
                                    </Accordion.Item>

                                    {/* 이용 안내 */}
                                    <Accordion.Item eventKey="1">
                                        <Accordion.Header>이용 안내</Accordion.Header>
                                        <Accordion.Body>
                                            <strong>이용 규칙</strong>
                                            <p>입퇴실 시간 <span>체크인 : </span><span>체크아웃 : </span></p>
                                            <ul>
                                                <li>최대 인원을 초과하는 인원은 입실이 불가합니다.</li>
                                                <li>예약인원 외 방문객의 출입을 엄격히 제한합니다.</li>
                                                <li>미성년자의 경우 보호자(법정대리인)의 동행 없이 투숙이 불가합니다.</li>
                                                <li>모든 공간에서 절대 금연입니다. 위반 시 특수청소비가 청구됩니다.</li>
                                                <li>다른 객실에 피해가 되지 않도록 늦은 시간에는 소음에 유의해주세요.</li>
                                            </ul>
                                        </Accordion.Body>
                                    </Accordion.Item>

                                    {/* 환불 규정 */}
                                    <Accordion.Item eventKey="2">
                                        <Accordion.Header>환불 규정</Accordion.Header>
                                        <Accordion.Body>
                                            <strong>환불 금액</strong>
                                            
                                            <ol>
                                                <li>체크인 15일 전 : 총 결제금액의 100% 환불</li>
                                                <li>체크인 9일 전 : 총 결제금액의 90% 환불</li>
                                                <li>체크인 8일 전: 총 결제금액의 80% 환불</li>
                                                <li>체크인 7일 전 : 총 결제금액의 70% 환불</li>
                                                <li>체크인 6일 전 : 총 결제금액의 60% 환불</li>
                                                <li>체크인 5일 전 : 총 결제금액의 50% 환불</li>
                                                <li>체크인 4일 전 : 총 결제금액의 40% 환불</li>
                                                <li>체크인 3일 전 : 변경 / 환불 불가</li>
                                            </ol>
                                        </Accordion.Body>
                                    </Accordion.Item>
                                </Accordion>
                            </div>
                            
                        </div>
                    </Col>

                    {/* 오른쪽 : 예약폼 영역 */}
                    <Col lg={4}>
                        <div className="right sticky-top pt-lg-0 pt-4">
                            {/* ReservationForm으로 선택된 객실 ID/정보 전달 */}
                            
                        </div>
                    </Col>
                </Row>
            </Container>
        </Container>
    </>
}

export default AccommodationDetail;