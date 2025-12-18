/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Socket } from "socket.io-client";
import { socketService } from "./socket.service";
import { RoomMessage } from "../types/room-message.types";
import { RoomMember } from "../types/room-member.types";
import { RoomPlaylist } from "../types/room-playlist.types";
import { IRoomSetting } from "../types/room-setting.types";
import {
  PlaylistUpdatedEvent,
  PlaylistOperationResponse,
  VideoChangedEvent,
} from "../types/room-playlist-event.types";

export interface JoinRoomPayload {
  roomCode: string;
}
export interface PlayNextVideoPayload {
  roomCode: string;
}
export interface PlayOrPauseVideoPayload {
  roomCode: string;
  isplaying: boolean;
  currentTime: number;
}
export interface PlayPreviousPayload {
  roomCode: string;
}
export interface PlayVideoFromPlaylistPayload {
  roomCode: string;
  playlistItemId: string;
}
export interface SeekVideoPayload {
  roomCode: string;
  currentTime: number;
}
export interface LeaveRoomPayload {
  roomCode: string;
}

export interface UserJoinedEvent {
  userId: string;
  username: string;
  role: string;
}

export interface UserLeftEvent {
  userId: string;
  username: string;
}

export interface MemberRemovedEvent {
  userId: string;
  username: string;
  roomId: string;
  timestamp: string;
}

export interface UserKickedEvent {
  userId: string;
  kickedBy: string;
  reason: string;
}

export interface UserRoleChangedEvent {
  userId: string;
  newRole: string;
  changedBy: string;
}

export interface ForceDisconnectEvent {
  reason: string;
  timestamp: string;
}

export interface SocketErrorEvent {
  success: false;
  error: string;
  errorCode: string;
  event: string;
  timestamp: string;
}

export interface KickUserResponse {
  success: boolean;
  message: string;
}

export interface ChangeUserRoleResponse {
  success: boolean;
  message: string;
  newRole: string;
}

export interface JoinRoomResponse {
  success: boolean;
  lastestMessages: RoomMessage[];
  members: RoomMember[];
  playlistItems: RoomPlaylist[];
  settings: IRoomSetting;
}

export interface SendMessageResponse {
  success: boolean;
  message: RoomMessage;
}

class RoomSocketService {
  private socket: Socket | null = null;
  private isAuthenticated = false;

  connect(): Promise<Socket> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected && this.isAuthenticated) {
        resolve(this.socket);
        return;
      }

      this.socket = socketService.connect("room");

      this.socket.once(
        "authenticated",
        (data: {
          success: boolean;
          userId: string;
          username: string;
          timestamp: string;
        }) => {
          console.log("Room socket authenticated:", data);
          this.isAuthenticated = true;
          resolve(this.socket!);
        }
      );

      this.socket.once("connect_error", (error) => {
        console.error("Room socket connection error:", error);
        this.isAuthenticated = false;
        reject(error);
      });

      setTimeout(() => {
        if (!this.isAuthenticated) {
          reject(new Error("Authentication timeout"));
        }
      }, 10000);
    });
  }

  disconnect(): void {
    if (this.socket) {
      socketService.disconnect("room");
      this.socket = null;
      this.isAuthenticated = false;
    }
  }

  async joinRoom(roomCode: string): Promise<JoinRoomResponse> {
    if (!this.socket?.connected) await this.connect();

    return new Promise((resolve, reject) => {
      const errorListener = (error: SocketErrorEvent) => {
        if (error.event === "joinRoom") {
          this.socket!.off("error", errorListener);
          reject(error);
        }
      };

      this.socket!.once("error", errorListener);

      this.socket!.emit(
        "joinRoom",
        { roomCode },
        (response: JoinRoomResponse) => {
          this.socket!.off("error", errorListener);
          response.success
            ? resolve(response)
            : reject(new Error("Failed to join room"));
        }
      );
    });
  }

  leaveRoom(roomCode: string): void {
    if (!this.socket?.connected) {
      console.warn("Socket not connected, cannot leave room");
      return;
    }
    console.log("Emitting leaveRoom:", roomCode);
    this.socket.emit("leaveRoom", { roomCode });
  }

  onUserJoined(callback: (data: UserJoinedEvent) => void): void {
    this.socket?.on("userJoined", callback);
  }

  onUserLeft(callback: (data: UserLeftEvent) => void): void {
    this.socket?.on("userLeft", callback);
  }

  async sendMessage(
    roomCode: string,
    content: string
  ): Promise<SendMessageResponse> {
    if (!this.socket?.connected) throw new Error("Socket not connected");

    return new Promise((resolve, reject) => {
      this.socket!.emit(
        "sendMessage",
        { roomCode, content },
        (response: SendMessageResponse) => {
          response.success
            ? resolve(response)
            : reject(new Error("Failed to send message"));
        }
      );
    });
  }

  onNewMessage(callback: (data: RoomMessage) => void): void {
    this.socket?.on("newMessage", callback);
  }

  onMemberRemoved(callback: (data: MemberRemovedEvent) => void): void {
    this.socket?.on("memberRemoved", callback);
  }

  onMemberAdded(callback: (data: RoomMember) => void): void {
    this.socket?.on("memberAdded", callback);
  }

  onUserKicked(callback: (data: UserKickedEvent) => void): void {
    this.socket?.on("userKicked", callback);
  }

  onUserRoleChanged(callback: (data: UserRoleChangedEvent) => void): void {
    this.socket?.on("userRoleChanged", callback);
  }

  onForceDisconnect(callback: (data: ForceDisconnectEvent) => void): void {
    this.socket?.on("forceDisconnect", callback);
  }

  offNewMessage(): void {
    this.socket?.off("newMessage");
  }
  offUserJoined(): void {
    this.socket?.off("userJoined");
  }
  offUserLeft(): void {
    this.socket?.off("userLeft");
  }
  offMemberRemoved(): void {
    this.socket?.off("memberRemoved");
  }
  offMemberAdded(): void {
    this.socket?.off("memberAdded");
  }
  offUserKicked(): void {
    this.socket?.off("userKicked");
  }
  offUserRoleChanged(): void {
    this.socket?.off("userRoleChanged");
  }
  offForceDisconnect(): void {
    this.socket?.off("forceDisconnect");
  }

  async kickUser(
    roomCode: string,
    targetUserId: string
  ): Promise<KickUserResponse> {
    if (!this.socket?.connected) throw new Error("Socket not connected");

    return new Promise((resolve, reject) => {
      this.socket!.emit(
        "kickUser",
        { roomCode, targetUserId },
        (response: KickUserResponse) => {
          response.success
            ? resolve(response)
            : reject(new Error("Failed to kick user"));
        }
      );
    });
  }

  async changeUserRole(
    roomCode: string,
    targetUserId: string,
    newRole: string
  ): Promise<ChangeUserRoleResponse> {
    if (!this.socket?.connected) throw new Error("Socket not connected");

    return new Promise((resolve, reject) => {
      this.socket!.emit(
        "changeUserRole",
        { roomCode, targetUserId, newRole },
        (response: ChangeUserRoleResponse) => {
          response.success
            ? resolve(response)
            : reject(new Error("Failed to change role"));
        }
      );
    });
  }

  // ==================== PLAYLIST MANAGEMENT ====================

  /**
   * Add episode to playlist
   * Requires MODERATOR+ permission
   */
  async addToPlaylist(
    roomCode: string,
    episodeId: string,
    position?: number
  ): Promise<PlaylistOperationResponse> {
    if (!this.socket?.connected) throw new Error("Socket not connected");

    return new Promise((resolve, reject) => {
      this.socket!.emit(
        "addToPlaylist",
        { roomCode, episodeId, position },
        (response: PlaylistOperationResponse) => {
          if (response.success) {
            resolve(response);
          } else {
            reject(new Error(response.message || "Failed to add to playlist"));
          }
        }
      );
    });
  }

  /**
   * Remove episode from playlist
   * Requires MODERATOR+ permission
   */
  async removeFromPlaylist(
    roomCode: string,
    playlistItemId: string
  ): Promise<PlaylistOperationResponse> {
    if (!this.socket?.connected) throw new Error("Socket not connected");

    return new Promise((resolve, reject) => {
      this.socket!.emit(
        "removeFromPlaylist",
        { roomCode, playlistItemId },
        (response: PlaylistOperationResponse) => {
          if (response.success) {
            resolve(response);
          } else {
            reject(
              new Error(response.message || "Failed to remove from playlist")
            );
          }
        }
      );
    });
  }

  /**
   * Reorder playlist (drag & drop)
   * Requires MODERATOR+ permission
   */
  async reorderPlaylist(
    roomCode: string,
    playlistItemId: string,
    newPosition: number
  ): Promise<PlaylistOperationResponse> {
    if (!this.socket?.connected) throw new Error("Socket not connected");

    return new Promise((resolve, reject) => {
      this.socket!.emit(
        "reorderPlaylist",
        { roomCode, playlistItemId, newPosition },
        (response: PlaylistOperationResponse) => {
          if (response.success) {
            resolve(response);
          } else {
            reject(new Error(response.message || "Failed to reorder playlist"));
          }
        }
      );
    });
  }
  async nextVideo(data: PlayNextVideoPayload): Promise<void> {
    if (!this.socket?.connected) throw new Error("Socket not connected");
    this.socket.emit("nextVideo", data);
  }
  async playOrPauseVideo(data: PlayOrPauseVideoPayload): Promise<void> {
    if (!this.socket?.connected) throw new Error("Socket not connected");
    this.socket.emit("playOrPauseVideo", data);
  }
  async previousVideo(data: PlayPreviousPayload): Promise<void> {
    if (!this.socket?.connected) throw new Error("Socket not connected");
    this.socket.emit("previousVideo", data);
  }
  async playVideoFromPlaylist(
    data: PlayVideoFromPlaylistPayload
  ): Promise<void> {
    if (!this.socket?.connected) throw new Error("Socket not connected");
    this.socket.emit("playVideoFromPlaylist", data);
  }
  async seekVideo(data: SeekVideoPayload): Promise<void> {
    if (!this.socket?.connected) throw new Error("Socket not connected");
    this.socket.emit("seekVideo", data);
  }
  /**
   * Listen for playlist updates from server
   */
  onPlaylistUpdated(callback: (data: PlaylistUpdatedEvent) => void): void {
    this.socket?.on("playlistUpdated", callback);
  }

  /**
   * Remove playlist update listener
   */
  offPlaylistUpdated(): void {
    this.socket?.off("playlistUpdated");
  }
  onVideoChanged(callback: (data: VideoChangedEvent) => void): void {
    this.socket?.on("videoChanged", callback);
  }
  offVideoChanged(): void {
    this.socket?.off("videoChanged");
  }
  removeAllListeners(): void {
    this.socket?.removeAllListeners();
  }
}

export const roomSocketService = new RoomSocketService();
