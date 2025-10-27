import { useEffect, useState, type ChangeEvent } from "react";
import api from "../../../global/api";
import axios from "axios";


interface inputStateType {
   loginId: string
   password: string
   password2: string
   nickname: string
   name: string
   email: string
   phone: string
   code: string
}

interface signupValidType {
   loginId: boolean
   password: boolean
   password2: boolean
   nickname: boolean
   email: boolean
   name: boolean
   phone: boolean
}

interface signupDirtyType {
   loginId: boolean
   password: boolean
   password2: boolean
   nickname: boolean
   name: boolean
   email: boolean
   phone: boolean
}

interface signupConfirmType {
   loginId: boolean
   nickname: boolean
   email: boolean
}


function SignupForm() {

   // 입력 상태값
   const [inputState, setInputState] = useState<inputStateType>({
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


   const [mailSend, setMailSend] = useState<boolean>(false)


   const regLoginId = /^(?![0-9]+$)[a-zA-Z0-9]{4,16}$/
   const regPassword = /^(?=.*[A-Z])(?=.*[\W_]).{8,}$/
   const regEmail = /^\S+@\S+\.\S+$/
   const regPhone = /^[0-9]+-[0-9]+-[0-9]+$/

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
      // 유효성 검사 실행
      let isValid = false;
      switch (name) {
         case "loginId":
            isValid = regLoginId.test(value);
            break;
         case "password":
            isValid = regPassword.test(value);
            break;
         case "email":
            isValid = regEmail.test(value);
            break;
         case "phone":
            isValid = regPhone.test(value);
            break;
         // 닉네임, 이름 등 단순 필수 값은 비어있지 않은지만 체크
         case "nickname":
         case "name":
            isValid = value.trim().length > 0;
            break;
         // password2는 useEffect에서 별도 처리
         case "password2":
            // 일단 '비어있지 않음' 정도만 체크하거나, 
            // 여기서도 비교 로직을 넣을 수 있지만 useEffect가 더 명확해요.
            // 여기서는 일단 비워둡시다. useEffect가 덮어쓸 거예요.
            isValid = true; // 혹은 value.length > 0
            break;
         default:
            isValid = true; // name처럼 규칙이 없는 필드
      }
      // valid 상태 업데이트
      // (password2는 여기서 true여도 useEffect에서 false로 바뀔 수 있음)
      setValid(prev => ({ ...prev, [name]: isValid }));
   }


   useEffect(() => {
      // 둘 다 비어있지 않고, 서로 일치하는지 검사
      const isMatch = inputState.password.length > 0 &&
         inputState.password === inputState.password2;

      // password2 필드의 유효성만 콕 집어서 업데이트
      setValid(prev => ({
         ...prev,
         password2: isMatch
      }));

      // 'password' 또는 'password2' 값이 바뀔 때마다 이 로직을 실행
   }, [inputState.password, inputState.password2]);


   // 아이디 중복 검사
   async function handelLoginIdConfirm(e: React.MouseEvent<HTMLButtonElement>) {
      if (!valid.loginId) {
         alert("아이디가 유효하지 않습니다. 다시 확인해주세요.")
         return;
      }

      try {
         await api.get(`/v1/user/loginId/${inputState.loginId}/duplicate`)
         alert("사용할 수 있는 아이디입니다.")
         setConfirm(prev => ({
            ...prev,
            loginId: true
         }));

      } catch (err: any) {
         console.error("[loginId] 확인 실패:", err);
         if (err.response && err.response.status === 409) {
            alert("이미 가입된 아이디입니다.");
         }
         else {
            alert("확인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
         }
         setConfirm(prev => ({
            ...prev,
            loginId: false
         }));
      }
   }


   // 닉네임 중복 검사
   async function handelNicknameConfirm(e: React.MouseEvent<HTMLButtonElement>) {
      if (!valid.nickname) {
         alert("닉네임 유효하지 않습니다. 다시 확인해주세요.")
         return;
      }

      try {
         await api.get(`/v1/user/nickname/${inputState.nickname}/duplicate`)
         alert("사용할 수 있는 닉네임입니다.")
         setConfirm(prev => ({
            ...prev,
            nickname: true
         }));

      } catch (err: any) {
         console.error("[nickname] 확인 실패:", err);
         if (err.response && err.response.status === 409) {
            alert("이미 가입된 닉네임입니다.");
         }
         else {
            alert("확인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
         }
         setConfirm(prev => ({
            ...prev,
            nickname: false
         }));
      }
   }

   // 인증 메일 발송
   async function handelEmailSend(e: React.MouseEvent<HTMLButtonElement>) {
      if (!valid.email) {
         alert("이메일이 유효하지 않습니다. 다시 확인해주세요.")
         return;
      }

      try {
         await api.post("/v1/mail-send", { email: inputState.email })
         alert("인증 메일이 발송됐습니다.")
         setMailSend(true)

      } catch (err: any) {
         console.error("[email] 확인 실패:", err);
         if (err.response && err.response.status === 409) {
            alert("이미 사용 중인 이메일입니다.");
         }
         else {
            alert("확인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
         }
         setConfirm(prev => ({
            ...prev,
            email: false
         }));
      }
   }


   async function mailCertify(e: React.MouseEvent<HTMLButtonElement>) {

      const MailCheckRequest = {
         email: inputState.email,
         code: inputState.code
      }

      try {
         await api.post("/v1/mail-check", MailCheckRequest)
         setConfirm(prev => ({
            ...prev,
            email: true
         }));
         alert("가입 완료")
      } catch (err) {
         console.log(err);
         setConfirm(prev => ({
            ...prev,
            email: false
         }));
         alert("가입 실패")
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
                     <button onClick={handelLoginIdConfirm} type="button" name="loginId" className="btn btn-outline-secondary flex-shrink-0">중복확인</button>
                  </div>
                  {dirty.loginId &&
                     (valid.loginId
                        ? <p className="form-text text-success mt-1">유효함</p>
                        : <p className="form-text text-danger mt-1">유효하지 않은 아이디입니다. 영문을 포함하여 4글자 이상 입력해주세요</p>
                     )}
               </div>


               <div className="mb-3">
                  <label htmlFor="password" className="form-label fw-bold">비밀번호</label>
                  <div className="d-flex">
                     <input type="password" onChange={handleChange} className="form-control me-2" name="password" id="password" value={inputState.password} placeholder="비밀번호를 입력하세요." />
                  </div>
                  {dirty.password &&
                     (valid.password
                        ? <p className="form-text text-success mt-1">유효함</p>
                        : <p className="form-text text-danger mt-1">유효하지 않은 비밀번호입니다. 대문자 + 소문자 + 특수문자 조합으로 8글자 이상 입력해주세요</p>
                     )}
               </div>


               <div className="mb-3">
                  <label htmlFor="password2" className="form-label fw-bold">비밀번호 확인</label>
                  <div className="d-flex">
                     <input type="password" onChange={handleChange} className="form-control me-2" name="password2" id="password2" value={inputState.password2} placeholder="한번 더 비밀번호를 입력하세요." />
                  </div>
                  {dirty.password2 &&
                     (valid.password2
                        ? <p className="form-text text-success mt-1">유효함</p>
                        : <p className="form-text text-danger mt-1">비밀번호가 일치하지 않습니다.</p>
                     )}
               </div>


               <div className="mb-3">
                  <label htmlFor="nickname" className="form-label fw-bold">닉네임</label>
                  <div className="d-flex">
                     <input type="text" onChange={handleChange} className="form-control me-2" name="nickname" id="nickname" value={inputState.nickname} placeholder="사용할 닉네임을 입력하세요." />
                     <button onClick={handelNicknameConfirm} name="nickname" type="button" className="btn btn-outline-secondary flex-shrink-0">중복확인</button>
                  </div>
                  {dirty.nickname &&
                     (valid.nickname
                        ? ""
                        : <p className="form-text text-danger mt-1">닉네임을 입력해주세요</p>
                     )}
               </div>


               <div className="mb-3">
                  <label htmlFor="email" className="form-label fw-bold">이메일</label>
                  <div className="d-flex">
                     <input type="email" onChange={handleChange} className="form-control me-2" name="email" id="email" value={inputState.email} placeholder="이메일을 입력하세요." />
                     <button onClick={handelEmailSend} name="email" type="button" className="btn btn-outline-secondary flex-shrink-0">인증요청</button>
                  </div>
                  {dirty.email &&
                     (valid.email
                        ? <p className="form-text text-success mt-1">유효함</p>
                        : <p className="form-text text-danger mt-1">이메일 형식으로 입력해주세요</p>
                     )}
                  {mailSend && (
                     <>
                        <input onChange={handleChange} type="text" className="form-control me-2" name="code" id="code" value={inputState.code} placeholder="인증코드를 입력하세요." />
                        <button onClick={mailCertify} type="button" className="btn btn-outline-primary flex-shrink-0">인증확인</button>
                     </>
                  )}

               </div>


               <div className="mb-3">
                  <label htmlFor="name" className="form-label fw-bold">이름</label>
                  <div className="d-flex">
                     <input type="text" onChange={handleChange} className="form-control me-2" name="name" id="name" value={inputState.name} placeholder="이름을 입력하세요." />
                  </div>
                  {dirty.name &&
                     (valid.name
                        ? ""
                        : <p className="form-text text-danger mt-1">이름을 입력해주세요</p>
                     )}
               </div>



               <div className="mb-3">
                  <label htmlFor="phone" className="form-label fw-bold">휴대폰 번호</label>
                  <div className="d-flex">
                     <input type="text" onChange={handleChange} className="form-control me-2" name="phone" id="phone" value={inputState.phone} placeholder="휴대폰 번호를 입력하세요." />
                  </div>
                  {dirty.phone &&
                     (valid.phone
                        ? <p className="form-text text-success mt-1">유효함</p>
                        : <p className="form-text text-danger mt-1">'-'를 포함하여 입력해주세요</p>
                     )}
               </div>


               <div className="mt-5">
                  <button type="submit" className="btn btn-dark w-100 py-2">
                     가입 하기
                  </button>
               </div>
            </form>
         </div>
      </div>
   );
}

export default SignupForm;