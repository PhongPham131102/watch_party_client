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
import { useState } from "react";

interface PasswordDialogProps {
  open: boolean;
  onVerify: (password: string) => Promise<void>;
  onCancel: () => void;
}

export function PasswordDialog({ open, onVerify, onCancel }: PasswordDialogProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const handleVerify = async () => {
    if (!password.trim()) {
      return;
    }

    setVerifying(true);
    try {
      await onVerify(password);
      setPassword("");
    } finally {
      setVerifying(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !verifying) {
      handleVerify();
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
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
                onKeyDown={handleKeyDown}
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
            onClick={onCancel}
            disabled={verifying}
            className="flex-1 bg-white/5 border-white/10 text-white hover:bg-white/10">
            Hủy
          </Button>
          <Button
            type="button"
            onClick={handleVerify}
            disabled={verifying}
            className="flex-1 bg-primary hover:bg-primary/90">
            {verifying ? "Đang xác thực..." : "Xác nhận"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function PasswordDialogScreen() {
  return (
    <div className="min-h-screen bg-linear-to-b from-[#0a0a0f] via-[#1a1a2e] to-[#0a0a0f] flex items-center justify-center">
      <div className="text-center max-w-md px-4">
        <div className="w-20 h-20 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
          <Lock className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Phòng riêng tư</h1>
        <p className="text-white/60 mb-6">
          Phòng này yêu cầu mật khẩu để truy cập
        </p>
      </div>
    </div>
  );
}
