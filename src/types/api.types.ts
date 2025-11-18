// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
  path?: string;
}

// Pagination Meta
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Movies API Response
export interface MoviesResponse {
  data: import('./movie.types').Movie[];
  meta: PaginationMeta;
}

// Find Movies Query DTO (matching backend)
export interface FindMoviesQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'draft' | 'published' | 'archived';
  contentType?: 'movie' | 'series';
  releaseYearFrom?: number;
  releaseYearTo?: number;
  durationMinutesFrom?: number;
  durationMinutesTo?: number;
  averageRatingFrom?: number;
  averageRatingTo?: number;
  totalRatingsFrom?: number;
  totalRatingsTo?: number;
  totalViewsFrom?: number;
  totalViewsTo?: number;
  genreIds?: string[];
  genreSlugs?: string[];
  countryIds?: string[];
  countrySlugs?: string[];
  actorIds?: string[];
  actorSlugs?: string[];
  directorIds?: string[];
  directorSlugs?: string[];
  sortBy?:
    | 'title'
    | 'releaseYear'
    | 'averageRating'
    | 'totalViews'
    | 'totalRatings'
    | 'durationMinutes'
    | 'createdAt'
    | 'updatedAt';
  sortOrder?: 'ASC' | 'DESC';
}

