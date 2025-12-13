"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/src/store/auth.store";
import LoginForm from "@/src/components/LoginForm";
import RegisterForm from "@/src/components/RegisterForm";

export default function AuthModal() {
    const { isAuthModalOpen, authModalMode, closeAuthModal, switchAuthMode } =
        useAuthStore();

    return (
        <Dialog open={isAuthModalOpen} onOpenChange={closeAuthModal}>
            <DialogContent className="sm:max-w-md bg-[#0e0f14] border-white/10 shadow-[0_0_50px_-12px] shadow-primary/20">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-white">
                        {authModalMode === "login" ? "Đăng nhập" : "Đăng ký"}
                    </DialogTitle>
                    <DialogDescription className="text-white/60">
                        {authModalMode === "login"
                            ? "Chào mừng bạn quay trở lại"
                            : "Tạo tài khoản mới để trải nghiệm đầy đủ"}
                    </DialogDescription>
                </DialogHeader>

                {authModalMode === "login" ? <LoginForm /> : <RegisterForm />}

                <div className="text-center text-sm text-white/60">
                    {authModalMode === "login" ? (
                        <>
                            Chưa có tài khoản?{" "}
                            <button
                                type="button"
                                onClick={switchAuthMode}
                                className="font-semibold text-primary hover:underline hover:text-primary/80 transition-colors">
                                Đăng ký ngay
                            </button>
                        </>
                    ) : (
                        <>
                            Đã có tài khoản?{" "}
                            <button
                                type="button"
                                onClick={switchAuthMode}
                                className="font-semibold text-primary hover:underline hover:text-primary/80 transition-colors">
                                Đăng nhập
                            </button>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
