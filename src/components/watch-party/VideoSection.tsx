/* eslint-disable @next/next/no-img-element */
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Film } from "lucide-react";
import { Episode } from "@/src/types/episode.types";
import VideoRoomPlayer from "../VideoRoomPlayer";

interface VideoSectionProps {
  searchQuery: string;
  episode: Episode | null;
  onSearchChange: (value: string) => void;
  onSearchFocus: () => void;
  showSearchResults: boolean;
  searchLoading: boolean;
  searchResults: Episode[];
  addingToPlaylist: string | null;
  onAddToPlaylist: (episodeId: string, episodeTitle: string) => void;
  onCloseSearch: () => void;
}

export function VideoSection({
  episode,
  searchQuery,
  onSearchChange,
  onSearchFocus,
  showSearchResults,
  searchLoading,
  searchResults,
  addingToPlaylist,
  onAddToPlaylist,
  onCloseSearch,
}: VideoSectionProps) {
  return (
    <div className="flex flex-col h-full gap-2 p-1">
      {/* Search Bar */}
      <div className="bg-white/5 shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <Input
            type="text"
            placeholder="Tìm kiếm phim, video..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={onSearchFocus}
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
                            onAddToPlaylist(episode.id, episode.title)
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
                  onClick={onCloseSearch}
                  className="w-full text-xs text-white/60 hover:text-white py-2 transition-colors">
                  Đóng
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Video Player */}
      <div className="bg-black overflow-hidden border border-white/10 flex-1 min-h-0 rounded-sm">
        {/* <div className="rounded-sm h-full flex items-center justify-center bg-linear-to-br from-gray-900 to-black">
          <div className="text-center">
            <Film className="w-16 h-16 text-white/20 mx-auto mb-3" />
            <p className="text-white/60 text-base">
              You&apos;re not watching anything!
            </p>
            <p className="text-white/40 text-xs mt-1">
              Pick something to watch above.
            </p>
          </div>
        </div> */}

        <div className="w-full h-full">
          {episode && (
            <VideoRoomPlayer
              episode={episode!}
              isPlaying={true}
              onPause={() => { }}
              onPlay={() => { }}
              onSeek={() => { }}
              updatedAt={0}
              currentTime={0}
            />
          )}
        </div>
      </div>
    </div>
  );
}
