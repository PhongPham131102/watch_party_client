"use client";
import Link from "next/link";
import { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import { Movie } from "@/src/types/movie.types";
import { useWatchHistoryStore } from "@/src/store/watchHistoryStore";

interface MovieCardProps {
  movie: Movie;
  quality?: "HD" | "CAM";
  showPlayButton?: boolean;
  progressSeconds?: number;
  totalSeconds?: number;
}

export default function MovieCard({ movie, progressSeconds: propProgress, totalSeconds: propTotal }: MovieCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const globalProgress = useWatchHistoryStore((state) => state.progressMap[movie.id]);

  const progressSeconds = propProgress !== undefined ? propProgress : globalProgress?.current;
  const totalSeconds = propTotal !== undefined ? propTotal : globalProgress?.total;

  const progressPercentage = (progressSeconds && totalSeconds)
    ? Math.min(Math.round((progressSeconds / totalSeconds) * 100), 100)
    : 0;

  const handlePlayClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return "";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <Link
      href={`/movies/${movie.slug}`}
      className="group relative block shrink-0 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}>
      <div className="relative aspect-2/3 w-full overflow-hidden rounded-md bg-gray-800">
        {/* Poster Image */}
        {movie.posterUrl || movie.backdropUrl ? (
          <Image
            src={movie.posterUrl || movie.backdropUrl || ""}
            alt={movie.title}
            fill
            sizes="(max-width: 768px) 150px, (max-width: 1024px) 200px, 250px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-gray-800 to-gray-900">
            <span className="text-white/50">No Image</span>
          </div>
        )}

        {/* Quality Badge */}
        <div className="absolute right-2 top-2 z-10">
          <span className="rounded bg-black/80 px-2 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
            HD
          </span>
        </div>

        {/* Play Button Overlay */}
        {isHovered && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-[2px] transition-all">
            <button
              onClick={handlePlayClick}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-black shadow-xl transition-all hover:bg-white hover:scale-110 active:scale-95">
              <Play size={24} fill="currentColor" className="ml-1" />
            </button>
          </div>
        )}

        {/* Gradient Overlay at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-linear-to-t from-black/80 to-transparent" />

        {/* Watch Progress Bar */}
        {progressPercentage > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-30">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        )}
      </div>

      {/* Movie Info */}
      <div className="mt-2 space-y-1">
        {/* Title */}
        <h3 className="line-clamp-1 text-sm font-medium text-white transition-colors group-hover:text-white/80">
          {movie.title}
        </h3>

        {/* Metadata */}
        <div className="flex items-center gap-2 text-xs text-white/60">
          {movie.releaseYear && (
            <>
              <span>{movie.releaseYear}</span>
              {movie.durationMinutes && <span>•</span>}
            </>
          )}
          {movie.durationMinutes && (
            <span>{formatDuration(movie.durationMinutes)}</span>
          )}
        </div>

        {/* Content Type Tag */}
        <div className="flex items-center gap-2">
          <span className="rounded bg-white/10 px-2 py-0.5 text-xs text-white/70">
            {movie.contentType === "series" ? "Series" : "Movie"}
          </span>
        </div>
      </div>
    </Link>
  );
}
