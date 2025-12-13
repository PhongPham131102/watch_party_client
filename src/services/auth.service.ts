import { ApiResponse } from "../types";
import { apiClient } from "./api.service";
import {
  GetMeReponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from "@/src/types/auth.types";

export class AuthService {
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    try {
      const response = await apiClient.post<RegisterResponse>(
        "/auth/register",
        data
      );
      return response;
    } catch (error) {
      throw error as ApiResponse;
    }
  }
  async login(data: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>("/auth/login", data);
      return response;
    } catch (error) {
      throw error as ApiResponse;
    }
  }
  async getMe(): Promise<GetMeReponse> {
    try {
      const response = await apiClient.get<GetMeReponse>("/auth/me");
      return response;
    } catch (error) {
      throw error as ApiResponse;
    }
  }
}

export const authService = new AuthService();
