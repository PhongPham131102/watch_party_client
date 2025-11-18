"use client";
import { useEffect } from "react";
import HeroSection from "@/src/components/HeroSection";
import MovieSwiper from "@/src/components/MovieSwiper";
import TrendingMovies from "@/src/components/TrendingMovies";
import { useMovieStore } from "@/src/store/movieStore";

export default function Home() {
  const { movies, fetchMovies } = useMovieStore();

  useEffect(() => {
    fetchMovies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-[#0e0f14]">
      <HeroSection movies={movies.slice(0, 5)} />
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
