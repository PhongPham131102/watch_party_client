"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Search as SearchIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import MovieCard from "@/src/components/MovieCard";
import { useMovieStore } from "@/src/store/movieStore";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryParam = searchParams.get("q")?.trim() || "";
  const [localQuery, setLocalQuery] = useState(queryParam);

  const { movies, pagination, isLoading, error, fetchMovies, filters } =
    useMovieStore();

  const filtersRef = useRef(filters);

  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  useEffect(() => {
    setLocalQuery(queryParam);

    const fetch = async () => {
      if (!queryParam) return;

      const baseFilters = {
        ...filtersRef.current,
        page: 1,
        search: queryParam,
      };

      await fetchMovies(baseFilters);
    };

    void fetch();
  }, [queryParam, fetchMovies]);

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = localQuery.trim();
    if (!trimmed) return;
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  const handlePageChange = (page: number) => {
    if (!pagination) return;
    if (page < 1 || page > pagination.totalPages) return;
    if (page === pagination.page) return;

    const baseFilters = {
      ...filtersRef.current,
      search: queryParam,
      page,
    };

    void fetchMovies(baseFilters);
  };

  const resultSummary = useMemo(() => {
    if (!queryParam) return "";
    if (isLoading) return `Đang tìm kiếm “${queryParam}”...`;
    if (error) return `Không thể tìm “${queryParam}”`;
    if (!movies.length) return `Không tìm thấy kết quả cho “${queryParam}”`;
    if (pagination) {
      return `Tìm thấy ${pagination.total} kết quả cho “${queryParam}”`;
    }
    return "";
  }, [queryParam, isLoading, error, movies.length, pagination]);

  return (
    <div className="min-h-screen bg-[#040510] px-6 py-12 text-white md:px-12 lg:px-16">
      <div className="mx-auto max-w-6xl space-y-10 mt-5">
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.4em] text-white/40">
              Tìm kiếm
            </p>
          </div>

          <form
            onSubmit={handleSearchSubmit}
            className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <SearchIcon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/60" />
              <Input
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
                placeholder="Nhập tên phim, diễn viên, thể loại..."
                className="w-full border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-base text-white placeholder:text-white/50 focus:border-white/30 focus:bg-white/10 focus-visible:ring-0"
              />
            </div>
            <button
              type="submit"
              className="rounded-md bg-[#1ed760] px-6 py-3 text-sm font-semibold text-[#06210f] transition hover:bg-[#20f072]">
              Tìm kiếm
            </button>
          </form>

          {resultSummary && (
            <p className="text-sm text-white/60">{resultSummary}</p>
          )}
        </div>

        {!queryParam ? (
          <div className="rounded-xl border border-white/5 bg-black/20 p-10 text-center text-white/60">
            <p>
              Nhập từ khóa vào ô tìm kiếm phía trên để khám phá hàng nghìn phim
              hấp dẫn.
            </p>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-20 text-white/70">
            <Loader2 className="mr-3 h-6 w-6 animate-spin" />
            Đang tải kết quả...
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-red-200">
            {error}
          </div>
        ) : movies.length ? (
          <>
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {movies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 pt-8">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/90 transition disabled:cursor-not-allowed disabled:opacity-40 hover:border-white/30">
                  Trang trước
                </button>
                <span className="text-sm text-white/70">
                  Trang {pagination.page} / {pagination.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/90 transition disabled:cursor-not-allowed disabled:opacity-40 hover:border-white/30">
                  Trang sau
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-xl border border-white/5 bg-black/20 p-10 text-center text-white/60">
            Không có phim nào phù hợp với từ khóa trên. Thử từ khác nhé!
          </div>
        )}
      </div>
    </div>
  );
}
