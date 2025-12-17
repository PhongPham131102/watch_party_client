import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { UserCog, User as UserIcon } from "lucide-react";

interface User {
  id?: string;
  username?: string;
}

interface Member {
  id: string;
  user: User | string | null;
  role: string;
}

interface MemberManagementDialogProps {
  open: boolean;
  member: Member | null;
  actionLoading: boolean;
  onClose: () => void;
  onChangeRole: (userId: string, newRole: string) => void;
  onKickUser: (userId: string) => void;
}

export function MemberManagementDialog({
  open,
  member,
  actionLoading,
  onClose,
  onChangeRole,
  onKickUser,
}: MemberManagementDialogProps) {
  const username =
    member && typeof member.user === "object" && member.user
      ? member.user.username
      : "Unknown";

  const userId =
    member && typeof member.user === "object" && member.user
      ? member.user.id
      : null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-[#0a0a0f] border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">
            Quản lý thành viên
          </DialogTitle>
          <DialogDescription className="text-white/60">
            {member ? `Hành động với ${username}` : "Chọn hành động"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {/* Change Role Section */}
          <div className="space-y-2">
            <Label className="text-white text-sm font-medium">
              Thay đổi quyền hạn
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => userId && onChangeRole(userId, "moderator")}
                disabled={actionLoading || member?.role === "moderator"}
                className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/30 disabled:opacity-50">
                <UserCog size={16} className="mr-2" />
                Moderator
              </Button>
              <Button
                onClick={() => userId && onChangeRole(userId, "member")}
                disabled={actionLoading || member?.role === "member"}
                className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 disabled:opacity-50">
                <UserIcon size={16} className="mr-2" />
                Member
              </Button>
            </div>
          </div>

          <div className="border-t border-white/10 my-4"></div>

          {/* Kick User Section */}
          <div className="space-y-2">
            <Label className="text-white text-sm font-medium">
              Hành động nguy hiểm
            </Label>
            <Button
              onClick={() => userId && onKickUser(userId)}
              disabled={actionLoading}
              className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 disabled:opacity-50">
              {actionLoading ? "Đang xử lý..." : "Kick khỏi phòng"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
