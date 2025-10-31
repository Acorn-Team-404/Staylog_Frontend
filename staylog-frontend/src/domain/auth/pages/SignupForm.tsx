import { useEffect, useState } from "react";
import api from "../../../global/api";
import { useNavigate } from "react-router-dom";
import type { signupConfirmType, signupDirtyType, signupStateType, signupValidType } from "../types/SignupType";
import sendEmail from "../utils/sendEmail";
import mailCertify from "../utils/mailCertify";
import { REGEX_EMAIL, REGEX_LOGIN_ID, REGEX_PASSWORD, REGEX_PHONE } from "../../../global/constants/Validation";
import duplicateCheck from "../utils/duplicateCheck";


function SignupForm() {



   const navigate = useNavigate();

   // 입력 상태값
   const [inputState, setInputState] = useState<signupStateType>({
      loginId: "",
      password: "",
      password2: "",
      nickname: "",
      name: "",
      email: "",
      phone: "",
      code: ""
   })

   // 한 번이라도 입력되었는지
   const [dirty, setDirty] = useState<signupDirtyType>({
      loginId: false,
      password: false,
      password2: false,
      nickname: false,
      name: false,
      email: false,
      phone: false
   })

   // 입력값이 유효한지
   const [valid, setValid] = useState<signupValidType>({
      loginId: false,
      password: false,
      password2: false,
      nickname: false,
      email: false,
      name: false,
      phone: false
   })


   // 중복확인 및 인증 여부
   const [confirm, setConfirm] = useState<signupConfirmType>({
      loginId: false,
      nickname: false,
      email: false
   })

   // 메일 발송 여부 상태값
   const [mailSend, setMailSend] = useState<boolean>(false)

   const [mailCodeTimer, setMailCodeTimer] = useState<number>(600);


   // 입력값 변경 및 dirty/valid 업데이트 함수
   function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
      const { name, value } = e.currentTarget
      setInputState(prev => ({
         ...prev,
         [name]: value
      }))
      setDirty(prev => ({
         ...prev,
         [name]: true
      }))

      // 정규표현식을 사용한 유효성 검사
      let isValid = false;
      switch (name) {
         case "loginId":
            isValid = REGEX_LOGIN_ID.test(value);
            break;
         case "password":
            isValid = REGEX_PASSWORD.test(value);
            break;
         case "email":
            isValid = REGEX_EMAIL.test(value);
            break;
         case "phone":
            isValid = REGEX_PHONE.test(value);
            break;
         case "nickname":
         case "name":
            isValid = value.trim().length > 0;
            break;
         // password2는 useEffect에서 별도 처리
         case "password2":
            isValid = true; // useEffect에서 false로 바뀔 수 있음
            break;
         default:
            isValid = true; // name처럼 규칙이 없는 필드
      }

      // valid 상태 업데이트
      setValid(prev => ({ ...prev, [name]: isValid }));
   }


   // password 일치 여부를 검증하기 위한 useEffect
   useEffect(() => {
      const isMatch = inputState.password.length > 0 &&
         inputState.password === inputState.password2;

      // password2의 유효성만 업데이트
      setValid(prev => ({
         ...prev,
         password2: isMatch
      }));
   }, [inputState.password, inputState.password2]);



   // 아이디 중복 검사
   async function handleLoginIdConfirm() {
      const isConfirm = await duplicateCheck({
         checkType: "loginId",
         value: inputState.loginId,
         valid: valid.loginId
      });
      if (isConfirm) {
         setConfirm(prev => ({
            ...prev,
            loginId: isConfirm
         }));
      }
   }


   // 닉네임 중복 검사
   async function handleNicknameConfirm() {
      const isConfirm = await duplicateCheck({
         checkType: "nickname",
         value: inputState.nickname,
         valid: valid.nickname
      });
      if (isConfirm) {
         setConfirm(prev => ({
            ...prev,
            nickname: isConfirm
         }));
      }
   }


   // 인증 메일 발송
   async function handleEmailSend() {

      setConfirm(prev => ({
         ...prev,
         email: false
      }))

      let isSend = await sendEmail({
         email: inputState.email,
         valid: valid.email
      })

      if (isSend) {
         setMailSend(isSend)

         // setConfirm(prev => ({
         //    ...prev,
         //    email: isSend
         // }));
      }

   }


   useEffect(() => {
      let timerId: NodeJS.Timeout | null = null;

      if (mailSend && !confirm.email) {
         setMailCodeTimer(180);

         timerId = setInterval(() => {
            setMailCodeTimer(prev => {
               if (prev <= 1) {
                  clearInterval(timerId!); // 0초가 되면 타이머 중지
                  setMailSend(false);      // 시간이 만료되면 메일 발송 상태도 초기화
                  return 0;                // 0으로 설정
               }
               return prev - 1;
            });
         }, 1000);
      }

      return () => {
         if (timerId) {
            clearInterval(timerId);
         }
      };
   }, [mailSend, confirm.email])





   // 메일 인증 코드 검증
   async function mailCodeCheck() {
      const isCertify = await mailCertify({
         email: inputState.email,
         code: inputState.code
      })
      setConfirm(prev => ({
         ...prev,
         email: isCertify
      }));

      setInputState(prev => ({
         ...prev,
         code: ""
      }))
   }


   // 회원가입 요청 함수
   async function handleSubmit() {

      // valid 값 검증
      const allValid = Object.values(valid).every(value => value === true);
      if (!allValid) {
         alert("입력 형식이 올바르지 않은 항목이 있습니다. 확인해주세요.");
         return;
      }

      // confirm 값 검증
      const allConfirmed = Object.values(confirm).every(value => value === true);

      if (!allConfirmed) {
         alert("아이디/닉네임 중복 확인 및 이메일 인증을 완료해주세요.");
         return;
      }

      const userInfo = {
         loginId: inputState.loginId,
         password: inputState.password,
         nickname: inputState.nickname,
         name: inputState.name,
         email: inputState.email,
         phone: inputState.phone
      }

      try {
         await api.post("/v1/user", userInfo)
         alert("회원가입 성공")
         navigate("/")
      } catch (err) {
         console.log(err);
         alert("회원가입 실패")
      }
   }


   return (
      <div className="row justify-content-center">
         <div className="col-12 col-md-8 col-lg-6 mb-5">
            <div className="text-center mb-4">
               <h1>SIGNUP</h1>
               <h4 className="text-secondary">회원가입</h4>
            </div>

            <hr className="mb-4" />

            <form>
               <div className="mb-3">
                  <label htmlFor="loginId" className="form-label fw-bold">아이디</label>
                  <div className="d-flex">
                     <input onChange={handleChange} type="text" className="form-control me-2" name="loginId" id="loginId" value={inputState.loginId} placeholder="아이디를 입력하세요." />
                     <button onClick={handleLoginIdConfirm} type="button" name="loginId" className="btn btn-outline-secondary flex-shrink-0">중복확인</button>
                  </div>
                  {dirty.loginId &&
                     (!valid.loginId &&
                        <p className="form-text text-danger mt-1">유효하지 않은 아이디입니다. 영문을 포함하여 4~16글자 입력해주세요</p>
                     )}
               </div>


               <div className="mb-3">
                  <label htmlFor="password" className="form-label fw-bold">비밀번호</label>
                  <div className="d-flex">
                     <input type="password" onChange={handleChange} className="form-control me-2" name="password" id="password" value={inputState.password} placeholder="비밀번호를 입력하세요." />
                  </div>
                  {dirty.password &&
                     (!valid.password &&
                        <p className="form-text text-danger mt-1">유효하지 않은 비밀번호입니다. 대문자 + 소문자 + 특수문자 조합으로 8글자 이상 입력해주세요</p>
                     )}
               </div>


               <div className="mb-3">
                  <label htmlFor="password2" className="form-label fw-bold">비밀번호 확인</label>
                  <div className="d-flex">
                     <input type="password" onChange={handleChange} className="form-control me-2" name="password2" id="password2" value={inputState.password2} placeholder="한번 더 비밀번호를 입력하세요." />
                  </div>
                  {dirty.password2 &&
                     (!valid.password2 &&
                        <p className="form-text text-danger mt-1">비밀번호가 일치하지 않습니다.</p>
                     )}
               </div>


               <div className="mb-3">
                  <label htmlFor="nickname" className="form-label fw-bold">닉네임</label>
                  <div className="d-flex">
                     <input type="text" onChange={handleChange} className="form-control me-2" name="nickname" id="nickname" value={inputState.nickname} placeholder="사용할 닉네임을 입력하세요." />
                     <button onClick={handleNicknameConfirm} name="nickname" type="button" className="btn btn-outline-secondary flex-shrink-0">중복확인</button>
                  </div>
                  {dirty.nickname &&
                     (!valid.nickname &&
                        <p className="form-text text-danger mt-1">닉네임을 입력해주세요</p>
                     )}
               </div>


               <div className="mb-3">
                  <label htmlFor="email" className="form-label fw-bold">이메일</label>
                  <div className="d-flex">
                     <input type="email" onChange={handleChange} className="form-control me-2" name="email" id="email" value={inputState.email} placeholder="이메일을 입력하세요." readOnly={confirm.email} />
                     <button onClick={handleEmailSend} name="email" type="button" className="btn btn-outline-secondary flex-shrink-0">인증요청</button>
                  </div>
                  {dirty.email &&
                     (!valid.email &&
                        <p className="form-text text-danger mt-1">이메일 형식으로 입력해주세요</p>
                     )}
                  {mailSend && !confirm.email && (
                     <>
                        <div className="d-flex">
                           <input onChange={handleChange} type="text" className="form-control me-2 mt-2" name="code" id="code" value={inputState.code} placeholder="인증코드를 입력하세요." />
                           <button onClick={mailCodeCheck} name="code" type="button" className="btn btn-outline-primary flex-shrink-0 mt-2">인증확인</button>
                        </div>
                     </>
                  )}
                  {mailSend && !confirm.email && <p className="form-text text-danger mt-1 fw-semibold">유효 시간: {mailCodeTimer}초</p>}
                  {mailSend && confirm.email && <p className="form-text text-success mt-1 fw-semibold">인증 완료</p>}
               </div>


               <div className="mb-3">
                  <label htmlFor="name" className="form-label fw-bold">이름</label>
                  <div className="d-flex">
                     <input type="text" onChange={handleChange} className="form-control me-2" name="name" id="name" value={inputState.name} placeholder="이름을 입력하세요." />
                  </div>
                  {dirty.name &&
                     (!valid.name &&
                        <p className="form-text text-danger mt-1">이름을 입력해주세요</p>
                     )}
               </div>



               <div className="mb-3">
                  <label htmlFor="phone" className="form-label fw-bold">휴대폰 번호</label>
                  <div className="d-flex">
                     <input type="text" onChange={handleChange} className="form-control me-2" name="phone" id="phone" value={inputState.phone} placeholder="휴대폰 번호를 입력하세요." />
                  </div>
                  {dirty.phone &&
                     (!valid.phone &&
                        <p className="form-text text-danger mt-1">'-'를 포함하여 입력해주세요</p>
                     )}
               </div>


               <div className="mt-5">
                  <button onClick={handleSubmit} type="button" className="btn btn-dark w-100 py-2">
                     가입 하기
                  </button>
               </div>
            </form>
         </div>
      </div>
   );
}

export default SignupForm;