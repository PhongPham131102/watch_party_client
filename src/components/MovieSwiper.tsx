"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Movie } from "@/src/types/movie.types";
import MovieCard from "./MovieCard";
import { useMoviesByGenre } from "@/src/hooks/useMoviesByGenre";

interface MovieSwiperProps {
  movies?: Movie[];
  title?: string;
  className?: string;
  genreSlug?: string; // Slug của thể loại để filter
  autoFetch?: boolean; // Tự động fetch nếu có genreSlug
}

export default function MovieSwiper({
  movies: propMovies,
  title,
  className = "",
  genreSlug,
  autoFetch = false,
}: MovieSwiperProps) {
  // Fetch movies theo genre nếu có genreSlug và autoFetch = true
  const { movies: genreMovies } = useMoviesByGenre(
    autoFetch && genreSlug ? genreSlug : "",
    {}
  );

  // Sử dụng movies từ props hoặc từ genre hook
  const movies = propMovies || genreMovies;

  if (!movies.length) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Section Title */}
      {title && (
        <h2 className="text-xl font-semibold text-white md:text-2xl lg:text-3xl px-6 md:px-12 lg:px-16">
          {title}
        </h2>
      )}

      {/* Carousel Container - tối đa 7 phim cùng lúc */}
      <div className="px-6 md:px-12 lg:px-16">
        <Carousel
          opts={{
            align: "start",
            loop: movies.length > 7,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {movies.map((movie) => (
              <CarouselItem
                key={movie.id}
                className="pl-2 md:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6 2xl:basis-[14.285%]"
              >
                <MovieCard movie={movie} />
              </CarouselItem>
            ))}
          </CarouselContent>

          <CarouselPrevious className="hidden lg:flex" />
          <CarouselNext className="hidden lg:flex" />
        </Carousel>
      </div>
    </div>
  );
}
