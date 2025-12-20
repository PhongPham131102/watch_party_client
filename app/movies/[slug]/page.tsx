"use client";

import { useEffect, useMemo, useState } from "react";

import { Clock, Play, Share2, Star, Heart, Check } from "lucide-react";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";

import MovieSwiper from "@/src/components/MovieSwiper";
import { useMovieDetailStore } from "@/src/store/movieDetailStore";
import { useMovieRecommendationsStore } from "@/src/store/movieRecommendationsStore";
import { useFavoriteStore } from "@/src/store/favoriteStore";
import { useAuthStore } from "@/src/store/auth.store";

const VideoPlayer = dynamic(() => import("@/src/components/VideoPlayer"), {
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
  const { isAuthenticated } = useAuthStore();

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
  }, [slug, fetchMovieDetail, fetchRecommendations, isAuthenticated, fetchFavorites]);

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
              className="rounded-full bg-white/10 px-6 py-2 text-sm font-semibold text-white transition hover:bg-white/20">
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
        <div className="w-full h-[610px]! flex">
          <div className="w-1/2 h-full px-16 py-20 text-white pt-40">
            <div className="space-y-6">
              <div className="space-y-4">
                <h1 className="text-5xl font-semibold leading-tight">
                  {movie.title}
                </h1>
              </div>

              <div className="flex flex-col gap-3 text-sm text-white/70">
                <div className="flex items-center gap-4 text-base font-medium">
                  <span className="flex items-center gap-1 text-yellow-400">
                    <Star size={18} fill="currentColor" />
                    {ratingValue ?? "?"}
                  </span>
                  <span className="rounded border border-white/10 px-2 py-0.5 text-xs text-white/80">
                    {movie.contentType?.toUpperCase() || "HD"}
                  </span>
                  <span>{movie.releaseYear ?? "Đang cập nhật"}</span>
                  <span className="flex items-center gap-1 text-white/80">
                    <Clock size={16} />
                    {runtimeLabel}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-white/60">
                  {[...countryLabels, ...genreLabels].map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-white/5 px-3 py-1">
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
                  {actorNames.length ? actorNames.join(", ") : "Đang cập nhật"}
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
                    className="text-sm font-semibold text-primary">
                    {showFullDescription ? "Thu gọn" : "Hiển thị thêm"}
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handlePlayClick}
                  className="cursor-pointer flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary/90">
                  <Play size={16} fill="currentColor" />
                  Chiếu phát
                </button>
                <button className="cursor-pointer flex items-center gap-2 rounded-full border border-white/10 px-6 py-3 text-sm font-semibold text-white/80 transition hover:border-white/40">
                  <Share2 size={16} />
                  Chia sẻ
                </button>
                {isAuthenticated && (
                  <button
                    onClick={() => movie && toggleFavorite(movie)}
                    className={`cursor-pointer flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-semibold transition ${isFavorite
                      ? "bg-primary border-primary text-white hover:bg-primary/90"
                      : "border-white/10 text-white/80 hover:border-white/40"
                      }`}>
                    {isFavorite ? (
                      <>
                        <Check size={16} />
                        Đã trong danh sách
                      </>
                    ) : (
                      <>
                        <Heart size={16} />
                        Danh sách của tôi
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
          <div
            className="w-1/2 h-full bg-no-repeat bg-cover"
            style={{ backgroundImage: `url('${heroImage}')` }}>
            <div
              className="h-full w-[300px] rounded-[1px] 
         bg-[linear-gradient(270deg,rgba(4,5,16,0)_0%,rgba(4,5,16,0.05)_16%,rgba(4,5,16,0.2)_30%,rgba(4,5,16,0.39)_43%,rgba(4,5,16,0.61)_55%,rgba(4,5,16,0.8)_68%,rgba(4,5,16,0.95)_82%,rgb(4,5,16)_98%)]"></div>
          </div>
        </div>
      )}

      {isPlaying && (
        <section className="px-6 py-16 md:px-12 lg:px-16">
          <div
            className={`grid gap-8 ${showEpisodeList ? "lg:grid-cols-[2fr,1fr]" : ""
              }`}>
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
                      <span key={tag} className="rounded-full bg-white/5 px-3 py-1">
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
                      className="text-sm font-semibold text-primary">
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
                        className={`w-full rounded-2xl border px-4 py-3 text-left transition ${isCurrent
                          ? "border-primary bg-primary/10 text-white"
                          : "border-white/10 bg-white/5 text-white/80 hover:border-white/40"
                          }`}>
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

      <section className="space-y-6 px-6 py-12 md:px-12 lg:px-16">
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
      </section>
    </div>
  );
}
