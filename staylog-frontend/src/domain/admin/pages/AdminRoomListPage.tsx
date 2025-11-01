// src/domain/admin/pages/AdminRoomListPage.tsx

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom"; // useNavigate 훅 임포트
import api from "../../../global/api";
import { formatKST } from "../../../global/utils/date";
import type { AdminRoomListData } from "../types/AdminRoomTypes";

// 상태 업데이트 API 호출 함수 (컴포넌트 외부에 정의하여 재사용)
const updateAccommodationStatus = async (accommodationId: number, roomId: number, status: 'Y' | 'N') => {
    // 'Y' (대기) -> 복원 API 호출
    const changeStatus = status === 'N'
        ? `/v1/admin/accommodations/${accommodationId}/rooms/${roomId}/restore`
        // 'N' (활성) -> 삭제 API 호출
        : `/v1/admin/accommodations/${accommodationId}/rooms/${roomId}/delete`;

    try {
        await api.patch(changeStatus, null);
        return true;
    } catch (err) {
        console.log(`객실 ID ${roomId} 상태 업데이트 실패:`, err);
        return false;
    }
};


function AdminRoomListPage() {
    // 숙소의 번호  /admin/accommodations/:accommodationId/rooms  에서 accommodationId 경로 변수 얻어내기 
    const { accommodationId: accommodationIdStr } = useParams();
    // 경로 변수를 숫자로 변환
    const accommodationId = Number(accommodationIdStr);

    const [rooms, setRooms] = useState<AdminRoomListData[]>([]);

    // 전체 숙소 목록 조회 (컴포넌트 마운트 시)
    useEffect(() => {
        api.get<AdminRoomListData[]>(`/v1/admin/accommodations/${accommodationId}/rooms`)
            .then(res => setRooms(res))
            .catch(err => console.log("객실 목록 로드 실패", err));
    }, [accommodationId]);

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

    //이동을 하기위한 hook
    //const navigate = useNavigate();

    return <>
        <div className="container-fluid py-3">
            <h1><span className="fw-bold">{rooms[0]?.accommodationName}</span> 객실 목록</h1>


            <table className="table table-striped text-center">
                <thead>
                    <tr>
                        <th style={{ width: '5%' }}>번호</th>
                        <th>객실명</th>
                        <th style={{ width: '10%' }}>유형</th>
                        <th style={{ width: '10%' }}>가격</th>
                        <th style={{ width: '15%' }}>최대 인원(성인)</th>
                        <th style={{ width: '15%' }}>등록일</th>
                        <th style={{ width: '10%' }}>상태</th>
                        <th style={{ width: '10%' }}>상세?</th>
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
                                <td>{item.name}</td>
                                <td>{item.typeName}</td>
                                <td>{item.price}</td>
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
                                </td>
                                <td className="text-center">
                                    <button
                                        className="btn btn-sm btn-outline-primary me-1"
                                        title="객실 목록 보기"
                                        //onClick={() => handleGoToRooms(item.accommodationId!)} // 이동 함수 연결
                                    >
                                        <i className="bi bi-list"></i>
                                    </button>
                                </td>
                            </tr>
                        )))}
                </tbody>
            </table>
        </div>
    </>;
}

export default AdminRoomListPage;