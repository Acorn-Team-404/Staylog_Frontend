import React, { useEffect, useState } from "react";
import { Card, Row, Col, Form, Button, Image, InputGroup, Fade } from "react-bootstrap";
import { fetchMemberInfo, updateMemberInfo, uploadProfileImage } from "../api/mypageApi";
import useGetUserIdFromToken from "../../auth/hooks/useGetUserIdFromToken";
import useGetNicknameFromToken from "../../auth/hooks/useGetNicknameFromToken";
import type { MemberInfo } from "../types/mypageTypes";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "../../../global/store";
import type { AppAction, RootState } from "../../../global/store/types";
import duplicateCheck from "../../auth/utils/duplicateCheck";
import AlertModal from "../components/AlertModal";
import sendEmail from "../../auth/utils/sendEmail";
import mailCertify from "../../auth/utils/mailCertify";
import { REGEX_PASSWORD } from "../../../global/constants/Validation";



function MemberInfoSection() {
    // auth 훅은 컴포넌트 최상단에서 선언
    const userId = useGetUserIdFromToken(); // 사용자 PK
    const nickname = useGetNicknameFromToken(); // 닉네임
    // Redux에도 로그인 정보가 있을 수 있지만, JWT 기반으로 갱신 보완
    const reduxNickname = useSelector((state: RootState) => state.userInfo?.nickname);

    // 회원정보 상태
    const [member, setMember] = useState<MemberInfo | null>(null); // 회원정보 상태
    const [editMode, setEditMode] = useState(false); // 전체 수정 모드 상태
    const [previewUrl, setPreviewUrl] = useState<string | null>(null); // 업로드 시 미리보기 이미지
    const [newProfileImageUrl, setNewProfileImageUrl] = useState<string | null>(null); // 새로 업로드된 이미지 URL을 임시 저장
    const [selectedFileName, setSelectedFileName] = useState<string>(""); // 선택된 파일명 표시

    // 비밀번호 변경 관련 상태
    const [showPasswordInput, setShowPasswordInput] = useState(false); // 비밀번호 변경 입력란 표시 여부
    const [passwordInput1, setPasswordInput1] = useState("");  // 새 비밀번호 입력값 (필드1)
    const [passwordInput2, setPasswordInput2] = useState("");  // 새 비밀번호 입력값 (필드2) 일치여부 확인
    const [passwordValid, setPasswordValid] = useState(true);  // 형식 검사
    const [passwordMatch, setPasswordMatch] = useState(true);  // 일치 여부 검사

    // 이메일 인증 관련 상태
    const [emailInput, setEmailInput] = useState(""); // 이메일 입력값
    const [emailCode, setEmailCode] = useState(""); // 이메일 인증코드 입력값
    const [isEmailRequested, setIsEmailRequested] = useState(false); // 이메일 인증 요청 상태
    const [isEmailVerified, setIsEmailVerified] = useState(false); // 이메일 인증 완료 상태
    const [emailMessage, setEmailMessage] = useState(""); // 이메일 중복확인 메시지 상태 추가
    const [emailSuccess, setEmailSuccess] = useState<boolean | null>(null); // 중복확인 메시지 색상 구분    

    // 닉네임 중복 확인 상태
    const [nicknameInput, setNicknameInput] = useState(""); // 닉네임 입력값
    const [nicknameAvailable, setNicknameAvailable] = useState(false);  // 사용 가능한 닉네임인지 여부
    const [isNicknameChecked, setIsNicknameChecked] = useState(false);  // 닉네임 중복확인 완료 여부
    const [nicknameMessage, setNicknameMessage] = useState(""); // UI용 메시지

    // 개별 편집 모드 상태 (이메일, 닉네임 각각의 편집 모드 관리)
    const [editModeEmail, setEditModeEmail] = useState(false); // 이메일 편집 모드
    const [editModeNickname, setEditModeNickname] = useState(false); // 닉네임 편집 모드

    // 생년월일 관련 상태
    const [birthDate, setBirthDate] = useState<string>("");  // 생년월일

    // 모달용 상태
    const [showNicknameModal, setShowNicknameModal] = useState(false); // 닉네임 중복확인 모달 상태
    const [nicknameModalMsg, setNicknameModalMsg] = useState(""); // 닉네임 중복확인 모달 메시지
    
    // 회원정보 수정 후 저장하기 완료 모달 상태
    const [showModal, setShowModal] = useState(false); // 저장 완료 모달 상태

    //  dispatch()는 UPDATE_NICKNAME, USER_INFO, LOGOUT 등 AppAction에 정의된 모든 액션을 안전하게 받을 수 있다.
    const dispatch = useDispatch<AppDispatch>();

    // 회원정보 조회
    useEffect(() => {
        if (!userId) return;
        fetchMemberInfo(userId)
            .then((data) => {
            setMember(data);
            console.log("????" + data.profileImage);
            
            if (data.birthDate) {
                setBirthDate (data.birthDate.substring(0, 10));
            }
        })
        .catch((err) => {
            console.error("회원정보 조회 실패:", err);
            alert("회원 정보를 불러올 수 없습니다. 다시 로그인해주세요.");
        });
    }, [userId]);

    // 닉네임 중복확인 alert 대체용 모달 설정
    useEffect(() => {
        const originalAlert = window.alert;
        window.alert = (msg:any) => {
            // alert 대신 커스텀 모달에 전달
            setNicknameModalMsg(String(msg));
            setShowNicknameModal(true);
        };
        return () => {
            window.alert = originalAlert;
        };
    }, []);
    // 입력값 변경
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!member) return;
        setMember({ ...member, [e.target.name]: e.target.value });
    };

    // 이메일 인증요청 (alert 없이 메시지 표시 & sendEmail API 연결)
    const handleEmailRequest = async () => {
        if (!emailInput.includes("@")) {
            setEmailSuccess(false);
            setEmailMessage("올바른 이메일 형식을 입력하세요.");
            return;
        }
        // 백엔드에 이메일 인증 요청 API 호출
        try {
            const ok = await sendEmail({ email: emailInput, valid:true});
            if (ok) { // 이메일 전송 성공시에만 true 처리
                setIsEmailRequested(true);
                setEmailSuccess(true);
                setEmailMessage("입력하신 이메일로 인증코드가 발송되었습니다.");
            }else{
                setEmailSuccess(false);
                setEmailMessage("이메일 전송에 실패했습니다. 다시 시도해주세요.");
            }
        }catch (err){
            console.error("이메일 인증 요청 실패:", err);
            setEmailSuccess(false);
            setEmailMessage("이메일 전송 중 오류가 발생했습니다. 다시 시도해주세요.");  
        }
    };

    // 이메일 인증 코드 확인 (mailCertify API 연결)
    const handleEmailVerify = async () => {
        // 실제 인증코드 검증 API 호출
        if (!emailCode.trim()) {
            setEmailSuccess(false);
            setEmailMessage("이메일 인증코드를 입력해주세요.");
            return;
        } try {
            const ok = await mailCertify({ email: emailInput, code: emailCode });
            if (ok) {
                setIsEmailVerified(true);
                setEmailSuccess(true);
                setEmailMessage("이메일 인증이 완료되었습니다.");
            } else {
                setIsEmailVerified(false);
                setEmailSuccess(false);
                setEmailMessage("인증코드가 올바르지 않습니다.");
            }
        } catch (err) {
            console.error("이메일 인증 확인 실패:", err);
            setEmailSuccess(false);
            setEmailMessage("이메일 인증 중 오류가 발생했습니다. 다시 시도해주세요."); 
        }
    };

    // 닉네임 중복확인
    const handleNicknameCheck = async () => {
        const next = nicknameInput.trim();
        if (!next) {
            setNicknameMessage("닉네임을 입력하세요.");
            return;
        }
        // 1. 현재 로그인 닉네임(토큰/회원정보의 member.nickname)과 동일한지 비교(동일하면 중복 처리)
        // useGetNicknameFromToken() 훅에서 가져온 nickname 값과 비교
        const currentNick = nickname ?? member?.nickname??"";
        if (next === currentNick) {
            setIsNicknameChecked(true);
            setNicknameAvailable(false);
            setNicknameMessage("현재 사용 중인 닉네임입니다. 다른 닉네임을 입력해주세요.");
            return;
        }
        // 2. 간단한 형식 유효성 검사 (특수문자 제외, 길이 제한 등)(선택) (2~20자, 한글/영문/숫자/_만)
        const valid = /^[a-zA-Z0-9가-힣_]{2,20}$/.test(next);
        if (!valid) {
            setNicknameMessage("닉네임은 2~20자의 한글, 영문, 숫자, 밑줄(_)만 사용할 수 있습니다.");
            return;
        }
        // 3. 중복확인 API 호출 (백엔드 중복확인 API 호출하여 사용)
        // duplicateCheck는 내부에서 alert를 띄우고 true/false를 반환 된 것을 UI로만 결과 표시
        const ok = await duplicateCheck({
            checkType: "nickname",
            value: next,
            valid,
        });
        // 4. API 결과에 따라 상태 업데이트
        setIsNicknameChecked(true);
        setNicknameAvailable(ok);        
        // alert 이후에 표시될 UI 메시지 설정
        setNicknameMessage(ok ? "사용 가능한 닉네임입니다." : "이미 사용 중입니다.");
        // alert 대신 모달 표시
        setNicknameModalMsg(ok ? "사용 가능한 닉네임입니다." : "이미 가입된 닉네임입니다.");
        setShowNicknameModal(true);
    };

    // 비밀번호 유효성 및 일치여부 검사 (SignupForm 참고)
    useEffect(() => {
        // 정규식: 대문자+소문자+특수문자 조합 8자 이상
        const isValid = REGEX_PASSWORD.test(passwordInput1);
        const isMatch = passwordInput1 === passwordInput2 || passwordInput2 === "";
            setPasswordValid(isValid || passwordInput1 === ""); // 빈칸은 true로 처리
            setPasswordMatch(isMatch);
    }, [passwordInput1, passwordInput2]);     

    const handlePwdChange = (pwd: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = pwd.target;
        if(name === "password1") setPasswordInput1(value);
        if(name === "password2") setPasswordInput2(value);
    };

    //프로필 이미지 변경 (미리보기 & (업로드)상태 업데이트 & 파일명 표시) **추후 수정 필요**
    const handleImageChange = async (img: React.ChangeEvent<HTMLInputElement>) => {
        const file = img.target.files?.[0];
        if (!file || !userId) return;
        // 브라우저 미리보기용 URL 생성
        const preview = URL.createObjectURL(file);
            setPreviewUrl(preview);
            setSelectedFileName(file.name); //파일명 저장
        try {
            // 실제 서버(Spring) 업로드
            const imageUrl = await uploadProfileImage(file, userId); // 업로드 요청
            // 업로드 완료 후 DB에 저장될 새로 받은 URL을 임시 상태에 저장
            setNewProfileImageUrl(imageUrl);
            // setMember((prev) => (prev ? { ...prev, profileImageUrl: imageUrl } : prev)); // UI 반영
            // Redux 전역 상태에도 프로필 이미지 업데이트 (프로필 이미지가 변경될 때마다 Redux 전역 상태도 함께 업데이트)
            // dispatch({ type: 'UPDATE_PROFILE_IMAGE', payload: imageUrl });
            console.log("프로필 이미지 업로드 완료, 임시 저장:", imageUrl);
        } catch (err) {
            console.error("이미지 업로드 실패:", err);
            alert("이미지 업로드 중 오류가 발생했습니다.");
        }
    };

    // 저장 버튼
    const handleSave = async () => {
        if (!member || !userId) return;

        // 이메일/닉네임 개별 수정모드에 따라 검증
        if (editModeEmail && !isEmailVerified) {
            setEmailSuccess(false);
            setEmailMessage("이메일 인증을 완료해주세요.");
            return;
        }
        if (editModeNickname && !nicknameAvailable) {
            alert("닉네임 중복확인을 완료해주세요.");
            return;
        } 

        // 조건부로 수정모드인 항목만 반영하도록 payload 구성
        const payload = {
            ...member,
            userId,
            email: editModeEmail ? emailInput : member.email,
            nickname: editModeNickname ? nicknameInput : member.nickname,
            birthDate: birthDate || "",
            password: showPasswordInput && passwordInput1 ? passwordInput1 : "", // 비밀번호 변경 사항 반영
            profileImage: newProfileImageUrl || member.profileImage, // 새로 업로드된 이미지가 있으면 새로 업로드된 이미지로, 없으면 기존 이미지로 반영
        };
        console.log("update payload:", payload); 

        try {
            // 회원정보 업데이트 API 호출
            await updateMemberInfo(payload);
            //DB 업데이트 이후 최신 회원정보 다시 불러오기 (닉네임 즉시 반영 위해)
            const updatedData = await fetchMemberInfo(userId);
            setMember(updatedData);

            // Redux 전역 상태 업데이트 (Navbar 닉네임 즉시 반영)
            dispatch({ type: "UPDATE_NICKNAME", payload: updatedData.nickname } as AppAction);
            // 새로 업로드된 프로필 이미지가 있다면 Redux 상태에도 반영 
            // MypageDropdown에서 전달받은 profileImage 값의 유무에 따라 프로필 이미지 또는 기본 아이콘을 조건부로 렌더링 (refresh 하더라도 프로필사진 Navbar에 유지)
            if (newProfileImageUrl) {
                dispatch({ type: 'UPDATE_PROFILE_IMAGE', payload: newProfileImageUrl });
                setNewProfileImageUrl(null); // 임시 상태 초기화
            }    
            // 저장 완료 모달 표시
            setShowModal(true); 
            // 상태 초기화
            setEditMode(false);
            setEditModeEmail(false);
            setEditModeNickname(false);
            setIsEmailRequested(false);
            setIsEmailVerified(false);
            setEmailMessage("");
            setNicknameMessage("");
            //비밀번호 변경 후처리
            setPasswordInput1(""); // 비밀번호 입력 필드1 초기화
            setPasswordInput2(""); // 비밀번호 입력 필드2 초기화
            setShowPasswordInput(false); // 입력창 닫기
        } catch(err) {
            console.error("회원정보 수정 실패:", err);
            alert("회원정보 수정 중 오류가 발생했습니다. 다시 시도해주세요.");
        }
    };

    if (!member) {
        return <p className="text-center mt-5">회원 정보를 불러오는 중...</p>;
    }

    return (
        <Card className="shadow-sm border-0 w-100 mypage-section">
        <Card.Body className="p-4">
            {/* 상단 섹션 제목 */}
            <div className="mb-3 text-center text-md-center">
                <h4 className="fw-bold">회원 정보</h4>
                <hr className="mb-4" />
            </div>

            {/* 폼 + 프로필 */}
            <Row className="g-4 align-items-start">
            {/* 왼쪽 폼(회원정보) — 모바일 화면 비율일 땐 순서가 아래로 내려가게 */}
            <Col xs={{ order: 2 }} md={{ order: 1, span: 8 }}>
                {/* ...Form 영역... */}
                <Form>
                <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold text-start d-block" style={{ marginBottom: "0.4rem" }}>로그인 ID</Form.Label>
                    <Form.Control size="sm" type="text" value={member.loginId} disabled />
                </Form.Group>

                {/* 이메일 변경 및 인증: 변경하기 및 취소 버튼 -> 인증요청 버튼 -> 인증확인 버튼 */}
                <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold text-start d-block" style={{ marginBottom: "0.4rem" }}>이메일</Form.Label>
                    {/* 전체 수정모드(editMode)가 아닐 땐 단순 표시만 */}
                    {!editMode ? (
                        <Form.Control size="sm" type="email" value={member.email || ""} disabled />
                    ) : !editModeEmail ? (
                        // 이메일 수정모드이고, 아직 이메일 변경 시작 전 상태
                        <InputGroup size="sm" className="d-flex justify-content-between align-items-center">
                            <Form.Control type="email" value={member.email || ""} disabled />
                            <Button 
                                variant="outline-secondary" 
                                onClick={() => {
                                    setEditModeEmail(true);
                                    setEmailInput(""); // 이메일 입력 초기화
                                    setEmailCode(""); // 인증코드 입력 초기화
                                    setEmailMessage(""); // 메시지 초기화
                                    setEmailSuccess(null); // 메시지 색상 초기화                  
                                }}
                                className="rounded-3 px-3 text-nowrap"
                                style={{
                                    whiteSpace: "nowrap", // 글자 줄바꿈 방지
                                    height: "32px", 
                                    lineHeight: "1", 
                                }}>변경하기
                            </Button>
                            </InputGroup>
                    ) : (
                        // 이메일 변경 중인 상태
                        <>
                        <InputGroup size="sm" className="mt-2">
                            <Form.Control
                                type="email"
                                value={emailInput}
                                placeholder="새 이메일 입력"
                                onChange={(e) => setEmailInput(e.target.value)}
                                disabled={isEmailRequested}
                            />
                            {!isEmailRequested && (
                                <Button variant="dark" className="rounded-3 px-3 text-nowrap" onClick={handleEmailRequest}>인증요청</Button>
                            )}
                            <Button
                                variant="outline-secondary"
                                className="rounded-3 px-3 text-nowrap"
                                onClick={() => {
                                    setEditModeEmail(false);
                                    setIsEmailRequested(false);
                                    setIsEmailVerified(false);
                                    setEmailInput("");
                                    setEmailCode("");
                                }}>취소하기
                            </Button>
                        </InputGroup>

                        {/* 이메일 인증코드 입력란 */}
                        {isEmailRequested && !isEmailVerified && (
                            <InputGroup size="sm" className="mt-2 d-flex gap-2">
                                <Form.Control type="text" placeholder="인증코드 입력" value={emailCode} onChange={(e) => setEmailCode(e.target.value)}/>
                                <Button 
                                    variant="success" 
                                    onClick={handleEmailVerify}
                                    className="rounded-3 px-3 text-nowrap"
                                    disabled={!emailCode.trim()} // 인증코드 입력 없으면 "인증확인" 버튼 비활성화
                                    style={{
                                        whiteSpace: "nowrap", 
                                        height: "32px", 
                                        lineHeight: "1", 
                                        padding: "0 12px"
                                    }}>인증확인
                                </Button>
                            </InputGroup>
                        )}
                        {/* 이메일 중복확인 결과 메세지(왼쪽 정렬 + 반응형 고정) */}
                        {isEmailVerified && (
                            <div className="mt-2 text-start w-100">
                                <p 
                                    className={`fw-semibold mb-0 ${emailSuccess ? "text-success" : "text-danger"}`}
                                    style={{fontSize: "0.9em", lineHeight: "1.4", wordBreak: "keep-all",}}
                                >{emailMessage}</p>
                            </div>
                        )}
                        </>
                    )}
                </Form.Group>

                {/* 닉네임 변경하기 및 중복확인 */}
                <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold text-start d-block" style={{ marginBottom: "0.4rem" }}>닉네임</Form.Label>
                    
                    {/* 전체 수정모드(editMode)가 아닐 땐 단순 표시만 */}
                    {!editMode ? (
                        <Form.Control size="sm" type="text" value={member.nickname || ""} disabled />
                    ) : !editModeNickname ? (
                        // 수정모드이고, 아직 닉네임 변경 시작 전
                        <InputGroup size="sm">
                            <Form.Control type="text" value={member.nickname || ""} disabled />
                            <Button
                                variant="outline-secondary" 
                                onClick={() => {
                                    setEditModeNickname(true)
                                    setNicknameInput(member?.nickname || "");   // 현재 닉네임으로 입력창 채우기
                                    setIsNicknameChecked(false);
                                    setNicknameAvailable(false);
                                    setNicknameMessage("");
                                }}
                                className="rounded-3 px-3 text-nowrap" 
                                style={{
                                    whiteSpace: "nowrap", 
                                    height: "32px", 
                                    lineHeight: "1", 
                                    padding: "0 12px"
                                }}
                            >변경하기
                            </Button>
                        </InputGroup>    
                    ) : (
                        // 닉네임 변경 중
                        <>
                        <InputGroup size="sm" className="mt-2">
                            <Form.Control
                                type="text"
                                value={nicknameInput}
                                placeholder="새 닉네임 입력"
                                onChange={(e) => setNicknameInput(e.target.value)}/>
                            <Button variant="dark" className="rounded-3 px-3 text-nowrap" onClick={handleNicknameCheck}>중복확인</Button>
                            <Button
                                variant="outline-secondary"
                                className="rounded-3 px-3 text-nowrap"
                                onClick={() => {
                                    setEditModeNickname(false);
                                    setIsNicknameChecked(false);
                                    setNicknameAvailable(false);
                                    setNicknameInput("");
                                }}
                                style={{whiteSpace: "nowrap", height: "32px", lineHeight: "1",}}>취소하기
                            </Button>
                        </InputGroup>
                        {/* 닉네임 중복확인 결과 메세지(왼쪽 정렬 + 반응형 고정) */}
                        {isNicknameChecked && (
                            <div className="mt-2 text-start w-100">
                                <p 
                                    className={`fw-semibold mb-0 ${nicknameAvailable ? "text-success" : "text-danger"}`}
                                    style={{fontSize: "0.9em", lineHeight: "1.4", wordBreak: "keep-all",}}
                                >{nicknameMessage}
                                </p>
                            </div>
                        )}
                        </>
                    )}
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold text-start d-block" style={{ marginBottom: "0.4rem" }}>이름</Form.Label>
                    <Form.Control size="sm" type="text" name="name" value={member.name || ""} onChange={handleChange} disabled={!editMode}/>
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold text-start d-block" style={{ marginBottom: "0.4rem" }}>전화번호</Form.Label>
                    <Form.Control size="sm" type="text" name="phone" value={member.phone || ""} onChange={handleChange} disabled={!editMode}/>
                </Form.Group>

                {/** 생년월일 캘린더 형식으로 변경 */}
                <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold text-start d-block" style={{ marginBottom: "0.4rem" }}>생년월일</Form.Label>
                        <Form.Control 
                            size="sm"
                            type="date"
                            name="birthDate"
                            value={birthDate} 
                            onChange={(e) => setBirthDate(e.target.value)} // YYYY-MM-DD
                            disabled={!editMode}
                            className={`border ${editMode ? "bg-white text-dark" : "bg-light text-muted"}`}
                        />
                </Form.Group>

                {/* 성별 선택 버튼 */}
                <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold text-start d-block" style={{ marginBottom: "0.4rem" }}>성별</Form.Label>
                    <div className="d-flex gap-3">
                        <Button
                            size="sm"
                            variant={member.gender === "M" ? "dark" : "outline-secondary"} // 선택된 성별에 따라 스타일 변경
                            className={`px-4 py-2 border ${!editMode ? "disabled" : ""}`}
                            onClick={() => editMode && setMember({ ...member, gender: "M" })}
                        >남성
                        </Button>
                        <Button
                            size="sm"
                            variant={member.gender === "F" ? "dark" : "outline-secondary"}
                            className={`px-4 py-2 border ${!editMode ? "disabled" : ""}`}
                            onClick={() => editMode && setMember({ ...member, gender: "F" })}
                        >여성
                        </Button>
                    </div>
                </Form.Group>

                {/* 비밀번호 변경 (입력창 조건부 렌더링으로: 수정모드일 때만 토글 버튼 + 입력창 표시) */}
                {editMode && (
                    <>
                        {/* 비밀번호 변경 버튼 (수정하기 버튼 클릭 시 활성화 되는 버튼) */}
                        {!showPasswordInput && (
                            <div className="d-flex justify-content-center gap-2 mb-3">
                                {/* 비밀번호 변경 버튼 */}
                                <Button size="sm" variant="outline-secondary" className="flex-fill text-nowrap" onClick={() => setShowPasswordInput((prev) => !prev)}>비밀번호 변경</Button>
                            </div>
                        )}                          

                        {/* 비밀번호 변경 입력창 */}
                        <Fade in={showPasswordInput} unmountOnExit>
                            <div>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold text-start d-block" style={{ marginBottom: "0.4rem" }}>비밀번호 변경</Form.Label>
                                    
                                    {/* 새 비밀번호 입력란(필드1) */}
                                    <Form.Control
                                        size="sm"
                                        type="password"
                                        name="password1"
                                        placeholder="새 비밀번호 입력"
                                        value={passwordInput1} //상태값 바인딩
                                        onChange={handlePwdChange} // 별도 상태로 (저장)업데이트
                                        disabled={!editMode}
                                        className="mb-1"/>

                                    {/* 비밀번호 확인 입력란(필드2) */}    
                                    <Form.Control
                                        size="sm"
                                        type="password"
                                        name="password2"
                                        placeholder="새 비밀번호 확인"
                                        value={passwordInput2} //상태값 바인딩
                                        onChange={handlePwdChange} //별도 상태로 (저장)업데이트
                                        disabled={!editMode}
                                        className="mb-1"/>

                                    {/* 안내 메세지 */} 
                                    <Form.Text className="text-start text-muted d-block">비밀번호 변경 원치 않으실 경우 비워두세요.</Form.Text>        

                                    {/* 유효성 검사 메세지 */}
                                    <Fade in={!passwordValid }>
                                        <Form.Text className="text-start text-danger d-block" style={{fontSize: "0.9em"}}>
                                            유효하지 않은 비밀번호 입니다.
                                            <br/>대문자+소문자+특수문자 포함 8자 이상 입력하세요.
                                        </Form.Text>
                                    </Fade>

                                    {/* 불일치 결과 메세지 */}
                                    <Fade in={!passwordMatch}>
                                        <Form.Text className="text-start text-danger d-block" style={{fontSize: "0.9em"}}>입력하신 비밀번호가 일치하지 않습니다.</Form.Text>
                                    </Fade>
                                    
                                    {/* 일치 결과 메세지 (비밀번호가 유효성 통과하고, 필드1&필드2 입력값이 일치할 경우 표시) */}
                                    <Fade in={
                                        passwordValid && //비밀번호 형식 통과
                                        passwordInput1 !== "" && //비밀번호 입력값(필드1)이 비어있지 않고
                                        passwordInput2 !== "" && //비밀번호 입력값(필드2)도 비어있지 않고
                                        passwordMatch // 두 입력값(필드1&필드2)이 일치 할 경우에만 통과
                                    }> 
                                        <Form.Text className="text-start text-success d-block" style={{fontSize: "0.9em"}}>입력하신 비밀번호가 일치합니다.</Form.Text>
                                    </Fade>
                                    
                                    {/* 비밀번호 변경 취소 버튼 (입력창 하단으로 이동) */}
                                    <div className="d-flex justify-content-center gap-1 mt-3">
                                        <Button
                                            size="sm"
                                            variant="outline-danger"
                                            className="flex-fill text-nowrap"
                                            onClick={() => {
                                                setShowPasswordInput(false);
                                                setPasswordInput1("");
                                                setPasswordInput2("");
                                                setPasswordValid(true);
                                                setPasswordMatch(true);
                                        }}
                                        >비밀번호 변경 취소
                                        </Button>
                                    </div>
                                </Form.Group>
                            </div>
                        </Fade>
                    </>
                )}

                {/* 회원정보 페이지 하단의 버튼 */}
                <div className="d-flex flex-column flex-sm-row gap-4 mt-4">
                    {!editMode ? (
                        <Button size="sm" variant="dark" className="flex-fill text-nowrap" onClick={() => setEditMode(true)}>수정하기</Button> 
                    ) : (
                        <>
                        <Button size="sm" variant="dark" className="flex-fill text-nowrap" onClick={handleSave}>저장하기</Button>
                        <Button size="sm" variant="outline-secondary" className="flex-fill text-nowrap" onClick={() => {
                            // 수정 취소 버튼 클릭 시 상태 초기화
                            setEditMode(false);
                            setEditModeEmail(false);
                            setEditModeNickname(false);
                            setIsEmailRequested(false);
                            setIsEmailVerified(false);
                            setEmailMessage("");
                            setNicknameMessage("");
                            setBirthDate("");
                            setPasswordInput1("");
                            setPasswordInput2("");
                            setShowPasswordInput(false);
                            setPasswordValid(true);
                            setPasswordMatch(true);
                        }}>취소하기</Button>
                        </>
                    )}
                </div>
                </Form>
            </Col>

            {/* 오른쪽 폼(프로필 사진) — 모바일 화면 비율일 땐 순서가 위로 오게  */}
            <Col xs={{ order: 1 }} md={{ order: 2, span: 4 }} className="text-center">
                <div
                    className="border rounded-circle mx-auto d-flex justify-content-center align-items-center bg-light overflow-hidden"
                    style={{ width: "130px", height: "130px" }}>
                    <Image 
                        onClick={() => document.getElementById("formFile")?.click()} style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        src={previewUrl || member.profileImage || "https://cdn-icons-png.flaticon.com/512/847/847969.png"} alt="profile image" roundedCircle fluid/>
                </div>
                <p className="text-muted mt-2 mb-1">프로필 사진</p>

                {/* editMode일 때만 보이는 파일 선택 버튼 + 파일명 표시 버튼 */} 
                {editMode && (
                    <Form.Group controlId="formFile" className="mt-2 d-flex flex-wrap align-items-center justify-content-center gap-2">
                        {/* 숨겨진 파일 입력 */}
                        <Form.Control type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }}/>
                        {/* 파일 선택 버튼 */}
                        <Button as="label" htmlFor="formFile" variant="outline-secondary" className="rounded-3 px-3" style={{ whiteSpace: "nowrap", height: "38px", lineHeight: "1", cursor: "pointer" }}>
                            파일 선택
                        </Button>
                        {/* 파일명 표시 */}
                        <span className="text-muted rounded-3 px-3 py-1" style={{ minWidth: "120px", maxWidth: "180px", height: "38px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "center", cursor: "pointer" }} >
                            {selectedFileName || "선택된 파일 없음"}
                        </span>
                    </Form.Group>
                )}
            </Col>
            </Row>
            {/* 닉네임 중복확인 결과 모달 */}
            <AlertModal show={showNicknameModal} message={nicknameModalMsg} onClose={() => setShowNicknameModal(false)}/>
            {/* 회원정보 수정 완료 모달 */}
            <AlertModal show={showModal} message="회원 정보가 수정되었습니다." onClose={() => setShowModal(false)}/>   
        </Card.Body>
        </Card>
    );
}

export default MemberInfoSection;