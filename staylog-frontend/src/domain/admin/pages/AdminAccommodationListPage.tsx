// src/domain/admin/pages/AdminAccommodationListPage.tsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // useNavigate 훅 임포트
import api from "../../../global/api";
import type { AdminAccommodationListData } from "../types/AdminAccommodatiomTypes";
import { formatKST } from "../../../global/utils/date";

// 상태 업데이트 API 호출 함수 (컴포넌트 외부에 정의하여 재사용)
const updateAccommodationStatus = async (accommodationId: number, status: 'Y' | 'N') => {
    // 'Y' (대기) -> 복원 API 호출
    const changeStatus = status === 'N'
        ? `/v1/admin/accommodations/${accommodationId}/restore`
        // 'N' (활성) -> 삭제 API 호출
        : `/v1/admin/accommodations/${accommodationId}/delete`;

    try {
        await api.patch(changeStatus, null);
        return true;
    } catch (err) {
        console.log(`숙소 ID ${accommodationId} 상태 업데이트 실패:`, err);
        return false;
    }
};


function AdminAccommodationListPage() {
    const [accommodations, setAccommodations] = useState<AdminAccommodationListData[]>([]);

    // 전체 숙소 목록 조회 (컴포넌트 마운트 시)
    useEffect(() => {
        api.get<AdminAccommodationListData[]>("/v1/admin/accommodations")
            .then(res => setAccommodations(res))
            .catch(err => console.log("숙소 목록 로드 실패", err));
    }, []);

    // 상태 변경 API 호출 핸들러 (원래 값 롤백 기능 포함)
    const handleStatusChange = async (
        accommodationId: number,
        e: React.ChangeEvent<HTMLSelectElement>
    ) => {
        if (!accommodationId) return;

        const newStatus = e.target.value as 'Y' | 'N';

        // 롤백을 위한 원래 값 저장
        const originalStatus = accommodations.find(item => item.accommodationId === accommodationId)?.deletedYn!;

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

    //이동을 하기위한 hook
    const navigate = useNavigate();

    //객실 목록 페이지 이동 핸들러
    const handleGoToRooms = (accommodationId: number) => {
        navigate(`/admin/accommodations/${accommodationId}/rooms`);
    };


    return <>
        <div className="container-fluid py-3">
            <h1>숙소 관리 페이지</h1>

            <table className="table table-striped text-center">
                <thead>
                    <tr>
                        <th style={{ width: '5%' }}>번호</th>
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
                            <tr key={item.accommodationId}>
                                <td>{index + 1}</td>
                                <td>{item.regionName}</td>
                                <td>{item.name}</td>
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
    </>;
}

export default AdminAccommodationListPage;