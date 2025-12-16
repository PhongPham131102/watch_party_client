/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useRoomStore } from "@/src/store/room.store";
import { toast } from "@/src/utils/toast";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
import {
  Eye,
  EyeOff,
  Lock,
  Search,
  Send,
  Users,
  ListVideo,
  Settings,
  MoreVertical,
  Crown,
  UserCog,
  Film,
} from "lucide-react";
import ProtectedRoute from "@/src/components/ProtectedRoute";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  roomSocketService,
  type UserJoinedEvent,
  type UserLeftEvent,
} from "@/src/services/room-socket.service";
import { RoomMessage, TypeMessage } from "@/src/types/room-message.types";

function RoomDetailPageContent() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params?.slug as string | undefined;

  const {
    currentRoom: room,
    isOwner,
    loading,
    error,
    isVerified,
    showPasswordDialog,
    messages,
    members,
    playlistItems,
    settings,
    fetchRoom,
    clearRoom,
    setShowPasswordDialog,
    verifyPassword,
    setRoomData,
    addMessage,
  } = useRoomStore();

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const [searchQuery, setSearchQuery] = useState("");
  const [chatMessage, setChatMessage] = useState("");
  const [onlineMembers, setOnlineMembers] = useState<UserJoinedEvent[]>([]);
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    if (!slug) {
      toast.error("Không tìm thấy mã phòng");
      return;
    }

    fetchRoom(slug).catch((err) => {
      console.error("Error fetching room details:", err);
      toast.error(err?.message || "Không thể tải thông tin phòng");
    });

    // Cleanup when component unmounts
    return () => {
      clearRoom();
    };
  }, [slug, fetchRoom, clearRoom]);

  // Socket connection and room join
  useEffect(() => {
    if (!room || !isVerified) return;

    const initializeRoom = async () => {
      try {
        // Connect to socket and wait for connection
        await roomSocketService.connect();

        // Listen for user joined
        roomSocketService.onUserJoined((data: UserJoinedEvent) => {
          console.log("User joined:", data);
          setOnlineMembers((prev) => [...prev, data]);
          toast.success(`${data.username} đã tham gia phòng`);
        });

        // Listen for user left
        roomSocketService.onUserLeft((data: UserLeftEvent) => {
          console.log("User left:", data);
          setOnlineMembers((prev) =>
            prev.filter((member) => member.userId !== data.userId)
          );
          toast.info(`${data.username} đã rời phòng`);
        });

        // Listen for new messages
        roomSocketService.onNewMessage((data: RoomMessage) => {
          addMessage(data);
        });

        // Join room and get initial data from response
        const response = await roomSocketService.joinRoom(room.code);
        console.log("Join room success:", response);

        // Update store with room data from response
        setRoomData({
          messages: response.lastestMessages,
          members: response.members,
          playlistItems: response.playlistItems,
          settings: response.settings,
        });
        toast.success("Đã tham gia phòng thành công!");
      } catch (error) {
        console.error("Failed to initialize room:", error);
        toast.error("Không thể kết nối đến phòng");
      }
    };

    initializeRoom();

    // Cleanup
    return () => {
      // Chỉ emit event, không đợi response vì khi browser đóng cleanup không chạy
      // Server sẽ tự handle disconnect event
      if (room) {
        roomSocketService.leaveRoom(room.code);
      }
      roomSocketService.offUserJoined();
      roomSocketService.offUserLeft();
      roomSocketService.offNewMessage();
    };
  }, [room, isVerified, setRoomData, addMessage]);

  const handleVerifyPassword = async () => {
    if (!password.trim()) {
      toast.error("Vui lòng nhập mật khẩu");
      return;
    }

    setVerifying(true);
    try {
      await verifyPassword(password);
      toast.success("Xác thực thành công!");
      setPassword("");
    } catch (err: any) {
      toast.error(err?.message || "Mật khẩu không đúng");
    } finally {
      setVerifying(false);
    }
  };

  const handleCancelPassword = () => {
    setShowPasswordDialog(false);
    setPassword("");
    setShowPassword(false);
    router.push("/watch-party");
  };

  const handleSendMessage = async () => {
    if (!chatMessage.trim() || !room) {
      return;
    }

    setSendingMessage(true);
    try {
      await roomSocketService.sendMessage(room.code, chatMessage.trim());
      setChatMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Không thể gửi tin nhắn");
    } finally {
      setSendingMessage(false);
    }
  };

  const handleKeyPressSendMessage = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter" && !e.shiftKey && !sendingMessage) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-b from-[#0a0a0f] via-[#1a1a2e] to-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/60">Đang tải thông tin phòng...</p>
        </div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className=" min-h-screen bg-linear-to-b from-[#0a0a0f] via-[#1a1a2e] to-[#0a0a0f] flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Không tìm thấy phòng
          </h1>
          <p className="text-white/60 mb-6">
            {error || "Phòng không tồn tại hoặc đã bị xóa"}
          </p>
          <button
            onClick={() => router.push("/watch-party")}
            className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors">
            Quay về trang chủ
          </button>
        </div>
      </div>
    );
  }

  // Show password dialog if needed
  if (!isVerified && showPasswordDialog) {
    return (
      <>
        <div className="min-h-screen bg-linear-to-b from-[#0a0a0f] via-[#1a1a2e] to-[#0a0a0f] flex items-center justify-center">
          <div className="text-center max-w-md px-4">
            <div className="w-20 h-20 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
              <Lock className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Phòng riêng tư
            </h1>
            <p className="text-white/60 mb-6">
              Phòng này yêu cầu mật khẩu để truy cập
            </p>
          </div>
        </div>

        <Dialog open={showPasswordDialog} onOpenChange={() => {}}>
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
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !verifying) {
                        handleVerifyPassword();
                      }
                    }}
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
                onClick={handleCancelPassword}
                disabled={verifying}
                className="flex-1 bg-white/5 border-white/10 text-white hover:bg-white/10">
                Hủy
              </Button>
              <Button
                type="button"
                onClick={handleVerifyPassword}
                disabled={verifying}
                className="flex-1 bg-primary hover:bg-primary/90">
                {verifying ? "Đang xác thực..." : "Xác nhận"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <div className="pt-16  h-screen bg-linear-to-b from-[#0a0a0f] via-[#1a1a2e] to-[#0a0a0f] flex flex-col overflow-hidden">
      {/* Room Header */}
      <div className="border-b border-white/10 bg-[#0a0a0f]/90 backdrop-blur-sm z-10 shrink-0">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-bold text-white">{room.name}</h1>
              <div className="flex items-center gap-3 text-sm text-white/60">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  {room.type === "public" ? "Public" : "Private"}
                </span>
                <span className="px-2 py-1 bg-white/5 rounded text-xs font-mono">
                  {room.code}
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
              onClick={() => router.push("/watch-party")}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-sm rounded-lg transition-colors">
              Leave Room
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="h-full grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-0">
          {/* Left Side - Video Section */}
          <div className="flex flex-col h-full gap-2 p-1">
            {/* Search Bar */}
            <div className="bg-white/5 shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input
                  type="text"
                  placeholder="Tìm kiếm phim, video..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                />
              </div>
            </div>

            {/* Video Player */}
            <div className="bg-blackoverflow-hidden border border-white/10 flex-1 min-h-0 rounded-sm">
              <div className="rounded-sm h-full flex items-center justify-center bg-linear-to-br from-gray-900 to-black">
                <div className="text-center">
                  <Film className="w-16 h-16 text-white/20 mx-auto mb-3" />
                  <p className="text-white/60 text-base">
                    You&apos;re not watching anything!
                  </p>
                  <p className="text-white/40 text-xs mt-1">
                    Pick something to watch above.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Tabs */}
          <div className="border-l border-white/10">
            <div className="bg-white/5 backdrop-blur-sm h-full flex flex-col">
              <TooltipProvider>
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="flex-1 flex flex-col">
                  <TabsList className="grid w-full grid-cols-4 bg-white/5 border-b border-white/10 rounded-none p-1 gap-1 h-auto">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <TabsTrigger
                          value="chat"
                          className="text-white/60 hover:text-white hover:bg-white/5 bg-transparent border-transparent  data-[state=active]:shadow-lg rounded-md flex items-center gap-2 transition-all justify-center h-10">
                          <Send size={16} />
                          <span className="hidden sm:inline text-sm font-medium">
                            Chat
                          </span>
                        </TabsTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Chat với mọi người</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <TabsTrigger
                          value="members"
                          className="text-white/60 hover:text-white hover:bg-white/5 bg-transparent border-transparent  data-[state=active]:shadow-lg rounded-md flex items-center gap-2 transition-all justify-center h-10">
                          <Users size={16} />
                          <span className="hidden sm:inline text-sm font-medium">
                            Members
                          </span>
                        </TabsTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Danh sách thành viên</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <TabsTrigger
                          value="playlist"
                          className="text-white/60 hover:text-white hover:bg-white/5 bg-transparent border-transparent  data-[state=active]:shadow-lg rounded-md flex items-center gap-2 transition-all justify-center h-10">
                          <ListVideo size={16} />
                          <span className="hidden sm:inline text-sm font-medium">
                            Playlist
                          </span>
                        </TabsTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Danh sách video</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <TabsTrigger
                          value="settings"
                          className="text-white/60 hover:text-white hover:bg-white/5 bg-transparent border-transparent  data-[state=active]:shadow-lg rounded-md flex items-center gap-2 transition-all justify-center h-10">
                          <Settings size={16} />
                          <span className="hidden sm:inline text-sm font-medium">
                            Settings
                          </span>
                        </TabsTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Cài đặt phòng</p>
                      </TooltipContent>
                    </Tooltip>
                  </TabsList>

                  {/* Chat Tab */}
                  <TabsContent
                    value="chat"
                    className="flex-1 flex flex-col m-0 data-[state=inactive]:hidden">
                    <ScrollArea className="flex-1 p-4">
                      <div className="space-y-3">
                        {messages.length === 0 ? (
                          <div className="text-center py-8">
                            <p className="text-white/40 text-sm">
                              Chưa có tin nhắn nào
                            </p>
                            <p className="text-white/30 text-xs mt-1">
                              Hãy là người đầu tiên gửi tin nhắn!
                            </p>
                          </div>
                        ) : (
                          messages.map((message) => {
                            const messageUser =
                              typeof message.user === "object" && message.user
                                ? message.user
                                : null;
                            const username = messageUser?.username || "Unknown";
                            const messageTime = new Date(
                              message.sentAt
                            ).toLocaleTimeString("vi-VN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            });

                            if (message.type === TypeMessage.SYSTEM) {
                              return (
                                <div
                                  key={message.id}
                                  className="flex justify-center">
                                  <span className="text-xs text-white/40 bg-white/5 px-3 py-1 rounded-full">
                                    {message.content}
                                  </span>
                                </div>
                              );
                            }

                            return (
                              <div key={message.id} className="flex gap-2">
                                <Avatar className="w-8 h-8">
                                  <AvatarFallback className="bg-primary/20 text-primary text-xs">
                                    {username.substring(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-medium text-white">
                                      {username}
                                    </span>
                                    <span className="text-xs text-white/40">
                                      {messageTime}
                                    </span>
                                  </div>
                                  <div className="bg-white/10 rounded-lg px-3 py-2">
                                    <p className="text-sm text-white/90">
                                      {message.content}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </ScrollArea>
                    <div className="p-3 border-t border-white/10">
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          placeholder="Type a message..."
                          value={chatMessage}
                          onChange={(e) => setChatMessage(e.target.value)}
                          onKeyDown={handleKeyPressSendMessage}
                          disabled={sendingMessage}
                          className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-white/40 disabled:opacity-50"
                        />
                        <Button
                          size="icon"
                          onClick={handleSendMessage}
                          disabled={sendingMessage || !chatMessage.trim()}
                          className="bg-primary hover:bg-primary/90 disabled:opacity-50">
                          <Send size={18} />
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Members Tab */}
                  <TabsContent
                    value="members"
                    className="flex-1 m-0 data-[state=inactive]:hidden">
                    <ScrollArea className="h-full p-4">
                      <div className="space-y-2">
                        {members.length === 0 ? (
                          <div className="text-center py-8">
                            <p className="text-white/40 text-sm">
                              Chưa có thành viên nào
                            </p>
                          </div>
                        ) : (
                          <>
                            {/* Group by role */}
                            {["owner", "admin", "moderator", "member"].map(
                              (role) => {
                                const roleMembers = members.filter(
                                  (m) => m.role === role
                                );
                                if (roleMembers.length === 0) return null;

                                const roleLabel =
                                  role === "owner"
                                    ? "Owner"
                                    : role === "admin"
                                    ? "Admin"
                                    : role === "moderator"
                                    ? "Moderator"
                                    : "Members";

                                return (
                                  <div key={role}>
                                    <div className="text-xs text-white/40 uppercase font-semibold mb-2 mt-4 first:mt-0">
                                      {roleLabel} - {roleMembers.length}
                                    </div>
                                    {roleMembers.map((member) => {
                                      const memberUser =
                                        typeof member.user === "object" &&
                                        member.user
                                          ? member.user
                                          : null;
                                      const username =
                                        memberUser?.username || "Unknown";

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
                                                {username
                                                  .substring(0, 2)
                                                  .toUpperCase()}
                                              </AvatarFallback>
                                            </Avatar>
                                            <div>
                                              <p className="text-sm font-medium text-white flex items-center gap-1">
                                                {username}
                                                {role === "owner" && (
                                                  <Crown
                                                    size={12}
                                                    className="text-primary"
                                                  />
                                                )}
                                                {role === "moderator" && (
                                                  <UserCog
                                                    size={12}
                                                    className="text-orange-400"
                                                  />
                                                )}
                                              </p>
                                              <p className="text-xs text-white/40 capitalize">
                                                {role}
                                              </p>
                                            </div>
                                          </div>
                                          {isOwner && role !== "owner" && (
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                              <Button
                                                size="icon"
                                                variant="ghost"
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
                              }
                            )}
                          </>
                        )}
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  {/* Playlist Tab */}
                  <TabsContent
                    value="playlist"
                    className="flex-1 m-0 data-[state=inactive]:hidden">
                    <ScrollArea className="h-full p-4">
                      <div className="space-y-3">
                        {playlistItems.length === 0 ? (
                          <div className="text-center py-8">
                            <ListVideo className="w-12 h-12 text-white/20 mx-auto mb-3" />
                            <p className="text-white/40 text-sm">
                              Playlist trống
                            </p>
                            <p className="text-white/30 text-xs mt-1">
                              Thêm video để bắt đầu xem cùng nhau!
                            </p>
                          </div>
                        ) : (
                          playlistItems.map((item, index) => {
                            const video =
                              typeof item.video === "object" && item.video
                                ? item.video
                                : null;
                            const addedBy =
                              typeof item.addBy === "object" && item.addBy
                                ? item.addBy
                                : null;

                            return (
                              <div
                                key={`${item.room}-${index}`}
                                className="flex gap-3 p-2 hover:bg-white/5 rounded-lg cursor-pointer">
                                <div className="relative shrink-0">
                                  <div className="w-32 h-20 bg-linear-to-br from-gray-800 to-gray-900 rounded overflow-hidden">
                                    {/* {video?.thumbnail ? (
                                      <img
                                        src={video.thumbnail}
                                        alt={video.name || "Video thumbnail"}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <Film
                                          size={24}
                                          className="text-white/20"
                                        />
                                      </div>
                                    )} */}
                                    <div className="w-full h-full flex items-center justify-center">
                                      <Film
                                        size={24}
                                        className="text-white/20"
                                      />
                                    </div>
                                  </div>
                                  {video?.durationMinutes && (
                                    <div className="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-xs text-white">
                                      {video.durationMinutes}
                                    </div>
                                  )}
                                  <div className="absolute top-1 left-1 bg-primary/90 px-1.5 py-0.5 rounded text-xs text-white font-semibold">
                                    #{item.position}
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-sm font-medium text-white truncate">
                                    {video?.title || "Unknown Video"}
                                  </h4>
                                  <p className="text-xs text-white/60 mt-1">
                                    Added by {addedBy?.username || "Unknown"}
                                  </p>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  {/* Settings Tab */}
                  <TabsContent
                    value="settings"
                    className="flex-1 m-0 data-[state=inactive]:hidden">
                    <ScrollArea className="h-full p-4">
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-sm font-semibold text-white mb-3">
                            Room Settings
                          </h3>
                          {settings ? (
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label className="text-white/80 text-sm">
                                  Room Type
                                </Label>
                                <Input
                                  type="text"
                                  value={settings.type}
                                  disabled
                                  className="bg-white/5 border-white/10 text-white disabled:opacity-50 capitalize"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label className="text-white/80 text-sm">
                                  Maximum Users
                                </Label>
                                <Input
                                  type="number"
                                  value={settings.max_users}
                                  disabled={!isOwner}
                                  className="bg-white/5 border-white/10 text-white disabled:opacity-50"
                                />
                                <p className="text-xs text-white/40">
                                  Maximum number of users allowed in the room
                                </p>
                              </div>

                              <div className="space-y-2">
                                <Label className="text-white/80 text-sm">
                                  Max Videos in Playlist
                                </Label>
                                <Input
                                  type="number"
                                  value={settings.max_video_in_playlist}
                                  disabled={!isOwner}
                                  className="bg-white/5 border-white/10 text-white disabled:opacity-50"
                                />
                                <p className="text-xs text-white/40">
                                  Maximum total videos in the playlist
                                </p>
                              </div>

                              <div className="space-y-2">
                                <Label className="text-white/80 text-sm">
                                  Max Videos per User
                                </Label>
                                <Input
                                  type="number"
                                  value={settings.max_video}
                                  disabled={!isOwner}
                                  className="bg-white/5 border-white/10 text-white disabled:opacity-50"
                                />
                                <p className="text-xs text-white/40">
                                  Maximum videos each user can add
                                </p>
                              </div>

                              {isOwner && (
                                <Button className="w-full bg-primary hover:bg-primary/90 mt-4">
                                  Save Settings
                                </Button>
                              )}
                            </div>
                          ) : (
                            <div className="text-center py-4">
                              <p className="text-white/40 text-sm">
                                Loading settings...
                              </p>
                            </div>
                          )}
                        </div>

                        {!isOwner && settings && (
                          <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                            <p className="text-xs text-white/60 text-center">
                              Only room owner can modify settings
                            </p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RoomDetailPage() {
  return (
    <ProtectedRoute>
      <RoomDetailPageContent />
    </ProtectedRoute>
  );
}
