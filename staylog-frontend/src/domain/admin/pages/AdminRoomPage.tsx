// src/domain/admin/pages/AdminRoomListPage.tsx

import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom"; // useNavigate 훅 임포트
import api from "../../../global/api";
import { formatKST } from "../../../global/utils/date";
import type { AdminRoomListData, AdminRoomListResponse, AdminRoomSearchParams } from "../types/AdminRoomTypes";
import type { CommonCodeNameList } from "../types/CommonCodeNameList";
import type { PageResponse } from "../../../global/types/Paginationtypes";
import Pagination from "../../../global/components/Pagination";
import '../css/AdminTable.css';

// 상태 업데이트 API 호출 함수 (컴포넌트 외부에 정의하여 재사용)
const updateAccommodationStatus = async (accommodationId: number, roomId: number, status: 'Y' | 'N') => {
    try {
        await api.patch(`/v1/admin/accommodations/${accommodationId}/rooms/${roomId}/status`, {
            deletedYn: status
        });
        return true;
    } catch (err) {
        console.log(`객실 ID ${roomId} 상태 업데이트 실패:`, err);
        return false;
    }
};


function AdminRoomPage() {
    // 숙소의 번호  /admin/accommodations/:accommodationId/rooms  에서 accommodationId 경로 변수 얻어내기 
    const { accommodationId: accommodationIdStr } = useParams();
    // 경로 변수를 숫자로 변환
    const accommodationId = Number(accommodationIdStr);

    const navigate = useNavigate(); // 페이지 이동 훅
    const location = useLocation(); // 현재 위치 훅
    const [rooms, setRooms] = useState<AdminRoomListData[]>([]);

    // location.state에서 전달된 검색어 상태 초기화
    const [searchParams, setSearchParams] = useState<AdminRoomSearchParams>(
        location.state?.searchParams || {
            keyword: '',
            accommodationId: accommodationId,
            pageNum: 1,
            pageSize: 10
        }
    );
    const [inputKeyword, setInputKeyword] = useState<string>(
        location.state?.inputKeyword || ''
    );

    //공통 코드 상태 정의
    const [rmTypeCodeList, setRmTypeCodeList] = useState<CommonCodeNameList[]>([]);

    // 전체 객실 목록 조회 (컴포넌트 마운트 시)
    useEffect(() => {
        api.get<AdminRoomListResponse>(`/v1/admin/accommodations/${accommodationId}/rooms`, { params: searchParams })
            .then(res => {
                setRooms(res.rooms);
                setPage(res.page);
            })
            .catch(err => console.log("객실 목록 로드 실패", err));


        // 공통 코드: 객실 타입 목록 로드
        api.get<CommonCodeNameList[]>("/v1/commonCode", { params: { codeId: 'ROOM_TYPE' } })
            .then(res => setRmTypeCodeList(res))
            .catch(err => console.log("객실 타입 로드 실패", err));
    }, [accommodationId, searchParams]);

    // 상태 변경 API 호출 핸들러 (원래 값 롤백 기능 포함)
    const handleStatusChange = async (
        accommodationId: number,
        roomId: number,
        e: React.ChangeEvent<HTMLSelectElement>
    ) => {
        if (!roomId) return;

        const newStatus = e.target.value as 'Y' | 'N';

        // 롤백을 위한 원래 값 저장
        const originalStatus = rooms.find(item => item.accommodationId === accommodationId && item.roomId === roomId)?.deletedYn!;

        if (originalStatus === newStatus) return;

        // UI 업데이트 
        setRooms(prev =>
            prev.map(item =>
                item.accommodationId === accommodationId && item.roomId === roomId
                    ? { ...item, deletedYn: newStatus }
                    : item
            )
        );

        // API 호출
        const success = await updateAccommodationStatus(accommodationId, roomId, newStatus);

        if (!success) {
            // API 실패 시, 원래 값으로 롤백
            alert('상태 업데이트 실패. 원래 상태로 되돌립니다.');
            setRooms(prev =>
                prev.map(item =>
                    item.accommodationId === accommodationId && item.roomId === roomId
                        ? { ...item, deletedYn: originalStatus }
                        : item
                )
            );
        }
    };

    //객실 상세 페이지 이동 핸들러
    const handleToDetailPage = (roomId: number) => {
        navigate(`/admin/accommodations/${accommodationId}/rooms/${roomId}`, {
            state: {
                searchParams,   // 현재 검색 조건
                inputKeyword,   // 현재 검색어
            }
        });
    };

    //숙소 상세 페이지 이동 핸들러
    const handleGoToAccommDetail = (accommodationId: number) => {
        navigate(`/admin/accommodations/${accommodationId}`);
    };

    //객실 등록 페이지 이동 핸들러
    const handleToAddPage = (accommodationId: number) => {
        navigate(`/admin/accommodations/${accommodationId}/rooms/new`);
    };

    // 검색 핸들러
    const handleSearch = () => {
        if (!inputKeyword.trim()) {
            alert('검색어를 입력해주세요.');
            return;
        }

        setSearchParams(prev => ({
            ...prev,
            keyword: inputKeyword.trim(),
            pageNum: 1 // 검색 시 1페이지로 이동
        }));
    };

    // 페이지 정보 상태
    const [page, setPage] = useState<PageResponse | null>(null);

    // 페이지 변경 핸들러
    const handlePageChange = (pageNum: number) => {
        setSearchParams(prev => ({
            ...prev,
            pageNum
        }));
    };

    return <>
        <div className="container-fluid py-3">
            <div className="d-flex justify-content-between align-items-center">
                <h3>
                    <span
                        className="fw-bold"
                        title="숙소 상세보기로 이동"
                        onClick={() => handleGoToAccommDetail(accommodationId)}
                        style={{ cursor: 'pointer', textDecoration: 'underline' }}>
                        {rooms[0]?.accommodationName}
                    </span> 객실 목록
                </h3>
                <button
                    title="새 객실 등록"
                    className="btn btn-outline-light text-dark mt-2 fw-bold"
                    style={{ backgroundColor: '#ebebebff' }} onClick={() => handleToAddPage(accommodationId)}
                >
                    <i className="bi bi-plus-lg"></i> <span className="d-none ms-2 d-md-inline">새 객실 등록</span>
                </button>
            </div>

            {/* 검색 필터 및 정렬 */}
            <div className="d-flex flex-column mt-3">
                {/* 모바일 전용 검색 필터 버튼 */}
                <button
                    className="btn btn-sm btn-outline-secondary d-md-none mb-3" // md 이상에서는 숨김 (d-md-none)
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#filterCollapse" // 아래 Collapse DIV의 ID와 일치
                >
                    검색 필터 설정 <i className="bi bi-funnel"></i>
                </button>

                {/* 필터 내용 (Collapse) */}
                <div className="collapse d-md-flex mt-3" id="filterCollapse">
                    {/* 상태/정렬 필터 그룹 */}
                    <div className="gap-1 flex-wrap d-flex">
                        <select
                            name="rmType"
                            className="form-select form-select-sm border-light w-auto"
                            value={searchParams.rmType || ''}
                            onChange={(e) => {
                                const value = e.target.value;
                                const filterValue = (value === 'ROOM_TYPE' || value === '') ? undefined : value;
                                setSearchParams(prev => ({
                                    ...prev,
                                    rmType: filterValue
                                }));
                            }}
                        >
                            {rmTypeCodeList.map(item => (
                                <option key={item.codeId} value={item.codeId}>{item.codeName}</option>
                            ))}
                        </select>
                        <select
                            name="status"
                            className="form-select form-select-sm border-light w-auto"
                            value={searchParams.deletedYn || ''}
                            onChange={(e) => {
                                const value = e.target.value as 'Y' | 'N' | '';
                                setSearchParams(prev => ({
                                    ...prev,
                                    deletedYn: value || undefined,
                                }));
                            }}
                        >
                            <option value=''>전체</option>
                            <option value="N">활성</option>
                            <option value="Y">대기</option>
                        </select>
                    </div>

                    {/* 검색어 입력 그룹 */}
                    <div className="ms-md-auto d-flex gap-2 flex-wrap h-75 mt-2 mt-md-0">
                        <div className="input-group h-75">
                            <input
                                type="text"
                                placeholder="객실명 검색"
                                className="form-control-sm border-1"
                                value={inputKeyword}
                                onChange={(e) => setInputKeyword(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleSearch();
                                    }
                                }}
                            />
                            <button title="검색" className="btn border-secondary border-1 btn-sm" onClick={handleSearch}>
                                <i className="bi bi-search"></i>
                            </button>
                            <button title="모든 검색조건 제거" className="btn border-secondary border-1 btn-sm" onClick={() => {
                                setInputKeyword('');
                                setSearchParams({
                                    accommodationId: accommodationId,
                                    pageNum: 1,
                                    pageSize: 10
                                });
                            }}>
                                <i className="bi bi-arrow-counterclockwise"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 페이지 정보 */}
            {page && (
                <small className="text-end text-muted mt-4 d-flex justify-content-end align-items-center gap-1">
                    전체 {page.totalCount}건 (
                    <input
                        type="number"
                        className="form-control-sm form-control border-1 border-light text-center d-inline-block"
                        value={page.totalPage === 0 ? 0 : page.pageNum}
                        style={{ width: '55px' }}
                        onChange={(e) => {
                            const newPageNum = Number(e.target.value);
                            if (newPageNum >= 0 && newPageNum <= page.totalPage) {
                                setSearchParams(prev => ({
                                    ...prev,
                                    pageNum: newPageNum
                                }));
                            }
                        }} /><span className="mx-1">/{page.totalPage} 페이지</span>)
                </small>
            )}

            {/* ---------- 데스크톱(≥lg): 테이블 ---------- */}
            <div className="table-responsive mt-1 d-none d-lg-block">
                <table className="table table-striped text-center mt-1 custom-table">
                    <thead className="table-light">
                        <tr>
                            <th style={{ width: '8%' }}>번호</th>
                            <th>객실명</th>
                            <th style={{ width: '10%' }}>유형</th>
                            <th style={{ width: '10%' }}>가격</th>
                            <th style={{ width: '20%' }}>최대 인원(성인)</th>
                            <th style={{ width: '15%' }}>등록일</th>
                            <th style={{ width: '10%' }}>상태</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rooms.length === 0 ? ( // 객실이 하나도 없을 때
                            <tr>
                                <td colSpan={7} className="text-center py-5">
                                    <div className="text-muted">
                                        <i className="bi bi-inbox fs-1 d-block mb-3"></i>
                                        <p className="mb-0">등록된 객실이 없습니다.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            rooms.map((item, index) => ( // 객실이 있을 때
                                <tr key={item.roomId}>
                                    <td>{index + 1}</td>
                                    <td>
                                        <button
                                            type="button"
                                            className="btn btn-link p-0 text-decoration-none"
                                            onClick={() => handleToDetailPage(item.roomId!)}
                                        >
                                            {item.name}
                                        </button>
                                    </td>
                                    <td>{item.typeName}</td>
                                    <td>{item.price!.toLocaleString()} 원</td>
                                    <td>{item.maxAdult}</td>
                                    <td>{formatKST(item.createdAt)}</td>
                                    <td>
                                        <select
                                            className="form-select form-select-sm"
                                            value={item.deletedYn}
                                            onChange={(e) => handleStatusChange(item.accommodationId, item.roomId, e)}
                                        >
                                            <option value="N">활성</option>
                                            <option value="Y">대기</option>
                                        </select>
                                        <span className={`badge bg-${item.deletedYn === 'N' ? 'success' : 'danger'}`}>
                                            {item.deletedYn === 'N' ? '활성' : '대기'}
                                        </span>
                                    </td>
                                </tr>
                            )))}
                    </tbody>
                </table>
            </div>

            {/* ---------- 모바일(<lg): 카드 ---------- */}
            <div className="d-lg-none d-grid gap-3 mt-3">
                {rooms.length === 0 ? (
                    <div className="card shadow-sm">
                        <div className="card-body text-center text-muted py-5">
                            <i className="bi bi-inbox fs-1 d-block mb-3"></i>
                            등록된 객실이 없습니다.
                        </div>
                    </div>
                ) : (
                    rooms.map((item, index) => (
                        <div key={item.roomId} className="card shadow-sm">
                            <div className="card-body">
                                {/* 상단: 객실명/유형/상태 */}
                                <div className="d-flex justify-content-between align-items-start gap-2">
                                    <div className="flex-grow-1">
                                        <button
                                            type="button"
                                            className="btn btn-link p-0 text-decoration-none fw-semibold text-start"
                                            onClick={() => handleToDetailPage(item.roomId!)}
                                        >
                                            {item.name}
                                        </button>
                                        <div className="text-muted small">
                                            {item.typeName}
                                        </div>
                                    </div>
                                    <div className="text-nowrap">
                                        <span className={`badge ${item.deletedYn === 'N' ? 'bg-success' : 'bg-danger'}`}>
                                            {item.deletedYn === 'N' ? '활성' : '대기'}
                                        </span>
                                    </div>
                                </div>

                                {/* 중간: 가격/최대 인원/등록일/번호 */}
                                <div className="mt-2 small text-muted">
                                    최대 인원(성인) <span className="ms-1">{item.maxAdult}</span> 명
                                    <br />
                                    가격 <span className="ms-1">{item.price!.toLocaleString()}</span> 원
                                </div>

                                {/* 하단: 상태 변경 */}
                                <div className="d-flex justify-content-end align-items-center mt-3">
                                    <span className="text-muted small me-auto">
                                        번호 <span className="ms-1">{page ? (page.pageNum - 1) * page.pageSize + index + 1 : index + 1}</span>
                                        <br />
                                        등록일 <span className="ms-1">{formatKST(item.createdAt)}</span>
                                    </span>
                                    <select
                                        className="form-select form-select-sm w-auto"
                                        value={item.deletedYn}
                                        onChange={(e) => handleStatusChange(item.accommodationId, item.roomId, e)}
                                    >
                                        <option value="N">활성</option>
                                        <option value="Y">대기</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* 페이지네이션 */}
            {page && <Pagination page={page} onPageChange={handlePageChange} />}
        </div>
    </>;
}

export default AdminRoomPage;