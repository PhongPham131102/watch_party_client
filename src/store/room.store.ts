/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import { Room } from "../types/room.types";
import { roomService } from "../services/room.service";
import { RoomMessage } from "../types/room-message.types";
import { RoomMember } from "../types/room-member.types";
import { RoomPlaylist } from "../types/room-playlist.types";
import { IRoomSetting } from "../types/room-setting.types";

interface RoomState {
  currentRoom: Room | null;
  isOwner: boolean;
  loading: boolean;
  error: string | null;
  isVerified: boolean;
  showPasswordDialog: boolean;
  messages: RoomMessage[];
  members: RoomMember[];
  playlistItems: RoomPlaylist[];
  settings: IRoomSetting | null;

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
  addMember: (member: RoomMember) => void;
  removeMember: (userId: string) => void;
  addPlaylistItem: (item: RoomPlaylist) => void;
  removePlaylistItem: (videoId: string) => void;
}

export const useRoomStore = create<RoomState>((set, get) => ({
  currentRoom: null,
  isOwner: false,
  loading: false,
  error: null,
  isVerified: false,
  showPasswordDialog: false,
  messages: [],
  members: [],
  playlistItems: [],
  settings: null,

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
      members: [],
      playlistItems: [],
      settings: null,
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

  setRoomData: (data) =>
    set({
      messages: data.messages,
      members: data.members,
      playlistItems: data.playlistItems,
      settings: data.settings,
    }),

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  addMember: (member) =>
    set((state) => ({
      members: [...state.members, member],
    })),

  removeMember: (userId) =>
    set((state) => ({
      members: state.members.filter((m) => {
        const memberId = typeof m.user === "string" ? m.user : m.user.id;
        return memberId !== userId;
      }),
    })),

  addPlaylistItem: (item) =>
    set((state) => ({
      playlistItems: [...state.playlistItems, item],
    })),

  removePlaylistItem: (videoId) =>
    set((state) => ({
      playlistItems: state.playlistItems.filter((item) => {
        const itemVideoId =
          typeof item.video === "string" ? item.video : item.video.id;
        return itemVideoId !== videoId;
      }),
    })),
}));
