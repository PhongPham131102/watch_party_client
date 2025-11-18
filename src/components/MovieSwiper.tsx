"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Mousewheel } from "swiper/modules";
import { Movie } from "@/src/types/movie.types";
import MovieCard from "./MovieCard";
import "swiper/css";
import "swiper/css/free-mode";

interface MovieSwiperProps {
  movies: Movie[];
  title?: string;
  className?: string;
}

export default function MovieSwiper({
  movies,
  title,

  className = "",
}: MovieSwiperProps) {
  if (movies.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Section Title */}
      {title && (
        <h2 className="text-xl font-semibold text-white md:text-2xl lg:text-3xl">
          {title}
        </h2>
      )}

      {/* Swiper Container - Không giới hạn số lượng slides */}
      <Swiper
        modules={[FreeMode, Mousewheel]}
        freeMode={{
          enabled: true,
          sticky: false,
          momentum: true,
          momentumBounce: false,
        }}
        mousewheel={{
          forceToAxis: true,
          sensitivity: 1,
          releaseOnEdges: false,
        }}
        slidesPerView="auto"
        spaceBetween={16}
        grabCursor={true}
        watchSlidesProgress={true}
        className="movie-swiper overflow-visible!">
        {movies.map((movie) => (
          <SwiperSlide
            key={movie.id}
            className="!w-[150px]! md:!w-[200px]! lg:!w-[250px]!">
            <MovieCard movie={movie} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
