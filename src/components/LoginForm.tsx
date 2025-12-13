"use client";

import { useState } from "react";
import { authService } from "@/src/services/auth.service";
import { useAuthStore } from "@/src/store/auth.store";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { loginSchema } from "../schemas/login.schema";
import { FormLoginErrors } from "../types";
import { toast } from "@/src/utils/toast";

export default function LoginForm() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [formErrors, setFormErrors] = useState<FormLoginErrors>({});

    const { setUser, setTokens, closeAuthModal } = useAuthStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormErrors({});
        setIsLoading(true);

        try {
            // Validate form với Zod
            const result = loginSchema.safeParse({ username, password });

            if (!result.success) {
                const errors: FormLoginErrors = {};
                result.error.issues.forEach((err) => {
                    if (err.path[0]) {
                        errors[err.path[0] as keyof FormLoginErrors] = err.message;
                    }
                });
                setFormErrors(errors);
                setIsLoading(false);
                return;
            }

            // Nếu hợp lệ, gọi API
            const response = await authService.login({
                username,
                password,
            });

            if (response.success && response.data) {
                setUser(response.data.user);
                setTokens(response.data.accessToken, response.data.refreshToken);
                toast.success("Đăng nhập thành công!", "Chào mừng bạn quay trở lại");
                closeAuthModal();
            } else {
                toast.error(response.message || "Đăng nhập thất bại");
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
                <Label htmlFor="username" className="text-white/80">
                    Tên đăng nhập
                </Label>
                <Input
                    id="username"
                    value={username}
                    onChange={(e) => {
                        setUsername(e.target.value);
                        if (formErrors.username) {
                            setFormErrors({ ...formErrors, username: undefined });
                        }
                    }}
                    className="border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:border-[#1ed760] focus-visible:ring-[#1ed760]"
                    placeholder="Tên đăng nhập của bạn"
                />
                {formErrors.username && (
                    <p className="text-xs text-red-400">{formErrors.username}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="password" className="text-white/80">
                    Mật khẩu
                </Label>
                <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => {
                        setPassword(e.target.value);
                        if (formErrors.password) {
                            setFormErrors({ ...formErrors, password: undefined });
                        }
                    }}
                    className="border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:border-[#1ed760] focus-visible:ring-[#1ed760]"
                    placeholder="Mật khẩu của bạn"
                />
                {formErrors.password && (
                    <p className="text-xs text-red-400">{formErrors.password}</p>
                )}
            </div>

            <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#1ed760] text-[#02100a] hover:bg-[#20f072] font-semibold">
                {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>
        </form>
    );
}
