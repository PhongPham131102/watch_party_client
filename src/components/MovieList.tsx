"use client";
import { Movie } from "@/src/types/movie.types";
import MovieCard from "./MovieCard";

interface MovieListProps {
  movies: Movie[];
  title?: string;
  className?: string;
}

export default function MovieList({
  movies,
  title,

  className = "",
}: MovieListProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Section Title */}
      {title && (
        <h2 className="text-xl font-semibold text-white md:text-2xl">
          {title}
        </h2>
      )}

      {/* Movie Cards Grid */}
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {movies.map((movie) => (
          <div
            key={movie.id}
            className="min-w-[150px] md:min-w-[200px] lg:min-w-[250px]">
            <MovieCard movie={movie} />
          </div>
        ))}
      </div>
    </div>
  );
}
