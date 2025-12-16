import { RoomType } from "./room.types";

export interface IRoomSetting {
  type: RoomType;
  max_video: number;
  max_video_in_playlist: number;
  max_users: number;
}
