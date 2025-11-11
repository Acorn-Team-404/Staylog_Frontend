import { useEffect, useState, useCallback, useMemo } from "react";
import api from "../../../global/api";
import "bootstrap/dist/css/bootstrap.min.css";
import { formatKST } from "../../../global/utils/date";
import type {
  AdminUser, Role, MemberStatus, AdminUserSearchParams, AdminUserListResponse
} from "../types/AdminUserTypes";
import { roleOptions, statusOptions, mapDtoToAdminUser } from "../types/AdminUserTypes";
import AdminUserDetailModal from "../components/AdminUserDetailModal";
import useCommonCodeSelector from "../../common/hooks/useCommonCodeSelector";
import type { CommonCodeDto } from "../../common/types";
import Pagination from "../../../global/components/Pagination";
import '../css/AdminTable.css';
import type { PageResponse } from "../../../global/types/Paginationtypes";

function AdminUserPage() {
  // 공통코드 → 상태 라벨/색상

  // DB 공통 코드 1. Redux의 공통 코드 스토어에서 특정 그룹 불러오기
  const userStatusList = useCommonCodeSelector("userStatus") as CommonCodeDto[];
  // 빠른 조회를 위한 codeId = CommonCodeDto Mapping 2. 그 리스트를 Map 형태로 변환 
  const userStatusMap = useMemo(() => {
    const m = new Map<string, CommonCodeDto>();
    for (const row of userStatusList ?? []) m.set(row.codeId, row);
    return m;
  }, [userStatusList]);
  // 서버가 "CONFIRM" 처럼 단축형으로 줄 수 있어서 통일 시키기
  const toStatusCodeId = (s?: MemberStatus | null) =>
    s ? `USER_STATUS_${String(s).toUpperCase()}` : "";
  const getStatusView = (status?: MemberStatus | null) => {
    // 3. 예약 목록 렌더링 시, 상태 코드에 해당하는 공통코드(label, color) 참조
    const cc = userStatusMap.get(toStatusCodeId(status));
    return { label: cc?.codeName ?? status ?? "—", color: cc?.attr1 ?? "#6c757d" };
  };

  //  페이지 상태 
  const [searchParams, setSearchParams] = useState<AdminUserSearchParams>({
    pageNum: 1,
    pageSize: 10,
  });
  const [inputKeyword, setInputKeyword] = useState<string>("");

  // 목록 / 페이징 정보 상태 관리
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [page, setPage] = useState<PageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setErrorMsg(null);
  
    // 유저 목록 조회
    api
      .get<AdminUserListResponse>("/v1/admin/users", { params: searchParams })
      .then((res) => {
        if (!mounted) return;
        setUsers((res.users ?? []).map(mapDtoToAdminUser));
        setPage(res.page);
      })
      .catch((err) => {
        console.error("유저 목록 조회 불가:", err);
        if (mounted) setErrorMsg("유저 목록을 불러오지 못했습니다.");
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [searchParams]);

  // 상세 모달
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const openDetail = useCallback((userId: number) => { setSelectedUserId(userId); setDetailOpen(true); }, []);
  const closeDetail = useCallback(() => { setDetailOpen(false); setSelectedUserId(null); }, []);

  // 권한/상태 변경
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);

  // 권한 변경 (ADMIN / VIP / USER)
  async function onChangeRole(userId: number, nextRole: Role) {
    const prev = users.find((u) => u.userId === userId)?.role;
    setUpdatingUserId(userId);
    setUsers((list) => list.map((u) => (u.userId === userId ? { ...u, role: nextRole } : u)));
    try {
      await api.patch(`/v1/admin/users/${userId}/role`, { role: nextRole });
    } catch { 
      console.log("유저 권한 변경 실패");
      setUsers((list) => list.map((u) => (u.userId === userId ? { ...u, role: prev ?? u.role } : u)));
    } finally {
      setUpdatingUserId(null);
    }
  }
  // 상태 변경 (ACTIVE / INACTIVE / WITHDRAWN)
  async function onChangeStatus(userId: number, nextStatus: MemberStatus) {
    const prev = users.find((u) => u.userId === userId)?.status;
    setUpdatingUserId(userId);
    setUsers((list) => list.map((u) => (u.userId === userId ? { ...u, status: nextStatus } : u)));
    try {
      await api.patch(`/v1/admin/users/${userId}/status`, { status: nextStatus });
    } catch {
      setUsers((list) => list.map((u) => (u.userId === userId ? { ...u, status: prev ?? u.status } : u)));
    } finally {
      setUpdatingUserId(null);
    }
  }
  // 검색 핸들 추가
  const handleSearch = () => {
    if (!inputKeyword.trim()) {
      alert("검색어를 입력해주세요.");
      return;
    }
    setSearchParams(prev => ({
      ...prev,
      keyword: inputKeyword.trim(),
      pageNum: 1,
    }));
  };
  // 검색 초기화
  const handleReset = () => {
    setInputKeyword("");
    setSearchParams({
      pageNum: 1,
      pageSize: 10,
    });
  };

  // 페이지 변경 핸들러 
  const handlePageChange = (nextPageNum: number) => {
    setSearchParams((prev) => ({
      ...prev,
      pageNum: nextPageNum,
    }));
  };

  return (
    <div className="container-fluid py-3">
      <h3>회원 관리 페이지</h3>

      <div className="d-flex align-items-center mt-3">
        <div className="ms-auto d-flex gap-2 flex-wrap">
          <div className="input-group">
            <input
              type="text"
              placeholder="회원 이름 검색"
              className="form-control form-control-sm"
              value={inputKeyword}
              onChange={(e) => setInputKeyword(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
            />
            <button title="검색" className="btn btn-sm btn-outline-secondary" onClick={handleSearch}>
              <i className="bi bi-search" />
            </button>
            <button title="모든 검색조건 제거" className="btn btn-sm btn-outline-secondary" onClick={handleReset}>
              <i className="bi bi-arrow-counterclockwise" />
            </button>
          </div>
        </div>
      </div>

      {/* 요약 정보 */}
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

      {/* 로딩/에러 */}
      {loading && (
        <div className="d-flex align-items-center gap-2 text-muted mt-3">
          <div className="spinner-border spinner-border-sm" role="status" />
          <span>불러오는 중…</span>
        </div>
      )}
      {!loading && errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

      {/*  데스크톱(표)  */}
      {!loading && !errorMsg && (
        <>
          <div className="table-responsive mt-1 d-none d-lg-block">
            <table className="table table-striped align-middle text-center">
              <thead className="table-light">
                <tr>
                  <th style={{ width: '6%' }}>번호</th>
                  <th style={{ minWidth: 140 }}>회원 이름</th>
                  <th style={{ minWidth: 200 }}>이메일</th>
                  <th style={{ width: 140 }}>Role</th>
                  <th style={{ width: 160 }}>가입일</th>
                  <th style={{ width: 160 }}>수정일</th>
                  <th style={{ width: 160 }}>마지막 로그인</th>
                  <th style={{ width: 160 }}>회원 상태</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-5 text-muted">
                      <i className="bi bi-inbox fs-1 d-block mb-3"></i>
                      <p className="mb-0">등록된 회원이 없습니다.</p>
                    </td>
                  </tr>
                ) : (
                  users.map((user, index) => (
                    <tr key={user.userId}>
                      <td>{page ? (page.pageNum - 1) * page.pageSize + index + 1 : index + 1}</td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-link p-0 text-decoration-none"
                          onClick={() => openDetail(user.userId)}
                        >
                          {user.name}
                        </button>
                      </td>
                      <td className="text-truncate" style={{ maxWidth: 260 }}>{user.email}</td>
                      <td>
                        <select
                          value={user.role}
                          disabled={updatingUserId === user.userId}
                          onChange={(e) => onChangeRole(user.userId, e.target.value as Role)}
                          className="form-select form-select-sm"
                        >
                          {roleOptions.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </td>
                      <td>{formatKST(user.createdAt)}</td>
                      <td>{formatKST(user.updatedAt)}</td>
                      <td>{formatKST(user.lastLogin)}</td>
                      <td>
                        <select
                          value={user.status}
                          disabled={updatingUserId === user.userId}
                          onChange={(e) => onChangeStatus(user.userId, e.target.value as MemberStatus)}
                          className="form-select form-select-sm"
                        >
                          {statusOptions.map((opt) => {
                            const view = getStatusView(opt);
                            return <option key={opt} value={opt}>{view.label}</option>;
                          })}
                        </select>
                        {(() => {
                          const view = getStatusView(user.status);
                          return (
                            <span className="badge ms-2" style={{ backgroundColor: view.color, color: "#fff" }}>
                              {view.label}
                            </span>
                          );
                        })()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/*  모바일(카드) */}
          <div className="d-lg-none d-grid gap-3 mt-3">
            {users.map((user) => {
              const view = getStatusView(user.status);
              return (
                <div key={user.userId} className="card shadow-sm">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <button
                          type="button"
                          className="btn btn-link p-0 text-decoration-none fw-semibold"
                          onClick={() => openDetail(user.userId)}
                        >
                          {user.name}
                        </button>
                        <div className="text-muted small">{user.email}</div>
                      </div>
                      <span className="badge" style={{ backgroundColor: view.color, color: "#fff" }}>
                        {view.label}
                      </span>
                    </div>

                    <div className="mt-2 small text-muted">
                      가입일 {formatKST(user.createdAt)}<br />
                      마지막 로그인 {formatKST(user.lastLogin)}
                    </div>

                    <div className="mt-3 d-flex gap-2">
                      <select
                        value={user.role}
                        disabled={updatingUserId === user.userId}
                        onChange={(e) => onChangeRole(user.userId, e.target.value as Role)}
                        className="form-select form-select-sm"
                      >
                        {roleOptions.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                      <select
                        value={user.status}
                        disabled={updatingUserId === user.userId}
                        onChange={(e) => onChangeStatus(user.userId, e.target.value as MemberStatus)}
                        className="form-select form-select-sm"
                      >
                        {statusOptions.map((opt) => {
                          const v = getStatusView(opt);
                          return <option key={opt} value={opt}>{v.label}</option>;
                        })}
                      </select>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* 페이지네이션 */}
      {page && <Pagination page={page} onPageChange={handlePageChange} />}

      <AdminUserDetailModal userId={selectedUserId} open={detailOpen} onClose={closeDetail} />
    </div>
  );
}

export default AdminUserPage;
