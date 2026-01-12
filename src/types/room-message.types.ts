import { User } from ".";
import { BaseEntity } from "./api.types";
import { Room } from "./room.types";
export enum TypeMessage {
  REGULAR = "regular",
  SYSTEM = "system",
}
export interface RoomMessage extends BaseEntity {
  content: string;
  type: TypeMessage;
  room: string | Room;
  user?: string | User | null;
  sentAt: Date;
}
