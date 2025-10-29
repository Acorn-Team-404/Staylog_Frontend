import { jwtDecode } from "jwt-decode";
import api from "../../../global/api/index";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import type { DecodedToken } from "../types/DecodedToken";


/**
 * JWT 토큰 검증 함수
 * App.tsx 최상위 컴포넌트에서 호출하여 새로고침 시에도 로그인 상태 유지
 * @author 이준혁
 */
function useAuthJwt() {

const dispatch = useDispatch();
const nav = useNavigate();

useEffect(() => {
   const token = localStorage.getItem("token")

   if (token) {
      try {
         
         const decoded = jwtDecode<DecodedToken>(token.substring(7))
         const now = Date.now() / 1000
         
         if (decoded.exp > now) {
            api.defaults.headers.common['Authorization'] = token;
            dispatch({
               type: "USER_INFO",
               payload: {
                  userId: decoded.sub,
                  loginId: decoded.loginId,
                  nickname: decoded.nickname
                  // profileImageUrl: decoded.profileImageUrl ? `/api/images${decoded.profileImageUrl}` : null // 아직 경로 지정 안됨
               }
            })

            const remainTime = (decoded.exp - now) * 1000;
            const logoutTimer = setTimeout(() => {
               dispatch({ type: "LOGOUT" })
               nav("/")
               alert("세션이 만료되어 자동 로그아웃 되었습니다.")
            }, remainTime)

            return () => clearTimeout(logoutTimer)

         } else {
            dispatch({ type: "LOGOUT" })
         }
      } catch (err) {
         console.error("유효하지 않은 토큰 : ", err);
         dispatch({ type: "LOGOUT" })
      }
   }
}, [dispatch, nav])
}

export default useAuthJwt;