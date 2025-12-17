import { Crown } from "lucide-react";

interface RoomHeaderProps {
  roomName: string;
  roomCode: string;
  roomType: string;
  isOwner: boolean;
  onLeaveRoom: () => void;
}

export function RoomHeader({
  roomName,
  roomCode,
  roomType,
  isOwner,
  onLeaveRoom,
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
                {roomType === "public" ? "Public" : "Private"}
              </span>
              <span className="px-2 py-1 bg-white/5 rounded text-xs font-mono">
                {roomCode}
              </span>
              {isOwner && (
                <span className="flex items-center gap-1 px-2 py-1 bg-primary/20 text-primary rounded text-xs">
                  <Crown size={12} />
                  Owner
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onLeaveRoom}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-sm rounded-lg transition-colors">
            Leave Room
          </button>
        </div>
      </div>
    </div>
  );
}
