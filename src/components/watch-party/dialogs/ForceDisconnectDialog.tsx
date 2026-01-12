import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface ForceDisconnectDialogProps {
  open: boolean;
  reason: string;
  onRedirect: () => void;
}

export function ForceDisconnectDialog({
  open,
  reason,
  onRedirect,
}: ForceDisconnectDialogProps) {
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (!open) return;

    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const redirectTimer = setTimeout(() => {
      onRedirect();
    }, 3000);

    return () => {
      clearInterval(countdownInterval);
      clearTimeout(redirectTimer);
    };
  }, [open, onRedirect]);

  return (
    <>
      <Dialog open={open} onOpenChange={() => {}} key={open ? "open" : "closed"}>
        <DialogContent
          className="sm:max-w-[425px] bg-[#0a0a0f] border-white/10 text-white"
          onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-transparent bg-clip-text bg-linear-to-r from-red-400 to-orange-400">
              Kết nối bị ngắt
            </DialogTitle>
            <DialogDescription className="text-white/60">
              Phiên kết nối của bạn đã bị ngắt
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-white text-sm">{reason}</p>
            </div>

            <div className="space-y-2">
              <p className="text-white/60 text-sm text-center">
                Tự động chuyển hướng trong{" "}
                <span className="text-primary font-bold text-lg">
                  {countdown}
                </span>{" "}
                giây...
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              onClick={onRedirect}
              className="flex-1 bg-primary hover:bg-primary/90">
              Quay về ngay
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Overlay when force disconnected */}
      {open && (
        <div className="fixed inset-0 bg-black/80 z-40 pointer-events-none" />
      )}
    </>
  );
}
