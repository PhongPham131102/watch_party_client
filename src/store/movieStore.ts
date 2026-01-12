/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import { movieService } from "@/src/services/movie.service";
import type { Movie } from "@/src/types/movie.types";
import type { FindMoviesQueryDto } from "@/src/types/movie.types";
import type { PaginationMeta } from "@/src/types/api.types";

// State interface
interface MovieState {
  // Data
  movies: Movie[];
  pagination: PaginationMeta | null;

  // Loading & Error
  isLoading: boolean;
  error: string | null;

  // Filters
  filters: FindMoviesQueryDto;

  // Actions
  fetchMovies: (params?: FindMoviesQueryDto) => Promise<void>;
  setFilters: (filters: Partial<FindMoviesQueryDto>) => void;
  resetFilters: () => void;
  updateFilters: (filters: Partial<FindMoviesQueryDto>) => void;
  reset: () => void;
}

// Initial filters
const initialFilters: FindMoviesQueryDto = {
  page: 1,
  limit: 20,
  sortBy: "createdAt",
  sortOrder: "DESC",
};

// Initial state
const initialState = {
  movies: [],
  pagination: null,
  isLoading: false,
  error: null,
  filters: initialFilters,
};

// Create store
export const useMovieStore = create<MovieState>((set, get) => ({
  ...initialState,

  // Fetch movies với filters hiện tại hoặc params mới
  fetchMovies: async (params?: FindMoviesQueryDto) => {
    set({ isLoading: true, error: null });

    try {
      // Sử dụng params mới nếu có, nếu không dùng filters hiện tại
      const filtersToUse = params || get().filters;

      const response = await movieService.getPublicMovies(filtersToUse);

      if (response.success && response.data) {
        set({
          movies: response.data.data,
          pagination: response.data.meta,
          isLoading: false,
          error: null,
          filters: params ? { ...get().filters, ...params } : get().filters,
        });
      } else {
        set({
          isLoading: false,
          error: response.message || "Failed to fetch movies",
        });
      }
    } catch (error: any) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error in fetchMovies:", error);
      }
      set({
        isLoading: false,
        error:
          error?.response?.data?.message ||
          error?.message ||
          "An error occurred while fetching movies",
        movies: [],
        pagination: null,
      });
    }
  },

  // Set filters mới (thay thế toàn bộ)
  setFilters: (filters: Partial<FindMoviesQueryDto>) => {
    set({
      filters: { ...initialFilters, ...filters },
    });
  },

  // Reset filters về mặc định
  resetFilters: () => {
    set({
      filters: { ...initialFilters },
    });
  },

  // Update filters (merge với filters hiện tại)
  updateFilters: (filters: Partial<FindMoviesQueryDto>) => {
    set({
      filters: { ...get().filters, ...filters },
    });
  },

  // Reset toàn bộ state
  reset: () => {
    set(initialState);
  },
}));
