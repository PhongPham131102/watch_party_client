"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Loader2, SlidersHorizontal } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import MovieCard from "@/src/components/MovieCard";
import MovieCardSkeleton from "@/src/components/MovieCardSkeleton";
import { useMovies } from "@/src/hooks/useMovies";

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

  const [page, setPage] = useState(1);
  const [selectedCountry, setSelectedCountry] = useState<string>(ALL_COUNTRY);
  const [selectedContentType, setSelectedContentType] = useState<
    "movie" | "series" | typeof ALL_CONTENT_TYPE
  >(ALL_CONTENT_TYPE);

  const { movies, total, isLoading, error } = useMovies({
    page,
    limit: PAGE_LIMIT,
    genreSlugs: slug ? [slug] : undefined,
    countrySlugs: selectedCountry !== ALL_COUNTRY ? [selectedCountry] : undefined,
    contentType: selectedContentType !== ALL_CONTENT_TYPE ? selectedContentType : undefined,
  });

  const totalPages = Math.ceil(total / PAGE_LIMIT);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const paginationPages = useMemo(() => {
    const pages: (number | string)[] = [];
    const delta = 1;

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (page <= 3) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = page - delta; i <= page + delta; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  }, [page, totalPages]);

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
          {total > 0 && (
            <p className="text-sm text-white/60">
              Có {total} phim trong thể loại này.
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
                onValueChange={(value) => {
                  setSelectedCountry(value);
                  setPage(1);
                }}>
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
                onValueChange={(value) => {
                  setSelectedContentType(
                    value as "movie" | "series" | typeof ALL_CONTENT_TYPE
                  );
                  setPage(1);
                }}>
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
          <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
            {Array.from({ length: 14 }).map((_, i) => (
              <MovieCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-red-200">
            {error}
          </div>
        ) : movies.length ? (
          <>
            <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
              {movies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-10">
                {/* Previous Button */}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="h-9 w-9 rounded-full border-white/10 hover:text-white bg-transparent text-white/80 transition-all hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {paginationPages.map((pageNum, index) => (
                    <div key={index}>
                      {pageNum === "..." ? (
                        <span className="flex h-9 w-9 items-center justify-center text-white/60">
                          ...
                        </span>
                      ) : (
                        <Button
                          variant={page === pageNum ? "default" : "outline"}
                          size="icon"
                          onClick={() => handlePageChange(pageNum as number)}
                          className={`h-9 w-9 rounded-full text-sm font-semibold transition-all ${page === pageNum
                            ? "bg-primary text-[#04130a] hover:bg-primary/90"
                            : "border-white/10 bg-white/5 text-white/80 hover:text-white hover:bg-white/10"
                            }`}
                        >
                          {pageNum}
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Next Button */}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className="h-9 w-9 rounded-full border-white/10 bg-transparent text-white/80 transition-all hover:text-white hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
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