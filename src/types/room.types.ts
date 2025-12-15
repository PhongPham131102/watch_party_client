import { User } from ".";
import { ApiResponse, BaseEntity } from "./api.types";
export enum RoomType {
  PUBLIC = "public",
  PRIVATE = "private",
}
export interface Room extends BaseEntity {
  name: string;
  code: string;
  type: RoomType;
  slug: string;
  password?: string | null;
  owner: User;
  isActive: boolean;
}

export interface CreateRoomRequest {
  name: string;
  type: RoomType;
  password?: string;
}

export interface CreateRoomResponse extends ApiResponse {
  data: Room;
}

export interface CheckRoomResponse extends ApiResponse {
  data: Room & {
    isOwner: boolean;
  };
}

export interface VerifyRoomPasswordRequest {
  password: string;
}
export interface VerifyRoomPasswordResponse extends ApiResponse {
  data: {
    isAuthenticated: boolean;
  };
}
