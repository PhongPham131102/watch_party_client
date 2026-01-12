/* eslint-disable @typescript-eslint/no-explicit-any */
import { ScrollArea } from "@/components/ui/scroll-area";
import { ListVideo } from "lucide-react";
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
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortablePlaylistItem } from "./SortablePlaylistItem";

interface PlaylistItem {
  id?: string;
  _id?: string;
  video: any;
  addBy: any;
  position: number;
}

interface PlaylistTabProps {
  playlistItems: PlaylistItem[];
  playlistItemIds: string[];
  curentPlaylistItemId: string | null;
  canControlPlaylist: boolean;
  deletingItemId: string | null;
  onDragEnd: (event: DragEndEvent) => void;
  onRemoveFromPlaylist: (itemId: string) => void;
  onPlayItem: (itemId: string) => void;
}

export function PlaylistTab({
  curentPlaylistItemId,
  onPlayItem,
  playlistItems,
  playlistItemIds,
  canControlPlaylist,
  deletingItemId,
  onDragEnd,
  onRemoveFromPlaylist,
}: PlaylistTabProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <ScrollArea className="h-full max-h-[calc(100vh-200px)]">
      <div className="py-2 w-full">
        {playlistItems.length === 0 ? (
          <div className="text-center py-8">
            <ListVideo className="w-12 h-12 text-white/20 mx-auto mb-3" />
            <p className="text-white/40 text-sm">Playlist trống</p>
            <p className="text-white/30 text-xs mt-1">
              Thêm video để bắt đầu xem cùng nhau!
            </p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd}>
            <SortableContext
              items={playlistItemIds}
              strategy={verticalListSortingStrategy}>
              <div className="pr-2 w-full">
                {playlistItems.map((item) => {
                  const video =
                    typeof item.video === "object" && item.video
                      ? item.video
                      : null;
                  const addedBy =
                    typeof item.addBy === "object" && item.addBy
                      ? item.addBy
                      : null;
                  const itemId = item.id || item._id || "";

                  return (
                    <SortablePlaylistItem
                      currentPlaylistItemId={curentPlaylistItemId}
                      onClickPlay={onPlayItem}
                      key={itemId}
                      id={itemId}
                      video={video}
                      addedBy={addedBy}
                      canDelete={canControlPlaylist}
                      canDrag={canControlPlaylist}
                      onDelete={onRemoveFromPlaylist}
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
  );
}
