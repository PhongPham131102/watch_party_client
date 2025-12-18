/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import { Room } from "../types/room.types";
import { roomService } from "../services/room.service";
import { RoomMessage } from "../types/room-message.types";
import { RoomMember } from "../types/room-member.types";
import { RoomPlaylist } from "../types/room-playlist.types";
import { IRoomSetting } from "../types/room-setting.types";
import { VideoChangedEvent } from "../types/room-playlist-event.types";

interface RoomState {
  currentRoom: Room | null;
  isOwner: boolean;
  loading: boolean;
  error: string | null;
  isVerified: boolean;
  showPasswordDialog: boolean;
  messages: RoomMessage[];
  hasMoreMessages: boolean;
  lastMessageId: string | null;
  members: RoomMember[];
  playlistItems: RoomPlaylist[];
  settings: IRoomSetting | null;
  videoState: VideoChangedEvent | null;

  currentPlayingItem: RoomPlaylist | null;
  setCurrentRoom: (room: Room | null, isOwner?: boolean) => void;
  fetchRoom: (slug: string) => Promise<void>;
  clearRoom: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setShowPasswordDialog: (show: boolean) => void;
  verifyPassword: (password: string) => Promise<void>;
  setRoomData: (data: {
    messages: RoomMessage[];
    members: RoomMember[];
    playlistItems: RoomPlaylist[];
    settings: IRoomSetting;
  }) => void;
  addMessage: (message: RoomMessage) => void;
  loadMoreMessages: () => Promise<void>;
  addMember: (member: RoomMember) => void;
  removeMember: (userId: string) => void;
  updateMemberRole: (userId: string, newRole: string) => void;
  addPlaylistItem: (item: RoomPlaylist) => void;
  removePlaylistItem: (itemId: string) => void;
  updatePlaylistItemPosition: (itemId: string, item: RoomPlaylist) => void;
  reorderPlaylistOptimistic: (oldIndex: number, newIndex: number) => void;
  setPlaylistItems: (items: RoomPlaylist[]) => void;
  setCurrentPlayingItem: (item: RoomPlaylist | null) => void;
  setVideoState: (videoState: VideoChangedEvent | null) => void;
}

export const useRoomStore = create<RoomState>((set, get) => ({
  currentRoom: null,
  isOwner: false,
  loading: false,
  error: null,
  isVerified: false,
  showPasswordDialog: false,
  messages: [],
  hasMoreMessages: true,
  lastMessageId: null,
  members: [],
  playlistItems: [],
  settings: null,
  currentPlayingItem: null,
  videoState: null,
  setVideoState: (videoState) => set({ videoState }),
  setCurrentPlayingItem: (item) => set({ currentPlayingItem: item }),

  setCurrentRoom: (room, isOwner = false) =>
    set({
      currentRoom: room,
      isOwner,
      error: null,
    }),

  fetchRoom: async (slug: string) => {
    set({ loading: true, error: null });
    try {
      const response = await roomService.checkRoom(slug);
      if (response.data) {
        const room = response.data;
        const isOwner = response.data.isOwner;

        // Logic kiểm tra quyền truy cập
        let isVerified = false;
        let showPasswordDialog = false;

        if (room.type === "public") {
          // Public room - cho vào luôn
          isVerified = true;
        } else if (room.type === "private") {
          // Private room
          if (isOwner) {
            // Chủ phòng - cho vào luôn
            isVerified = true;
          } else {
            // Không phải chủ phòng - yêu cầu mật khẩu
            isVerified = false;
            showPasswordDialog = true;
          }
        }

        set({
          currentRoom: room,
          isOwner,
          loading: false,
          error: null,
          isVerified,
          showPasswordDialog,
        });
      } else {
        set({
          currentRoom: null,
          isOwner: false,
          loading: false,
          error: "Không tìm thấy phòng",
          isVerified: false,
          showPasswordDialog: false,
        });
      }
    } catch (err: any) {
      set({
        currentRoom: null,
        isOwner: false,
        loading: false,
        error: err?.message || "Không thể tải thông tin phòng",
        isVerified: false,
        showPasswordDialog: false,
      });
      throw err;
    }
  },

  clearRoom: () =>
    set({
      currentRoom: null,
      isOwner: false,
      error: null,
      isVerified: false,
      showPasswordDialog: false,
      messages: [],
      hasMoreMessages: true,
      lastMessageId: null,
      members: [],
      playlistItems: [],
      settings: null,
      currentPlayingItem: null,
      loading: false,
    }),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  setShowPasswordDialog: (show) => set({ showPasswordDialog: show }),

  verifyPassword: async (password: string) => {
    const currentRoom = get().currentRoom;

    if (!currentRoom?.code) {
      throw new Error("Không tìm thấy mã phòng");
    }

    try {
      const response = await roomService.verifyRoomPassword(
        currentRoom.code,
        password
      );

      // Kiểm tra isAuthenticated từ response
      if (!response.data?.isAuthenticated) {
        throw new Error("Mật khẩu không đúng");
      }

      set({
        isVerified: true,
        showPasswordDialog: false,
      });
    } catch (err: any) {
      throw err;
    }
  },

  setRoomData: (data) => {
    const lastMsg = data.messages.length > 0 ? data.messages[0] : null;
    set({
      messages: data.messages,
      hasMoreMessages: data.messages.length >= 20,
      lastMessageId: lastMsg?.id || null,
      members: data.members,
      playlistItems: data.playlistItems,
      settings: data.settings,
    });
  },

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  loadMoreMessages: async () => {
    const { currentRoom, lastMessageId, hasMoreMessages } = get();

    if (!currentRoom?.code || !hasMoreMessages || !lastMessageId) {
      return;
    }

    try {
      const response = await roomService.getMessages(
        currentRoom.code,
        lastMessageId,
        20
      );

      if (response.success && response.data.length > 0) {
        // Prepend older messages to the beginning (vì backend trả về DESC)
        const olderMessages = response.data.reverse();
        set((state) => ({
          messages: [...olderMessages, ...state.messages],
          hasMoreMessages: response.pagination.hasMore,
          lastMessageId: response.pagination.lastMessageId,
        }));
      } else {
        set({ hasMoreMessages: false });
      }
    } catch (error) {
      console.error("Failed to load more messages:", error);
      throw error;
    }
  },

  addMember: (member) =>
    set((state) => {
      // Check if member already exists (avoid duplicate)
      const memberId =
        typeof member.user === "string" ? member.user : member.user?.id;
      const existingMember = state.members.find((m) => {
        const existingId = typeof m.user === "string" ? m.user : m.user?.id;
        return existingId === memberId;
      });

      if (existingMember) {
        console.log("Member already exists in list:", memberId);
        return state;
      }

      return {
        members: [...state.members, member],
      };
    }),

  removeMember: (userId) =>
    set((state) => ({
      members: state.members.filter((m) => {
        const memberId = typeof m.user === "string" ? m.user : m.user.id;
        return memberId !== userId;
      }),
    })),

  updateMemberRole: (userId, newRole) =>
    set((state) => ({
      members: state.members.map((m) => {
        const memberId = typeof m.user === "string" ? m.user : m.user.id;
        if (memberId === userId) {
          return { ...m, role: newRole as any };
        }
        return m;
      }),
    })),

  addPlaylistItem: (item) =>
    set((state) => {
      // Check if item already exists to avoid duplicates
      const itemId = (item as any).id || (item as any)._id;
      const exists = state.playlistItems.some((existingItem) => {
        const existingId =
          (existingItem as any).id || (existingItem as any)._id;
        return existingId === itemId;
      });

      if (exists) {
        return state;
      }

      return {
        playlistItems: [...state.playlistItems, item].sort(
          (a, b) => a.position - b.position
        ),
      };
    }),

  removePlaylistItem: (itemId) =>
    set((state) => ({
      playlistItems: state.playlistItems.filter((item) => {
        // Item có thể có id hoặc cần so sánh với item._id tùy backend
        const currentItemId = (item as any).id || (item as any)._id;
        return currentItemId !== itemId;
      }),
    })),

  updatePlaylistItemPosition: (itemId, updatedItem) =>
    set((state) => ({
      playlistItems: state.playlistItems
        .map((item) => {
          const currentItemId = (item as any).id || (item as any)._id;
          return currentItemId === itemId ? updatedItem : item;
        })
        .sort((a, b) => a.position - b.position),
    })),

  // Optimistic reorder without waiting for server
  reorderPlaylistOptimistic: (oldIndex, newIndex) =>
    set((state) => {
      const items = [...state.playlistItems];
      const [movedItem] = items.splice(oldIndex, 1);
      items.splice(newIndex, 0, movedItem);
      return { playlistItems: items };
    }),

  // Set playlist items (for rollback or server updates)
  setPlaylistItems: (items) => set({ playlistItems: items }),
}));
