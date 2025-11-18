// Movie types based on backend entity
export interface Movie {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  originalTitle: string | null;
  releaseYear: number | null;
  durationMinutes: number | null;
  posterUrl: string | null;
  backdropUrl: string | null;
  trailerUrl: string | null;
  averageRating: number;
  totalRatings: number;
  totalViews: number;
  status: string;
  contentType: string; // 'movie' | 'series'
  movieGenres?: Array<{ genre: { name: string } }>;
  movieDirectors?: Array<{ director: { name: string } }>;
  movieActors?: Array<{ actor: { name: string } }>;
  movieCountries?: Array<{ country: { name: string } }>;
  createdAt?: string;
  updatedAt?: string;
}

