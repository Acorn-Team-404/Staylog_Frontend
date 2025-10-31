export interface AdminRoom {
    accommodationId: number;
    accommodationName: string;
    roomId: number;
    name?: string;
    rmType: string;
    typeName: string;
    price?: number;
    maxAdult?: number;
    maxChildren?: number;
    maxInfant?: number;
    checkInTime?: string;
    checkOutTime?: string;
    area?: number;
    deletedYn: 'Y' | 'N';
    singleBed?: number;
    doubleBed?: number;
    queenBed?: number;
    kingBed?: number;
    createdAt: string;
    updatedAt?: string;
}

export interface AdminRoomSearchParams {
    accommodationId: number;
    rmType?: string;
    keyword?: string;
    deletedYn?: 'Y' | 'N';
}

export interface AdminRoomListData {
    accommodationId: number;
    accommodationName: string;
    roomId: number;
    name?: string;
    rmType: string;
    typeName: string;
    price?: number;
    maxAdult: number;
    deletedYn: 'Y' | 'N';
    createdAt: string;
}

