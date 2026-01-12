/* eslint-disable @typescript-eslint/no-explicit-any */
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RoomMemberRole } from "@/src/types/room-member.types";
import { roomService } from "@/src/services/room.service";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectTrigger,
  SelectValue,
  SelectItem,
} from "@/components/ui/select";
import { RoomType } from "@/src/types/room.types";

interface RoomSettings {
  type: string;
  max_users: number;
  max_video_in_playlist: number;
  max_video: number;
}

interface SettingsTabProps {
  settings: RoomSettings | null;
  isOwner: boolean;
  userRole: RoomMemberRole | null;
}

import React from "react";
import { roomSocketService } from "@/src/services/room-socket.service";
import { useRoomStore } from "@/src/store/room.store";

export function SettingsTab({ settings, isOwner }: SettingsTabProps) {
  const { currentRoom } = useRoomStore();
  const [form, setForm] = React.useState<RoomSettings | null>(settings);
  const [changed, setChanged] = React.useState(false);
  const [isloading, setIsLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [password, setPassword] = React.useState("");
  const prevType = React.useRef<string | null>(null);

  React.useEffect(() => {
    setForm(settings);
    setChanged(false);
    prevType.current = settings?.type || null;
    setShowPassword(false);
    setPassword("");
  }, [settings]);

  const handleChange = (key: keyof RoomSettings, value: any) => {
    if (!form) return;
    const newForm = { ...form, [key]: value };
    setForm(newForm);
    setChanged(JSON.stringify(newForm) !== JSON.stringify(settings));

    // Nếu chuyển từ public sang private lần đầu thì show ô nhập mật khẩu
    if (
      key === "type" &&
      value === RoomType.PRIVATE &&
      prevType.current === RoomType.PUBLIC
    ) {
      setShowPassword(true);
    } else if (key === "type" && value === RoomType.PUBLIC) {
      setShowPassword(false);
      setPassword("");
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentRoom?.code == null || form == null) return;
    setIsLoading(true);
    const payload: any = {
      type: form.type as RoomType,
      max_users: form.max_users,
      max_video_in_playlist: form.max_video_in_playlist,
      max_video: form.max_video,
    };
    if (showPassword && password) {
      payload.password = password;
    }
    roomSocketService.editRoomSettings(currentRoom.code, payload);

    setTimeout(() => {
      setIsLoading(false);
      setChanged(false);
      setShowPassword(false);
      setPassword("");
      prevType.current = form.type;
    }, 500);
  };

  return (
    <ScrollArea className="h-full m-4">
      <div className="space-y-6 px-1">
        <div>
          {form ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white/80 text-sm">Loại phòng</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) => handleChange("type", v)}
                  disabled={!isOwner}>
                  <SelectTrigger className="w-full bg-white/5 border border-white/20 text-white focus:ring-2 focus:ring-gray-500/60 focus:border-gray-500/60 rounded-md transition-colors duration-200 data-[state=open]:border-gray-500/60">
                    <SelectValue
                      placeholder="Chọn loại phòng"
                      className="text-white"
                    />
                  </SelectTrigger>
                  <SelectContent className="bg-[#181824] border border-white/10 text-white rounded-md shadow-lg">
                    <SelectGroup>
                      <SelectLabel className="text-xs text-white/40 px-2 py-1">
                        Chọn loại phòng
                      </SelectLabel>
                      <SelectItem
                        value={RoomType.PRIVATE}
                        className="data-[state=checked]:bg-gray-500 data-[state=checked]:text-white hover:bg-white/10 text-white/90 cursor-pointer px-3 py-2 rounded transition-colors focus:bg-gray-500 focus:text-white">
                        Riêng tư
                      </SelectItem>
                      <SelectItem
                        value={RoomType.PUBLIC}
                        className="data-[state=checked]:bg-gray-500 data-[state=checked]:text-white hover:bg-white/10 text-white/90 cursor-pointer px-3 py-2 rounded transition-colors focus:bg-gray-500 focus:text-white">
                        Công khai
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {showPassword && (
                  <div className="mt-2">
                    <Label className="text-white/80 text-sm">Mật khẩu phòng</Label>
                    <Input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="bg-white/5 border-white/10 text-white mt-1"
                      placeholder="Nhập mật khẩu cho phòng riêng tư"
                      autoFocus
                    />
                    <p className="text-xs text-white/40 mt-1">Chỉ hiển thị khi chuyển từ công khai sang riêng tư lần đầu.</p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-white/80 text-sm">
                  Số lượng người dùng tối đa
                </Label>
                <Input
                  type="number"
                  value={form.max_users}
                  onChange={(e) =>
                    handleChange("max_users", Number(e.target.value))
                  }
                  disabled={!isOwner}
                  className="bg-white/5 border-white/10 text-white disabled:opacity-50"
                />
                <p className="text-xs text-white/40">
                  Số lượng người dùng tối đa được phép trong phòng
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-white/80 text-sm">
                  Số lượng video tối đa trong danh sách phát
                </Label>
                <Input
                  type="number"
                  value={form.max_video_in_playlist}
                  onChange={(e) =>
                    handleChange(
                      "max_video_in_playlist",
                      Number(e.target.value)
                    )
                  }
                  disabled={!isOwner}
                  className="bg-white/5 border-white/10 text-white disabled:opacity-50"
                />
                <p className="text-xs text-white/40">
                  Số lượng video tối đa trong danh sách phát
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-white/80 text-sm">
                  Số lượng video tối đa mỗi người dùng
                </Label>
                <Input
                  type="number"
                  value={form.max_video}
                  onChange={(e) =>
                    handleChange("max_video", Number(e.target.value))
                  }
                  disabled={!isOwner}
                  className="bg-white/5 border-white/10 text-white disabled:opacity-50"
                />
                <p className="text-xs text-white/40">
                  Số lượng video tối đa mỗi người dùng có thể thêm
                </p>
              </div>

              {isOwner && (
                <Button
                  className="w-full bg-primary hover:bg-primary/90 mt-4"
                  onClick={handleSave}
                  disabled={!changed || isloading}>
                  Lưu thay đổi
                </Button>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-white/40 text-sm">Đang tải cài đặt...</p>
            </div>
          )}
        </div>
      </div>
    </ScrollArea>
  );
}
