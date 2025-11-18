"use client";
import { Movie } from "@/src/types/movie.types";
import MovieSwiper from "./MovieSwiper";
import { groupMoviesByGenre } from "@/src/utils/movieUtils";

interface MovieSectionsProps {
  movies: Movie[];
  genres?: string[];
  onPlayClick?: (movie: Movie) => void;
  className?: string;
}

export default function MovieSections({
  movies,
  genres,
  onPlayClick,
  className = "",
}: MovieSectionsProps) {
  // Nếu không có genres được chỉ định, sử dụng 5 genres phổ biến
  const defaultGenres = [
    "Hành động",
    "Kỳ ảo",
    "Hài kịch",
    "Kinh dị",
    "Bí ẩn",
  ];

  const selectedGenres = genres || defaultGenres;
  const groupedMovies = groupMoviesByGenre(movies);

  return (
    <div className={`space-y-8 md:space-y-12 ${className}`}>
      {selectedGenres.map((genre) => {
        const genreMovies = groupedMovies[genre];
        if (!genreMovies || genreMovies.length === 0) {
          return null;
        }

        return (
          <MovieSwiper
            key={genre}
            movies={genreMovies}
            title={genre}
            quality="HD"
            showPlayButton={true}
            onPlayClick={onPlayClick}
          />
        );
      })}
    </div>
  );
}

