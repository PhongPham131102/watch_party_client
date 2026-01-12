import { RoomMemberRole } from "@/src/types/room-member.types";
import { Crown, UserCog } from "lucide-react";

interface RoomHeaderProps {
  roomName: string;
  roomCode: string;
  roomType: string;
  isOwner: boolean;
  onLeaveRoom: () => void;
  userRole: RoomMemberRole | null;
}

export function RoomHeader({
  roomName,
  roomCode,
  roomType,
  isOwner,
  onLeaveRoom,
  userRole,
}: RoomHeaderProps) {
  return (
    <div className="border-b border-white/10 bg-[#0a0a0f]/90 backdrop-blur-sm z-10 shrink-0">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold text-white">{roomName}</h1>
            <div className="flex items-center gap-3 text-sm text-white/60">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                {roomType === "public" ? "Công khai" : "Riêng tư"}
              </span>
              <span className="px-2 py-1 bg-white/5 rounded text-xs font-mono">
                {roomCode}
              </span>
              {userRole === "owner" && (
                <span className="flex items-center gap-1 px-2 py-1 bg-primary/20 text-primary rounded text-xs">
                  <Crown size={12} />
                  Chủ phòng
                </span>
              )}
              {userRole === "moderator" && (
                <span className="flex items-center gap-1 px-2 py-1 bg-orange-500/20 text-orange-400 rounded text-xs">
                  <UserCog size={12} className="text-orange-400" />
                  Quản trị viên
                </span>
              )}
              {userRole === "member" && (
                <span className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                  Thành viên
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onLeaveRoom}
            className="px-4 py-2 bg-primary/80 hover:bg-primary text-white text-sm rounded-lg transition-colors">
            Rời phòng
          </button>
        </div>
      </div>
    </div>
  );
}
