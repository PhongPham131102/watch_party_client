/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "../store/auth.store";
import { authService } from "../services/auth.service";

export function useAuthInitialize() {
  const [isInitialized, setIsInitialized] = useState(false);
  const { setUser, logout } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      // Kiểm tra flag trong localStorage trước
      const hasAuth = typeof window !== "undefined" && localStorage.getItem("hasAuth") === "true";
      
      if (!hasAuth) {
        // Người dùng chưa từng đăng nhập, không cần gọi API
        setIsInitialized(true);
        return;
      }

      // Có flag, nghĩa là đã từng đăng nhập, kiểm tra cookie còn hợp lệ không
      try {
        const response = await authService.getMe();

        if (response.success && response.data) {
          setUser(response.data.user);
        } else {
          // Cookie không hợp lệ, xóa flag
          localStorage.removeItem("hasAuth");
        }
      } catch (error) {
        // Cookie hết hạn hoặc không hợp lệ, xóa flag
        if (typeof window !== "undefined") {
          localStorage.removeItem("hasAuth");
        }
      } finally {
        setIsInitialized(true);
      }
    };

    initAuth();

    // Lắng nghe event unauthorized từ axios interceptor
    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener("unauthorized", handleUnauthorized);

    return () => {
      window.removeEventListener("unauthorized", handleUnauthorized);
    };
  }, [setUser, logout]);

  return { isInitialized };
}
