export interface RoomDetailDto {
  rmTypeName: string;
  rmTypeNameEn: string;

  roomId: number;
  accommodationId: number;
  name: string;
  type: string;
  price: number;
  maxAdult: number;
  maxChildren : number;
  maxInfant : number;
  checkIn: string;
  checkOut: string;
  area: number;
  singleBed: number;
  doubleBed: number;
  queenBed: number;
  kingBed: number;
  checkInTime: string;
  checkOutTime: string;
  description: string;
  imageUrl?: string;
}

