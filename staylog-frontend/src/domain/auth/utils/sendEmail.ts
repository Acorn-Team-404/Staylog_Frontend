import api from "../../../global/api";

interface sendEmailProps {
   email: string
   valid: boolean
}


/**
 * 인증 메일 전송하는 함수
 * @author 이준혁
 * @param email 입력받은 이메일
 * @param code 이메일 유효성 여부
 * @returns 인증 성공 시 true, 실패 시 false
 */
async function sendEmail({email, valid}: sendEmailProps) {
      if (!valid) {
         alert("이메일이 유효하지 않습니다. 다시 확인해주세요.")
         return;
      }

      try {
         alert("메일 전송 중입니다. 잠시만 기다려주세요")
         await api.post("/v1/mail-send", { email: email })
         alert("메일 전송이 완료되었습니다.")
         return true;

      } catch (err: any) {
         console.error("[email] 확인 실패:", err);
         if (err.response && err.response.status === 409) {
            alert("이미 사용 중인 이메일입니다.");
         }
         else {
            alert("확인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
         }
         return false;
      }
}

export default sendEmail;