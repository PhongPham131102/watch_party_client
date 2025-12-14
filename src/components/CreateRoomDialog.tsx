/* eslint-disable react-hooks/incompatible-library */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Eye, EyeOff, Loader2 } from "lucide-react";
import { roomService } from "@/src/services/room.service";
import { toast } from "@/src/utils/toast";
import { RoomType } from "../types/room.types";
import { createRoomSchema, CreateRoomFormData } from "../schemas/room.schema";

interface CreateRoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateRoomDialog({
  open,
  onOpenChange,
}: CreateRoomDialogProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateRoomFormData>({
    resolver: zodResolver(createRoomSchema),
    defaultValues: {
      name: "",
      type: RoomType.PUBLIC,
      password: "",
    },
  });

  const roomType = watch("type");

  const onSubmit = async (data: CreateRoomFormData) => {
    try {
      const response = await roomService.createRoom({
        name: data.name.trim(),
        type: data.type,
        password: data.type === RoomType.PRIVATE ? data.password : undefined,
      });

      // Navigate to the newly created room
      const roomIdentifier = response.data?.code;
      if (roomIdentifier) {
        toast.success("Tạo phòng thành công!");
        reset();
        setShowPassword(false);
        onOpenChange(false);
        router.push(`/watch-party/${roomIdentifier}`);
      } else {
        toast.error("Không thể chuyển đến phòng. Thiếu mã phòng!");
      }
    } catch (error: any) {
      console.error("Error creating room:", error);
      toast.error(error?.message || "Không thể tạo phòng. Vui lòng thử lại!");
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isSubmitting) {
      if (!newOpen) {
        reset();
        setShowPassword(false);
      }
      onOpenChange(newOpen);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-[#0a0a0f] border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-transparent bg-clip-text bg-linear-to-r from-red-400 to-orange-400">
            Tạo Phòng Mới
          </DialogTitle>
          <DialogDescription className="text-white/60">
            Điền thông tin để tạo phòng xem phim cùng bạn bè
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
          {/* Room Name */}
          <div className="space-y-2">
            <Label htmlFor="room-name" className="text-white/90">
              Tên phòng <span className="text-red-400">*</span>
            </Label>
            <Input
              id="room-name"
              placeholder="Nhập tên phòng..."
              {...register("name")}
              disabled={isSubmitting}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-red-500/50 focus:ring-red-500/20"
            />
            {errors.name && (
              <p className="text-sm text-red-400">{errors.name.message}</p>
            )}
          </div>

          {/* Room Type */}
          <div className="space-y-3">
            <Label className="text-white/90">
              Loại phòng <span className="text-red-400">*</span>
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setValue("type", RoomType.PUBLIC)}
                disabled={isSubmitting}
                className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                  roomType === RoomType.PUBLIC
                    ? "border-red-500 bg-red-500/10"
                    : "border-white/10 bg-white/5 hover:border-white/20"
                } disabled:opacity-50 disabled:cursor-not-allowed`}>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    roomType === RoomType.PUBLIC
                      ? "border-red-500"
                      : "border-white/30"
                  }`}>
                  {roomType === RoomType.PUBLIC && (
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  )}
                </div>
                <div className="flex-1 text-left">
                  <span className="font-medium text-white">Công khai</span>
                  <p className="text-xs text-white/50 mt-1">
                    Mọi người có thể tham gia
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setValue("type", RoomType.PRIVATE)}
                disabled={isSubmitting}
                className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                  roomType === RoomType.PRIVATE
                    ? "border-red-500 bg-red-500/10"
                    : "border-white/10 bg-white/5 hover:border-white/20"
                } disabled:opacity-50 disabled:cursor-not-allowed`}>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    roomType === RoomType.PRIVATE
                      ? "border-red-500"
                      : "border-white/30"
                  }`}>
                  {roomType === RoomType.PRIVATE && (
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  )}
                </div>
                <div className="flex-1 text-left">
                  <span className="font-medium text-white">Riêng tư</span>
                  <p className="text-xs text-white/50 mt-1">
                    Cần mật khẩu để vào
                  </p>
                </div>
              </button>
            </div>
            {errors.type && (
              <p className="text-sm text-red-400">{errors.type.message}</p>
            )}
          </div>

          {/* Password (only for private rooms) */}
          {roomType === RoomType.PRIVATE && (
            <div className="space-y-2">
              <Label htmlFor="room-password" className="text-white/90">
                Mật khẩu <span className="text-red-400">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="room-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu phòng..."
                  {...register("password")}
                  disabled={isSubmitting}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-red-500/50 focus:ring-red-500/20 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isSubmitting}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors disabled:opacity-50">
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-400">
                  {errors.password.message}
                </p>
              )}
              <p className="text-xs text-white/50">
                Bạn bè sẽ cần mật khẩu này để tham gia phòng
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
              className="bg-white/5 border-white/10 text-white hover:bg-white/10">
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary/90 text-white disabled:opacity-50 disabled:cursor-not-allowed">
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Tạo Phòng
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
