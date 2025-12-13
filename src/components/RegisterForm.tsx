"use client";

import { useState } from "react";
import { authService } from "@/src/services/auth.service";
import { useAuthStore } from "@/src/store/auth.store";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/src/utils/toast";
import { registerSchema } from "../schemas/register.schema";
import { ApiResponse } from "../types";
import { ErrorCode } from "../types/error.types";
import { Eye, EyeOff } from "lucide-react";

interface FormErrors {
  email?: string;
  name?: string;
  fullName?: string;
  password?: string;
  confirmPassword?: string;
}

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
    fullName: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { setUser, setTokens, closeAuthModal } = useAuthStore();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (formErrors[name as keyof FormErrors]) {
      setFormErrors({
        ...formErrors,
        [name]: undefined,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setIsLoading(true);

    try {
      // Validate form với Zod
      const result = registerSchema.safeParse(formData);

      if (!result.success) {
        const errors: FormErrors = {};
        result.error.issues.forEach((err) => {
          if (err.path[0]) {
            errors[err.path[0] as keyof FormErrors] = err.message;
          }
        });
        setFormErrors(errors);
        setIsLoading(false);
        return;
      }

      // Nếu hợp lệ, gọi API (cần loại bỏ confirmPassword)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, ...registerData } = formData;
      const response = await authService.register(registerData);

      if (response.success && response.data) {
        setUser(response.data.user);
        setTokens(response.data.accessToken, response.data.refreshToken);
        toast.success(
          "Đăng ký thành công!",
          "Chào mừng bạn đến với Watch Party"
        );
        closeAuthModal();
      } else {
        toast.error(response.message || "Đăng ký thất bại");
      }
    } catch (err) {
      const { message, errorCode } = err as ApiResponse;
      if (errorCode === ErrorCode.USER_EMAIL_EXISTS) {
        setFormErrors((prev) => ({
          ...prev,
          email: "Email đã được sử dụng",
        }));
      }
      if (errorCode === ErrorCode.USER_USERNAME_EXISTS) {
        setFormErrors((prev) => ({
          ...prev,
          username: "Tên đăng nhập đã được sử dụng",
        }));
      }

      toast.error(message || "Đã xảy ra lỗi");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-white/80">
          Email
        </Label>
        <Input
          id="email"
          name="email"
          type="text"
          value={formData.email}
          onChange={handleChange}
          className="border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:border-primary focus-visible:ring-primary"
          placeholder="Địa chỉ email"
        />
        {formErrors.email && (
          <p className="text-xs text-red-500">{formErrors.email}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="username" className="text-white/80">
          Tên đăng nhập
        </Label>
        <Input
          id="username"
          name="username"
          type="text"
          value={formData.username}
          onChange={handleChange}
          className="border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:border-primary focus-visible:ring-primary"
          placeholder="Tên đăng nhập"
        />
        {formErrors.name && (
          <p className="text-xs text-red-500">{formErrors.name}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="fullName" className="text-white/80">
          Họ và tên
        </Label>
        <Input
          id="fullName"
          name="fullName"
          type="text"
          value={formData.fullName}
          onChange={handleChange}
          className="border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:border-primary focus-visible:ring-primary"
          placeholder="Họ và tên"
        />
        {formErrors.fullName && (
          <p className="text-xs text-red-500">{formErrors.fullName}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-white/80">
          Mật khẩu
        </Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleChange}
            className="border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:border-primary focus-visible:ring-primary pr-10"
            placeholder="Mật khẩu"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {formErrors.password && (
          <p className="text-xs text-red-500">{formErrors.password}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-white/80">
          Xác nhận mật khẩu
        </Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            value={formData.confirmPassword}
            onChange={handleChange}
            className="border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:border-primary focus-visible:ring-primary pr-10"
            placeholder="Nhập lại mật khẩu"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {formErrors.confirmPassword && (
          <p className="text-xs text-red-500">{formErrors.confirmPassword}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-primary text-white hover:bg-primary/90 font-bold transition-all duration-200">
        {isLoading ? "Đang đăng ký..." : "Đăng ký"}
      </Button>
    </form>
  );
}
