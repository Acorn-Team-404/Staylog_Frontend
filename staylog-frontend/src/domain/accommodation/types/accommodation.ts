// src/domain/accommodation/types/accommodation.ts

export interface AccommodationReviewList {
    readonly boardId : number;
    readonly userId : number;
    nickname : string;
    profileImage : string;
    content : string;
    rating : number;
    reviewCount : number;
    createdAt : string;

}
export interface AccommodationRoomList {
    readonly roomId : number;
    name : string;
    maxGuest : number;
    rmTypeNameEn : string;
    rmTypeName : string;
    price : number;
}

export interface AccommodationDetail {
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
    rooms? : AccommodationRoomList[];
    reviews? : AccommodationReviewList[]; 

    // 다음 개발 단계에서 추가될 필드 (주석 처리)
    // averageRating?: number;
    // images?: ImageResponse[];
}