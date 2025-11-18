"use client";

import { useEffect, useMemo, useState } from "react";

import { Clock, Play, Share2, Star } from "lucide-react";
import { useParams } from "next/navigation";

import MovieSwiper from "@/src/components/MovieSwiper";
import { useMovieDetailStore } from "@/src/store/movieDetailStore";
import { useMovieRecommendationsStore } from "@/src/store/movieRecommendationsStore";

export default function MovieDetailView() {
  const params = useParams();
  const slug = params?.slug as string;
  const { movie, isLoading, error, fetchMovieDetail } = useMovieDetailStore();
  const [showFullDescription, setShowFullDescription] = useState(false);
  const {
    recommendations,
    isLoading: isRecommendationsLoading,
    error: recommendationsError,
    fetchRecommendations,
  } = useMovieRecommendationsStore();

  useEffect(() => {
    if (!slug) return;
    void fetchMovieDetail(slug);
    void fetchRecommendations(slug, 12);
  }, [slug, fetchMovieDetail, fetchRecommendations]);

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
    <div className="min-h-screen w-full bg-[#040510] ">
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
                <span className="flex items-center gap-1 text-[#0cb05c]">
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
                  className="text-sm font-semibold text-[#39c98e]">
                  {showFullDescription ? "Thu gọn" : "Hiển thị thêm"}
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              <button className="cursor-pointer flex items-center gap-2 rounded-full bg-[#0cb05c] px-6 py-3 text-sm font-semibold text-[#02100a] transition hover:bg-[#0fd472]">
                <Play size={16} />
                Chiếu phát
              </button>
              <button className="cursor-pointer flex items-center gap-2 rounded-full border border-white/10 px-6 py-3 text-sm font-semibold text-white/80 transition hover:border-white/40">
                <Share2 size={16} />
                Chia sẻ
              </button>
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

      <section className="px-6 md:px-12 lg:px-16 py-12 text-white space-y-6">
        <div>
          <h2 className="text-2xl font-semibold">Đề xuất cho bạn</h2>
          <div className="mt-2 h-1 w-24 rounded-full bg-[#1ed760]" />
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
