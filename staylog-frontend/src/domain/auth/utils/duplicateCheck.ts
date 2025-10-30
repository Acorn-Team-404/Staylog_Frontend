import api from "../../../global/api";

interface DuplicateCheckProps {
   checkType: "loginId" | "nickname"
   value: string
   valid: boolean
}


/**
 * 입력값 중복 확인 함수
 * @author 이준혁
 * @param checkType 중복 체크할 요소
 * @param value 입력된 값
 * @param valid 입력값의 유효성
 * @returns 사용할 수 있다면 true, 사용할 수 없다면 false 반환
 */
async function duplicateCheck({checkType, value, valid}: DuplicateCheckProps): Promise<boolean> {
   
   let valueType = "";

   if(checkType === "loginId") {
      valueType = "아이디"
   } else if(checkType === "nickname") {
      valueType = "닉네임"
   }

   // 유효성 검증
      if (!valid) {
         alert("유효하지 않은 입력입니다. 다시 확인해주세요.")
         return false;
      }

      try {
         await api.get(`/v1/user/loginId/${value}/duplicate`)
         alert(`사용할 수 있는 ${valueType}입니다.`)
         return true;

      } catch (err: any) {
         console.error(`[${checkType}] 확인 실패:`, err);
         if (err.response && err.response.status === 409) {
            alert(`이미 가입된 ${valueType}입니다.`);
         }
         else {
            alert("확인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
         }
         return false;
      }

}

export default duplicateCheck;