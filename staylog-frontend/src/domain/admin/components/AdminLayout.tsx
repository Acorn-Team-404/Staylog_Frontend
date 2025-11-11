// src/domain/admin/pages/AdminLayout.tsx

import { Container } from 'react-bootstrap';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import '../css/AdminLayout.css';
import { useState } from 'react';

function AdminLayout() {
    // NavLink의 active 스타일을 위한 함수
    const navLinkClass = ({ isActive, isPending }: { isActive: boolean, isPending: boolean }) =>
        `nav-link py-2 ${isActive ? 'fw-bold text-primary bg-light text-dark' : 'text-muted'} ${isPending ? 'pending' : ''}`;

    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    // 메뉴 아이템 정의
    const menuItems = [
        { path: '', label: '회원관리', end: true },
        { path: 'accommodations', label: '숙소관리' },
        { path: 'reservations', label: '예약관리' },
        { path: 'boards', label: '게시판 관리' },
        { path: 'coupon', label: '쿠폰 관리' },
        { path: 'home', label: '홈 화면 관리' }, // 새로 추가
    ];
    // 현재 활성화된 메뉴 찾기
    const getCurrentMenu = () => {
        const path = location.pathname.split('/admin/')[1] || '';
        const currentItem = menuItems.find(item => {
            if (item.path === '' && path === '') return true;
            if (item.path !== '' && path.startsWith(item.path)) return true;
            return false;
        });
        return currentItem?.label || '회원관리';
    };

    return <>
        <Container fluid className="container-fluid admin-container px-0">
            {/* md 이하에서 상단 고정 가로 네비게이션 */}
            <div className="d-lg-none sticky-top w-100" style={{ top: "58px", zIndex: 1020 }}>
                <div className="bg-white border rounded mb-3">
                    {/* 현재 메뉴 표시 버튼 */}
                    <button 
                        className="btn btn-light w-100 text-start d-flex justify-content-between align-items-center p-3"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        <span className="fw-bold">{getCurrentMenu()}</span>
                        <i className={`bi bi-chevron-${isMenuOpen ? 'up' : 'down'}`}></i>
                    </button>
                    
                    {/* 토글 메뉴 목록 */}
                    {isMenuOpen && (
                        <div className="border-top">
                            <ul className="nav flex-column">
                                {menuItems.map((item) => (
                                    <li key={item.path || 'index'} className="nav-item">
                                        <NavLink 
                                            to={item.path} 
                                            className={navLinkClass}
                                            end={item.end}
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            {item.label}
                                        </NavLink>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
            
            <div className="row admin-row">
                {/* 사이드바 영역 추가: col-lg-3 */}
                <div className="col-lg-2 d-none d-lg-block admin-sidebar">
                    <div className="sticky-top" style={{ top: "100px" }}>
                        <div className="p-3 rounded">
                            <ul className="nav nav-pills flex-column">
                                <li className="nav-item mb-1">
                                    <NavLink to="user" className={navLinkClass}>회원관리</NavLink>
                                </li>
                                <li className="nav-item mb-1">
                                    <NavLink to="accommodations" className={navLinkClass}>숙소관리</NavLink>
                                </li>
                                <li className="nav-item mb-1">
                                    <NavLink to="reservations" className={navLinkClass}>예약관리</NavLink>
                                </li>
                                <li className="nav-item mb-1">
                                    <NavLink to="boards" className={navLinkClass}>게시판 관리</NavLink>
                                </li>
                                <li className="nav-item mb-1">
                                    <NavLink to="coupon" className={navLinkClass}>쿠폰 관리</NavLink>
                                </li>
                                <li className="nav-item mb-1"> {/* 새로 추가 */}
                                    <NavLink to="home" className={navLinkClass}>홈 화면 관리</NavLink>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* 메인 콘텐츠 영역: col-lg-9 */}
                <div className="col-lg-10 container">
                    <div className="p-3">
                        <Outlet />
                    </div>
                </div>
            </div>
        </Container>
    </>
}

export default AdminLayout;