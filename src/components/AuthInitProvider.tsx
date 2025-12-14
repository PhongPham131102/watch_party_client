"use client";

import { useAuthInitialize } from "../hooks/useAuthInitialize";


export default function AuthInitProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isInitialized } = useAuthInitialize();

  // Không hiển thị loading screen nữa
  // Chỉ chờ kiểm tra cookie xong (rất nhanh) rồi render ngay
  // Nếu có cookie thì user được set, không có thì để mặc định chưa đăng nhập
  if (!isInitialized) {
    // Return null hoặc skeleton nhỏ gọn nếu cần
    return null;
  }

  return <>{children}</>;
}
