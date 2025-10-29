import { useEffect, useState } from "react";
import api from "../../../global/api";
import "bootstrap/dist/css/bootstrap.min.css";
import { formatKST } from "../../../global/utils/date";
import type { AdminUserDto, AdminUser, Role, MemberStatus } from "../types/AdminTypes";
import { roleOptions, statusOptions, mapDtoToAdminUser } from "../types/AdminTypes";

function AdminPage() {
    
    // 유저 목록을 상태 값으로 관리
    const [users, setUsers] = useState<AdminUser[]>([]);
    // 현재 수정중인 유저 ID 상태 값 관리
    const [updatingUserId, setupdatingUserId] = useState<number | null>(null);

    // 전체 유저 목록 조회
    useEffect(() => {
  api
    .get<{ users: AdminUserDto[] }, { users: AdminUserDto[] }>(
      "/v1/admin/users",
      { params: { pageNum: 1 } }
    )
    .then((res) => {
      // ✅ 이제 payload는 AxiosResponse가 아니라 { users: [...] } 로 인식됨
      const list = Array.isArray(res.users) ? res.users : [];
      setUsers(list.map(mapDtoToAdminUser));
    })
    .catch((err) => console.error("유저 목록 조회 불가:", err));
}, []);
    // 유저 권한 변경을 위한 함수
    async function onChangeRole(userId : number, nextRole: Role) {
        // 현재 값 저장을 저장한다 (실패시 롤백)
        const prev = users.find(user => user.userId === userId)?.role;

        // 변경중인 유저 표시
        setupdatingUserId(userId);
        setUsers(list => list.map(user => user.userId === userId ? {
            ...user,
            role: nextRole
        } : user));
        // 수정 API 호출
        try{
            await api.patch(`/v1/admin/users/${userId}/role`,{role: nextRole})
        } catch(err) {
            console.log("유저 권한을 변경에 실패하였습니다.");
            // 실패시 롤백
            setUsers(list => list.map(user => userId === userId ? {
                ...user,
                role : prev ?? user.role
            }: user));
        } finally {
            setupdatingUserId(null);
        }
    }
    return(
    <div className="container-fluid py-3">
    <h1>관리자 페이지 입니다.</h1>
        <table className="table table-striped">
            <thead>
            <tr>
                <th>회원 이름</th>
                <th>이메일</th>
                <th>Role</th>
                <th>가입한 날짜</th>
                <th>수정한 날짜</th>
                <th>마지막 로그인</th>
                <th>회원 상태</th>
            </tr>
            </thead>
            <tbody>
                {users.map((user) => (
                    <tr key={user.userId}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>
                            <select
                                value={user.role}
                                disabled={updatingUserId === user.userId} // 수정 중이면 비활성화
                                onChange={(e) => onChangeRole(user.userId, e.target.value as Role)}
                                className="form-select"
                            >
                                {roleOptions.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                    </td>
                        <td>{formatKST(user.createdAt)}</td>
                        <td>{formatKST(user.updatedAt)}</td>
                        <td>{formatKST(user.lastLogin)}</td>
                        <td>{user.status}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
    );
}

export default AdminPage;