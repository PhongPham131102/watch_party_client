import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  Alert,
  TextInput,
  Pressable,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";

import { useRoomStore } from "@/store/room.store";
import { roomSocketService } from "@/services/room-socket.service";
import { roomService } from "@/services/room.service";
import VideoRoomPlayer from "@/components/VideoRoomPlayer";

import RoomTabs from "@/components/room/RoomTabs";
import ChatTab from "@/components/room/ChatTab";
import PlaylistTab from "@/components/room/PlaylistTab";
import MembersTab from "@/components/room/MembersTab";
import SettingsTab from "@/components/room/SettingsTab";
import { useAuthStore } from "@/store/auth.store";
import Toast from "react-native-toast-message";
import { RoomType } from "@/types/room.types";

type TabType = "chat" | "playlist" | "members" | "settings";

export default function RoomDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const roomCode = id;

  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isAuthenticated, user } = useAuthStore();
  const {
    currentRoom,
    setRoomData,
    addMessage,
    addMember,
    removeMember,
    members,
    playlistItems,
    videoState,
    setVideoState,
    setCurrentRoom,
    setSettings,
    addPlaylistItem,
    removePlaylistItem,
    updatePlaylistItemPosition,
    setCurrentPlayingItem,
    updateMemberRole,
    clearRoom,
  } = useRoomStore();

  const [activeTab, setActiveTab] = useState<TabType>("chat");
  const [isChecking, setIsChecking] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [needsPassword, setNeedsPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [verifyingPassword, setVerifyingPassword] = useState(false);
  const [roomInfo, setRoomInfo] = useState<any>(null);

  // Get current playing item from playlist items
  const currentPlayingItemObj = useMemo(() => {
    if (!videoState?.current_playlist_id) return null;
    return playlistItems.find(
      (item) =>
        (item.id || (item as any)._id) === videoState.current_playlist_id
    );
  }, [videoState?.current_playlist_id, playlistItems]);

  const currentPlayingEpisode = useMemo(() => {
    const video = currentPlayingItemObj?.video;
    return typeof video === "string" ? null : video || null;
  }, [currentPlayingItemObj]);

  const hasNext = useMemo(() => {
    if (!currentPlayingItemObj || !playlistItems.length) return false;
    return playlistItems.some(
      (item) => item.position > currentPlayingItemObj.position
    );
  }, [currentPlayingItemObj, playlistItems]);

  const hasPrevious = useMemo(() => {
    if (!currentPlayingItemObj || !playlistItems.length) return false;
    return playlistItems.some(
      (item) => item.position < currentPlayingItemObj.position
    );
  }, [currentPlayingItemObj, playlistItems]);

  // Get user role from members list
  const userRole = useMemo(() => {
    if (!user || !members.length) return null;

    const currentUserId = typeof user === "string" ? user : user.id;
    const member = members.find((m) => {
      const memberUserId = typeof m.user === "string" ? m.user : m.user?.id;
      return memberUserId === currentUserId;
    });

    const role = member?.role || null;
    console.log("Current User Role Detection:", {
      currentUserId,
      memberFound: !!member,
      role,
    });
    return role;
  }, [user, members]);

  // Check room existence and type
  const checkRoom = useCallback(async () => {
    if (!roomCode) return;

    setIsChecking(true);
    setConnectError(null);

    try {
      const response = await roomService.checkRoom(roomCode);

      if (response.success && response.data) {
        const room = response.data;
        setRoomInfo(room);
        setCurrentRoom(room, room.isOwner);

        // Check if room is private
        if (room.type === RoomType.PRIVATE) {
          setNeedsPassword(true);
          setIsChecking(false);
        } else {
          // Public room, proceed to connect
          await connectToRoom(room);
        }
      } else {
        setConnectError("Không tìm thấy phòng với mã này");
        setIsChecking(false);
      }
    } catch (error: any) {
      console.error("Room check error:", error);
      setConnectError(error?.message || "Không thể kiểm tra phòng");
      setIsChecking(false);
    }
  }, [roomCode]);

  // Verify password for private room
  const verifyPassword = async () => {
    if (!password.trim() || !roomCode) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Vui lòng nhập mật khẩu",
      });
      return;
    }

    setVerifyingPassword(true);
    try {
      const response = await roomService.verifyRoomPassword(roomCode, password);

      if (response.data?.isAuthenticated) {
        // Password correct, proceed to connect
        setNeedsPassword(false);
        if (roomInfo) {
          await connectToRoom(roomInfo);
        } else {
          // This shouldn't happen, but as a fallback checkRoom again
          await checkRoom();
        }
      } else {
        Toast.show({
          type: "error",
          text1: "Lỗi",
          text2: "Mật khẩu không đúng",
        });
      }
    } catch (error: any) {
      console.error("Password verification error:", error);
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: error?.message || "Không thể xác thực mật khẩu",
      });
    } finally {
      setVerifyingPassword(false);
    }
  };

  // Connect to room via socket
  const connectToRoom = async (roomData?: any) => {
    if (!roomCode) return;

    // Ensure room is in store
    if (roomData) {
      setCurrentRoom(roomData, roomData.isOwner);
    } else if (roomInfo) {
      setCurrentRoom(roomInfo, roomInfo.isOwner);
    }

    setIsConnecting(true);
    setConnectError(null);

    try {
      const socket = await roomSocketService.connect();
      const response = await roomSocketService.joinRoom(roomCode);

      if (response.success) {
        setRoomData({
          messages: (response.lastestMessages || []).reverse(),
          members: response.members || [],
          playlistItems: response.playlistItems || [],
          settings: response.settings,
        });

        // Setup initial video state
        const currentState = response.currentState;
        if (currentState) {
          const now = Date.now();
          const latencySeconds = Math.max(
            0,
            (now - currentState.updated_at) / 1000
          );

          const correctedCurrentTime =
            currentState.is_playing === "playing"
              ? currentState.current_time + latencySeconds
              : currentState.current_time;

          setVideoState({
            ...currentState,
            current_time: correctedCurrentTime,
          });

          if (currentState.current_playlist_id) {
            const currentItem = (response.playlistItems || []).find(
              (item: any) =>
                (item.id || item._id) === currentState.current_playlist_id
            );
            setCurrentPlayingItem(currentItem || null);
          }
        }

        setIsChecking(false);
      } else {
        setConnectError("Không thể tham gia phòng");
      }
    } catch (error: any) {
      console.error("Room connection error:", error);
      setConnectError(error.message || "Không thể kết nối đến phòng");
    } finally {
      setIsConnecting(false);
    }
  };

  // Initial check
  useEffect(() => {
    if (!isAuthenticated) {
      Alert.alert("Yêu cầu đăng nhập", "Vui lòng đăng nhập để tham gia phòng", [
        { text: "Đăng nhập", onPress: () => router.push("/login") },
        { text: "Hủy", onPress: () => router.back() },
      ]);
      return;
    }

    checkRoom();

    return () => {
      if (roomCode) {
        roomSocketService.leaveRoom(roomCode);
      }
      clearRoom();
    };
  }, [roomCode, isAuthenticated, checkRoom, clearRoom, router]);

  // Video event handlers
  const handlePlay = useCallback(
    (data: { roomCode: string; currentTime: number }) => {
      roomSocketService.playOrPauseVideo({
        ...data,
        isplaying: true,
      });
    },
    []
  );

  const handlePause = useCallback(
    (data: { roomCode: string; currentTime: number }) => {
      roomSocketService.playOrPauseVideo({
        ...data,
        isplaying: false,
      });
    },
    []
  );

  const handleSeek = useCallback(
    (data: { roomCode: string; currentTime: number }) => {
      roomSocketService.seekVideo(data);
    },
    []
  );

  const handleNext = useCallback(() => {
    if (!roomCode) return;
    roomSocketService.nextVideo({ roomCode });
  }, [roomCode]);

  const handlePrevious = useCallback(() => {
    if (!roomCode) return;
    roomSocketService.previousVideo({ roomCode });
  }, [roomCode]);

  // Socket Listeners
  useEffect(() => {
    if (!roomCode) return;

    roomSocketService.onNewMessage((msg) => {
      addMessage(msg);
    });

    roomSocketService.onMemberAdded((member) => {
      addMember(member);
    });

    roomSocketService.onMemberRemoved((data) => {
      removeMember(data.userId);
    });

    roomSocketService.onRoomSettingsUpdated((settings) => {
      setSettings(settings);
    });

    // Listen for playlist updated (Website logic)
    roomSocketService.onPlaylistUpdated((data) => {
      const currentUserId = typeof user === "string" ? user : user?.id;

      const isOwnAction =
        (data.action === "add" && data.addedBy === currentUserId) ||
        (data.action === "remove" && data.removedBy === currentUserId) ||
        (data.action === "reorder" && data.reorderedBy === currentUserId);

      // Nếu là action của mình thì bỏ qua reorder (đã update optimistic rồi)
      if (isOwnAction && data.action === "reorder") {
        return;
      }

      if (data.action === "add") {
        addPlaylistItem(data.item);
      } else if (data.action === "remove") {
        const itemId = (data.item as any).id || (data.item as any)._id;
        if (itemId) removePlaylistItem(itemId);
      } else if (data.action === "reorder") {
        const itemId = (data.item as any).id || (data.item as any)._id;
        if (itemId) updatePlaylistItemPosition(itemId, data.item);
      }
    });

    // Listen for video changed (Website logic)
    roomSocketService.onVideoChanged((data) => {
      const currentPlaylist = useRoomStore.getState().playlistItems;
      const newPlayingItem = currentPlaylist.find((item) => {
        const itemId = item.id || (item as any)._id;
        return itemId === data.current_playlist_id;
      });

      const now = Date.now();
      const latencySeconds = Math.max(0, (now - data.updated_at) / 1000);

      const correctedCurrentTime =
        data.is_playing === "playing"
          ? data.current_time + latencySeconds
          : data.current_time;

      setVideoState({
        ...data,
        current_time: correctedCurrentTime,
      });

      setCurrentPlayingItem(newPlayingItem || null);
    });

    roomSocketService.onUserRoleChanged((data) => {
      updateMemberRole(data.userId, data.newRole);
      if (data.userId === (typeof user === "string" ? user : user?.id)) {
        Toast.show({
          type: "info",
          text1: "Thông báo",
          text2: `Quyền của bạn đã được thay đổi thành ${data.newRole}`,
        });
      }
    });

    roomSocketService.onUserKicked((data) => {
      if (data.userId === (typeof user === "string" ? user : user?.id)) {
        Toast.show({
          type: "error",
          text1: "Bị kick",
          text2: "Bạn đã bị kick khỏi phòng",
        });
        router.push("/watch-party");
      }
    });

    // Cleanup listeners
    return () => {
      roomSocketService.offNewMessage();
      roomSocketService.offMemberAdded();
      roomSocketService.offMemberRemoved();
      roomSocketService.offVideoChanged();
      roomSocketService.offRoomSettingsUpdated();
      roomSocketService.offPlaylistUpdated();
      roomSocketService.offUserRoleChanged();
      roomSocketService.offUserKicked();
    };
  }, [
    roomCode,
    addMessage,
    addMember,
    removeMember,
    setVideoState,
    setSettings,
    updateMemberRole,
    addPlaylistItem,
    removePlaylistItem,
    updatePlaylistItemPosition,
    setCurrentPlayingItem,
    user,
    router,
  ]);

  if (!roomCode) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Mã phòng không hợp lệ</Text>
      </View>
    );
  }

  // Show password dialog for private rooms
  if (needsPassword) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" backgroundColor="#0e0f14" />
        <Stack.Screen options={{ headerShown: false }} />

        <View
          style={[styles.passwordContainer, { paddingTop: insets.top + 40 }]}
        >
          <View style={styles.passwordCard}>
            <View style={styles.lockIcon}>
              <Ionicons name="lock-closed" size={48} color="#ef4444" />
            </View>

            <Text style={styles.passwordTitle}>Phòng riêng tư</Text>
            <Text style={styles.passwordSubtitle}>
              Phòng này yêu cầu mật khẩu để truy cập
            </Text>

            <View style={styles.passwordInputContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Nhập mật khẩu phòng..."
                placeholderTextColor="#6b7280"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!verifyingPassword}
                autoFocus
              />
            </View>

            <View style={styles.passwordButtons}>
              <Pressable
                style={[styles.passwordButton, styles.cancelButton]}
                onPress={() => router.back()}
                disabled={verifyingPassword}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </Pressable>

              <Pressable
                style={[
                  styles.passwordButton,
                  styles.verifyButton,
                  verifyingPassword && styles.verifyButtonDisabled,
                ]}
                onPress={verifyPassword}
                disabled={verifyingPassword}
              >
                {verifyingPassword ? (
                  <>
                    <ActivityIndicator size="small" color="#fff" />
                    <Text style={styles.verifyButtonText}>
                      Đang xác thực...
                    </Text>
                  </>
                ) : (
                  <Text style={styles.verifyButtonText}>Xác nhận</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="#000" />
      <Stack.Screen options={{ headerShown: false }} />

      {/* Video Area (Persistent at top) */}
      <View style={[styles.videoSection, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Ionicons
            name="arrow-back"
            size={24}
            color="white"
            onPress={() => router.back()}
            style={styles.backButton}
          />
          <Text style={styles.roomTitle} numberOfLines={1}>
            {currentRoom?.name || roomInfo?.name || `Phòng: ${roomCode}`}
          </Text>
        </View>

        <View style={styles.videoPlaceholder}>
          {currentPlayingEpisode ? (
            <VideoRoomPlayer
              episode={currentPlayingEpisode}
              roomCode={roomCode}
              userRole={userRole}
              isPlaying={videoState?.is_playing === "playing"}
              currentTime={videoState?.current_time || 0}
              updatedAt={videoState?.updated_at || 0}
              onPlay={handlePlay}
              onPause={handlePause}
              onSeek={handleSeek}
              onNextEpisode={handleNext}
              onPreviousEpisode={handlePrevious}
            />
          ) : (
            <View style={styles.noVideoContainer}>
              <Ionicons name="film-outline" size={64} color="#6b7280" />
              <Text style={styles.noVideoText}>
                Chưa có video nào trong playlist
              </Text>
              <Text style={styles.noVideoSubtext}>
                Thêm video để bắt đầu xem cùng nhau
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Connection Status Overlay */}
      {isChecking || isConnecting ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#ef4444" />
          <Text style={styles.loadingText}>
            {isChecking ? "Đang kiểm tra phòng..." : "Đang tham gia..."}
          </Text>
        </View>
      ) : connectError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{connectError}</Text>
          <Pressable onPress={checkRoom} style={styles.retryButton}>
            <Text style={styles.retryText}>Thử lại</Text>
          </Pressable>
        </View>
      ) : (
        <>
          {/* Tabs */}
          <RoomTabs activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Tab Content */}
          <View style={styles.contentArea}>
            {activeTab === "chat" && <ChatTab />}
            {activeTab === "playlist" && <PlaylistTab />}
            {activeTab === "members" && <MembersTab />}
            {activeTab === "settings" && (
              <SettingsTab
                isOwner={
                  userRole === "owner" ||
                  currentRoom?.ownerId ===
                    (typeof user === "string" ? user : user?.id)
                }
              />
            )}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0e0f14",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0e0f14",
  },
  passwordContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  passwordCard: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#1a1b20",
    borderRadius: 20,
    padding: 32,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
  },
  lockIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  passwordTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  passwordSubtitle: {
    color: "#9ca3af",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
  },
  passwordInputContainer: {
    width: "100%",
    marginBottom: 24,
  },
  passwordInput: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: "#fff",
    fontSize: 15,
  },
  passwordButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  passwordButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  verifyButton: {
    backgroundColor: "#ef4444",
    flexDirection: "row",
    gap: 8,
  },
  verifyButtonDisabled: {
    opacity: 0.6,
  },
  verifyButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  videoSection: {
    backgroundColor: "black",
    zIndex: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#000",
  },
  backButton: {
    marginRight: 16,
  },
  roomTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  videoPlaceholder: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#1f2937",
  },
  noVideoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1f2937",
  },
  noVideoText: {
    color: "#9ca3af",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 16,
  },
  noVideoSubtext: {
    color: "#6b7280",
    fontSize: 14,
    marginTop: 8,
  },
  contentArea: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(14,15,20, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20,
    marginTop: 250, // Push down below video area roughly
  },
  loadingText: {
    color: "white",
    marginTop: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "#ef4444",
    fontSize: 16,
    marginBottom: 10,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  retryButton: {
    marginTop: 8,
  },
  retryText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});
