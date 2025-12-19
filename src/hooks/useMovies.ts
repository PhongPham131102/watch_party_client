import { useQuery } from "@tanstack/react-query";
import { movieService } from "@/src/services/movie.service";
import type { Movie, FindMoviesQueryDto } from "@/src/types/movie.types";

interface UseMoviesResult {
    movies: Movie[];
    isLoading: boolean;
    error: string | null;
    total: number;
}

export function useMovies(
    options?: Partial<FindMoviesQueryDto>
): UseMoviesResult {
    const query = useQuery({
        queryKey: ["movies", options],
        queryFn: async () => {
            return await movieService.getPublicMovies({
                page: 1,
                limit: 20,
                sortBy: "createdAt",
                sortOrder: "DESC",
                ...options,
            });
        },
    });

    const response = query.data;

    return {
        movies: response?.success && response.data ? response.data.data : [],
        isLoading: query.isLoading,
        error: query.isError ? (query.error as any)?.message || "Failed to fetch movies" : null,
        total: response?.success && response.data ? response.data.meta.total : 0,
    };
}
