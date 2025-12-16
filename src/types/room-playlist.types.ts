import { User } from ".";
import { Episode } from "./movie.types";
import { Room } from "./room.types";

export interface RoomPlaylist {
  room: string | Room;
  video: string | Episode;
  position: number;
  addBy: string | User;
}
