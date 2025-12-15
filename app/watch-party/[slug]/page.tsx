/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useRoomStore } from "@/src/store/room.store";
import { toast } from "@/src/utils/toast";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Lock } from "lucide-react";
import ProtectedRoute from "@/src/components/ProtectedRoute";

function RoomDetailPageContent() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params?.slug as string | undefined;

  const {
    currentRoom: room,
    isOwner,
    loading,
    error,
    isVerified,
    showPasswordDialog,
    fetchRoom,
    clearRoom,
    setShowPasswordDialog,
    verifyPassword,
  } = useRoomStore();

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (!slug) {
      toast.error("Không tìm thấy mã phòng");
      return;
    }

    fetchRoom(slug).catch((err) => {
      console.error("Error fetching room details:", err);
      toast.error(err?.message || "Không thể tải thông tin phòng");
    });

    // Cleanup when component unmounts
    return () => {
      clearRoom();
    };
  }, [slug, fetchRoom, clearRoom]);

  const handleVerifyPassword = async () => {
    if (!password.trim()) {
      toast.error("Vui lòng nhập mật khẩu");
      return;
    }

    setVerifying(true);
    try {
      await verifyPassword(password);
      toast.success("Xác thực thành công!");
      setPassword("");
    } catch (err: any) {
      toast.error(err?.message || "Mật khẩu không đúng");
    } finally {
      setVerifying(false);
    }
  };

  const handleCancelPassword = () => {
    setShowPasswordDialog(false);
    setPassword("");
    setShowPassword(false);
    router.push("/watch-party");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-b from-[#0a0a0f] via-[#1a1a2e] to-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/60">Đang tải thông tin phòng...</p>
        </div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="min-h-screen bg-linear-to-b from-[#0a0a0f] via-[#1a1a2e] to-[#0a0a0f] flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Không tìm thấy phòng
          </h1>
          <p className="text-white/60 mb-6">
            {error || "Phòng không tồn tại hoặc đã bị xóa"}
          </p>
          <button
            onClick={() => router.push("/watch-party")}
            className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors">
            Quay về trang chủ
          </button>
        </div>
      </div>
    );
  }

  // Show password dialog if needed
  if (!isVerified && showPasswordDialog) {
    return (
      <>
        <div className="min-h-screen bg-linear-to-b from-[#0a0a0f] via-[#1a1a2e] to-[#0a0a0f] flex items-center justify-center">
          <div className="text-center max-w-md px-4">
            <div className="w-20 h-20 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
              <Lock className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Phòng riêng tư
            </h1>
            <p className="text-white/60 mb-6">
              Phòng này yêu cầu mật khẩu để truy cập
            </p>
          </div>
        </div>

        <Dialog open={showPasswordDialog} onOpenChange={() => {}}>
          <DialogContent
            className="sm:max-w-[425px] bg-[#0a0a0f] border-white/10 text-white"
            onInteractOutside={(e) => e.preventDefault()}>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-transparent bg-clip-text bg-linear-to-r from-red-400 to-orange-400">
                Nhập mật khẩu phòng
              </DialogTitle>
              <DialogDescription className="text-white/60">
                Phòng này là phòng riêng tư. Vui lòng nhập mật khẩu để tiếp tục.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="room-password" className="text-white">
                  Mật khẩu
                </Label>
                <div className="relative">
                  <Input
                    id="room-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu phòng"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !verifying) {
                        handleVerifyPassword();
                      }
                    }}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40 pr-10"
                    disabled={verifying}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                    disabled={verifying}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelPassword}
                disabled={verifying}
                className="flex-1 bg-white/5 border-white/10 text-white hover:bg-white/10">
                Hủy
              </Button>
              <Button
                type="button"
                onClick={handleVerifyPassword}
                disabled={verifying}
                className="flex-1 bg-primary hover:bg-primary/90">
                {verifying ? "Đang xác thực..." : "Xác nhận"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-[#0a0a0f] via-[#1a1a2e] to-[#0a0a0f] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Room Header */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-2">
                {room.name}
              </h1>
              <div className="flex items-center gap-4 text-sm text-white/60">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  {room.type === "public"
                    ? "Phòng công khai"
                    : "Phòng riêng tư"}
                </span>
                <span>
                  Mã phòng:{" "}
                  <span className="text-white font-mono">{room.code}</span>
                </span>
                {isOwner && (
                  <span className="px-2 py-1 bg-primary/20 text-primary rounded text-xs">
                    Chủ phòng
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => router.push("/watch-party")}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors">
              Rời phòng
            </button>
          </div>
        </div>

        {/* Video Player Placeholder */}
        <div className="bg-black rounded-xl overflow-hidden mb-6">
          <div className="aspect-video flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🎬</div>
              <p className="text-white/60">
                Video player sẽ được hiển thị ở đây
              </p>
            </div>
          </div>
        </div>

        {/* Room Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">
              Thông tin phòng
            </h2>
            <div className="space-y-3 text-white/80">
              <div className="flex justify-between">
                <span className="text-white/60">Tên phòng:</span>
                <span>{room.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Loại phòng:</span>
                <span>{room.type === "public" ? "Công khai" : "Riêng tư"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Chủ phòng:</span>
                <span>{room.owner.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Trạng thái:</span>
                <span
                  className={room.isActive ? "text-green-400" : "text-red-400"}>
                  {room.isActive ? "Đang hoạt động" : "Không hoạt động"}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Thành viên</h2>
            <p className="text-white/60 text-sm">
              Danh sách thành viên sẽ hiển thị ở đây
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RoomDetailPage() {
  return (
    <ProtectedRoute>
      <RoomDetailPageContent />
    </ProtectedRoute>
  );
}
