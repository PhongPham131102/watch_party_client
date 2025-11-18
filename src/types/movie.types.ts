// Genre, Director, Actor, Country types from API
export interface Genre {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface Director {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  biography?: string | null;
  profileImageUrl?: string | null;
  dateOfBirth?: string | null;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface Actor {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  biography?: string | null;
  profileImageUrl?: string | null;
  dateOfBirth?: string | null;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface Country {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

// Movie type based on backend API response (exact match)
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
  averageRating: string; // Backend trả về string
  totalRatings: number;
  totalViews: number;
  status: string;
  contentType: string; // 'movie' | 'series'
  genres: Genre[];
  directors: Director[];
  actors: Actor[];
  countries: Country[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

// Legacy format (for backward compatibility with mockMovies)
export interface MovieLegacy {
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
  contentType: string;
  movieGenres?: Array<{ genre: { name: string } }>;
  movieDirectors?: Array<{ director: { name: string } }>;
  movieActors?: Array<{ actor: { name: string } }>;
  movieCountries?: Array<{ country: { name: string } }>;
  createdAt?: string;
  updatedAt?: string;
}

