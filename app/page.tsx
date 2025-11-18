"use client";
import HeroSection from "@/src/components/HeroSection";
import MovieSwiper from "@/src/components/MovieSwiper";

import { mockMovies } from "@/src/data/mockMovies";

export default function Home() {
  return (
    <div className="min-h-screen bg-black">
      <HeroSection movies={mockMovies} />
      <div className="px-6 py-8 md:px-12 lg:px-16">
        <MovieSwiper movies={mockMovies} title="Phim mới" />
      </div>
    </div>
  );
}
