import { BaseEntity, User } from ".";
import { Episode } from "./episode.types";

import { Room } from "./room.types";

export interface RoomPlaylist extends BaseEntity {
  room: string | Room;
  video: string | Episode;
  position: number;
  addBy: string | User;
}
