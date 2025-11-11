// src/domain/admin/pages/AdminBoardListPage.tsx

import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../../global/api";
import { formatKST } from "../../../global/utils/date";
import type {
    AdminBoardList,
    AdminBoardSearchParams,
    AdminBoardListResponse
} from "../types/AdminBoardTypes";
import '../css/AdminTable.css';
import type { PageResponse } from "../../../global/types/Paginationtypes";
import Pagination from "../../../global/components/Pagination";
import type { CommonCodeNameList } from "../types/CommonCodeNameList";

// 상태 업데이트 API 호출 함수
const updateBoardStatus = async (boardId: number, status: 'Y' | 'N') => {
    try {
        await api.patch(`/v1/admin/boards/${boardId}/status`, {
            deleted: status
        });
        return true;
    } catch (err) {
        console.error(`게시판 ID ${boardId} 상태 업데이트 실패:`, err);
        return false;
    }
};

function AdminBoardPage() {
    const navigate = useNavigate(); // 페이지 이동 훅
    const location = useLocation(); // 현재 위치 훅
    const [boards, setBoards] = useState<AdminBoardList[]>([]); // 게시글 목록 상태

    // location.state에서 검색어 복원
    const [inputKeyword, setInputKeyword] = useState<string>(
        location.state?.inputKeyword || ''
    );
    const [searchParams, setSearchParams] = useState<AdminBoardSearchParams>(
        location.state?.searchParams || {
            boardType: 'BOARD_REVIEW',
            pageNum: 1,
            pageSize: 10
        }
    );

    //공통 코드 상태 정의
    const [regionCodeList, setRegionCodeList] = useState<CommonCodeNameList[]>([]);


    // 게시글 목록 조회
    useEffect(() => {
        api.get<AdminBoardListResponse>("/v1/admin/boards", { params: searchParams })
            .then(res => {
                setBoards(res.boards);
                setPage(res.page);
            })
            .catch(err => console.log("게시글 목록 로드 실패", err));

        // 공통 코드: 지역 코드 목록 로드
        api.get<CommonCodeNameList[]>("/v1/commonCode", { params: { codeId: 'REGION_TYPE' } })
            .then(res => setRegionCodeList(res))
            .catch(err => console.log("지역 코드 로드 실패", err));
    }, [searchParams]);

    // 상태 변경 핸들러
    const handleStatusChange = async (
        boardId: number,
        e: React.ChangeEvent<HTMLSelectElement>
    ) => {
        if (!boardId) return;

        const newStatus = e.target.value as 'Y' | 'N';
        const originalStatus = boards.find(item => item.boardId === boardId)?.deleted!;

        if (originalStatus === newStatus) return;

        // UI 업데이트 
        setBoards(prev =>
            prev.map(item =>
                item.boardId === boardId
                    ? { ...item, deleted: newStatus }
                    : item
            )
        );

        // API 호출
        const success = await updateBoardStatus(boardId, newStatus);

        if (!success) {
            alert('상태 업데이트 실패. 원래 상태로 되돌립니다.');
            setBoards(prev =>
                prev.map(item =>
                    item.boardId === boardId
                        ? { ...item, deleted: originalStatus }
                        : item
                )
            );
        }
    };

    // 검색 핸들러
    const handleSearch = () => {
        if (!searchParams.searchType) {
            alert('검색 기준을 선택해주세요.');
            return;
        }
        if (!inputKeyword.trim()) {
            alert('검색어를 입력해주세요.');
            return;
        }

        setSearchParams(prev => ({
            ...prev,
            keyword: inputKeyword.trim(),
            pageNum: 1  // 검색 시 첫 페이지로
        }));
    };

    // 상세 페이지 이동
    const handleToDetailPage = (boardId: number) => {
        navigate(`/admin/boards/${boardId}`, {
            state: {
                searchParams,   // 현재 검색 조건
                inputKeyword,   // 현재 검색어
            }
        });
    };

    // 게시판 타입 변경
    const handleBoardTypeChange = (boardType: 'BOARD_REVIEW' | 'BOARD_JOURNAL') => {
        setSearchParams({
            boardType,
            pageNum: 1,
            pageSize: 10
        });
        setInputKeyword('');
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

    return (
        <div className="container-fluid">
            {/* 게시판 타입 선택 */}
            <div className="d-flex gap-2 mt-3 mb-4">
                <button
                    className={`btn ${searchParams.boardType === 'BOARD_REVIEW' ? 'select-bg border-light fw-bold' : 'btn-outline-light text-secondary'}`}
                    onClick={() => handleBoardTypeChange('BOARD_REVIEW')}
                >리뷰 게시판</button>
                <button
                    className={`btn ${searchParams.boardType === 'BOARD_JOURNAL' ? 'select-bg border-light fw-bold' : 'btn-outline-light text-secondary'}`}
                    onClick={() => handleBoardTypeChange('BOARD_JOURNAL')}
                >저널 게시판</button>
            </div>

            <h4>{searchParams.boardType === 'BOARD_REVIEW' ? '리뷰 게시판 관리' : '저널 게시판 관리'}</h4>

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
                <div className="collapse d-md-flex" id="filterCollapse">

                    {/* 상태/정렬 필터 그룹 */}
                    <div className="gap-1 flex-wrap d-flex gap-2 flex-wrap d-flex align-items-center">
                        <select
                            name="status"
                            className="form-select form-select-sm border-light w-auto"
                            value={searchParams.deleted || ''}
                            onChange={(e) => {
                                const value = e.target.value as 'Y' | 'N' | '';
                                setSearchParams(prev => ({
                                    ...prev,
                                    deleted: value || null,
                                    pageNum: 1
                                }));
                            }}
                        >
                            <option value=''>전체</option>
                            <option value="N">공개</option>
                            <option value="Y">숨김</option>
                        </select>

                        {/* 지역 코드 필터 (저널 게시판 전용) */}
                        {searchParams.boardType === 'BOARD_JOURNAL' && (
                            <select
                                name="regionCode"
                                className="form-select form-select-sm border-light w-auto"
                                value={searchParams.regionCode || ''}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    const filterValue = (value === 'REGION_TYPE' || value === '') ? undefined : value;
                                    setSearchParams(prev => ({
                                        ...prev,
                                        regionCode: filterValue
                                    }));
                                }}
                            >
                                {regionCodeList.map(item => (
                                    <option key={item.codeId} value={item.codeId}>{item.codeName}</option>
                                ))}
                            </select>
                        )}

                        <select
                            className="form-select form-select-sm border-light w-auto"
                            name="orderBy"
                            onChange={(e) => {
                                const [sortBy, sortOrder] = e.target.value.split('_') as ['createdAt' | 'viewsCount' | 'rating' | 'likesCount', 'ASC' | 'DESC'];
                                setSearchParams(prev => ({
                                    ...prev,
                                    sortBy,
                                    sortOrder,
                                    pageNum: 1
                                }));
                            }}
                        >
                            <option value="createdAt_DESC">최신등록순</option>
                            <option value="createdAt_ASC">오래된순</option>
                            {searchParams.boardType === 'BOARD_REVIEW' && (
                                <>
                                    <option value="rating_DESC">평점 높은순</option>
                                    <option value="rating_ASC">평점 낮은순</option>
                                </>
                            )}
                            <option value="viewsCount_DESC">조회수 높은순</option>
                            <option value="viewsCount_ASC">조회수 낮은순</option>
                            <option value="likesCount_DESC">좋아요 많은순</option>
                            <option value="likesCount_ASC">좋아요 적은순</option>
                        </select>
                    </div>

                    {/* 검색 기준 및 입력 그룹 */}
                    <div className="ms-md-auto d-flex gap-2 mt-2 mt-md-0 align-items-center">
                        {/* 검색어 기준 필터 (리뷰 게시판 전용 - 숙소명, 작성자) */}
                        {searchParams.boardType === 'BOARD_REVIEW' && (
                            <select
                                name="searchType"
                                className="form-select form-select-sm border-light w-auto"
                                value={searchParams.searchType || ''}
                                onChange={(e) => {
                                    const value = e.target.value as 'accommodationName' | 'userNickName' | undefined;
                                    setSearchParams(prev => ({
                                        ...prev,
                                        searchType: value || undefined
                                    }));
                                }}
                            >
                                <option value=''>검색 기준</option>
                                <option value="accommodationName">숙소명</option>
                                <option value="userNickName">작성자</option>
                            </select>
                        )}


                        <div className="input-group input-group-sm">
                            <input
                                type="text"
                                placeholder={searchParams.boardType === 'BOARD_REVIEW' ? "검색어 입력" : "작성자명 입력"}
                                className="form-control-sm border-1"
                                value={inputKeyword}
                                onChange={(e) => {
                                    setInputKeyword(e.target.value);
                                    {
                                        searchParams.boardType === 'BOARD_JOURNAL' && setSearchParams(prev => ({
                                            ...prev,
                                            searchType: 'userNickName'
                                        }))
                                    }
                                }}
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
                                    boardType: searchParams.boardType,
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
                            {searchParams.boardType === 'BOARD_REVIEW' ? <th>숙소명</th> : <th>지역</th>}
                            <th>제목</th>
                            <th style={{ width: '12%' }}>작성자</th>
                            <th>반응지표</th>
                            <th style={{ width: '15%' }}>등록일</th>
                            <th style={{ width: '10%' }}>상태</th>
                        </tr>
                    </thead>
                    <tbody>
                        {boards.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="text-center py-5">
                                    <div className="text-muted">
                                        <i className="bi bi-inbox fs-1 d-block mb-3"></i>
                                        <p className="mb-0">등록된 게시글이 없습니다.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            boards.map((item, index) => (
                                <tr key={item.boardId}>
                                    <td>{page ? (page.pageNum - 1) * page.pageSize + index + 1 : index + 1}</td>
                                    {searchParams.boardType === 'BOARD_REVIEW' ? <td>{item.accommodationName || '-'}</td> : <td>{item.regionName || '-'}</td>}
                                    <td>
                                        <button
                                            type="button"
                                            className="btn btn-link p-0 text-decoration-none"
                                            onClick={() => handleToDetailPage(item.boardId)}
                                        >
                                            {item.title}
                                        </button>
                                    </td>
                                    <td>{item.userNickName}</td>
                                    <td>
                                        {searchParams.boardType === 'BOARD_REVIEW' && (
                                            <span className="badge bg-warning text-dark me-1">
                                                <i className="bi bi-star"></i> {item.rating}
                                            </span>
                                        )}
                                        <span className="badge bg-danger me-1">
                                            <i className="bi bi-heart"></i> {item.likesCount}
                                        </span>
                                        <span className="badge bg-secondary">
                                            <i className="bi bi-eye"></i> {item.viewsCount}
                                        </span>
                                    </td>
                                    <td>{formatKST(item.createdAt)}</td>
                                    <td>
                                        <select
                                            className="form-select form-select-sm"
                                            value={item.deleted}
                                            onChange={(e) => handleStatusChange(item.boardId, e)}
                                        >
                                            <option value="N">공개</option>
                                            <option value="Y">숨김</option>
                                        </select>
                                        <span className={`badge bg-${item.deleted === 'N' ? 'success' : 'danger'}`}>
                                            {item.deleted === 'N' ? '공개' : '숨김'}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>


            {/* ---------- 모바일(<lg): 카드 ---------- */}
            <div className="d-lg-none d-grid gap-3 mt-3">
                {boards.length === 0 ? (
                    <div className="card shadow-sm">
                        <div className="card-body text-center text-muted py-5">
                            <i className="bi bi-inbox fs-1 d-block mb-3"></i>
                            등록된 게시글이 없습니다.
                        </div>
                    </div>
                ) : (
                    boards.map((item, index) => (
                        <div key={item.boardId} className="card shadow-sm">
                            <div className="card-body">
                                {/* 상단: 제목/작성자/상태 */}
                                <div className="d-flex justify-content-between align-items-start gap-2">
                                    <div className="flex-grow-1">
                                        <button
                                            type="button"
                                            className="btn btn-link p-0 text-decoration-none fw-semibold text-start"
                                            onClick={() => handleToDetailPage(item.boardId)}
                                        >
                                            {item.title}
                                        </button>
                                        <div className="text-muted small">
                                            {item.accommodationName || "-"} · {item.userNickName}
                                        </div>
                                    </div>
                                    <div className="text-nowrap">
                                        <span
                                            className={`badge ${item.deleted === "N" ? "bg-success" : "bg-danger"
                                                }`}
                                        >
                                            {item.deleted === "N" ? "공개" : "숨김"}
                                        </span>
                                    </div>
                                </div>


                                {/* 중간: 반응지표 */}
                                <div className="mt-2 small gap-1 d-flex align-items-center">
                                    {searchParams.boardType === "BOARD_REVIEW" && (
                                        <span className="badge bg-warning text-dark">
                                            <i title="별점" className="bi bi-star"></i> {item.rating}
                                        </span>
                                    )}
                                    <span className="badge bg-danger">
                                        <i title="좋아요수" className="bi bi-heart"></i> {item.likesCount}
                                    </span>
                                    <span className="badge bg-secondary">
                                        <i title="조회수" className="bi bi-eye"></i> {item.viewsCount}
                                    </span>
                                </div>

                                {/* 하단: 날짜 + 상태 선택 */}
                                <div className="d-flex justify-content-between align-items-center mt-3">
                                    <div className="text-muted small">
                                        번호 <span className="ms-1">{page ? (page.pageNum - 1) * page.pageSize + index + 1 : index + 1}</span>
                                        <br />
                                        등록일 <span className="ms-1">{formatKST(item.createdAt)}</span>
                                    </div>
                                    <div className="d-flex align-items-center gap-2">
                                        <select
                                            className="form-select form-select-sm"
                                            value={item.deleted}
                                            onChange={(e) => handleStatusChange(item.boardId, e)}
                                        >
                                            <option value="N">공개</option>
                                            <option value="Y">숨김</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* 페이지네이션 */}
            {page && <Pagination page={page} onPageChange={handlePageChange} />}
        </div>
    );
}

export default AdminBoardPage;