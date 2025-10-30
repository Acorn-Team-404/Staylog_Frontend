import api from "../../../global/api";


interface MailCertifyProps {
   email: string
   code: string
}


/**
 * 인증 코드로 이메일 인증하는 함수
 * @author 이준혁
 * @param email 입력받은 이메일
 * @param code 입력받은 인증 코드
 * @returns 인증 성공 시 true, 실패 시 false
 */
async function mailCertify({email, code}: MailCertifyProps) {
   const MailCheckRequest = {
      email: email,
      code: code
   }

   try {
      await api.post("/v1/mail-check", MailCheckRequest)
      alert("인증 완료")
      return true;
   } catch (err) {
      console.log(err);
      alert("인증 번호가 유효하지 않습니다.")
      return false;
   }
}

export default mailCertify;