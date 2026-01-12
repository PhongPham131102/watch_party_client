"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authService } from "@/src/services/auth.service";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  forgotPasswordSchema,
  verifyResetCodeSchema,
  resetPasswordSchema,
  ForgotPasswordFormData,
  VerifyResetCodeFormData,
  ResetPasswordFormData,
} from "../schemas/auth.schema";
import { toast } from "@/src/utils/toast";
import { ErrorCode, ErrorCodeMessage } from "../types/error.types";
import { useAuthStore } from "../store/auth.store";
import {
  ArrowLeft,
  Mail,
  ShieldCheck,
  KeyRound,
  Loader2,
  RefreshCcw,
} from "lucide-react";
import { ApiResponse } from "../types";

export default function ForgotPasswordFlow() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [countdown, setCountdown] = useState(0);
  const { setAuthModalMode } = useAuthStore();

  // Form step 1: Request code
  const forgotForm = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  // Form step 2: Verify code
  const verifyForm = useForm<VerifyResetCodeFormData>({
    resolver: zodResolver(verifyResetCodeSchema),
    defaultValues: {
      email: "",
      code: "",
    },
  });

  // Form step 3: Reset password
  const resetForm = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
      code: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Countdown timer logic
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const startCountdown = () => setCountdown(60);

  const onForgotSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await authService.forgotPassword(data);
      setEmail(data.email);
      verifyForm.setValue("email", data.email);
      setStep(2);
      startCountdown();
      toast.success("Đã gửi mã xác nhận", "Vui lòng kiểm tra email của bạn");
    } catch (error: unknown) {
      const err = error as ApiResponse;
      const errorCode = err?.errorCode as ErrorCode;
      let msg = "Không thể gửi email xác nhận. Vui lòng thử lại sau.";

      if (errorCode === ErrorCode.AUTH_EMAIL_NOT_FOUND) {
        msg = "Email này chưa được đăng ký tài khoản.";
      } else if (errorCode === ErrorCode.VALIDATION_ERROR) {
        msg = "Vui lòng nhập đúng định dạng email.";
      } else if (errorCode === ErrorCode.INTERNAL_SERVER_ERROR) {
        msg = "Lỗi khi gửi mail hoặc lỗi server";
      }

      toast.error(msg);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    try {
      await authService.forgotPassword({ email });
      startCountdown();
      toast.success("Đã gửi lại mã", "Vui lòng kiểm tra lại email của bạn");
    } catch (error: unknown) {
      toast.error("Không thể gửi lại mã. Vui lòng thử lại sau.");
    }
  };

  const onVerifySubmit = async (data: VerifyResetCodeFormData) => {
    try {
      const response = await authService.verifyResetCode(data);
      if (response.success) {
        resetForm.setValue("email", email);
        resetForm.setValue("code", data.code);
        setStep(3);
      }
    } catch (error: unknown) {
      const err = error as ApiResponse;
      const errorCode = err?.errorCode as ErrorCode;
      let msg = "Mã xác nhận không hợp lệ";

      if (errorCode === ErrorCode.VALIDATION_ERROR) {
        msg = "Dữ liệu không hợp lệ";
      } else if (errorCode === ErrorCode.BAD_REQUEST) {
        msg = "Mã OTP không khớp hoặc đã quá 10 phút";
      }

      toast.error(msg);
    }
  };

  const onResetSubmit = async (data: ResetPasswordFormData) => {
    try {
      const response = await authService.resetPassword(data);
      if (response.success) {
        toast.success(
          "Đặt lại mật khẩu thành công",
          "Vui lòng đăng nhập với mật khẩu mới"
        );
        setAuthModalMode("login");
      }
    } catch (error: unknown) {
      const err = error as ApiResponse;
      const errorCode = err?.errorCode as ErrorCode;
      let msg = "Đã xảy ra lỗi khi đặt lại mật khẩu";

      if (errorCode === ErrorCode.VALIDATION_ERROR) {
        msg = "Dữ liệu không hợp lệ";
      } else if (errorCode === ErrorCode.BAD_REQUEST) {
        msg = "Mật khẩu không khớp hoặc mã xác nhận đã hết hạn";
      } else if (errorCode === ErrorCode.AUTH_ACCOUNT_NOT_FOUND) {
        msg = "Email không còn tồn tại trong hệ thống";
      }

      toast.error(msg);
    }
  };

  // Step 1: Input Email
  if (step === 1) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <button
            onClick={() => setAuthModalMode("login")}
            className="flex items-center text-sm font-medium text-white/60 hover:text-white transition-all hover:-translate-x-1"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại đăng nhập
          </button>
        </div>

        <form
          onSubmit={forgotForm.handleSubmit(onForgotSubmit)}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white/80">
              Email của bạn
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <Input
                id="email"
                {...forgotForm.register("email")}
                placeholder="email@example.com"
                className={`pl-10 border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 ${
                  forgotForm.formState.errors.email
                    ? "border-red-500/50 shadow-[0_0_10px_-2px_rgba(239,68,68,0.2)]"
                    : ""
                }`}
              />
            </div>
            {forgotForm.formState.errors.email && (
              <p className="text-xs text-red-500">
                {forgotForm.formState.errors.email.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={forgotForm.formState.isSubmitting}
            className="w-full bg-primary text-white hover:bg-primary/90 font-bold"
          >
            {forgotForm.formState.isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Gửi mã xác nhận"
            )}
          </Button>
        </form>
      </div>
    );
  }

  // Step 2: Verify OTP
  if (step === 2) {
    const currentOTP = verifyForm.watch("code") || "";
    return (
      <div className="space-y-6 text-center">
        <div className="flex flex-col space-y-2 text-left">
          <button
            onClick={() => setStep(1)}
            className="flex items-center text-sm font-medium text-white/60 hover:text-white transition-all hover:-translate-x-1"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Nhập lại email
          </button>
        </div>

        <div className="space-y-2">
          <h3 className="text-white font-medium">Xác thực mã OTP</h3>
          <p className="text-xs text-white/60">
            Chúng tôi đã gửi mã 6 chữ số đến{" "}
            <span className="text-primary font-medium">{email}</span>
          </p>
        </div>

        <form
          onSubmit={verifyForm.handleSubmit(onVerifySubmit)}
          className="space-y-6"
        >
          <div className="flex justify-between gap-2 sm:gap-4">
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <div
                key={index}
                className="relative flex-1 aspect-square max-w-[50px]"
              >
                <input
                  type="text"
                  maxLength={1}
                  inputMode="numeric"
                  className={`w-full h-full text-center text-xl font-bold bg-white/5 border rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#E50914]/40 text-white ${
                    verifyForm.formState.errors.code
                      ? "border-red-500/50"
                      : index === currentOTP.length
                      ? "border-[#E50914] bg-[#E50914]/10"
                      : "border-white/10"
                  }`}
                  value={currentOTP[index] || ""}
                  onChange={(e) => {
                    const val = (e.target as HTMLInputElement).value.replace(
                      /[^0-9]/g,
                      ""
                    );
                    if (!val) return;
                    const codeArr = currentOTP.split("");
                    codeArr[index] = val.slice(-1);
                    const newCode = codeArr.join("").slice(0, 6);
                    verifyForm.setValue("code", newCode);
                    if (newCode.length <= 6) {
                      const next =
                        e.currentTarget.parentElement?.nextElementSibling?.querySelector(
                          "input"
                        ) as HTMLInputElement;
                      if (next) next.focus();
                    }
                  }}
                  onKeyDown={(e) => {
                    if (
                      e.key === "Backspace" &&
                      !currentOTP[index] &&
                      index > 0
                    ) {
                      const newCode = currentOTP.slice(0, -1);
                      verifyForm.setValue("code", newCode);
                      const prev =
                        e.currentTarget.parentElement?.previousElementSibling?.querySelector(
                          "input"
                        ) as HTMLInputElement;
                      if (prev) prev.focus();
                    }
                  }}
                />
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center space-y-4">
            <Button
              type="submit"
              disabled={
                verifyForm.formState.isSubmitting || currentOTP.length !== 6
              }
              className="w-full bg-primary text-white hover:bg-primary/90 font-bold"
            >
              {verifyForm.formState.isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Xác nhận mã"
              )}
            </Button>

            <button
              type="button"
              onClick={handleResendOTP}
              disabled={countdown > 0}
              className="flex items-center text-xs font-medium text-white/40 hover:text-white transition-colors disabled:opacity-50"
            >
              <RefreshCcw
                className={`mr-2 h-3 w-3 ${
                  countdown > 0 ? "animate-spin" : ""
                }`}
              />
              {countdown > 0 ? `Gửi lại mã (${countdown}s)` : "Gửi lại mã"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Step 3: New Password
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 text-green-500" />
          <span className="text-xs text-green-500 font-medium">
            OTP đã được xác thực thành công.
          </span>
        </div>
      </div>

      <form
        onSubmit={resetForm.handleSubmit(onResetSubmit)}
        className="space-y-4"
      >
        <div className="space-y-2">
          <Label htmlFor="newPasswordReset" className="text-white/80">
            Mật khẩu mới
          </Label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <Input
              id="newPasswordReset"
              type="password"
              {...resetForm.register("newPassword")}
              placeholder="••••••••"
              className={`pl-10 border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:border-primary ${
                resetForm.formState.errors.newPassword
                  ? "border-red-500/50"
                  : ""
              }`}
            />
          </div>
          {resetForm.formState.errors.newPassword && (
            <p className="text-xs text-red-500">
              {resetForm.formState.errors.newPassword.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPasswordReset" className="text-white/80">
            Xác nhận mật khẩu
          </Label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <Input
              id="confirmPasswordReset"
              type="password"
              {...resetForm.register("confirmPassword")}
              placeholder="••••••••"
              className={`pl-10 border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:border-primary ${
                resetForm.formState.errors.confirmPassword
                  ? "border-red-500/50"
                  : ""
              }`}
            />
          </div>
          {resetForm.formState.errors.confirmPassword && (
            <p className="text-xs text-red-500">
              {resetForm.formState.errors.confirmPassword.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={resetForm.formState.isSubmitting}
          className="w-full bg-primary text-white hover:bg-primary/90 font-bold mt-2"
        >
          {resetForm.formState.isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Đặt lại mật khẩu"
          )}
        </Button>
      </form>
    </div>
  );
}
