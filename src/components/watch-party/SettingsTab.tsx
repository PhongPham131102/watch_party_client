import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface RoomSettings {
  type: string;
  max_users: number;
  max_video_in_playlist: number;
  max_video: number;
}

interface SettingsTabProps {
  settings: RoomSettings | null;
  isOwner: boolean;
}

export function SettingsTab({ settings, isOwner }: SettingsTabProps) {
  return (
    <ScrollArea className="h-full p-4">
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-white mb-3">
            Room Settings
          </h3>
          {settings ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white/80 text-sm">Room Type</Label>
                <Input
                  type="text"
                  value={settings.type}
                  disabled
                  className="bg-white/5 border-white/10 text-white disabled:opacity-50 capitalize"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white/80 text-sm">Maximum Users</Label>
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
              <p className="text-white/40 text-sm">Loading settings...</p>
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
  );
}
