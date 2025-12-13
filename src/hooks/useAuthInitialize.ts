/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "../store/auth.store";
import { authService } from "../services/auth.service";

export function useAuthInitialize() {
  const [isLoading, setIsLoading] = useState(true);
  const { setUser, logout } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const response = await authService.getMe();

        if (response.success && response.data) {
          setUser(response.data.user);
        } else {
          logout();
        }
      } catch (error) {
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Lắng nghe event unauthorized từ axios interceptor
    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('unauthorized', handleUnauthorized);

    return () => {
      window.removeEventListener('unauthorized', handleUnauthorized);
    };
  }, [setUser, logout]);

  return { isLoading };
}
