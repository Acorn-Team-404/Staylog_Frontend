export interface AdminAccommodation {
    accommodationId?: number;
    name: string;
    acType: string;
    typeName: string;
    regionCode: string;
    regionName: string;
    address?: string;
    description: string;
    deletedYn: 'Y' | 'N';
    checkInTime?: string;
    checkOutTime?: string;
    longitude?: number;
    latitude?: number;
    createdAt: string;
    updatedAt?: string;
}

export interface AdminAccommodationSearchParams {
    regionCode?: string;
    acType?: string;
    keyword?: string;
    deletedYn?: 'Y' | 'N';
}

export interface AdminAccommodationListData {
    accommodationId: number;
    name: string;
    acType: string;
    typeName: string;
    regionCode: string;
    regionName: string;
    deletedYn: 'Y' | 'N';
    createdAt: string;
}

