"use client";

import { useEffect } from "react";

import Image from "next/image";
import Link from "next/link";
import { Play, Share2, Bookmark, Clock } from "lucide-react";
import { useMovieDetailStore } from "@/src/store/movieDetailStore";
import { useParams } from "next/navigation";

export default function MovieDetailView() {
  const params = useParams();
  const slug = params.slug as string;
  const { movie, isLoading, error, fetchMovieDetail } = useMovieDetailStore();

  useEffect(() => {
    if (!slug) return;
    fetchMovieDetail(slug);
  }, [slug, fetchMovieDetail]);

  if (isLoading || !movie) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0e0f14] text-white">
        {error ? (
          <div className="text-center space-y-4">
            <p className="text-lg text-white/80">
              Không thể tải thông tin phim.
            </p>
            <button
              onClick={() => fetchMovieDetail(slug)}
              className="rounded-lg bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20">
              Thử lại
            </button>
          </div>
        ) : (
          <p className="text-lg text-white/80">Đang tải thông tin phim...</p>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0e0f14] pb-16 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 pt-12 lg:flex-row">
        <div className="flex-1 space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-emerald-400">
              <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-emerald-300">
                {movie.averageRating ? `★ ${movie.averageRating}` : "Mới"}
              </span>
              <span className="text-white/60">
                {movie.releaseYear ?? "Chưa rõ"} •{" "}
                {movie.durationMinutes
                  ? `${movie.durationMinutes} phút`
                  : "Đang cập nhật"}
              </span>
            </div>
            <h1 className="text-3xl font-extrabold leading-tight md:text-4xl">
              {movie.title}
            </h1>
            {movie.originalTitle && (
              <p className="text-lg text-white/70">{movie.originalTitle}</p>
            )}
            <div className="flex flex-wrap gap-2">
              {movie.genres?.map((genre) => (
                <span
                  key={genre.id}
                  className="rounded-full bg-white/5 px-3 py-1 text-xs text-white/80">
                  {genre.name}
                </span>
              ))}
            </div>
          </div>

          {movie.description && (
            <p className="text-base leading-relaxed text-white/80">
              {movie.description}
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            <button className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-6 py-3 text-sm font-semibold text-black transition hover:bg-emerald-400">
              <Play size={18} fill="currentColor" className="-ml-1" />
              Chiếu phát
            </button>
            <button className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-6 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/10">
              <Share2 size={16} />
              Chia sẻ
            </button>
            <button className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-6 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/10">
              <Bookmark size={16} />
              Sưu tập
            </button>
            {movie.durationMinutes && (
              <div className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-4 py-2 text-sm text-white/70">
                <Clock size={16} />
                {movie.durationMinutes} phút
              </div>
            )}
          </div>

          <div className="space-y-5 rounded-2xl border border-white/5 bg-white/5 p-5">
            <InfoRow label="Đạo diễn" values={movie.directors} />
            <InfoRow label="Diễn viên" values={movie.actors} />
            <InfoRow label="Quốc gia" values={movie.countries} />
          </div>

          {movie.trailerUrl && (
            <div className="rounded-3xl border border-white/5 bg-white/5 p-6">
              <h2 className="text-lg font-semibold">Trailer</h2>
              <p className="text-sm text-white/60">
                Xem trailer chính thức của {movie.title}
              </p>
              <Link
                href={movie.trailerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20">
                <Play size={16} fill="currentColor" className="-ml-1" />
                Xem trên YouTube
              </Link>
            </div>
          )}
        </div>

        <div className="relative w-full overflow-hidden rounded-4xl border border-white/5 bg-white/5 p-6 lg:w-[420px]">
          <div className="relative aspect-3/4 w-full overflow-hidden rounded-3xl">
            {movie.posterUrl || movie.backdropUrl ? (
              <Image
                src={movie.posterUrl || movie.backdropUrl || ""}
                alt={movie.title}
                fill
                className="object-cover"
                sizes="420px"
              />
            ) : (
              <div className="h-full w-full bg-zinc-900" />
            )}
            <div className="absolute inset-0 bg-linear-to-t from-[#0e0f14] via-black/20 to-transparent" />
          </div>
          <div className="mt-4 space-y-2 text-sm text-white/80">
            <p>
              Lượt xem:{" "}
              <span className="font-semibold text-white">
                {movie.totalViews?.toLocaleString() ?? 0}
              </span>
            </p>
            <p>
              Đánh giá:{" "}
              <span className="font-semibold text-white">
                ★ {movie.averageRating ?? "0.0"} / 10
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-6xl px-6">
        <section className="rounded-3xl border border-white/5 bg-white/5 p-6">
          <h2 className="text-lg font-semibold">Diễn viên nổi bật</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {movie.actors?.map((actor) => (
              <div
                key={actor.id}
                className="flex items-center gap-3 rounded-2xl bg-white/5 p-4">
                <div className="h-14 w-14 overflow-hidden rounded-xl bg-white/10">
                  {actor.profileImageUrl ? (
                    <Image
                      src={actor.profileImageUrl}
                      alt={actor.name}
                      width={56}
                      height={56}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-zinc-800" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold">{actor.name}</p>
                  {actor.biography && (
                    <p className="text-xs text-white/60 line-clamp-2">
                      {actor.biography}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  values,
}: {
  label: string;
  values?: Array<{ id: string; name: string }>;
}) {
  if (!values?.length) return null;

  return (
    <div className="space-y-2">
      <p className="text-sm uppercase tracking-wide text-white/50">{label}</p>
      <div className="flex flex-wrap gap-2">
        {values.map((item) => (
          <span
            key={item.id}
            className="rounded-full bg-white/10 px-3 py-1 text-sm text-white/90">
            {item.name}
          </span>
        ))}
      </div>
    </div>
  );
}
