"use client";

import { useState } from "react";
import { authService } from "@/src/services/auth.service";
import { useAuthStore } from "@/src/store/auth.store";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/src/utils/toast";
import { registerSchema } from "../schemas/register.schema";

interface FormErrors {
    email?: string;
    name?: string;
    fullName?: string;
    password?: string;
}

export default function RegisterForm() {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        name: "",
        fullName: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [formErrors, setFormErrors] = useState<FormErrors>({});

    const { setUser, setTokens, closeAuthModal } = useAuthStore();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
        // Clear error for this field when user starts typing
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

            // Nếu hợp lệ, gọi API
            const response = await authService.register(formData);

            if (response.success && response.data) {
                setUser(response.data.user);
                setTokens(response.data.accessToken, response.data.refreshToken);
                toast.success("Đăng ký thành công!", "Chào mừng bạn đến với Watch Party");
                closeAuthModal();
            } else {
                toast.error(response.message || "Đăng ký thất bại");
            }
        } catch (err: any) {
            toast.error(
                err?.response?.data?.message || err?.message || "Đã xảy ra lỗi"
            );
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
                    className="border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:border-[#1ed760] focus-visible:ring-[#1ed760]"
                    placeholder="email@example.com"
                />
                {formErrors.email && (
                    <p className="text-xs text-red-400">{formErrors.email}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="name" className="text-white/80">
                    Tên đăng nhập
                </Label>
                <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    className="border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:border-[#1ed760] focus-visible:ring-[#1ed760]"
                    placeholder="username"
                />
                {formErrors.name && (
                    <p className="text-xs text-red-400">{formErrors.name}</p>
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
                    className="border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:border-[#1ed760] focus-visible:ring-[#1ed760]"
                    placeholder="Nguyễn Văn A"
                />
                {formErrors.fullName && (
                    <p className="text-xs text-red-400">{formErrors.fullName}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="password" className="text-white/80">
                    Mật khẩu
                </Label>
                <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:border-[#1ed760] focus-visible:ring-[#1ed760]"
                    placeholder="••••••••"
                />
                {formErrors.password && (
                    <p className="text-xs text-red-400">{formErrors.password}</p>
                )}
            </div>

            <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#1ed760] text-[#02100a] hover:bg-[#20f072] font-semibold">
                {isLoading ? "Đang đăng ký..." : "Đăng ký"}
            </Button>
        </form>
    );
}
