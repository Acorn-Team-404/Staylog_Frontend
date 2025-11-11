// src/domain/accommodation/types/AccommodationType.ts

export interface AccommodationReviewListType {
    readonly boardId : number;
    readonly userId : number;
    nickname : string;
    contentUrl : string | null; // 리뷰 미리보기 대표 이미지
    profileUrl : string | null; // 프로필 이미지
    title : string;
    content : string;
    rating : number;
    createdAt : string;
}
export interface AccommodationRoomListType {
    maxAdult: number;
    maxChildren: number;
    maxInfant: number;
    readonly roomId : number;
    name : string;
    maxGuest : number;
    rmTypeNameEn : string;
    rmTypeName : string;
    price : number;
    imageUrl?: string; 
}

export interface AccommodationDetailType {
    readonly accommodationId?: number;
    name : string;
    typeNameEn : string;
    typeName : string;
    description : string;
    address : string;
    regionNameEn : string;
    regionName : string;
    latitude : number;
    longitude : number;
    createdAt : string;
    updatedAt : string | null;
    checkInTime : string;
    checkOutTime : string;
    rooms?: AccommodationRoomListType[];
    reviews?: AccommodationReviewListType[]; 

    // 다음 개발 단계에서 추가될 필드 (주석 처리)
    // averageRating?: number;
    // images?: ImageResponse[];
}