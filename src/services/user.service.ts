import { apiClient } from "./api.service";
import { User } from "@/src/types/auth.types";

export interface UpdateProfileRequest {
    fullName?: string;
    avatarUrl?: string;
}

export interface UpdateProfileResponse {
    success: boolean;
    message: string;
    data: User;
}

export interface UploadAvatarResponse {
    success: boolean;
    message: string;
    data: User;
}

export class UserService {
    async updateProfile(data: UpdateProfileRequest): Promise<UpdateProfileResponse> {
        try {
            const response = await apiClient.patch<UpdateProfileResponse>("/users/profile", data);
            return response;
        } catch (error) {
            throw error;
        }
    }

    async uploadAvatar(file: File): Promise<UploadAvatarResponse> {
        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await apiClient.patch<UploadAvatarResponse>("/users/avatar", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return response;
        } catch (error) {
            throw error;
        }
    }
}

export const userService = new UserService();
