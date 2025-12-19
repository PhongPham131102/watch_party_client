"use client";
import HeroSection from "@/src/components/HeroSection";
import MovieSwiper from "@/src/components/MovieSwiper";
import TrendingMovies from "@/src/components/TrendingMovies";
import { useMovies } from "@/src/hooks/useMovies";

export default function Home() {
  const { movies, isLoading } = useMovies({ limit: 5 });

  return (
    <div className="min-h-screen bg-[#0e0f14]">
      {!isLoading && <HeroSection movies={movies} />}
      <TrendingMovies />
      <section className="space-y-10 py-8">
        <MovieSwiper
          title="Phim hành động"
          genreSlug="hanh-dong"
          autoFetch={true}
          className="mt-4"
        />
        <MovieSwiper
          title="Phim tội phạm"
          genreSlug="toi-pham"
          autoFetch={true}
        />

        <MovieSwiper
          title="Phim phiêu lưu"
          genreSlug="phieu-luu"
          autoFetch={true}
        />
        <MovieSwiper
          title="Phim miền tây"
          genreSlug="mien-tay"
          autoFetch={true}
        />
      </section>
    </div>
  );
}
