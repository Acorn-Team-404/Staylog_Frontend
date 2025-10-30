export interface DecodedToken {
   sub: string; // userId
   loginId: string;
   nickname: string;
   // profileImageUrl: string | null
   exp: number;
}