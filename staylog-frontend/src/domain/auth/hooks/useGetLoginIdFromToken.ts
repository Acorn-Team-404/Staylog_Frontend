import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import type { TokenPayload } from "../types/TokenPayload";

/**
 * 토큰에서 loginId를 추출하는 커스텀 훅
 * @author 이준혁
 * @returns loginId 로그인한 사용자의 로그인 아이디
 */
function useGetLoginIdFromToken() {
   const [loginId, setLoginId] = useState<string | undefined>();
   // 토큰 가져오기

   // 가져온 토큰 업데이트
   useEffect(() => {
      const token = localStorage.getItem("token");
      if (token) {
         try {
            const decoded = jwtDecode<TokenPayload>(token);
            setLoginId(decoded.loginId)
         } catch (err) {
            console.log(err);
            setLoginId(undefined);
         }
      } else {
         setLoginId(undefined);
      }
   }, [])
   return loginId;
}

export default useGetLoginIdFromToken;