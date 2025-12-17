/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useRoomStore } from "@/src/store/room.store";
import { useAuthStore } from "@/src/store/auth.store";
import { toast } from "@/src/utils/toast";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { Send, Users, ListVideo, Settings } from "lucide-react";
import ProtectedRoute from "@/src/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DragEndEvent } from "@dnd-kit/core";
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
  type MemberRemovedEvent,
  type UserKickedEvent,
  type UserRoleChangedEvent,
  type ForceDisconnectEvent,
} from "@/src/services/room-socket.service";
import { RoomMessage } from "@/src/types/room-message.types";
import { episodeService } from "@/src/services/episode.service";
import { Episode } from "@/src/types/episode.types";
import { PlaylistUpdatedEvent } from "@/src/types/room-playlist-event.types";

// Import separated components
import { RoomHeader } from "@/src/components/watch-party/RoomHeader";
import { VideoSection } from "@/src/components/watch-party/VideoSection";
import { ChatTab } from "@/src/components/watch-party/ChatTab";
import { MembersTab } from "@/src/components/watch-party/MembersTab";
import { PlaylistTab } from "@/src/components/watch-party/PlaylistTab";
import { SettingsTab } from "@/src/components/watch-party/SettingsTab";
import {
  PasswordDialog,
  PasswordDialogScreen,
} from "@/src/components/watch-party/dialogs/PasswordDialog";
import { MemberManagementDialog } from "@/src/components/watch-party/dialogs/MemberManagementDialog";
import { ForceDisconnectDialog } from "@/src/components/watch-party/dialogs/ForceDisconnectDialog";

function RoomDetailPageContent() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params?.slug as string | undefined;

  const { user: currentUser } = useAuthStore();

  const {
    currentRoom: room,
    isOwner,
    loading,
    error,
    isVerified,
    showPasswordDialog,
    messages,
    hasMoreMessages,
    members,
    playlistItems,
    settings,
    fetchRoom,
    clearRoom,
    setShowPasswordDialog,
    verifyPassword,
    setRoomData,
    addMessage,
    removeMember,
    addMember,
    loadMoreMessages,
    updateMemberRole,
    addPlaylistItem,
    removePlaylistItem,
    updatePlaylistItemPosition,
    reorderPlaylistOptimistic,
    setPlaylistItems,
  } = useRoomStore();

  const handleForceDisconnectRedirect = useCallback(() => {
    clearRoom();
    router.push("/watch-party");
  }, [clearRoom, router]);

  const [activeTab, setActiveTab] = useState("chat");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Episode[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [addingToPlaylist, setAddingToPlaylist] = useState<string | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [chatMessage, setChatMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [loadingMoreMessages, setLoadingMoreMessages] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [showMemberMenu, setShowMemberMenu] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [isForceDisconnected, setIsForceDisconnected] = useState(false);
  const [disconnectReason, setDisconnectReason] = useState("");

  // Debounced search effect
  useEffect(() => {
    const delayTimer = setTimeout(async () => {
      if (searchQuery.trim()) {
        setSearchLoading(true);
        setShowSearchResults(true);
        try {
          const response = await episodeService.searchEpisode({
            query: searchQuery,
            page: 1,
            limit: 10,
          });
          setSearchResults(response.data.episodes);
        } catch (error) {
          console.error("Search error:", error);
          toast.error("Không thể tìm kiếm phim");
          setSearchResults([]);
        } finally {
          setSearchLoading(false);
        }
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(delayTimer);
  }, [searchQuery]);



  const [isJoinedRoom, setIsJoinedRoom] = useState(false);
  const [joinError, setJoinError] = useState<string>("");
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const chatInputRef = useRef<HTMLInputElement | null>(null);

  // Memoize valid playlist items to prevent re-computing on every render
  const validPlaylistItems = useMemo(() => {
    return playlistItems.filter((item) => {
      const itemId = (item as any).id || (item as any)._id;
      if (!itemId || itemId.startsWith("temp-")) {
        console.warn("Skipping invalid playlist item:", item);
        return false;
      }
      return true;
    });
  }, [playlistItems]);

  // Memoize playlist item IDs for SortableContext
  const playlistItemIds = useMemo(() => {
    return validPlaylistItems.map(
      (item) => (item as any).id || (item as any)._id
    );
  }, [validPlaylistItems]);

  // Check if current user can control playlist
  const canControlPlaylist = useMemo(() => {
    if (!currentUser || !members.length) return false;

    const currentMember = members.find((m) => {
      const memberId = typeof m.user === "string" ? m.user : m.user?.id;
      return memberId === currentUser.id;
    });

    const role = currentMember?.role;
    return role === "owner" || role === "moderator";
  }, [currentUser, members]);

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
          toast.success(`${data.username} đã tham gia phòng`);
        });

        // Listen for user left
        roomSocketService.onUserLeft((data: UserLeftEvent) => {
          console.log("User left:", data);
          toast.info(`${data.username} đã rời phòng`);
        });

        // Listen for new messages
        roomSocketService.onNewMessage((data: RoomMessage) => {
          addMessage(data);
        });

        // Listen for member removed
        roomSocketService.onMemberRemoved((data: MemberRemovedEvent) => {
          console.log("Member removed:", data);
          removeMember(data.userId);
        });

        // Listen for member added
        roomSocketService.onMemberAdded((data) => {
          console.log("Member added:", data);
          addMember(data);
        });

        // Listen for user kicked
        roomSocketService.onUserKicked((data: UserKickedEvent) => {
          console.log("User kicked:", data);
          if (data.userId === currentUser?.id) {
            toast.error("Bạn đã bị kick khỏi phòng");
            router.push("/watch-party");
          }
        });

        // Listen for user role changed
        roomSocketService.onUserRoleChanged((data: UserRoleChangedEvent) => {
          console.log("User role changed:", data);
          updateMemberRole(data.userId, data.newRole);
          if (data.userId === currentUser?.id) {
            toast.info(`Quyền của bạn đã được thay đổi thành ${data.newRole}`);
          }
        });

        // Listen for playlist updated
        roomSocketService.onPlaylistUpdated((data: PlaylistUpdatedEvent) => {
          console.log("Playlist updated:", data);

          // Kiểm tra xem action này có phải từ currentUser không
          const isOwnAction =
            (data.action === "add" && data.addedBy === currentUser?.id) ||
            (data.action === "remove" && data.removedBy === currentUser?.id) ||
            (data.action === "reorder" && data.reorderedBy === currentUser?.id);

          // Nếu là action của mình thì bỏ qua (đã update optimistic rồi)
          if (isOwnAction && data.action === "reorder") {
            console.log(
              "Skipping own reorder action (already optimistically updated)"
            );
            return;
          }

          // Handle based on action type
          if (data.action === "add") {
            addPlaylistItem(data.item);
            // Không cần toast ở đây vì đã có system message từ backend
          } else if (data.action === "remove") {
            const itemId = (data.item as any).id || (data.item as any)._id;
            if (itemId) {
              removePlaylistItem(itemId);
            }
          } else if (data.action === "reorder") {
            const itemId = (data.item as any).id || (data.item as any)._id;
            if (itemId) {
              updatePlaylistItemPosition(itemId, data.item);
            }
          }
        });

        // Listen for force disconnect (when user opens room in another tab)
        roomSocketService.onForceDisconnect((data: ForceDisconnectEvent) => {
          console.log("Force disconnect:", data);
          setIsForceDisconnected(true);
          setDisconnectReason(
            data.reason || "Bạn đã mở phòng này ở tab/thiết bị khác"
          );
        });

        // Join room and get initial data from response
        const response = await roomSocketService.joinRoom(room.code);
        console.log("Join room success:", response);

        // Update store with room data from response
        setRoomData({
          messages: response.lastestMessages.reverse(),
          members: response.members,
          playlistItems: response.playlistItems,
          settings: response.settings,
        });
        setIsJoinedRoom(true);
        toast.success("Đã tham gia phòng thành công!");
      } catch (error: any) {
        console.error("Join room failed:", error);
        const errorMessage =
          error?.error || error?.message || "Không thể kết nối đến phòng";
        setJoinError(errorMessage);
        toast.error(errorMessage);
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
      roomSocketService.offMemberRemoved();
      roomSocketService.offMemberAdded();
      roomSocketService.offUserKicked();
      roomSocketService.offUserRoleChanged();
      roomSocketService.offForceDisconnect();
      roomSocketService.offPlaylistUpdated();
    };
  }, [
    room,
    isVerified,
    setRoomData,
    addMessage,
    removeMember,
    addMember,
    updateMemberRole,
    currentUser,
    router,
  ]);

  // Auto scroll to bottom when new messages arrive or switch to chat tab
  useEffect(() => {
    if (activeTab === "chat") {
      // Use setTimeout to ensure DOM is fully rendered
      setTimeout(() => {
        if (scrollAreaRef.current) {
          const scrollContainer = scrollAreaRef.current.querySelector(
            "[data-radix-scroll-area-viewport]"
          );
          if (scrollContainer) {
            scrollContainer.scrollTop = scrollContainer.scrollHeight;
          }
        }
      }, 100);
    }
  }, [messages, activeTab]);

  const handleLoadMoreMessages = async () => {
    if (loadingMoreMessages || !room || !hasMoreMessages) {
      console.log("Skip load more:", {
        loadingMoreMessages,
        hasRoom: !!room,
        hasMoreMessages,
      });
      return;
    }

    console.log("Starting load more messages...");
    setLoadingMoreMessages(true);

    // Save scroll position before loading
    const scrollContainer = scrollAreaRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]"
    );
    const scrollHeightBefore = scrollContainer?.scrollHeight || 0;
    const scrollTopBefore = scrollContainer?.scrollTop || 0;

    try {
      await loadMoreMessages();
      console.log("Load more messages success!");

      // Restore scroll position after loading
      setTimeout(() => {
        if (scrollContainer) {
          const scrollHeightAfter = scrollContainer.scrollHeight;
          const scrollHeightDiff = scrollHeightAfter - scrollHeightBefore;
          scrollContainer.scrollTop = scrollTopBefore + scrollHeightDiff;
        }
      }, 100);
    } catch (error) {
      console.error("Failed to load more messages:", error);
      toast.error("Không thể tải thêm tin nhắn");
    } finally {
      setLoadingMoreMessages(false);
    }
  };

  const handleVerifyPassword = useCallback(
    async (password: string) => {
      await verifyPassword(password);
      toast.success("Xác thực thành công!");
    },
    [verifyPassword]
  );

  const handleCancelPassword = useCallback(() => {
    setShowPasswordDialog(false);
    router.push("/watch-party");
  }, [router, setShowPasswordDialog]);

  const handleSendMessage = async () => {
    if (!chatMessage.trim() || !room) {
      return;
    }

    setSendingMessage(true);
    try {
      await roomSocketService.sendMessage(room.code, chatMessage.trim());
      setChatMessage("");
      // Keep focus on input after sending with small delay
      setTimeout(() => {
        if (chatInputRef.current) chatInputRef.current.focus();
      }, 100);
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

  const handleKickUser = async (userId: string) => {
    if (!room || actionLoading) return;

    setActionLoading(true);
    try {
      await roomSocketService.kickUser(room.code, userId);
      toast.success("Đã kick người dùng");
      setShowMemberMenu(false);
      setSelectedMember(null);
    } catch (error: any) {
      console.error("Failed to kick user:", error);
      toast.error(error?.message || "Không thể kick người dùng");
    } finally {
      setActionLoading(false);
    }
  };

  const handleChangeRole = async (userId: string, newRole: string) => {
    if (!room || actionLoading) return;

    setActionLoading(true);
    try {
      await roomSocketService.changeUserRole(room.code, userId, newRole);
      toast.success(`Đã thay đổi quyền thành ${newRole}`);
      setShowMemberMenu(false);
      setSelectedMember(null);
    } catch (error: any) {
      console.error("Failed to change role:", error);
      toast.error(error?.message || "Không thể thay đổi quyền");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddToPlaylist = async (
    episodeId: string,
    episodeTitle: string
  ) => {
    if (!room || addingToPlaylist) return;

    setAddingToPlaylist(episodeId);
    try {
      const response = await roomSocketService.addToPlaylist(
        room.code,
        episodeId
      );

      if (response.isDuplicate) {
        toast.warning(response.message);
      } else {
        toast.success(`Đã thêm "${episodeTitle}" vào playlist`);
      }

      setShowSearchResults(false);
      setSearchQuery("");
    } catch (error: any) {
      console.error("Failed to add to playlist:", error);
      toast.error(error?.message || "Không thể thêm vào playlist");
    } finally {
      setAddingToPlaylist(null);
    }
  };

  const handleRemoveFromPlaylist = async (itemId: string) => {
    if (!room || deletingItemId) return;

    setDeletingItemId(itemId);
    try {
      await roomSocketService.removeFromPlaylist(room.code, itemId);
    } catch (error: any) {
      console.error("Failed to remove from playlist:", error);
      toast.error(error?.message || "Không thể xóa khỏi playlist");
    } finally {
      setDeletingItemId(null);
    }
  };

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;

      if (!over || active.id === over.id || !room) {
        return;
      }

      const oldIndex = playlistItems.findIndex(
        (item) =>
          (item as any).id === active.id || (item as any)._id === active.id
      );
      const newIndex = playlistItems.findIndex(
        (item) => (item as any).id === over.id || (item as any)._id === over.id
      );

      if (oldIndex === -1 || newIndex === -1) return;

      // Lưu trạng thái cũ để rollback nếu có lỗi
      const previousPlaylist = [...playlistItems];

      // **OPTIMISTIC UPDATE**: Cập nhật UI ngay lập tức
      reorderPlaylistOptimistic(oldIndex, newIndex);

      // Tính toán position mới theo fractional indexing
      let newPosition: number;

      if (newIndex === 0) {
        // Kéo lên đầu
        newPosition = playlistItems[0].position / 2;
      } else if (newIndex === playlistItems.length - 1) {
        // Kéo xuống cuối
        newPosition = playlistItems[playlistItems.length - 1].position + 1000;
      } else {
        // Kéo vào giữa
        if (newIndex > oldIndex) {
          // Kéo xuống
          const itemBefore = playlistItems[newIndex];
          const itemAfter = playlistItems[newIndex + 1];
          newPosition = itemAfter
            ? (itemBefore.position + itemAfter.position) / 2
            : itemBefore.position + 1000;
        } else {
          // Kéo lên
          const itemBefore = playlistItems[newIndex - 1];
          const itemAfter = playlistItems[newIndex];
          newPosition = (itemBefore.position + itemAfter.position) / 2;
        }
      }

      try {
        const itemId =
          (playlistItems[oldIndex] as any).id ||
          (playlistItems[oldIndex] as any)._id;

        // Gửi request đến server (không cần đợi UI update)
        await roomSocketService.reorderPlaylist(room.code, itemId, newPosition);
      } catch (error: any) {
        console.error("Failed to reorder playlist:", error);
        toast.error(error?.message || "Không thể sắp xếp lại playlist");

        // **ROLLBACK**: Hoàn tác nếu server thất bại
        setPlaylistItems(previousPlaylist);
      }
    },
    [room, playlistItems, reorderPlaylistOptimistic, setPlaylistItems]
  );

  // Handle load more messages when scrolling to top
  useEffect(() => {
    if (activeTab !== "chat") return;

    const scrollContainer = scrollAreaRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]"
    );

    if (!scrollContainer) {
      console.log("ScrollArea viewport not found!");
      return;
    }

    console.log("ScrollArea viewport found, adding scroll listener");

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;

      console.log("Scroll event:", {
        scrollTop,
        scrollHeight,
        clientHeight,
        loadingMoreMessages,
        hasMoreMessages,
        room: !!room,
      });

      // Trigger load more when scroll near top (within 100px)
      if (scrollTop < 100 && !loadingMoreMessages && hasMoreMessages && room) {
        console.log("🔥 Triggering load more messages...");
        handleLoadMoreMessages();
      }
    };

    scrollContainer.addEventListener("scroll", handleScroll);

    return () => {
      console.log("Removing scroll listener");
      scrollContainer.removeEventListener("scroll", handleScroll);
    };
  }, [
    activeTab,
    loadingMoreMessages,
    hasMoreMessages,
    room,
    handleLoadMoreMessages,
  ]);

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

  // Don't show error UI when force disconnected (will redirect soon)
  if ((error || !room) && !isForceDisconnected) {
    return (
      <div className=" min-h-screen bg-linear-to-b from-[#0a0a0f] via-[#1a1a2e] to-[#0a0a0f] flex items-center justify-center">
        <div className="text-center max-w-md px-4">
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
        <PasswordDialogScreen />
        <PasswordDialog
          open={showPasswordDialog}
          onVerify={handleVerifyPassword}
          onCancel={handleCancelPassword}
        />
      </>
    );
  }

  // Show error UI when join fails
  if (joinError && room && isVerified) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#1a1a2e] border border-red-500/30 rounded-lg p-6">
          <div className="text-center mb-4">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-500/10 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Không thể tham gia phòng
            </h3>
            <p className="text-red-400 text-sm">{joinError}</p>
          </div>
          <div className="space-y-2">
            <Button
              onClick={() => router.push("/watch-party")}
              className="w-full bg-primary hover:bg-primary/90">
              Quay về danh sách phòng
            </Button>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="w-full border-white/20 text-white hover:bg-white/5">
              Thử lại
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state while joining room
  if (!isJoinedRoom && room && isVerified) {
    return (
      <div className="min-h-screen bg-linear-to-b from-[#0a0a0f] via-[#1a1a2e] to-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/60">Đang tham gia phòng...</p>
        </div>
      </div>
    );
  }

  // Don't show room UI if not joined
  if (!isJoinedRoom) {
    return null;
  }

  return (
    <div className="pt-16  h-screen bg-linear-to-b from-[#0a0a0f] via-[#1a1a2e] to-[#0a0a0f] flex flex-col overflow-hidden">
      {/* Room Header */}
      <RoomHeader
        roomName={room?.name || ""}
        roomCode={room?.code || ""}
        roomType={room?.type || "public"}
        isOwner={isOwner}
        onLeaveRoom={() => router.push("/watch-party")}
      />

      <div className="flex-1 overflow-hidden">
        <div className="h-full grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-0">
          {/* Left Side - Video Section */}
          <VideoSection
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSearchFocus={() =>
              searchQuery.trim() && setShowSearchResults(true)
            }
            showSearchResults={showSearchResults}
            searchLoading={searchLoading}
            searchResults={searchResults}
            addingToPlaylist={addingToPlaylist}
            onAddToPlaylist={handleAddToPlaylist}
            onCloseSearch={() => {
              setShowSearchResults(false);
              setSearchQuery("");
            }}
          />

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
                            Members ({members.length})
                          </span>
                        </TabsTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Danh sách thành viên ({members.length})</p>
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
                    <ChatTab
                      messages={messages}
                      hasMoreMessages={hasMoreMessages}
                      loadingMoreMessages={loadingMoreMessages}
                      currentUserId={currentUser?.id}
                      chatMessage={chatMessage}
                      sendingMessage={sendingMessage}
                      scrollAreaRef={scrollAreaRef}
                      chatInputRef={chatInputRef}
                      onChatMessageChange={setChatMessage}
                      onSendMessage={handleSendMessage}
                      onKeyPress={handleKeyPressSendMessage}
                    />
                  </TabsContent>

                  {/* Members Tab */}
                  <TabsContent
                    value="members"
                    className="flex-1 m-0 data-[state=inactive]:hidden">
                    <MembersTab
                      members={members}
                      currentUserId={currentUser?.id}
                      isOwner={isOwner}
                      onMemberClick={(member) => {
                        setSelectedMember(member);
                        setShowMemberMenu(true);
                      }}
                    />
                  </TabsContent>

                  {/* Playlist Tab */}
                  <TabsContent
                    value="playlist"
                    className="flex-1 m-0 data-[state=inactive]:hidden">
                    <PlaylistTab
                      playlistItems={validPlaylistItems}
                      playlistItemIds={playlistItemIds}
                      canControlPlaylist={canControlPlaylist}
                      deletingItemId={deletingItemId}
                      onDragEnd={handleDragEnd}
                      onRemoveFromPlaylist={handleRemoveFromPlaylist}
                    />
                  </TabsContent>

                  {/* Settings Tab */}
                  <TabsContent
                    value="settings"
                    className="flex-1 m-0 data-[state=inactive]:hidden">
                    <SettingsTab settings={settings} isOwner={isOwner} />
                  </TabsContent>
                </Tabs>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </div>

      {/* Member Management Dialog */}
      <MemberManagementDialog
        open={showMemberMenu}
        member={selectedMember}
        actionLoading={actionLoading}
        onClose={() => {
          setShowMemberMenu(false);
          setSelectedMember(null);
        }}
        onChangeRole={handleChangeRole}
        onKickUser={handleKickUser}
      />

      {/* Force Disconnect Dialog */}
      <ForceDisconnectDialog
        open={isForceDisconnected}
        reason={disconnectReason}
        onRedirect={handleForceDisconnectRedirect}
      />
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
