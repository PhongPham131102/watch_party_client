"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Loader2, Search as SearchIcon, SlidersHorizontal } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MovieCard from "@/src/components/MovieCard";
import { useMovies } from "@/src/hooks/useMovies";
import { Button } from "@/components/ui/button";

const PAGE_LIMIT = 21;

const ALL_COUNTRY = "all-country";
const ALL_GENRE = "all-genre";
const ALL_CONTENT_TYPE = "all-content";

const COUNTRY_FILTERS = [
  { label: "Tất cả quốc gia", value: ALL_COUNTRY },
  { label: "Việt Nam", value: "viet-nam" },
  { label: "Hàn Quốc", value: "han-quoc" },
  { label: "Hoa Kỳ", value: "hoa-ky" },
  { label: "Trung Quốc", value: "trung-quoc" },
];

const GENRE_FILTERS = [
  { label: "Tất cả thể loại", value: ALL_GENRE },
  { label: "Kinh Dị", value: "kinh-di" },
  { label: "Hành Động", value: "hanh-dong" },
  { label: "Lãng Mạn", value: "lang-man" },
  { label: "Hoạt Hình", value: "hoat-hinh" },
];

const CONTENT_TYPE_FILTERS: {
  label: string;
  value: "movie" | "series" | typeof ALL_CONTENT_TYPE;
}[] = [
    { label: "Tất cả", value: ALL_CONTENT_TYPE },
    { label: "Phim lẻ", value: "movie" },
    { label: "Phim bộ", value: "series" },
  ];

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryParam = searchParams.get("q")?.trim() || "";
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [page, setPage] = useState(1);
  const [selectedCountry, setSelectedCountry] = useState<string>(ALL_COUNTRY);
  const [selectedGenre, setSelectedGenre] = useState<string>(ALL_GENRE);
  const [selectedContentType, setSelectedContentType] = useState<
    "movie" | "series" | typeof ALL_CONTENT_TYPE
  >(ALL_CONTENT_TYPE);

  const { movies, total, isLoading, error } = useMovies({
    page,
    limit: PAGE_LIMIT,
    search: queryParam,
    countrySlugs: selectedCountry !== ALL_COUNTRY ? [selectedCountry] : undefined,
    genreSlugs: selectedGenre !== ALL_GENRE ? [selectedGenre] : undefined,
    contentType: selectedContentType !== ALL_CONTENT_TYPE ? selectedContentType : undefined,
  });

  const totalPages = Math.ceil(total / PAGE_LIMIT);

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const value = searchInputRef.current?.value ?? "";
    const trimmed = value.trim();
    if (!trimmed) return;
    setPage(1);
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resultSummary = useMemo(() => {
    if (!queryParam) return "";
    if (isLoading) return `Đang tìm kiếm “${queryParam}”...`;
    if (error) return `Không thể tìm “${queryParam}”`;
    if (!movies.length) return `Không tìm thấy kết quả cho “${queryParam}”`;
    return `Tìm thấy ${total} kết quả cho “${queryParam}”`;
  }, [queryParam, isLoading, error, movies.length, total]);

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

  return (
    <div className="min-h-screen bg-[#040510] px-6 py-12 text-white md:px-12 lg:px-16">
      <div className="mx-auto max-w-9xl space-y-6 mt-5">
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
                key={queryParam}
                ref={searchInputRef}
                defaultValue={queryParam}
                placeholder="Nhập tên phim, diễn viên, thể loại..."
                className="w-full border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-base text-white placeholder:text-white/50 focus:border-white/30 focus:bg-white/10 focus-visible:ring-0"
              />
            </div>
            <button
              type="submit"
              className="rounded-md bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary/90">
              Tìm kiếm
            </button>
          </form>

          {resultSummary && (
            <p className="text-sm text-white/60">{resultSummary}</p>
          )}
        </div>

        <section className=" rounded-2xl border border-white/5 bg-white/4 px-3 py-2 backdrop-blur">
          <header className="flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.4em] text-white/50">
            <SlidersHorizontal size={18} />
            Bộ lọc
          </header>

          <div className="flex flex-col gap-2 lg:flex-row lg:items-end">
            <div className="flex-1 space-y-2">
              <Select
                value={selectedCountry}
                onValueChange={(value: string) => {
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
              <Select
                value={selectedGenre}
                onValueChange={(value: string) => {
                  setSelectedGenre(value);
                  setPage(1);
                }}>
                <SelectTrigger className="h-11 rounded-lg border-white/10 bg-black/50">
                  <SelectValue placeholder="Tất cả thể loại" />
                </SelectTrigger>
                <SelectContent>
                  {GENRE_FILTERS.map((genre) => (
                    <SelectItem key={genre.value} value={genre.value}>
                      {genre.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 space-y-2">
              <Select
                value={selectedContentType}
                onValueChange={(value: string) => {
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
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-7">
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
            Không có phim nào phù hợp với từ khóa trên. Thử từ khác nhé!
          </div>
        )}
      </div>
    </div>
  );
}
