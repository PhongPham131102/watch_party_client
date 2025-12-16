import { BaseEntity, User } from ".";
import { Room } from "./room.types";

export enum RoomMemberRole {
  OWNER = "owner",
  ADMIN = "admin",
  MODERATOR = "moderator",
  MEMBER = "member",
}
export interface RoomMember extends BaseEntity {
  room: string | Room;
  user: string | User;
  role: RoomMemberRole;
}
