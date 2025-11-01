import { useEffect, useState, useCallback } from "react";
import api from "../../../global/api";
import "bootstrap/dist/css/bootstrap.min.css";
import { formatKST } from "../../../global/utils/date";
import type { AdminUserDto, AdminUser, Role, MemberStatus } from "../types/AdminTypes";
import { roleOptions, statusOptions, mapDtoToAdminUser } from "../types/AdminTypes";
import AdminUserDetailModal from "../components/AdminUserDetailModal";

const STATUS_COLORS: Record<MemberStatus, string> = {
  ACTIVE: "#28a745",      // green
  INACTIVE: "#ffc107",    // yellow
  WITHDRAWN: "#dc3545",   // red
};

function AdminUserPage() {
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [updatingUserId, setupdatingUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 목록 조회
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setErrorMsg(null);

    api
      .get<{ users: AdminUserDto[] }>("/v1/admin/users", { params: { pageNum: 1 } })
      .then((res) => {
        const list = Array.isArray(res.users) ? res.users : [];
        if (mounted) setUsers(list.map(mapDtoToAdminUser));
      })
      .catch((err) => {
        console.error("유저 목록 조회 불가:", err);
        if (mounted) setErrorMsg("유저 목록을 불러오지 못했습니다.");
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  const openDetail = useCallback((userId: number) => {
    setSelectedUserId(userId);
    setDetailOpen(true);
  }, []);
  const closeDetail = useCallback(() => {
    setDetailOpen(false);
    setSelectedUserId(null);
  }, []);

  // 권한 변경
  async function onChangeRole(userId: number, nextRole: Role) {
    const prev = users.find((u) => u.userId === userId)?.role;
    setupdatingUserId(userId);
    setUsers((list) => list.map((u) => (u.userId === userId ? { ...u, role: nextRole } : u)));

    try {
      // 필요 시 POST로 교체하세요: await api.post(`/v1/admin/users/${userId}/role`, { role: nextRole });
      await api.patch(`/v1/admin/users/${userId}/role`, { role: nextRole });
    } catch (err) {
      console.log("유저 권한 변경 실패");
      setUsers((list) =>
        list.map((u) => {
          if (u.userId !== userId) return u;
          return u.role === nextRole ? { ...u, role: prev ?? u.role } : u;
        }),
      );
    } finally {
      setupdatingUserId(null);
    }
  }

  // 상태 변경
  async function onChangeStatus(userId: number, nextStatus: MemberStatus) {
    const prev = users.find((u) => u.userId === userId)?.status;
    setupdatingUserId(userId);
    setUsers((list) => list.map((u) => (u.userId === userId ? { ...u, status: nextStatus } : u)));

    try {
      await api.patch(`/v1/admin/users/${userId}/status`, { status: nextStatus });
    } catch (err) {
      console.log("유저 상태 변경 실패");
      setUsers((list) =>
        list.map((u) => {
          if (u.userId !== userId) return u;
          return u.status === nextStatus ? { ...u, status: prev ?? u.status } : u;
        }),
      );
    } finally {
      setupdatingUserId(null);
    }
  }

  return (
    <div className="container-fluid py-3">
      <div className="d-flex align-items-center justify-content-between mb-3">
      </div>

      {/* 로딩 / 에러 상태 */}
      {loading && (
        <div className="d-flex align-items-center gap-2 text-muted">
          <div className="spinner-border spinner-border-sm" role="status" />
          <span>불러오는 중…</span>
        </div>
      )}
      {!loading && errorMsg && (
        <div className="alert alert-danger" role="alert">
          {errorMsg}
        </div>
      )}

      {!loading && !errorMsg && (
        <>
          {/* md 이상: 테이블 뷰 */}
          <div className="d-none d-md-block">
            <div className="table-responsive">
              <table className="table table-striped align-middle">
                <thead className="table-light">
                  <tr>
                    <th style={{ minWidth: 140 }}>회원 이름</th>
                    <th style={{ minWidth: 200 }}>이메일</th>
                    <th style={{ width: 140 }}>Role</th>
                    <th style={{ width: 160 }}>가입한 날짜</th>
                    <th style={{ width: 160 }} className="d-none d-lg-table-cell">수정한 날짜</th>
                    <th style={{ width: 160 }} className="d-none d-xl-table-cell">마지막 로그인</th>
                    <th style={{ width: 160 }}>회원 상태</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.userId}>
                      <td>
                        <button
                          type="button"
                          className="btn btn-link p-0 text-decoration-none"
                          onClick={() => openDetail(user.userId)}
                          aria-label={`${user.name} 상세보기`}
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
                          aria-label={`${user.name} 권한 변경`}
                        >
                          {roleOptions.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </td>
                      <td>{formatKST(user.createdAt)}</td>
                      <td className="d-none d-lg-table-cell">{formatKST(user.updatedAt)}</td>
                      <td className="d-none d-xl-table-cell">{formatKST(user.lastLogin)}</td>
                      <td>
                        <select
                          value={user.status}
                          disabled={updatingUserId === user.userId}
                          onChange={(e) => onChangeStatus(user.userId, e.target.value as MemberStatus)}
                          className="form-select form-select-sm"
                          aria-label={`${user.name} 상태 변경`}
                        >
                          {statusOptions.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                        <span
                          className="badge ms-2"
                          style={{ backgroundColor: STATUS_COLORS[user.status] ?? "#6c757d" }}
                        >
                          {user.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* xs~sm: 카드 리스트 뷰 */}
          <div className="d-md-none">
            <div className="row g-2">
              {users.map((user) => (
                <div className="col-12" key={user.userId}>
                  <div className="card shadow-sm">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <button
                            type="button"
                            className="btn btn-link p-0 text-decoration-none fw-semibold"
                            onClick={() => openDetail(user.userId)}
                            aria-label={`${user.name} 상세보기`}
                          >
                            {user.name}
                          </button>
                          <div className="text-muted small text-truncate">{user.email}</div>
                        </div>
                        <span
                          className="badge"
                          style={{ backgroundColor: STATUS_COLORS[user.status] ?? "#6c757d" }}
                        >
                          {user.status}
                        </span>
                      </div>

                      <div className="mt-3 d-flex flex-wrap gap-2">
                        <div className="d-flex align-items-center gap-2">
                          <span className="text-muted small">Role</span>
                          <select
                            value={user.role}
                            disabled={updatingUserId === user.userId}
                            onChange={(e) => onChangeRole(user.userId, e.target.value as Role)}
                            className="form-select form-select-sm"
                            style={{ minWidth: 120 }}
                          >
                            {roleOptions.map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>

                        <div className="d-flex align-items-center gap-2">
                          <span className="text-muted small">Status</span>
                          <select
                            value={user.status}
                            disabled={updatingUserId === user.userId}
                            onChange={(e) => onChangeStatus(user.userId, e.target.value as MemberStatus)}
                            className="form-select form-select-sm"
                            style={{ minWidth: 140 }}
                          >
                            {statusOptions.map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="mt-3 text-muted small">
                        <div>가입: {formatKST(user.createdAt)}</div>
                        <div>수정: {formatKST(user.updatedAt)}</div>
                        <div>마지막 로그인: {formatKST(user.lastLogin)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {users.length === 0 && (
                <div className="col-12">
                  <div className="alert alert-light text-center">표시할 회원이 없습니다.</div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <AdminUserDetailModal userId={selectedUserId} open={detailOpen} onClose={closeDetail} />
    </div>
  );
}

export default AdminUserPage;
