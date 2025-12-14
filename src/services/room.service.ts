import { ApiResponse } from "../types";
import { CreateRoomRequest, CreateRoomResponse } from "../types/room.types";
import { apiClient } from "./api.service";

export class RoomService {
  async createRoom(data: CreateRoomRequest): Promise<CreateRoomResponse> {
    try {
      const response = await apiClient.post<CreateRoomResponse>(
        "/rooms",
        data
      );
      return response;
    } catch (error) {
      throw error as ApiResponse;
    }
  }

  async getRooms() {
    try {
      const response = await apiClient.get("/rooms");
      return response;
    } catch (error) {
      throw error as ApiResponse;
    }
  }
}

export const roomService = new RoomService();
