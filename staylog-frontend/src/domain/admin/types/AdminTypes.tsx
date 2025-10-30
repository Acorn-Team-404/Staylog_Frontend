// 서버에서 받아오는 원본 Dto
export interface AdminUserDto {
  
   userId : number;
   name : string;
   email : string;
   role : string;
   createdAt : string;
   updatedAt : string;
   lastLogin : string|null;
   status : string;
}
export type Role =  "USER" | "VIP" | "ADMIN";
export type MemberStatus = "ACTIVE" | "INACTIVE" | "WITHDRAWN";

// 선택값
export const roleOptions: Role[] = ["USER", "VIP", "ADMIN"];
export const statusOptions: MemberStatus[] = ["ACTIVE", "INACTIVE", "WITHDRAWN"];


// UI 표시용으로 정의
export interface AdminUser {
  userId: number;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
  lastLogin: string | null;
  status: MemberStatus;
}


// 변환 함수 (DTO → UI)
export function mapDtoToAdminUser(dto: AdminUserDto): AdminUser {
  return {
      
    userId: dto.userId,
    name: dto.name,
    email: dto.email,
    role: dto.role as Role,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
    lastLogin: dto.lastLogin,
    status: dto.status as MemberStatus,
  };


}