import { ApiResponse } from "../types";
import {
  CheckRoomResponse,
  CreateRoomRequest,
  CreateRoomResponse,
  VerifyRoomPasswordResponse,
} from "../types/room.types";
import { RoomMessage } from "../types/room-message.types";
import { apiClient } from "./api.service";

export interface GetMessagesResponse {
  success: boolean;
  data: RoomMessage[];
  pagination: {
    limit: number;
    hasMore: boolean;
    lastMessageId: string | null;
  };
}

export class RoomService {
  async createRoom(data: CreateRoomRequest): Promise<CreateRoomResponse> {
    try {
      const response = await apiClient.post<CreateRoomResponse>("/rooms", data);
      return response;
    } catch (error) {
      throw error as ApiResponse;
    }
  }

  async checkRoom(code: string): Promise<CheckRoomResponse> {
    try {
      const response = await apiClient.get<CheckRoomResponse>(
        `/rooms/check-room/${code}`
      );
      return response;
    } catch (error) {
      throw error as ApiResponse;
    }
  }
  async verifyRoomPassword(
    code: string,
    password: string
  ): Promise<VerifyRoomPasswordResponse> {
    try {
      const response = await apiClient.post<VerifyRoomPasswordResponse>(
        `/rooms/verify-password/${code}`,
        { password }
      );
      return response;
    } catch (error) {
      throw error as ApiResponse;
    }
  }

  async getMessages(
    roomCode: string,
    lastMessageId?: string,
    limit: number = 20
  ): Promise<GetMessagesResponse> {
    try {
      const params = new URLSearchParams();
      params.append("roomCode", roomCode);
      if (lastMessageId) {
        params.append("lastMessageId", lastMessageId);
      }
      params.append("limit", limit.toString());

      const response = await apiClient.get<GetMessagesResponse>(
        `/room-messages?${params.toString()}`
      );
      return response;
    } catch (error) {
      throw error as ApiResponse;
    }
  }
}

export const roomService = new RoomService();
