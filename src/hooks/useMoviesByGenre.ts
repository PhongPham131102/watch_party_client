import { useState, useEffect } from "react";
import { movieService } from "@/src/services/movieService";
import type { Movie } from "@/src/types/movie.types";
import type { FindMoviesQueryDto } from "@/src/types/api.types";

interface UseMoviesByGenreResult {
  movies: Movie[];
  isLoading: boolean;
  error: string | null;
}

export function useMoviesByGenre(
  genreSlug: string,
  options?: Partial<FindMoviesQueryDto>
): UseMoviesByGenreResult {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!genreSlug) {
      setMovies([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    const fetchMovies = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await movieService.getPublicMovies({
          genreSlugs: [genreSlug],
          limit: 20,
          sortBy: "createdAt",
          sortOrder: "DESC",
          ...options,
        });

        if (response.success && response.data) {
          setMovies(response.data.data);
        } else {
          setError(response.message || "Failed to fetch movies");
        }
      } catch (err: any) {
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "An error occurred while fetching movies"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovies();
  }, [genreSlug, JSON.stringify(options)]);

  return { movies, isLoading, error };
}

