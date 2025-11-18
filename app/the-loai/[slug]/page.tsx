"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2, SlidersHorizontal } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MovieCard from "@/src/components/MovieCard";
import { useMovieStore } from "@/src/store/movieStore";

const PAGE_LIMIT = 21;

const ALL_COUNTRY = "all-country";
const ALL_CONTENT_TYPE = "all-content";

const COUNTRY_FILTERS = [
  { label: "Tất cả quốc gia", value: ALL_COUNTRY },
  { label: "Việt Nam", value: "viet-nam" },
  { label: "Hàn Quốc", value: "han-quoc" },
  { label: "Hoa Kỳ", value: "hoa-ky" },
  { label: "Trung Quốc", value: "trung-quoc" },
];

const CONTENT_TYPE_FILTERS: {
  label: string;
  value: "movie" | "series" | typeof ALL_CONTENT_TYPE;
}[] = [
  { label: "Tất cả", value: ALL_CONTENT_TYPE },
  { label: "Phim lẻ", value: "movie" },
  { label: "Phim bộ", value: "series" },
];

const GENRE_LABELS: Record<string, string> = {
  "hanh-dong": "Hành Động",
  "kinh-di": "Kinh Dị",
  "vien-tuong": "Viễn Tưởng",
  "lang-man": "Lãng Mạn",
  "hoat-hinh": "Hoạt Hình",
  "chinh-kich": "Chính Kịch",
};

export default function GenreListingPage() {
  const params = useParams();
  const slug = params?.slug as string | undefined;
  const readableGenre = useMemo(() => {
    if (!slug) return "Đang cập nhật";
    return GENRE_LABELS[slug] || slug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }, [slug]);

  const { movies, pagination, isLoading, error, fetchMovies, filters } =
    useMovieStore();

  const filtersRef = useRef(filters);
  const [selectedCountry, setSelectedCountry] = useState<string>(
    filters.countrySlugs?.[0] ?? ALL_COUNTRY
  );
  const [selectedContentType, setSelectedContentType] = useState<
    "movie" | "series" | typeof ALL_CONTENT_TYPE
  >(filters.contentType ?? ALL_CONTENT_TYPE);

  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  useEffect(() => {
    const fetch = async () => {
      if (!slug) return;

      const baseFilters = {
        ...filtersRef.current,
        page: 1,
        limit: PAGE_LIMIT,
        genreSlugs: [slug],
        countrySlugs:
          selectedCountry !== ALL_COUNTRY ? [selectedCountry] : undefined,
        contentType:
          selectedContentType !== ALL_CONTENT_TYPE
            ? selectedContentType
            : undefined,
      };

      await fetchMovies(baseFilters);
    };

    void fetch();
  }, [slug, selectedCountry, selectedContentType, fetchMovies]);

  const handlePageChange = (page: number) => {
    if (!pagination || !slug) return;
    if (page < 1 || page > pagination.totalPages) return;
    if (page === pagination.page) return;

    const baseFilters = {
      ...filtersRef.current,
      genreSlugs: [slug],
      page,
      limit: PAGE_LIMIT,
      countrySlugs:
        selectedCountry !== ALL_COUNTRY ? [selectedCountry] : undefined,
      contentType:
        selectedContentType !== ALL_CONTENT_TYPE
          ? selectedContentType
          : undefined,
    };

    void fetchMovies(baseFilters);
  };

  const paginationPages = useMemo(() => {
    if (!pagination) return [];
    const total = pagination.totalPages;
    const current = pagination.page;
    const delta = 2;
    let start = Math.max(1, current - delta);
    let end = Math.min(total, current + delta);

    if (current <= delta) {
      end = Math.min(total, end + (delta - current + 1));
    }
    if (total - current < delta) {
      start = Math.max(1, start - (delta - (total - current)));
    }

    const pages: number[] = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }, [pagination]);

  if (!slug) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#040510] text-white">
        Không xác định được thể loại.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#040510] px-6 py-12 text-white md:px-12 lg:px-16">
      <div className="mx-auto max-w-9xl space-y-6 mt-5">
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold md:text-4xl">
            {readableGenre}
          </h1>
          {pagination?.total ? (
            <p className="text-sm text-white/60">
              Có {pagination.total} phim trong thể loại này.
            </p>
          ) : (
            <p className="text-sm text-white/60">
              Đang hiển thị kết quả cho thể loại này.
            </p>
          )}
        </div>

        <section className="space-y-4 rounded-2xl border border-white/5 bg-white/4 p-4 backdrop-blur">
          <header className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.4em] text-white/50">
            <SlidersHorizontal size={18} />
            Bộ lọc
          </header>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
            <div className="flex-1 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
                Quốc gia
              </p>
              <Select
                value={selectedCountry}
                onValueChange={(value) => setSelectedCountry(value)}>
                <SelectTrigger className="h-11 rounded-lg border-white/10 bg-black/50">
                  <SelectValue placeholder="Tất cả quốc gia" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRY_FILTERS.map((country) => (
                    <SelectItem key={country.value} value={country.value}>
                      {country.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
                Loại nội dung
              </p>
              <Select
                value={selectedContentType}
                onValueChange={(value) =>
                  setSelectedContentType(
                    value as "movie" | "series" | typeof ALL_CONTENT_TYPE
                  )
                }>
                <SelectTrigger className="h-11 rounded-lg border-white/10 bg-black/50">
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  {CONTENT_TYPE_FILTERS.map((ct) => (
                    <SelectItem key={ct.value} value={ct.value}>
                      {ct.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {isLoading ? (
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
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-7">
              {movies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="flex flex-wrap items-center justify-center gap-3 pt-10">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/90 transition disabled:cursor-not-allowed disabled:opacity-40 hover:border-white/30">
                  Trang trước
                </button>
                <div className="flex flex-wrap items-center gap-2">
                  {paginationPages.map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`h-10 w-10 rounded-full text-sm font-semibold transition ${
                        pagination.page === page
                          ? "bg-[#1ed760] text-[#04130a]"
                          : "bg-white/5 text-white/80 hover:bg-white/10"
                      }`}>
                      {page}
                    </button>
                  ))}
                </div>
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
            Không có phim nào trong thể loại này. Quay lại sau nhé!
          </div>
        )}
      </div>
    </div>
  );
}
