/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { GripVertical, Film, Play } from "lucide-react";

interface SortablePlaylistItemProps {
  id: string;
  video: any;
  addedBy: any;
  canDelete: boolean;
  canDrag: boolean;
  onDelete: (id: string, title: string) => void;
  isDeleting: boolean;
  onClickPlay: (playlistItemId: string) => void;
  currentPlaylistItemId: string | null;
}

export function SortablePlaylistItem({
  id,
  video,
  addedBy,
  canDelete,
  canDrag,
  onDelete,
  isDeleting,
  onClickPlay,
  currentPlaylistItemId,
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

  const isPlaying = id === currentPlaylistItemId;

  return (
    <div ref={setNodeRef} style={style} className="w-full px-2 my-2">
      <div
        className={`grid grid-cols-[20px_112px_1fr_40px] gap-2 py-2 bg-gray-800/50 hover:bg-gray-800/70 rounded-md group items-center ${
          isDragging ? "shadow-lg shadow-primary/20 ring-2 ring-primary/50" : ""
        }`}>
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
              <div
                className={`w-full h-full group-hover:opacity-100 transition-opacity relative`}
                {...(!isPlaying && {
                  onClick: () => onClickPlay(id),
                  style: { cursor: "pointer" },
                })}>
                <img
                  src={video.thumbnailUrl}
                  alt={video.title || "Video thumbnail"}
                  className="w-full h-full object-cover"
                />
                <div
                  className={`${
                    isPlaying && "hidden"
                  } absolute inset-0 flex items-center justify-center transition-opacity opacity-0 group-hover:opacity-100
                  `}>
                  <Play size={24} className={"text-white"} />
                </div>
                {isPlaying && (
                  <div className="flex space-x-1 absolute bottom-1/2 left-1/2 transform -translate-x-1/2 translate-y-1/2">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1 bg-gray-300 rounded-full animate-pulse"
                        style={{
                          height: "15px",
                          animationDelay: `${i * 0.15}s`,
                          animationDuration: "0.6s",
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
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
            Thêm bởi {addedBy?.username || "Unknown"}
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
