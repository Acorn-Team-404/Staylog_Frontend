// src/domain/admin/types/AdminBoardTypes.tsx

import type { PageRequest, PageResponse } from "../../../global/types/Paginationtypes";

export interface AdminBoard {
    boardId: number;           // 게시글 ID
    userId: number;            // 로그인된 사용자 ID
    userNickName?: string;     // 작성자 닉네임
    accommodationId?: number;  // 숙소 ID
    accommodationName?: string;// 숙소 이름
    bookingId: number;         // 예약 ID
    regionCode: string;        // 지역 코드 (예: 'SEOUL')
    regionName?: string;       // 지역 이름
    title: string;             // 제목
    content: string;           // 내용
    rating?: number;    // 평점
    likesCount?: number;            // 좋아요 수
    viewsCount?: number;       // 조회수
    createdAt: string;        // 작성일
    updatedAt?: string;
    deleted: 'Y' | 'N';
}

export interface AdminBoardSearchParams extends PageRequest {
    boardType: 'BOARD_REVIEW' | 'BOARD_JOURNAL';

    // 검색 조건
    searchType?: 'accommodationName' | 'userNickName';
    keyword?: string;
    regionCode?: string;
    deleted?: 'Y' | 'N' | null;

    // 정렬조건
    sortBy?: 'createdAt' | 'viewsCount' | 'rating' | 'likesCount';
    sortOrder?: 'ASC' | 'DESC';
}

export interface AdminBoardListResponse {
    boards: AdminBoardList[];
    page: PageResponse;
}

export interface AdminBoardList {
    boardId: number;           // 게시글 ID
    userId: number;            // 로그인된 사용자 ID
    userNickName?: string;     // 작성자 닉네임
    accommodationId?: number;  // 숙소 ID
    accommodationName?: string;// 숙소 이름
    regionCode: string;        // 지역 코드 (예: 'SEOUL')
    regionName?: string;       // 지역 이름
    title: string;             // 제목
    rating?: number;    // 평점
    likesCount?: number;            // 좋아요 수
    viewsCount?: number;       // 조회수
    createdAt: string;        // 작성일
    deleted: 'Y' | 'N';
}