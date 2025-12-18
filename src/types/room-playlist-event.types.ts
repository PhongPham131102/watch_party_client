import { RoomPlaylist } from "./room-playlist.types";

/**
 * Playlist action types
 */
export enum PlaylistAction {
  ADD = "add",
  REMOVE = "remove",
  REORDER = "reorder",
}

/**
 * Event when playlist is updated
 */
export interface PlaylistUpdatedEvent {
  item: RoomPlaylist;
  action: PlaylistAction;
  addedBy?: string;
  removedBy?: string;
  reorderedBy?: string;
  isDuplicate?: boolean;
  duplicateCount?: number;
}
export interface VideoChangedEvent {
  current_playlist_id?: string;
  is_playing: "playing" | "paused";
  current_time: number;
  updated_at: number;
}

/**
 * DTO for adding episode to playlist
 */
export interface AddToPlaylistDto {
  roomCode: string;
  episodeId: string;
  position?: number;
}

/**
 * DTO for removing from playlist
 */
export interface RemoveFromPlaylistDto {
  roomCode: string;
  playlistItemId: string;
}

/**
 * DTO for reordering playlist
 */
export interface ReorderPlaylistDto {
  roomCode: string;
  playlistItemId: string;
  newPosition: number;
}

/**
 * Response from playlist operations
 */
export interface PlaylistOperationResponse {
  success: boolean;
  message: string;
  item?: RoomPlaylist;
  itemId?: string;
  isDuplicate?: boolean;
  duplicateCount?: number;
}
