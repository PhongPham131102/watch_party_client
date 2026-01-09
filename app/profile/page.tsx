"use client";

import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/src/store/auth.store";
import { authService } from "@/src/services/auth.service";
import { userService } from "@/src/services/user.service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Loader2, User, Mail, Shield, UserCircle } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ErrorCode, ErrorCodeMessage } from "@/src/types/error.types";
import { ApiResponse } from "@/src/types/api.types";
import {
  changePasswordSchema,
  ChangePasswordFormData,
} from "@/src/schemas/auth.schema";

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Load user data into local state when user changes
  useEffect(() => {
    if (user) {
      setFullName(user.profile?.fullName || "");
      setAvatarPreview(user.profile?.avatarUrl || null);
    }
  }, [user]);

  // Mutation for uploading avatar
  const uploadAvatarMutation = useMutation({
    mutationFn: (file: File) => userService.uploadAvatar(file),
    onSuccess: (response) => {
      if (response.success && response.data) {
        setUser(response.data);
        setAvatarPreview(response.data.profile.avatarUrl);
        toast.success("Đã tải ảnh đại diện lên thành công");
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || "Lỗi khi tải ảnh đại diện");
    },
  });

  // Mutation for updating profile
  const updateProfileMutation = useMutation({
    mutationFn: (data: { fullName: string; avatarUrl?: string }) =>
      userService.updateProfile(data),
    onSuccess: (response) => {
      if (response.success && response.data) {
        setUser(response.data);
        toast.success("Cập nhật thông tin thành công");
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || "Lỗi khi cập nhật thông tin");
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Kích thước ảnh không được vượt quá 2MB");
        return;
      }
      uploadAvatarMutation.mutate(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate({
      fullName,
      avatarUrl: avatarPreview || undefined,
    });
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0e0f14] text-white">
        <p className="text-white/60">
          Vui lòng đăng nhập để xem thông tin cá nhân.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0e0f14] px-4 py-12 md:px-12 lg:px-24">
      <div className="mx-auto max-w-4xl space-y-8 mt-10">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            Hồ sơ cá nhân
          </h1>
          <p className="text-white/50">
            Quản lý thông tin cá nhân và thiết lập tài khoản của bạn.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {/* Avatar Section */}
          <Card className="md:col-span-1">
            <CardContent className="flex flex-col items-center justify-center p-6 space-y-4">
              <div className="relative group">
                <Avatar className="h-32 w-32 border-4 border-white/5 ring-2 ring-primary/20">
                  <AvatarImage
                    src={avatarPreview || ""}
                    alt={user.username}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-white/5 text-4xl text-white/20">
                    {user.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-transform hover:scale-110 active:scale-95 disabled:opacity-50"
                  disabled={uploadAvatarMutation.isPending}
                >
                  {uploadAvatarMutation.isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Camera className="h-5 w-5" />
                  )}
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-white">
                  {user.username}
                </h3>
                <p className="text-sm text-white/50">
                  {user.role?.name || "Thành viên"}
                </p>
              </div>

              {user.profile?.isPremium && (
                <div className="rounded-full bg-yellow-500/10 px-4 py-1 text-xs font-bold text-yellow-500 border border-yellow-500/20">
                  PREMIUM
                </div>
              )}
            </CardContent>
          </Card>

          <div className="md:col-span-2 space-y-8">
            {/* Details Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Thông tin chi tiết</CardTitle>
                <CardDescription>
                  Cập nhật tên hiển thị và các thông tin liên lạc khác.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label
                        htmlFor="fullName"
                        className="text-sm font-medium text-white/80"
                      >
                        Họ và tên
                      </Label>
                      <div className="relative">
                        <UserCircle className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                        <Input
                          id="fullName"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Nhập họ và tên của bạn"
                          className="bg-white/5 border-white/10 pl-10 focus:border-primary/50 focus:ring-primary/20"
                        />
                      </div>
                    </div>

                    <div className="grid gap-2 opacity-70">
                      <Label className="text-sm font-medium text-white/40">
                        Username (Không thể thay đổi)
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                        <Input
                          value={user.username}
                          disabled
                          className="bg-white/5 border-white/10 pl-10 cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div className="grid gap-2 opacity-70">
                      <Label className="text-sm font-medium text-white/40">
                        Địa chỉ Email
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                        <Input
                          value={user.email}
                          disabled
                          className="bg-white/5 border-white/10 pl-10 cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button
                      type="submit"
                      disabled={updateProfileMutation.isPending}
                      className="bg-primary hover:bg-primary/90 text-white px-8 font-semibold shadow-[0_0_20px_rgba(229,9,20,0.2)] transition-all hover:shadow-[0_0_25px_rgba(229,9,20,0.4)]"
                    >
                      {updateProfileMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Đang lưu...
                        </>
                      ) : (
                        "Lưu thay đổi"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Password Section */}
            <ChangePasswordCard />
          </div>
        </div>
      </div>
    </div>
  );
}

function ChangePasswordCard() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data: ChangePasswordFormData) =>
      authService.changePassword(data),
    onSuccess: () => {
      toast.success("Thay đổi mật khẩu thành công");
      reset();
    },
    onError: (error: ApiResponse) => {
      const errorCode = error.errorCode;

      if (
        errorCode === ErrorCode.USER_INVALID_PASSWORD ||
        errorCode === ErrorCode.AUTH_INVALID_CREDENTIALS
      ) {
        toast.error("Mật khẩu hiện tại không chính xác");
      } else if (errorCode === ErrorCode.AUTH_ACCOUNT_NOT_FOUND) {
        toast.error("Tài khoản không tồn tại hoặc đã bị đăng xuất");
      } else if (errorCode && ErrorCodeMessage[errorCode]) {
        toast.error(ErrorCodeMessage[errorCode]);
      } else {
        toast.error(error?.message || "Lỗi khi thay đổi mật khẩu");
      }
    },
  });

  const onSubmit = (data: ChangePasswordFormData) => {
    changePasswordMutation.mutate(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Đổi mật khẩu</CardTitle>
        <CardDescription>
          Bảo mật tài khoản của bạn bằng cách thay đổi mật khẩu định kỳ.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="oldPassword">Mật khẩu hiện tại</Label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <Input
                id="oldPassword"
                type="password"
                {...register("oldPassword")}
                placeholder="••••••••"
                className={`bg-white/5 border-white/10 pl-10 ${
                  errors.oldPassword
                    ? "border-red-500/50 focus:border-red-500"
                    : ""
                }`}
              />
            </div>
            {errors.oldPassword && (
              <p className="text-xs text-red-500">
                {errors.oldPassword.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="newPassword">Mật khẩu mới</Label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <Input
                id="newPassword"
                type="password"
                {...register("newPassword")}
                placeholder="••••••••"
                className={`bg-white/5 border-white/10 pl-10 ${
                  errors.newPassword
                    ? "border-red-500/50 focus:border-red-500"
                    : ""
                }`}
              />
            </div>
            {errors.newPassword && (
              <p className="text-xs text-red-500">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <Input
                id="confirmPassword"
                type="password"
                {...register("confirmPassword")}
                placeholder="••••••••"
                className={`bg-white/5 border-white/10 pl-10 ${
                  errors.confirmPassword
                    ? "border-red-500/50 focus:border-red-500"
                    : ""
                }`}
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-500">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={changePasswordMutation.isPending}
              className="bg-white/10 hover:bg-white/20 text-white border-white/10"
            >
              {changePasswordMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                "Đổi mật khẩu"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
