import { ApiResponse } from "../types";
import {
  CheckRoomResponse,
  CreateRoomRequest,
  CreateRoomResponse,
  VerifyRoomPasswordResponse,
} from "../types/room.types";
import { apiClient } from "./api.service";

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
}

export const roomService = new RoomService();
