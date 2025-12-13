"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../store/auth.store";

/**
 * Component để bảo vệ các trang cần đăng nhập
 * Wrap component này ở các trang cần authentication
 */
export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, openAuthModal } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      // Mở modal đăng nhập thay vì redirect
      openAuthModal("login");
      // Hoặc redirect về trang chủ
      // router.push("/");
    }
  }, [isAuthenticated, openAuthModal, router]);

  // Nếu chưa đăng nhập, không render children
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">
            Bạn cần đăng nhập để truy cập trang này
          </h2>
          <p className="text-muted-foreground">
            Vui lòng đăng nhập để tiếp tục
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
