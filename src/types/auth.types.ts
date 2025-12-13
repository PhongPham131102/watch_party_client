import { Role, UserProfile, ApiResponse, BaseEntity } from "./index";

export interface RegisterRequest {
    email: string;
    password: string;
    name: string;
    fullName: string;
}
export interface User extends BaseEntity {
    email: string;
    username: string;
    isActive: boolean;
    role: Role;
    profile: UserProfile;
}
export interface RegisterResponse extends ApiResponse {
    data: {
        user: User,
        accessToken: string;
        refreshToken: string;
    }
}