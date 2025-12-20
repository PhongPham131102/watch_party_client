"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useMoviesByGenre } from "@/src/hooks/useMoviesByGenre";
import { useDominantColor } from "@/src/hooks/useDominantColor";
import type { Movie } from "@/src/types/movie.types";
import { Play } from "lucide-react";

interface TrendingMoviesProps {
  title?: string;
  genreSlug?: string;
  limit?: number;
}

function TrendingCard({ movie, rank }: { movie: Movie; rank: number }) {
  const dominantColor = useDominantColor(movie.posterUrl);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      href={`/movies/${movie.slug}`}
      className="group relative flex aspect-2/3 flex-col overflow-hidden rounded-2xl bg-zinc-900 shadow-xl transition hover:-translate-y-1 hover:shadow-2xl cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}>
      <div className="absolute right-2 top-2 z-10">
        <span className="rounded bg-black/80 px-2 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
          HD
        </span>
      </div>
      <div className="relative h-full w-full overflow-hidden rounded-2xl">
        {movie.posterUrl ? (
          <Image
            src={movie.posterUrl}
            alt={movie.title}
            fill
            className={`object-cover transition-transform duration-300 ${isHovered ? "scale-105" : "scale-100"
              }`}
            sizes="(max-width: 768px) 200px, (max-width: 1024px) 220px, 240px"
          />
        ) : (
          <div className="h-full w-full bg-zinc-800" />
        )}
        {isHovered && (
          <div className="cursor-pointer absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-[2px] transition-all">
            <button className="cursor-pointer flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-black shadow-xl transition-all hover:bg-white hover:scale-110 active:scale-95">
              <Play size={24} fill="currentColor" className="ml-1" />
            </button>
          </div>
        )}
        <div
          className="absolute inset-x-0 bottom-0 h-1/3"
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0) 0%, ${dominantColor}C0 60%, #000000EE 100%)`,
          }}
        />
      </div>
      <div className="absolute inset-x-0 bottom-0 z-30 flex h-28 flex-col justify-end gap-1 p-4 text-white">
        <p className="text-2xl font-bold uppercase tracking-wide drop-shadow-lg">
          TOP {rank}
        </p>
        <p className="text-sm font-semibold  line-clamp-2 truncate">
          {movie.title}
        </p>
      </div>
    </Link>
  );
}

import TrendingCardSkeleton from "./MovieCardSkeleton"; // Fallback to MovieCardSkeleton
import MovieSwiperSkeleton from "./MovieSwiperSkeleton";

export default function TrendingMovies({
  title = "Top Phim Thịnh Hành",
  genreSlug = "hanh-dong",
  limit = 10,
}: TrendingMoviesProps) {
  const { movies, isLoading } = useMoviesByGenre(genreSlug, {
    limit,
    sortBy: "totalViews",
    sortOrder: "DESC",
  });

  if (isLoading) {
    return <MovieSwiperSkeleton />;
  }

  if (movies.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4 px-6  pt-8 md:px-12 lg:px-16">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white md:text-3xl">{title}</h2>

      </div>

      <Carousel
        opts={{
          align: "start",
          loop: movies.length > 4,
        }}
        className="w-full">
        <CarouselContent className="-ml-3 md:-ml-4">
          {movies.map((movie, index) => (
            <CarouselItem
              key={movie.id}
              className="pl-3 md:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/7">
              <TrendingCard movie={movie} rank={index + 1} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex" />
        <CarouselNext className="hidden md:flex" />
      </Carousel>
    </section>
  );
}
