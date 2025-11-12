// src/global/components/MypageDropdown.tsx
import { useRef, useState } from "react"; // useState, useRef 훅 import
import { Dropdown, Image } from "react-bootstrap";
import { useDispatch } from "react-redux"; // Redux 디스패치 훅 import
import { useNavigate } from "react-router-dom";
import { logout } from "../../domain/auth/api"; // 로그아웃 API 함수 import
import useMediaQuery from "../hooks/useMediaQuery"; // useMediaQuery 훅 import
import { useModal } from "../hooks/useModal";
import type { ModalMode } from "../types";
import Modal from "./Modal";

interface MypageDropdownProps {
  onClose: () => void; // Navbar.tsx 에서 넘겨준 onClose 받는다.
  profileImage: string | null | undefined; // 프로필 이미지 URL prop 추가
}

function MypageDropdown({ onClose, profileImage }: MypageDropdownProps) {
    const navigate = useNavigate();
    const dispatch = useDispatch(); // Redux 디스패치 훅 사용
    const [showDropdown, setShowDropdown] = useState(false); // 드롭다운 표시 상태 관리
    const hideTimer = useRef<number | null>(null); // 타이머 ID를 저장할 ref

    // --- 화면 크기 감지 ---
    const isDesktop = useMediaQuery('(min-width: 992px)'); // lg 브레이크포인트

    // 드롭다운 메뉴 선택 핸들러 (로그아웃)
    const handleLogout = async () => {
        try {
            // 1) 백엔드에 refreshToken 삭제 요청
            await logout();

            // 2) 프론트 상태 초기화 (redux userInfo, auth 등 비우기)
            dispatch({ type: "LOGOUT" });

            // 3) 혹시 모를 로컬 스토리지 토큰도 제거
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");

            // 4) 드롭다운 닫기
            onClose();
            setShowDropdown(false); // 드롭다운 상태 닫기

            // 5) 메인 or 로그인으로 이동
            navigate("/");
        } catch (err) {
            console.error("로그아웃 실패:", err);
            alert("로그아웃에 실패했습니다. 다시 시도해주세요.");
        }
    };

    // 드롭다운 메뉴 선택 핸들러
    const handleSelect = (eventKey: string | null) => {
        if (!eventKey) return;

        // 로그아웃일 때는 따로 처리
        if (eventKey === "logout") {
            void handleLogout();
            return;
        }

        // 나머지는 /mypage/... 로 이동
        navigate(`/mypage/${eventKey}`);
        onClose();
        setShowDropdown(false); // 드롭다운 상태 닫기
    };

    // 모달 커스텀훅 사용
    const { isModalOpen, modalMode, openModal, closeModal } = useModal<ModalMode>('none');

    // --- 호버/클릭 이벤트 핸들러 ---
    const handleMouseEnter = () => {
        if (isDesktop) {
            if (hideTimer.current) {
                clearTimeout(hideTimer.current); // "닫기" 타이머 취소
            }
            setShowDropdown(true);
        }
    };

    const handleMouseLeave = () => {
        if (isDesktop) {
            // 300ms 후에 드롭다운을 닫는 타이머 설정
            hideTimer.current = window.setTimeout(() => {
                setShowDropdown(false);
            }, 300);
        }
    };

    // 모바일에서는 클릭으로 토글, PC에서는 show 상태로 제어
    const handleToggle = (isOpen: boolean, meta: { source?: string }) => {
        // PC 호버 시에는 자동 토글 방지
        if (isDesktop && meta.source !== 'select') {
            return;
        }
        setShowDropdown(isOpen);
    };

    return (
        <>
            <Dropdown
                align="end"
                onSelect={handleSelect}
                onMouseEnter={handleMouseEnter} // 마우스 진입 시 드롭다운 열기
                onMouseLeave={handleMouseLeave} // 마우스 이탈 시 딜레이 후 드롭다운 닫기
                show={showDropdown} // 드롭다운 표시 상태 제어
                onToggle={handleToggle} // 클릭 토글 핸들러 추가
            >
                {/* 아이콘이 토글 역할*/}
                <Dropdown.Toggle
                    variant="light"
                    id="mypage-dropdown"
                    className="border-0 bg-transparent p-0"
                >
                    {profileImage ? (
                        <Image src={profileImage} roundedCircle width="32" height="32" alt="Profile"/>
                    ) : (
                        <i className="bi bi-person-circle" style={{ fontSize: "32px" }}></i>
                    )}
                </Dropdown.Toggle>

                {/* react-bootstrap이 자동으로 아이콘 기준 위치를 움직이게 함*/}
                <Dropdown.Menu className="shadow-sm mt-2">
                    <Dropdown.Header className="fw-bold text-center">마이페이지</Dropdown.Header>
                    <Dropdown.Divider />

                    <Dropdown.Item eventKey="member">회원 정보</Dropdown.Item>
                    <Dropdown.Item eventKey="reservations">예약 정보</Dropdown.Item>
                    <Dropdown.Item eventKey="reviews">리뷰 내역</Dropdown.Item>
                    <Dropdown.Item onClick={() => openModal('coupon')}>내 쿠폰함</Dropdown.Item>

                    <Dropdown.Divider />
                    <Dropdown.Item eventKey="logout" className="text-danger text-center fw-semibold">로그아웃</Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>

            {isModalOpen && <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                mode={modalMode} />
            }
        </>
    );
}

export default MypageDropdown;
