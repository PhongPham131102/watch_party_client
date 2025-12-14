"use client";

import { useEffect } from "react";
import { useAuthStore } from "../store/auth.store";
import { socketService } from "../services/socket.service";

/**
 * Provider để quản lý socket lifecycle dựa trên auth state
 * Connect khi đăng nhập, disconnect khi logout
 */
export default function SocketProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && user) {
      console.log("🔌 User đăng nhập, đang kết nối socket...");
      socketService.connect("base");
    } else {
      if (socketService.isConnected("base")) {
        console.log("🔌 User logout, đang ngắt kết nối socket...");
        socketService.disconnect("base");
      }
    }
  }, [isAuthenticated, user]);

  return <>{children}</>;
}
