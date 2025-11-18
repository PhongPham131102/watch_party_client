"use client";
import HeroSection from "@/src/components/HeroSection";
import MovieSections from "@/src/components/MovieSections";
import { mockMovies } from "@/src/data/mockMovies";

export default function Home() {
  const handlePlayClick = (movie: { id: string; title: string }) => {
    console.log("Play movie:", movie.title);
    // TODO: Implement play functionality
  };

  return (
    <div className="min-h-screen bg-black">
      <HeroSection movies={mockMovies} />
      <div className="px-6 py-8 md:px-12 lg:px-16">
        <MovieSections movies={mockMovies} onPlayClick={handlePlayClick} />
      </div>
    </div>
  );
}
