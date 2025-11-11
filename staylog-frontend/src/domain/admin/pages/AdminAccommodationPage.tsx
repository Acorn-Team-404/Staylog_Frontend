// src/domain/admin/pages/AdminAccommodationListPage.tsx

import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom"; // useNavigate 훅 임포트
import api from "../../../global/api";
import type { AdminAccommodationListData, AdminAccommodationSearchParams } from "../types/AdminAccommodationTypes";
import { formatKST } from "../../../global/utils/date";
import type { CommonCodeNameList } from "../types/CommonCodeNameList";
import type { PageResponse } from "../../../global/types/Paginationtypes";
import type { AdminAccommodationListResponse } from "../types/AdminAccommodationTypes";
import Pagination from "../../../global/components/Pagination";
import '../css/AdminTable.css';

// 상태 업데이트 API 호출 함수 (컴포넌트 외부에 정의하여 재사용)
const updateAccommodationStatus = async (accommodationId: number, status: 'Y' | 'N') => {
  try {
    await api.patch(`/v1/admin/accommodations/${accommodationId}/status`, {
      deletedYn: status
    });
    return true;
  } catch (err) {
    console.error(`숙소 ID ${accommodationId} 상태 업데이트 실패:`, err);
    return false;
  }
};


function AdminAccommodationListPage() {
  const navigate = useNavigate(); // 페이지 이동 훅
  const location = useLocation(); // 현재 위치 훅

  // 숙소 목록 상태 정의
  const [accommodations, setAccommodations] = useState<AdminAccommodationListData[]>([]);

  // location.state에서 검색 파라미터 복원
  const [searchParams, setSearchParams] = useState<AdminAccommodationSearchParams>(
    location.state?.searchParams || {
      pageNum: 1,
      pageSize: 10
    }
  );
  const [inputKeyword, setInputKeyword] = useState<string>(
    location.state?.inputKeyword || ''
  );

  //공통 코드 상태 정의
  const [acTypeCodeList, setAcTypeCodeList] = useState<CommonCodeNameList[]>([]);
  const [regionCodeList, setRegionCodeList] = useState<CommonCodeNameList[]>([]);


  // 전체 숙소 목록 조회 (컴포넌트 마운트 시)
  useEffect(() => {
    // 숙소 목록 로드
    api.get<AdminAccommodationListResponse>("/v1/admin/accommodations", { params: searchParams })
      .then(res => {
        setAccommodations(res.accommodations);
        setPage(res.page);
      })
      .catch(err => console.log("숙소 목록 로드 실패", err));

    // 공통 코드: 숙소 타입 목록 로드
    api.get<CommonCodeNameList[]>("/v1/commonCode", { params: { codeId: 'ACCOMMODATION_TYPE' } })
      .then(res => setAcTypeCodeList(res))
      .catch(err => console.log("숙소 타입 로드 실패", err));

    // 공통 코드: 지역 코드 목록 로드
    api.get<CommonCodeNameList[]>("/v1/commonCode", { params: { codeId: 'REGION_TYPE' } })
      .then(res => setRegionCodeList(res))
      .catch(err => console.log("지역 코드 로드 실패", err));
  }, [searchParams, searchParams.acType]);

  // 상태 변경 API 호출 핸들러 (원래 값 롤백 기능 포함)
  const handleStatusChange = async (
    accommodationId: number,
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    if (!accommodationId) return;

    const newStatus = e.target.value as 'Y' | 'N';

    // 롤백을 위한 원래 값 저장
    const originalStatus = accommodations.find(item => item.accommodationId === accommodationId)?.deletedYn!;

    if (originalStatus === newStatus) return;

    // UI 업데이트 
    setAccommodations(prev =>
      prev.map(item =>
        item.accommodationId === accommodationId
          ? { ...item, deletedYn: newStatus }
          : item
      )
    );

    // API 호출
    const success = await updateAccommodationStatus(accommodationId, newStatus);

    if (!success) {
      // API 실패 시, 원래 값으로 롤백
      alert('상태 업데이트 실패. 원래 상태로 되돌립니다.');
      setAccommodations(prev =>
        prev.map(item =>
          item.accommodationId === accommodationId
            ? { ...item, deletedYn: originalStatus }
            : item
        )
      );
    }
  };

  //숙소 상세 페이지 이동 핸들러
  const handleToDetailPage = (accommodationId: number) => {
    navigate(`/admin/accommodations/${accommodationId}`, {
      state: {
        searchParams,   // 현재 검색 조건
        inputKeyword,   // 현재 검색어
      }
    });
  };

  //객실 목록 페이지 이동 핸들러
  const handleGoToRooms = (accommodationId: number) => {
    navigate(`/admin/accommodations/${accommodationId}/rooms`);
  };

  //숙소 등록 페이지 이동 핸들러
  const handleToAddPage = () => {
    navigate(`/admin/accommodations/new`);
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
      pageNum: 1  // 검색 시 첫 페이지로
    }));
  };

  // 페이지 정보 상태 정의
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
        <h3>숙소 관리 페이지</h3>
        <button
          title="새 숙소 등록"
          className="btn btn-outline-light text-dark mt-2 fw-bold"
          style={{ backgroundColor: '#ebebebff' }} onClick={handleToAddPage}
        >
          <i className="bi bi-plus-lg"></i> <span className="d-none ms-2 d-md-inline">새 숙소 등록</span>
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
              name="acType"
              className="form-select form-select-sm border-light w-auto"
              value={searchParams.acType || ''}
              onChange={(e) => {
                const value = e.target.value;
                const filterValue = (value === 'ACCOMMODATION_TYPE' || value === '') ? undefined : value;
                setSearchParams(prev => ({
                  ...prev,
                  acType: filterValue
                }));
              }}
            >
              {acTypeCodeList.map(item => (
                <option key={item.codeId} value={item.codeId}>{item.codeName}</option>
              ))}
            </select>
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
              <option value="Y">숨김</option>
            </select>
          </div>

          {/* 검색어 입력 그룹 */}
          <div className="ms-md-auto d-flex gap-2 flex-wrap h-75 mt-2 mt-md-0">
            <div className="input-group h-75">
              <input
                type="text"
                placeholder="숙소명 검색"
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
      {/* -------- 데스크톱(≥lg): 테이블 -------- */}
      <div className="table-responsive mt-1 d-none d-lg-block">
        <table className="table table-striped text-center mt-1 custom-table">
          <thead className="table-light">
            <tr>
              <th style={{ width: '8%' }}>번호</th>
              <th style={{ width: '10%' }}>지역</th>
              <th>숙소명</th>
              <th style={{ width: '10%' }}>유형</th>
              <th style={{ width: '15%' }}>등록일</th>
              <th style={{ width: '10%' }}>상태</th>
              <th style={{ width: '10%' }}>객실목록</th>
            </tr>
          </thead>
          <tbody>
            {accommodations.length === 0 ? ( // 숙소가 하나도 없을 때
              <tr>
                <td colSpan={7} className="text-center py-5">
                  <div className="text-muted">
                    <i className="bi bi-inbox fs-1 d-block mb-3"></i>
                    <p className="mb-0">등록된 숙소가 없습니다.</p>
                  </div>
                </td>
              </tr>
            ) : (
              accommodations.map((item, index) => ( // 숙소가 있을 때
                <tr key={item.accommodationId || index}>
                  <td>{page ? (page.pageNum - 1) * page.pageSize + index + 1 : index + 1}</td>
                  <td>{item.regionName}</td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-link p-0 text-decoration-none"
                      onClick={() => handleToDetailPage(item.accommodationId!)}
                    >
                      {item.name}
                    </button>
                  </td>
                  <td>{item.typeName}</td>
                  <td>{formatKST(item.createdAt)}</td>
                  <td>
                    <select
                      className="form-select form-select-sm"
                      value={item.deletedYn}
                      onChange={(e) => handleStatusChange(item.accommodationId, e)}
                    >
                      <option value="N">활성</option>
                      <option value="Y">대기</option>
                    </select>
                    <span className={`badge bg-${item.deletedYn === 'N' ? 'success' : 'danger'}`}>
                      {item.deletedYn === 'N' ? '활성' : '대기'}
                    </span>
                  </td>
                  <td className="text-center">
                    <button
                      className="btn btn-sm btn-outline-primary me-1"
                      title="객실 목록 보기"
                      onClick={() => handleGoToRooms(item.accommodationId!)} // 이동 함수 연결
                    >
                      <i className="bi bi-list"></i>
                    </button>
                  </td>
                </tr>
              )))}
          </tbody>
        </table>
      </div>

      {/* -------- 모바일(<lg): 카드 -------- */}
      <div className="d-lg-none d-grid gap-3 mt-3">
        {accommodations.length === 0 ? (
          <div className="card shadow-sm">
            <div className="card-body text-center text-muted py-5">
              <i className="bi bi-inbox fs-1 d-block mb-3"></i>
              등록된 숙소가 없습니다.
            </div>
          </div>
        ) : (
          accommodations.map((item, index) => (
            <div key={item.accommodationId || index} className="card shadow-sm">
              <div className="card-body">
                {/* 상단: 숙소명/지역/유형 */}
                <div className="d-flex justify-content-between align-items-start gap-2">
                  <div className="flex-grow-1">
                    <button
                      type="button"
                      className="btn btn-link p-0 text-decoration-none fw-semibold text-start"
                      onClick={() => handleToDetailPage(item.accommodationId!)}
                    >
                      {item.name}
                    </button>
                    <div className="text-muted small">
                      {item.regionName} · {item.typeName}
                    </div>
                  </div>
                  <div className="text-nowrap">
                    <span className={`badge ${item.deletedYn === 'N' ? 'bg-success' : 'bg-danger'}`}>
                      {item.deletedYn === 'N' ? '활성' : '대기'}
                    </span>
                  </div>
                </div>

                {/* 중간: 등록일/일련번호 */}
                <div className="mt-2 small text-muted">
                  번호 <span className="ms-1">{page ? (page.pageNum - 1) * page.pageSize + index + 1 : index + 1}</span>
                  <br />
                  등록일 <span className="ms-1">{formatKST(item.createdAt)}</span>
                </div>

                {/* 하단: 상태변경 + 객실목록 버튼 */}
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <select
                    className="form-select form-select-sm w-auto"
                    value={item.deletedYn}
                    onChange={(e) => handleStatusChange(item.accommodationId!, e)}
                  >
                    <option value="N">활성</option>
                    <option value="Y">대기</option>
                  </select>
                  <button
                    className="btn btn-sm btn-outline-primary"
                    title="객실 목록 보기"
                    onClick={() => handleGoToRooms(item.accommodationId!)}
                  >
                    <i className="bi bi-list"></i>
                    <span className="d-none d-sm-inline ms-1">객실목록</span>
                  </button>
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


export default AdminAccommodationListPage;