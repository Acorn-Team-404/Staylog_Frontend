import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import type { TokenPayload } from "../types/TokenPayload";

/**
 * 토큰에서 userId를 추출하는 커스텀 훅
 * @author 이준혁
 * @returns userId 로그인한 사용자의 PK
 */
function useGetUserIdFromToken() {
   const [userId, setUserId] = useState<number | undefined>();
   // 토큰 가져오기

   // 가져온 토큰 업데이트
   useEffect(() => {
      const token = localStorage.getItem("token");
      if (token) {
         try {
            const decoded = jwtDecode<TokenPayload>(token);
            setUserId(decoded.sub)
         } catch (err) {
            console.log(err);
            setUserId(undefined);
         }
      } else {
         setUserId(undefined);
      }
   }, [])
   return userId;
}

export default useGetUserIdFromToken;