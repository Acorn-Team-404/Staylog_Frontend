// src/domain/admin/pages/AdminLayout.tsx

import { NavLink, Outlet } from 'react-router-dom';

function AdminLayout() {
    const BASE_PATH = "/admin";
    // NavLink의 active 스타일을 위한 함수
    const navLinkClass = ({ isActive, isPending }: { isActive: boolean, isPending: boolean }) =>
        `nav-link py-2 ${isActive ? 'fw-bold text-primary bg-light text-dark' : 'text-muted'} ${isPending ? 'pending' : ''}`;
    
    return <>
        <div className="row">
            {/* 사이드바 영역 추가: col-lg-3 */}
            <div className="col-lg-3 d-none d-lg-block bg-light border-end mt-0">
                <div className="sticky-top" style={{ top: "100px" }}>
                    <div className="p-3 rounded">
                        <ul className="nav nav-pills flex-column">
                            <li className="nav-item mb-1">
                                <NavLink to={`${BASE_PATH}`} className={navLinkClass} end>회원관리</NavLink>
                            </li>
                            <li className="nav-item mb-1">
                                <NavLink to={`${BASE_PATH}/accommodations`} className={navLinkClass}>숙소관리</NavLink>
                            </li>
                            <li className="nav-item mb-1">
                                <NavLink to={`${BASE_PATH}/reservations`} className={navLinkClass}>예약관리</NavLink>
                            </li>
                            <li className="nav-item mb-1">
                                <NavLink to={`${BASE_PATH}/reviews`} className={navLinkClass}>리뷰 게시판 관리</NavLink>
                            </li>
                            <li className="nav-item mb-1">
                                <NavLink to={`${BASE_PATH}/journals`} className={navLinkClass}>저널 게시판 관리</NavLink>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            
            {/* 메인 콘텐츠 영역: col-lg-9 */}
            <div className="col-lg-9"> 
                <div className="p-3">
                    <Outlet /> 
                </div>
            </div>
        </div>
    </>
}

export default AdminLayout;