import { useQuery } from "@tanstack/react-query";
import { movieService } from "@/src/services/movie.service";
import type { Movie, FindMoviesQueryDto } from "@/src/types/movie.types";

interface UseMoviesByGenreResult {
  movies: Movie[];
  isLoading: boolean;
  error: string | null;
}

export function useMoviesByGenre(
  genreSlug: string,
  options?: Partial<FindMoviesQueryDto>
): UseMoviesByGenreResult {
  const query = useQuery({
    queryKey: ["movies", "genre", genreSlug, options],
    queryFn: async () => {
      return await movieService.getPublicMovies({
        genreSlugs: [genreSlug],
        limit: 20,
        sortBy: "createdAt",
        sortOrder: "DESC",
        ...options,
      });
    },
    enabled: !!genreSlug,
  });

  const response = query.data;

  return {
    movies: response?.success && response.data ? response.data.data : [],
    isLoading: query.isLoading,
    error: query.isError ? (query.error as any)?.message || "Failed to fetch movies" : null,
  };
}

