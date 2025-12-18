import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Crown, UserCog, MoreVertical } from "lucide-react";

interface User {
  id?: string;
  username?: string;
}

interface Member {
  id: string;
  user: User | string | null;
  role: string;
}

interface MembersTabProps {
  members: Member[];
  currentUserId?: string;
  isOwner: boolean;
  onMemberClick: (member: Member) => void;
}

export function MembersTab({
  members,
  currentUserId,
  isOwner,
  onMemberClick,
}: MembersTabProps) {
  return (
    <ScrollArea className="h-full max-h-[calc(100vh-245px)] p-4">
      <div className="space-y-2">
        {members.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-white/40 text-sm">Chưa có thành viên nào</p>
          </div>
        ) : (
          <>
            {/* Group by role */}
            {["owner", "admin", "moderator", "member"].map((role) => {
              const roleMembers = members.filter((m) => m.role === role);
              if (roleMembers.length === 0) return null;

              const roleLabel =
                role === "owner"
                  ? "Chủ phòng"
                  : role === "moderator"
                  ? "Quản trị viên"
                  : "Thành viên";

              return (
                <div key={role}>
                  <div className="text-xs text-white/40 uppercase font-semibold mb-2 mt-4 first:mt-0">
                    {roleLabel} - {roleMembers.length}
                  </div>
                  {roleMembers.map((member) => {
                    const memberUser =
                      typeof member.user === "object" && member.user
                        ? member.user
                        : null;
                    const username = memberUser?.username || "Unknown";

                    return (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-2 hover:bg-white/5 rounded-lg group">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback
                              className={
                                role === "owner"
                                  ? "bg-primary/20 text-primary"
                                  : role === "moderator"
                                  ? "bg-orange-500/20 text-orange-400"
                                  : "bg-blue-500/20 text-blue-400"
                              }>
                              {username.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium text-white flex items-center gap-1">
                              {username}
                              {role === "owner" && (
                                <Crown size={12} className="text-primary" />
                              )}
                              {role === "moderator" && (
                                <UserCog
                                  size={12}
                                  className="text-orange-400"
                                />
                              )}
                            </p>
                            <p className="text-xs text-white/40 capitalize">
                              {roleLabel}
                            </p>
                          </div>
                        </div>
                        {isOwner &&
                          role !== "owner" &&
                          memberUser?.id !== currentUserId && (
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => onMemberClick(member)}
                                className="h-8 w-8 text-white/60 hover:text-white">
                                <MoreVertical size={16} />
                              </Button>
                            </div>
                          )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </>
        )}
      </div>
    </ScrollArea>
  );
}
