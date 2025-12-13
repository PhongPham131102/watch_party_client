import { create } from "zustand";
import { User } from "@/src/types/auth.types";

interface AuthState {
    user: User | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    isAuthModalOpen: boolean;
    authModalMode: "login" | "register";

    setUser: (user: User | null) => void;
    setTokens: (accessToken: string, refreshToken: string) => void;
    logout: () => void;
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
        if (typeof window !== "undefined") {
            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("refreshToken", refreshToken);
        }
        set({ accessToken, isAuthenticated: true });
    },

    logout: () => {
        if (typeof window !== "undefined") {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
        }
        set({
            user: null,
            accessToken: null,
            isAuthenticated: false,
        });
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