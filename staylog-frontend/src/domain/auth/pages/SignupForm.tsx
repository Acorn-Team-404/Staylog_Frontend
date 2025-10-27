
function SignupForm() {
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
                        <input type="text" className="form-control me-2" id="loginId" placeholder="아이디를 입력하세요." />
                        <button type="button" className="btn btn-outline-secondary flex-shrink-0">중복확인</button>
                     </div>
                     <p className="form-text text-danger mt-1">
                        <span className="text-primary">1</span> 이미 사용 중인 아이디입니다.
                     </p>
                  </div>


                  <div className="mb-3">
                     <label htmlFor="password" className="form-label fw-bold">비밀번호</label>
                     <div className="d-flex">
                        <input type="text" className="form-control me-2" id="password" placeholder="비밀번호를 입력하세요." />
                     </div>
                     <p className="form-text text-danger mt-1">
                        <span className="text-primary">1</span> 비밀번호가 유효하지 않습니다.
                     </p>
                  </div>


                  <div className="mb-3">
                     <label htmlFor="password2" className="form-label fw-bold">비밀번호 확인</label>
                     <div className="d-flex">
                        <input type="text" className="form-control me-2" id="password2" placeholder="한번 더 비밀번호를 입력하세요." />
                     </div>
                     <p className="form-text text-danger mt-1">
                        <span className="text-primary">1</span> 비밀번호가 일치하지 않습니다.
                     </p>
                  </div>


                  <div className="mb-3">
                     <label htmlFor="nickname" className="form-label fw-bold">닉네임</label>
                     <div className="d-flex">
                        <input type="text" className="form-control me-2" id="nickname" placeholder="사용할 닉네임을 입력하세요." />
                        <button type="button" className="btn btn-outline-secondary flex-shrink-0">중복확인</button>
                     </div>
                     <p className="form-text text-danger mt-1">
                        <span className="text-primary">1</span> 이미 사용 중인 닉네임입니다.
                     </p>
                  </div>


                  <div className="mb-3">
                     <label htmlFor="name" className="form-label fw-bold">이름</label>
                     <div className="d-flex">
                        <input type="text" className="form-control me-2" id="name" placeholder="이름을 입력하세요." />
                     </div>
                  </div>

                  <div className="mb-3">
                     <label htmlFor="email" className="form-label fw-bold">이메일</label>
                     <div className="d-flex">
                        <input type="email" className="form-control me-2" id="email" placeholder="이메일을 입력하세요." />
                        <button type="button" className="btn btn-outline-secondary flex-shrink-0">인증요청</button>
                     </div>
                     <p className="form-text text-danger mt-1">
                        <span className="text-primary">1</span> 이메일이 유효하지 않습니다.
                     </p>
                  </div>


                  <div className="mb-3">
                     <label htmlFor="phone" className="form-label fw-bold">휴대폰 번호</label>
                     <div className="d-flex">
                        <input type="text" className="form-control me-2" id="phone" placeholder="휴대폰 번호를 입력하세요." />
                     </div>
                     <p className="form-text text-danger mt-1">
                        <span className="text-primary">1</span> 휴대폰 번호가 유효하지 않습니다.
                     </p>
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