import { create } from "zustand";
import { User } from "@/src/types/auth.types";
import { authService } from "@/src/services/auth.service";

interface AuthState {
    user: User | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    isAuthModalOpen: boolean;
    authModalMode: "login" | "register";

    setUser: (user: User | null) => void;
    setTokens: (accessToken: string, refreshToken: string) => void;
    logout: () => Promise<void>;
    openAuthModal: (mode: "login" | "register") => void;
    closeAuthModal: () => void;
    switchAuthMode: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isAuthModalOpen: false,
    authModalMode: "login",

    setUser: (user) =>
        set({
            user,
            isAuthenticated: !!user,
        }),

    setTokens: (accessToken, refreshToken) => {
        // Backend đã lưu tokens vào httpOnly cookies
        // Lưu flag vào localStorage để biết user đã đăng nhập
        if (typeof window !== "undefined") {
            localStorage.setItem("hasAuth", "true");
        }
        set({ accessToken, isAuthenticated: true });
    },

    logout: async () => {
        try {
            // Gọi API logout để backend xóa cookies
            await authService.logout();
        } catch (error) {
            // Nếu lỗi cũng vẫn clear state client
            console.error("Logout error:", error);
        } finally {
            // Xóa flag khỏi localStorage
            if (typeof window !== "undefined") {
                localStorage.removeItem("hasAuth");
            }
            // Clear state
            set({
                user: null,
                accessToken: null,
                isAuthenticated: false,
            });
        }
    },

    openAuthModal: (mode) =>
        set({
            isAuthModalOpen: true,
            authModalMode: mode,
        }),

    closeAuthModal: () =>
        set({
            isAuthModalOpen: false,
        }),

    switchAuthMode: () =>
        set((state) => ({
            authModalMode: state.authModalMode === "login" ? "register" : "login",
        })),
}));