export interface TokenPayload {
   sub: number | undefined;    // 사용자 PK (userId)
   loginId: string | undefined; // 사용자 로그인 아이디
   nickname: string;
}