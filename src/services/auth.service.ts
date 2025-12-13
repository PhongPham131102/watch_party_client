import { apiClient } from "./api.service";
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from "@/src/types/auth.types";

export class AuthService {
    async register(data: RegisterRequest): Promise<RegisterResponse> {
        try {
            const response = await apiClient.post<RegisterResponse>("/auth/register", data);
            return response;
        } catch (error: any) {
            throw error;
        }
    }

    async login(data: LoginRequest): Promise<LoginResponse> {
        try {
            const response = await apiClient.post<LoginResponse>("/auth/login", data);
            return response;
        } catch (error: any) {
            throw error;
        }
    }
}

export const authService = new AuthService();