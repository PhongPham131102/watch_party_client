/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useRoomStore } from "@/src/store/room.store";
import { useAuthStore } from "@/src/store/auth.store";
import { toast } from "@/src/utils/toast";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef, useMemo } from "react";
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
  User,
} from "lucide-react";
import ProtectedRoute from "@/src/components/ProtectedRoute";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
import { RoomMessage, TypeMessage } from "@/src/types/room-message.types";
import { episodeService } from "@/src/services/episode.service";
import { Episode } from "@/src/types/episode.types";
import { PlaylistUpdatedEvent } from "@/src/types/room-playlist-event.types";
import { GripVertical } from "lucide-react";

// Sortable Playlist Item Component
interface SortablePlaylistItemProps {
  id: string;
  video: any;
  addedBy: any;
  canDelete: boolean;
  canDrag: boolean;
  onDelete: (id: string, title: string) => void;
  isDeleting: boolean;
}

function SortablePlaylistItem({
  id,
  video,
  addedBy,
  canDelete,
  canDrag,
  onDelete,
  isDeleting,
}: SortablePlaylistItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: !canDrag });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? transition : "all 150ms ease",
    opacity: isDragging ? 0.6 : 1,
    scale: isDragging ? 1.02 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="w-full px-2 my-2">
      <div className={`grid grid-cols-[20px_112px_1fr_40px] gap-2 py-2 bg-gray-800/50 hover:bg-gray-800/70 rounded-md group items-center ${isDragging ? 'shadow-lg shadow-primary/20 ring-2 ring-primary/50' : ''}`}>
        {canDrag ? (
          <div
            {...attributes}
            {...listeners}
            className="flex items-center justify-center cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity">
            <GripVertical size={16} className="text-white/40" />
          </div>
        ) : (
          <div />
        )}

        <div className="relative">
          <div className="w-full aspect-video bg-linear-to-br from-gray-800 to-gray-900 rounded overflow-hidden">
            {video?.thumbnailUrl ? (
              <img
                src={video.thumbnailUrl}
                alt={video.title || "Video thumbnail"}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Film size={20} className="text-white/20" />
              </div>
            )}
          </div>
          {video?.durationMinutes && (
            <div className="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-xs text-white">
              {video.durationMinutes} phút
            </div>
          )}
        </div>

        <div className="min-w-0 overflow-hidden">
          <h4 className="text-sm font-medium text-white truncate">
            {video?.title || "Unknown Video"}
          </h4>
          <p className="text-xs text-white/60 mt-0.5 truncate">
            Added by {addedBy?.username || "Unknown"}
          </p>
        </div>

        <div className="flex items-center justify-center pr-2">
          {canDelete && (
            <Button
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(id, video?.title || "Unknown Video");
              }}
              disabled={isDeleting}
              className="h-8 w-8 bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 border border-red-500/30 disabled:opacity-50">
              {isDeleting ? (
                <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round">
                  <path d="M3 6h18" />
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                </svg>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

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

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Episode[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [addingToPlaylist, setAddingToPlaylist] = useState<string | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [chatMessage, setChatMessage] = useState("");
  const [onlineMembers, setOnlineMembers] = useState<UserJoinedEvent[]>([]);
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

  // Update current user role
  useEffect(() => {
    if (currentUser && members.length > 0) {
      const currentMember = members.find((m) => {
        const memberId = typeof m.user === "string" ? m.user : m.user?.id;
        return memberId === currentUser.id;
      });
      if (currentMember) {
        setCurrentUserRole(currentMember.role);
      }
    }
  }, [currentUser, members]);

  const [redirectCountdown, setRedirectCountdown] = useState(3);
  const [isJoinedRoom, setIsJoinedRoom] = useState(false);
  const [joinError, setJoinError] = useState<string>("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
          setOnlineMembers((prev) => {
            // Check if user already exists (avoid duplicate when opening multiple tabs)
            const existingUser = prev.find((m) => m.userId === data.userId);
            if (existingUser) {
              console.log("User already in online list:", data.userId);
              return prev;
            }
            return [...prev, data];
          });
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
            console.log("Skipping own reorder action (already optimistically updated)");
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
          setRedirectCountdown(3);

          // Countdown timer
          const countdownInterval = setInterval(() => {
            setRedirectCountdown((prev) => {
              if (prev <= 1) {
                clearInterval(countdownInterval);
                return 0;
              }
              return prev - 1;
            });
          }, 1000);

          // Auto redirect after 3 seconds
          setTimeout(() => {
            router.push("/watch-party");
            // Cleanup after redirect to avoid flash error UI
            setTimeout(() => {
              clearRoom();
            }, 100);
          }, 3000);
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

  const handleRemoveFromPlaylist = async (
    itemId: string,
    videoTitle: string
  ) => {
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

  const handleDragEnd = async (event: DragEndEvent) => {
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
  };

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
      <div className="border-b border-white/10 bg-[#0a0a0f]/90 backdrop-blur-sm z-10 shrink-0">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-bold text-white">{room?.name}</h1>
              <div className="flex items-center gap-3 text-sm text-white/60">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  {room?.type === "public" ? "Public" : "Private"}
                </span>
                <span className="px-2 py-1 bg-white/5 rounded text-xs font-mono">
                  {room?.code}
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
                  onFocus={() =>
                    searchQuery.trim() && setShowSearchResults(true)
                  }
                  className="pl-9 h-9 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                />

                {/* Search Results Dropdown */}
                {showSearchResults && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-gray-900/95 backdrop-blur-sm border border-white/10 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
                    {searchLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="flex items-center gap-2 text-white/60">
                          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-sm">Đang tìm kiếm...</span>
                        </div>
                      </div>
                    ) : searchResults.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-white/40 text-sm">
                          Không tìm thấy kết quả
                        </p>
                        <p className="text-white/30 text-xs mt-1">
                          Thử tìm kiếm với từ khóa khác
                        </p>
                      </div>
                    ) : (
                      <div className="p-2 space-y-1">
                        {searchResults.map((episode) => (
                          <div
                            key={episode.id}
                            className="flex gap-3 p-2 hover:bg-white/5 rounded-lg transition-colors group">
                            <div className="relative shrink-0">
                              <div className="w-24 h-16 bg-linear-to-br from-gray-800 to-gray-900 rounded overflow-hidden">
                                {episode.thumbnailUrl ? (
                                  <img
                                    src={episode.thumbnailUrl}
                                    alt={episode.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Film size={20} className="text-white/20" />
                                  </div>
                                )}
                              </div>
                              {episode.durationMinutes && (
                                <div className="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-xs text-white">
                                  {episode.durationMinutes}m
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-white truncate">
                                  {episode.title}
                                </h4>
                              </div>
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleAddToPlaylist(episode.id, episode.title)
                                }
                                disabled={
                                  addingToPlaylist === episode.id ||
                                  episode.processingStatus !== "SUCCESS"
                                }
                                className="shrink-0 bg-primary hover:bg-primary/90 text-white h-8 px-3 text-xs disabled:opacity-50">
                                {addingToPlaylist === episode.id ? (
                                  <div className="flex items-center gap-1">
                                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                  </div>
                                ) : (
                                  "Thêm"
                                )}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Close button */}
                    <div className="border-t border-white/10 p-2">
                      <button
                        onClick={() => {
                          setShowSearchResults(false);
                          setSearchQuery("");
                        }}
                        className="w-full text-xs text-white/60 hover:text-white py-2 transition-colors">
                        Đóng
                      </button>
                    </div>
                  </div>
                )}
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
                    <ScrollArea
                      ref={scrollAreaRef}
                      className="flex-1 max-h-[74vh] p-4">
                      <div className="space-y-3">
                        {/* Loading indicator at top */}
                        {loadingMoreMessages && (
                          <div className="flex justify-center py-3">
                            <div className="flex items-center gap-2 text-white/60">
                              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                              <span className="text-sm">Đang tải...</span>
                            </div>
                          </div>
                        )}

                        {/* No more messages indicator */}
                        {!hasMoreMessages && messages.length > 0 && (
                          <div className="flex justify-center py-2">
                            <span className="text-xs text-white/30">
                              Đã tải hết tin nhắn
                            </span>
                          </div>
                        )}

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
                            const userId = messageUser?.id || messageUser?.id;
                            const messageTime = new Date(
                              message.sentAt
                            ).toLocaleTimeString("vi-VN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            });

                            // System message
                            if (message.type === TypeMessage.SYSTEM) {
                              return (
                                <div
                                  key={message.id}
                                  className="flex justify-center">
                                  <span className="text-xs text-white/40 text-center bg-white/5 px-3 py-1 rounded-full">
                                    {message.content}
                                  </span>
                                </div>
                              );
                            }

                            // Check if message is from current user
                            const isCurrentUser =
                              userId === currentUser?.id ||
                              userId === currentUser?.id;

                            // Current user's message - align right
                            if (isCurrentUser) {
                              return (
                                <div
                                  key={message.id}
                                  className="flex justify-end">
                                  <div className="flex flex-col items-end max-w-[75%]">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-xs text-white/40">
                                        {messageTime}
                                      </span>
                                      <span className="text-sm font-medium text-white">
                                        Bạn
                                      </span>
                                    </div>
                                    <div className="bg-primary/90 rounded-lg px-3 py-2">
                                      <p className="text-sm text-white">
                                        {message.content}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              );
                            }

                            // Other user's message - align left
                            return (
                              <div key={message.id} className="flex gap-2">
                                <Avatar className="w-8 h-8 shrink-0">
                                  <AvatarFallback className="bg-blue-500/20 text-blue-400 text-xs">
                                    {username.substring(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 max-w-[75%]">
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
                          ref={chatInputRef}
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
                                          {isOwner &&
                                            role !== "owner" &&
                                            memberUser?.id !==
                                              currentUser?.id && (
                                              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                  size="icon"
                                                  variant="ghost"
                                                  onClick={() => {
                                                    setSelectedMember(member);
                                                    setShowMemberMenu(true);
                                                  }}
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
                    <ScrollArea className="h-full">
                      <div className="py-2 w-full">
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
                          <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}>
                            <SortableContext
                              items={playlistItemIds}
                              strategy={verticalListSortingStrategy}>
                              <div className="pr-2 w-full">
                                {validPlaylistItems.map((item) => {
                                  const video =
                                    typeof item.video === "object" && item.video
                                      ? item.video
                                      : null;
                                  const addedBy =
                                    typeof item.addBy === "object" && item.addBy
                                      ? item.addBy
                                      : null;
                                  const itemId =
                                    (item as any).id || (item as any)._id;

                                  return (
                                    <SortablePlaylistItem
                                      key={itemId}
                                      id={itemId}
                                      video={video}
                                      addedBy={addedBy}
                                      canDelete={canControlPlaylist}
                                      canDrag={canControlPlaylist}
                                      onDelete={handleRemoveFromPlaylist}
                                      isDeleting={deletingItemId === itemId}
                                    />
                                  );
                                })}
                              </div>
                            </SortableContext>
                          </DndContext>
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

      {/* Member Management Dialog */}
      <Dialog open={showMemberMenu} onOpenChange={setShowMemberMenu}>
        <DialogContent className="sm:max-w-[425px] bg-[#0a0a0f] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">
              Quản lý thành viên
            </DialogTitle>
            <DialogDescription className="text-white/60">
              {selectedMember &&
              typeof selectedMember.user === "object" &&
              selectedMember.user
                ? `Hành động với ${selectedMember.user.username}`
                : "Chọn hành động"}
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
                  onClick={() =>
                    selectedMember &&
                    typeof selectedMember.user === "object" &&
                    selectedMember.user &&
                    handleChangeRole(selectedMember.user.id, "moderator")
                  }
                  disabled={
                    actionLoading || selectedMember?.role === "moderator"
                  }
                  className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/30 disabled:opacity-50">
                  <UserCog size={16} className="mr-2" />
                  Moderator
                </Button>
                <Button
                  onClick={() =>
                    selectedMember &&
                    typeof selectedMember.user === "object" &&
                    selectedMember.user &&
                    handleChangeRole(selectedMember.user.id, "member")
                  }
                  disabled={actionLoading || selectedMember?.role === "member"}
                  className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 disabled:opacity-50">
                  <User size={16} className="mr-2" />
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
                onClick={() =>
                  selectedMember &&
                  typeof selectedMember.user === "object" &&
                  selectedMember.user &&
                  handleKickUser(selectedMember.user.id)
                }
                disabled={actionLoading}
                className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 disabled:opacity-50">
                {actionLoading ? "Đang xử lý..." : "Kick khỏi phòng"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Force Disconnect Dialog */}
      <Dialog open={isForceDisconnected} onOpenChange={() => {}}>
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
              <p className="text-white text-sm">{disconnectReason}</p>
            </div>

            <div className="space-y-2">
              <p className="text-white/60 text-sm text-center">
                Tự động chuyển hướng trong{" "}
                <span className="text-primary font-bold text-lg">
                  {redirectCountdown}
                </span>{" "}
                giây...
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              onClick={() => {
                clearRoom();
                router.push("/watch-party");
              }}
              className="flex-1 bg-primary hover:bg-primary/90">
              Quay về ngay
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Overlay when force disconnected */}
      {isForceDisconnected && (
        <div className="fixed inset-0 bg-black/80 z-40 pointer-events-none" />
      )}
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
