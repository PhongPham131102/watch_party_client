import { Socket } from "socket.io-client";
import { socketService } from "./socket.service";
import { RoomMessage } from "../types/room-message.types";
import { RoomMember } from "../types/room-member.types";
import { RoomPlaylist } from "../types/room-playlist.types";
import { IRoomSetting } from "../types/room-setting.types";

export interface JoinRoomPayload {
  roomCode: string;
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

      // Wait for authenticated event from server
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

      // Handle connection errors
      this.socket.once("connect_error", (error) => {
        console.error("Room socket connection error:", error);
        this.isAuthenticated = false;
        reject(error);
      });

      // Timeout after 10 seconds
      setTimeout(() => {
        if (!this.isAuthenticated) {
          console.error("Room socket authentication timeout");
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
    if (!this.socket?.connected) {
      console.log("Socket not connected, connecting first...");
      await this.connect();
    }
    console.log("Emitting joinRoom:", roomCode);

    return new Promise((resolve, reject) => {
      this.socket!.emit(
        "joinRoom",
        { roomCode },
        (response: JoinRoomResponse) => {
          console.log("Join room response:", response);
          if (response.success) {
            resolve(response);
          } else {
            reject(new Error("Failed to join room"));
          }
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
    if (!this.socket?.connected) {
      throw new Error("Socket not connected");
    }

    return new Promise((resolve, reject) => {
      this.socket!.emit(
        "sendMessage",
        { roomCode, content },
        (response: SendMessageResponse) => {
          console.log("Send message response:", response);
          if (response.success) {
            resolve(response);
          } else {
            reject(new Error("Failed to send message"));
          }
        }
      );
    });
  }

  onNewMessage(callback: (data: RoomMessage) => void): void {
    this.socket?.on("newMessage", callback);
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

  removeAllListeners(): void {
    this.socket?.removeAllListeners();
  }
}

export const roomSocketService = new RoomSocketService();
