"use client";

import { useAuthInitialize } from "../hooks/useAuthInitialize";


export default function AuthInitProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading } = useAuthInitialize();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
