// src/pages/admin/components/AdminUserDetailModal.tsx
import { useEffect, useState } from "react";
import api from "../../../global/api";
import { formatKST } from "../../../global/utils/date";

/**
 * 관리자 회원 상세 조회용 Dto
 * /v1/admin/users/{userId} API 응답
 */
export type AdminUserDetailDto = {
  userId: number;
  loginId: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  status: string;
  gender: string | null;
  birthDate: string | null;
  profileImage: string | null;
  createdAt: string;
  updatedAt: string | null;
  lastLogin: string | null;
  withdrawnAt: string | null;
};
/**
 * 컴포넌트 Props
 * @param userId 상세 조회할 유저 Id
 * @param open 모달 열림 여부
 * @param onClose 모달 닫기 콜백
 */
type Props = {
  userId: number | null;
  open: boolean;
  onClose: () => void;
};

export default function AdminUserDetailModal({ userId, open, onClose }: Props) {
    // 상태 값 정의
  const [data, setData] = useState<AdminUserDetailDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !userId) return;
    setLoading(true);
    setErr(null);

    api
      .get<AdminUserDetailDto>(`/v1/admin/users/${userId}`)
      .then((res) => setData(res))
      .catch(() => setErr("회원 상세 정보를 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, [open, userId]);

  // ESC로 모달 닫기 처리 / 모달이 열렸을 때만 이벤트 활성화
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  // 닫혀있으면 렌더링 중단하기
  if (!open) return null;

  return (
    <>
      {/* 모달 뒷 배경 어둡게 */}
      <div className="modal-backdrop fade show" />

      {/* Modal */}
      <div className="modal fade show d-block" role="dialog" aria-modal="true">
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">회원 상세</h5>
              <button type="button" className="btn-close" aria-label="Close" onClick={onClose} />
            </div>

            <div className="modal-body">
              {loading && (
                <div className="d-flex align-items-center gap-2">
                  <div className="spinner-border spinner-border-sm" role="status" />
                  <span>불러오는 중…</span>
                </div>
              )}

              {err && <div className="alert alert-danger mb-0">{err}</div>}

              {!loading && !err && data && (
                <div className="container-fluid">
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <div className="card">
                        <div className="card-body">
                          <h6 className="text-muted mb-3">기본 정보</h6>
                          <dl className="row mb-0">
                            <dt className="col-4">이름</dt>
                            <dd className="col-8">{data.name}</dd>
                            <dt className="col-4">이메일</dt>
                            <dd className="col-8">{data.email}</dd>
                            <dt className="col-4">로그인 ID</dt>
                            <dd className="col-8">{data.loginId}</dd>
                            <dt className="col-4">전화번호</dt>
                            <dd className="col-8">{data.phone ?? "—"}</dd>
                          </dl>
                        </div>
                      </div>
                    </div>

                    <div className="col-12 col-md-6">
                      <div className="card">
                        <div className="card-body">
                          <h6 className="text-muted mb-3">상태/권한</h6>
                          <dl className="row mb-0">
                            <dt className="col-4">권한</dt>
                            <dd className="col-8">{data.role}</dd>
                            <dt className="col-4">상태</dt>
                            <dd className="col-8">{data.status}</dd>
                            <dt className="col-4">성별</dt>
                            <dd className="col-8">{data.gender ?? "—"}</dd>
                            <dt className="col-4">생년월일</dt>
                            <dd className="col-8">{data.birthDate ? data.birthDate.split(" ")[0] : "—"}</dd> {/* YYYY-MM-DD로 출력되게 하려고 수정*/}
                          </dl>
                        </div>
                      </div>
                    </div>

                    <div className="col-12">
                      <div className="card">
                        <div className="card-body">
                          <h6 className="text-muted mb-3">타임스탬프</h6>
                          <div className="row">
                            <div className="col-md-3">
                              <small className="text-muted d-block">가입일</small>
                              <strong>{formatKST(data.createdAt)}</strong>
                            </div>
                            <div className="col-md-3">
                              <small className="text-muted d-block">수정일</small>
                              <strong>{formatKST(data.updatedAt)}</strong>
                            </div>
                            <div className="col-md-3">
                              <small className="text-muted d-block">마지막 로그인</small>
                              <strong>{formatKST(data.lastLogin)}</strong>
                            </div>
                            <div className="col-md-3">
                              <small className="text-muted d-block">탈퇴일</small>
                              <strong>{formatKST(data.withdrawnAt)}</strong>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                닫기
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
