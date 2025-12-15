import { Socket } from "socket.io-client";
import { socketService } from "./socket.service";

export interface RoomMember {
  userId: string;
  username: string;
  role: "owner" | "monitor" | "member";
}

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
      this.socket.once("authenticated", (data: { success: boolean; userId: string; username: string; timestamp: string }) => {
        console.log("Room socket authenticated:", data);
        this.isAuthenticated = true;
        resolve(this.socket!);
      });

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

  async joinRoom(roomCode: string): Promise<void> {
    if (!this.socket?.connected) {
      console.log("Socket not connected, connecting first...");
      await this.connect();
    }
    console.log("Emitting joinRoom:", roomCode);
    this.socket!.emit("joinRoom", { roomCode });
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
