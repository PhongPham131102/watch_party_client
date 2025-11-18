import { Movie } from "@/src/types/movie.types";

/**
 * Lấy danh sách tất cả genres từ movies
 */
export function getAllGenres(movies: Movie[]): string[] {
  const genreSet = new Set<string>();
  movies.forEach((movie) => {
    movie.movieGenres?.forEach((mg) => {
      if (mg.genre?.name) {
        genreSet.add(mg.genre.name);
      }
    });
  });
  return Array.from(genreSet);
}

/**
 * Lọc movies theo genre
 */
export function getMoviesByGenre(movies: Movie[], genreName: string): Movie[] {
  return movies.filter((movie) =>
    movie.movieGenres?.some((mg) => mg.genre?.name === genreName)
  );
}

/**
 * Group movies theo genre
 */
export function groupMoviesByGenre(movies: Movie[]): Record<string, Movie[]> {
  const grouped: Record<string, Movie[]> = {};
  movies.forEach((movie) => {
    movie.movieGenres?.forEach((mg) => {
      const genreName = mg.genre?.name;
      if (genreName) {
        if (!grouped[genreName]) {
          grouped[genreName] = [];
        }
        // Tránh duplicate
        if (!grouped[genreName].some((m) => m.id === movie.id)) {
          grouped[genreName].push(movie);
        }
      }
    });
  });
  return grouped;
}

