"use client";

import { useEffect, useMemo, useState } from "react";

import { Clock, Play, Share2, Star, Heart, Check } from "lucide-react";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { toast } from "sonner";

import MovieSwiper from "@/src/components/MovieSwiper";
import { useMovieDetailStore } from "@/src/store/movieDetailStore";
import { useMovieRecommendationsStore } from "@/src/store/movieRecommendationsStore";
import { useFavoriteStore } from "@/src/store/favoriteStore";
import { useAuthStore } from "@/src/store/auth.store";

const VideoPlayer = dynamic(() => import("@/src/components/VideoPlayer"), {
  ssr: false,
});

const MovieComments = dynamic(() => import("@/src/components/MovieComments"), {
  ssr: false,
});

export default function MovieDetailView() {
  const params = useParams();
  const slug = params?.slug as string;
  const { movie, isLoading, error, fetchMovieDetail } = useMovieDetailStore();
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [playerState, setPlayerState] = useState<{
    slug: string | null;
    isPlaying: boolean;
    episodeId: string | null;
  }>({
    slug: null,
    isPlaying: false,
    episodeId: null,
  });
  const {
    recommendations,
    isLoading: isRecommendationsLoading,
    error: recommendationsError,
    fetchRecommendations,
  } = useMovieRecommendationsStore();
  const { favorites, toggleFavorite, fetchFavorites } = useFavoriteStore();
  const { isAuthenticated, openAuthModal } = useAuthStore();

  const isFavorite = useMemo(() => {
    return favorites.some((f) => f.id === movie?.id);
  }, [favorites, movie?.id]);

  useEffect(() => {
    if (!slug) return;
    void fetchMovieDetail(slug);
    void fetchRecommendations(slug, 12);
    if (isAuthenticated) {
      void fetchFavorites();
    }
  }, [
    slug,
    fetchMovieDetail,
    fetchRecommendations,
    isAuthenticated,
    fetchFavorites,
  ]);

  // Update page title
  useEffect(() => {
    if (movie?.title) {
      document.title = `${movie.title} - Watch Party`;
    }
    return () => {
      document.title = "Watch Party";
    };
  }, [movie?.title]);

  const description =
    movie?.description || "Thông tin phim đang được cập nhật.";
  const isLongDescription = description.length > 240;
  const displayedDescription =
    showFullDescription || !isLongDescription
      ? description
      : `${description.slice(0, 240)}...`;

  const ratingValue = movie?.averageRating
    ? Number(Number(movie.averageRating).toFixed(1))
    : null;

  const runtimeLabel = useMemo(() => {
    if (!movie?.durationMinutes) return "Đang cập nhật";
    const hours = Math.floor(movie.durationMinutes / 60);
    const minutes = movie.durationMinutes % 60;
    if (!hours) return `${minutes} phút`;
    return `${hours} giờ ${minutes ? `${minutes} phút` : ""}`.trim();
  }, [movie?.durationMinutes]);

  const heroImage =
    movie?.backdropUrl || movie?.posterUrl || "/images/movie-fallback.jpg";

  const genreLabels = movie?.genres?.map((genre) => genre.name) || [];
  const countryLabels = movie?.countries?.map((country) => country.name) || [];
  const directorNames =
    movie?.directors?.map((director) => director.name) || [];
  const actorNames = movie?.actors?.map((actor) => actor.name) || [];

  const episodes = useMemo(() => movie?.episodes ?? [], [movie]);

  const isPlaying =
    playerState.slug === movie?.id && playerState.isPlaying === true;
  const activeEpisodeId = isPlaying ? playerState.episodeId : null;

  const currentEpisode = useMemo(() => {
    if (!episodes.length) return undefined;
    if (!activeEpisodeId) return episodes[0];
    return (
      episodes.find((episode) => episode.id === activeEpisodeId) || episodes[0]
    );
  }, [episodes, activeEpisodeId]);

  const streamUrl = useMemo(() => {
    if (!currentEpisode) return "";
    return (
      currentEpisode.masterM3u8Minio ||
      currentEpisode.masterM3u8S3 ||
      currentEpisode.qualitiesMinio?.[0]?.url ||
      currentEpisode.qualitiesS3?.[0]?.url ||
      ""
    );
  }, [currentEpisode]);

  const formatEpisodeDuration = (minutes?: number | null) => {
    if (!minutes) return "Đang cập nhật";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (!hours) return `${mins} phút`;
    return `${hours}h ${mins ? `${mins}m` : ""}`.trim();
  };

  const hasEpisodes = episodes.length > 0;
  const showEpisodeList = movie?.contentType === "series" && hasEpisodes;
  const hasStream = Boolean(streamUrl);

  const handlePlayClick = () => {
    if (!movie?.id) return;
    setPlayerState((prev) => ({
      slug: movie.id,
      isPlaying: true,
      episodeId:
        prev.slug === movie.id && prev.episodeId
          ? prev.episodeId
          : episodes[0]?.id ?? null,
    }));
  };

  const handleSelectEpisode = (episodeId: string) => {
    if (!movie?.id) return;
    setPlayerState({
      slug: movie.id,
      isPlaying: true,
      episodeId,
    });
  };

  const handleShare = async () => {
    if (!movie) return;
    const shareData = {
      title: movie.title,
      text: `Xem phim ${movie.title} tại Watch Party`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Đã sao chép liên kết vào bộ nhớ tạm");
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  if (isLoading || !movie) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#05060b] text-white">
        {error ? (
          <div className="space-y-4 text-center">
            <p className="text-lg text-white/80">
              Không thể tải thông tin phim.
            </p>
            <button
              onClick={() => slug && fetchMovieDetail(slug)}
              className="rounded-full bg-white/10 px-6 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              Thử lại
            </button>
          </div>
        ) : (
          <p className="text-lg text-white/70">Đang tải thông tin phim...</p>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#040510] text-white">
      {!isPlaying && (
        <div className="relative w-full flex flex-col lg:flex-row min-h-auto lg:h-[610px]">
          {/* Mobile Background Image (Absolute) - Visible only on mobile */}
          {/* Mobile Layout: Poster Top + Content Bottom */}
          <div className="lg:hidden w-full relative">
            {/* Image Container - Aspect Ratio 2/3 for poster feel */}
            <div className="aspect-2/3 w-full relative">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url('${heroImage}')` }}
              >
                {/* Top gradient for header visibility */}
                <div className="absolute inset-x-0 top-0 h-32 bg-linear-to-b from-black/80 to-transparent"></div>
                {/* Bottom gradient to merge with content */}
                <div className="absolute inset-x-0 bottom-0 h-64 bg-linear-to-t from-[#040510] via-[#040510]/90 to-transparent"></div>
              </div>
            </div>

            {/* Content Overlay - Pull up slightly to overlap gradient */}
            <div className="relative z-10 px-4 sm:px-8 -mt-32 pb-8">
              <h1 className="text-3xl font-bold leading-tight drop-shadow-xl text-center mb-4">
                {movie.title}
              </h1>

              {/* Meta info row */}
              <div className="flex flex-wrap items-center justify-center gap-3 text-sm font-medium text-white/90 mb-6">
                <span className="flex items-center gap-1 text-yellow-500">
                  <Star size={16} fill="currentColor" />
                  {ratingValue ?? "?"}
                </span>
                <span className="text-white/40">•</span>
                <span>{movie.releaseYear ?? "N/A"}</span>
                <span className="text-white/40">•</span>
                <span className="rounded border border-white/20 px-2 py-0.5 text-xs bg-white/10">
                  {movie.contentType?.toUpperCase() || "HD"}
                </span>
                <span className="text-white/40">•</span>
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  {runtimeLabel}
                </span>
              </div>

              {/* Action Buttons - Centered */}
              <div className="flex items-center justify-center gap-3 mb-6 w-full">
                <button
                  onClick={handlePlayClick}
                  className="flex-1 cursor-pointer flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-bold text-white shadow-lg shadow-primary/30 transition active:scale-95 whitespace-nowrap"
                >
                  <Play size={18} fill="currentColor" />
                  Xem Ngay
                </button>
                <button
                  onClick={() =>
                    isAuthenticated
                      ? movie && toggleFavorite(movie)
                      : openAuthModal("login")
                  }
                  className="flex-1 cursor-pointer flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-3 text-white backdrop-blur-sm active:scale-95 hover:bg-white/20 whitespace-nowrap"
                >
                  {isFavorite ? <Check size={18} /> : <Heart size={18} />}
                  <span className="text-sm font-bold">
                    {isFavorite ? "Đã lưu" : "Lưu lại"}
                  </span>
                </button>
                <button
                  onClick={handleShare}
                  className="cursor-pointer flex items-center justify-center rounded-full border border-white/20 bg-white/10 p-3 text-white backdrop-blur-sm active:scale-95 hover:bg-white/20"
                >
                  <Share2 size={20} />
                </button>
              </div>

              {/* Details */}
              <div className="space-y-4 text-sm text-white/80">
                <p
                  className="leading-relaxed line-clamp-3"
                  onClick={() => setShowFullDescription(!showFullDescription)}
                >
                  {displayedDescription}
                </p>

                <div className="pt-2 border-t border-white/10 space-y-2 text-xs text-white/60">
                  <p>
                    <span className="text-white/40">Thể loại:</span>{" "}
                    {genreLabels.join(", ")}
                  </p>
                  <p>
                    <span className="text-white/40">Diễn viên:</span>{" "}
                    {actorNames.slice(0, 3).join(", ")}...
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Content Section */}
          {/* Desktop Content Section (Hidden on Mobile) */}
          <div className="hidden lg:flex relative z-10 w-full lg:w-1/2 h-full px-4 sm:px-8 lg:px-16 py-12 lg:py-20 text-white pt-24 lg:pt-40 flex-col justify-center">
            <div className="space-y-6">
              <div className="space-y-4">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight drop-shadow-lg">
                  {movie.title}
                </h1>
              </div>

              <div className="flex flex-col gap-3 text-sm text-white/90 lg:text-white/70">
                <div className="flex flex-wrap items-center gap-3 lg:gap-4 text-sm lg:text-base font-medium">
                  <span className="flex items-center gap-1 text-yellow-400">
                    <Star size={18} fill="currentColor" />
                    {ratingValue ?? "?"}
                  </span>
                  <span className="rounded border border-white/20 lg:border-white/10 px-2 py-0.5 text-xs text-white">
                    {movie.contentType?.toUpperCase() || "HD"}
                  </span>
                  <span>{movie.releaseYear ?? "Đang cập nhật"}</span>
                  <span className="flex items-center gap-1 text-white/90 lg:text-white/80">
                    <Clock size={16} />
                    {runtimeLabel}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-white/80 lg:text-white/60">
                  {[...countryLabels, ...genreLabels].map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-white/10 lg:bg-white/5 px-3 py-1"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2 text-sm text-white/90 lg:text-white/80">
                <p>
                  <span className="text-white/70 lg:text-white/60">
                    Đạo diễn:{" "}
                  </span>
                  {directorNames.length
                    ? directorNames.join(", ")
                    : "Đang cập nhật"}
                </p>
                <p>
                  <span className="text-white/70 lg:text-white/60">
                    Diễn viên chính:{" "}
                  </span>
                  {actorNames.length ? actorNames.join(", ") : "Đang cập nhật"}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-white/90 lg:text-white/80 line-clamp-4 lg:line-clamp-none">
                  <span className="text-white/70 lg:text-white/60">
                    {" "}
                    Miêu tả:{" "}
                  </span>
                  {displayedDescription}
                </p>
                {isLongDescription && (
                  <button
                    onClick={() => setShowFullDescription((prev) => !prev)}
                    className="text-sm font-semibold text-primary hover:underline"
                  >
                    {showFullDescription ? "Thu gọn" : "Hiển thị thêm"}
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-3 pt-4 lg:pt-0">
                <button
                  onClick={handlePlayClick}
                  className="cursor-pointer flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary/90 hover:scale-105 active:scale-95 shadow-lg shadow-primary/20"
                >
                  <Play size={18} fill="currentColor" />
                  Xem ngay
                </button>
                <button
                  onClick={handleShare}
                  className="cursor-pointer flex items-center gap-2 rounded-full border border-white/20 bg-white/5 lg:bg-transparent px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10 hover:border-white/40"
                >
                  <Share2 size={18} />
                  Chia sẻ
                </button>
                <button
                  onClick={() =>
                    isAuthenticated
                      ? movie && toggleFavorite(movie)
                      : openAuthModal("login")
                  }
                  className={`cursor-pointer flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-semibold transition hover:scale-105 active:scale-95 ${
                    isFavorite
                      ? "bg-primary border-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20"
                      : "border-white/20 bg-white/5 lg:bg-transparent text-white hover:bg-white/10 hover:border-white/40"
                  }`}
                >
                  {isFavorite ? (
                    <>
                      <Check size={18} />
                      Đã lưu
                    </>
                  ) : (
                    <>
                      <Heart size={18} />
                      Lưu lại
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Desktop Image Section - Hidden on Mobile */}
          <div
            className="hidden lg:block w-1/2 h-full bg-no-repeat bg-cover bg-center relative"
            style={{ backgroundImage: `url('${heroImage}')` }}
          >
            <div
              className="absolute inset-0 w-full h-full 
         bg-[linear-gradient(270deg,rgba(4,5,16,0)_0%,rgba(4,5,16,0.05)_16%,rgba(4,5,16,0.2)_30%,rgba(4,5,16,0.39)_43%,rgba(4,5,16,0.61)_55%,rgba(4,5,16,0.8)_68%,rgba(4,5,16,0.95)_82%,rgb(4,5,16)_98%)]"
            ></div>
          </div>
        </div>
      )}
      {isPlaying && (
        <section className="px-4 py-8 md:px-12 lg:px-16 lg:py-16">
          <div
            className={`grid gap-8 ${
              showEpisodeList ? "lg:grid-cols-[2fr,1fr]" : ""
            }`}
          >
            <div className="space-y-6">
              <div className="">
                {hasStream ? (
                  <VideoPlayer
                    src={streamUrl}
                    videoId={currentEpisode?.id || movie.id}
                    movieId={movie.id}
                    episodeId={currentEpisode?.id}
                    className="h-[80vh]"
                  />
                ) : (
                  <div className="flex h-[420px] items-center justify-center text-white/60">
                    Nội dung đang được cập nhật.
                  </div>
                )}
              </div>

              <div className="space-y-4 p-6">
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs uppercase tracking-[0.4em] text-white/50">
                  <span>
                    {movie.contentType === "series" ? "Series" : "Phim lẻ"}
                  </span>
                  {currentEpisode && showEpisodeList && (
                    <span className="rounded-full bg-white/5 px-3 py-1 text-[11px] font-semibold normal-case tracking-normal text-white/70">
                      Tập {currentEpisode.episodeNumber}
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  <h2 className="text-3xl font-semibold md:text-4xl">
                    {movie.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-white/80">
                    <span className="flex items-center gap-1 text-yellow-500">
                      <Star size={18} fill="currentColor" />
                      {ratingValue ?? "?"}
                    </span>
                    <span className="rounded border border-white/10 px-2 py-0.5 text-xs">
                      {movie.releaseYear ?? "Đang cập nhật"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={16} />
                      {runtimeLabel}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-white/60">
                    {[...countryLabels, ...genreLabels].map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-white/5 px-3 py-1"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 text-sm text-white/80">
                  <p>
                    <span className="text-white/60">Đạo diễn: </span>
                    {directorNames.length
                      ? directorNames.join(", ")
                      : "Đang cập nhật"}
                  </p>
                  <p>
                    <span className="text-white/60">Diễn viên chính: </span>
                    {actorNames.length
                      ? actorNames.join(", ")
                      : "Đang cập nhật"}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-white/80">
                    <span className="text-white/60"> Miêu tả: </span>
                    {displayedDescription}
                  </p>
                  {isLongDescription && (
                    <button
                      onClick={() => setShowFullDescription((prev) => !prev)}
                      className="text-sm font-semibold text-primary"
                    >
                      {showFullDescription ? "Thu gọn" : "Hiển thị thêm"}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {showEpisodeList && (
              <div className="rounded-3xl border border-white/10 bg-black/40 p-4 shadow-2xl backdrop-blur">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.4em] text-white/50">
                      Danh sách tập
                    </p>
                    {currentEpisode && (
                      <p className="text-sm text-white/60">
                        Tập {currentEpisode.episodeNumber}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-white/50">
                    {episodes.length} tập
                  </span>
                </div>

                <div className="mt-4 max-h-[480px] space-y-2 overflow-y-auto pr-1">
                  {episodes.map((episode) => {
                    const isCurrent = currentEpisode?.id === episode.id;
                    return (
                      <button
                        key={episode.id}
                        onClick={() => handleSelectEpisode(episode.id)}
                        className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                          isCurrent
                            ? "border-primary bg-primary/10 text-white"
                            : "border-white/10 bg-white/5 text-white/80 hover:border-white/40"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold">
                              Tập {episode.episodeNumber}
                            </p>
                            <p className="text-xs text-white/60">
                              {episode.title}
                            </p>
                          </div>
                          <span className="text-xs text-white/60">
                            {formatEpisodeDuration(episode.durationMinutes)}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </section>
      )}
      <section className="space-y-6 px-4 py-8 md:px-12 lg:px-16 lg:py-12">
        <div>
          <h2 className="text-2xl font-semibold">Đề xuất cho bạn</h2>
          <div className="mt-2 h-1 w-24 rounded-full bg-primary" />
        </div>

        {isRecommendationsLoading ? (
          <p className="text-white/60">Đang tải đề xuất...</p>
        ) : recommendationsError ? (
          <p className="text-sm text-red-400">{recommendationsError}</p>
        ) : recommendations.length ? (
          <MovieSwiper movies={recommendations} />
        ) : (
          <p className="text-white/60">
            Chưa có đề xuất nào phù hợp cho phim này.
          </p>
        )}
      </section>{" "}
      <section className="w-full flex justify-center px-4 py-8 md:px-12 lg:px-16 lg:py-12">
        <div className="w-full max-w-4xl mx-auto">
          <MovieComments movieId={movie.id} />
        </div>
      </section>
    </div>
  );
}
