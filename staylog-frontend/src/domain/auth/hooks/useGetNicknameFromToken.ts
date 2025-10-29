import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import type { TokenPayload } from "../types/TokenPayload";

/**
 * 토큰에서 nickname을 추출하는 커스텀 훅
 * @author 이준혁
 * @returns nickname 로그인한 사용자의 닉네임
 */
function useGetNicknameFromToken() {
   const [nickname, setNickname] = useState<string | undefined>();
   // 토큰 가져오기

   // 가져온 토큰 업데이트
   useEffect(() => {
      const token = localStorage.getItem("token");
      if (token) {
         try {
            const decoded = jwtDecode<TokenPayload>(token);
            setNickname(decoded.nickname)
         } catch (err) {
            console.log(err);
            setNickname(undefined);
         }
      } else {
         setNickname(undefined);
      }
   }, [])
   return nickname;
}

export default useGetNicknameFromToken;