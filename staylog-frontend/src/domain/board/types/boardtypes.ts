// src/domain/board/types/boardtypes.ts

import type { PageResponse } from "../../../global/types/Paginationtypes";



export type BoardDto = {

   boardId: number;           // 게시글 ID
   userId: number;            // 로그인된 사용자 ID
   userNickName?: string;     // 작성자 닉네임
   userName?: string;         // 작성자 닉네임
   accommodationId?: number;  // 숙소 ID
   accommodationName?: string;// 숙소 이름
   bookingId: number;         // 예약 ID
   checkIn?: string;          // 체크인 날짜
   checkOut?: string;         // 체크아웃 날짜
   regionCode: string;        // 지역 코드 (예: 'SEOUL')
   regionName?: string;       // 지역 이름
   boardType: string;         // 게시판 타입 (예: 'REVIEW')
   title: string;             // 제목
   content: string;           // 내용
   rating?: number | 0;       // 평점
   likesCount?: number;       // 좋아요 수
   viewsCount?: number;       // 조회수
   createdAt?: string;        // 작성일

   imageData?: string;     // 썸네일 이미지

}


export interface PageInfo extends PageResponse {
      boardType: string;
      regionCodes: string[];
      sort: "latest" | "likes" | "views";
    }

export type LikesDto = {
      
      likeId?: number;            // 좋아요 ID
      boardId: number;            // 게시글 ID
      userId: number;             // 사용자 ID
}