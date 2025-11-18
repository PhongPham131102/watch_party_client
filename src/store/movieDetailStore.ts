import { create } from "zustand";
import type { Movie } from "@/src/types/movie.types";
import { movieService } from "@/src/services/movieService";

interface MovieDetailState {
  movie: Movie | null;
  isLoading: boolean;
  error: string | null;
  fetchMovieDetail: (slug: string) => Promise<void>;
  reset: () => void;
}

export const useMovieDetailStore = create<MovieDetailState>((set) => ({
  movie: null,
  isLoading: false,
  error: null,

  fetchMovieDetail: async (slug: string) => {
    set({ isLoading: true, error: null });
    try {
      const movie = await movieService.getMovieBySlug(slug);
      set({ movie, isLoading: false, error: null });
    } catch (error: any) {
      set({
        movie: null,
        isLoading: false,
        error:
          error?.response?.data?.message ||
          error?.message ||
          "Không thể tải thông tin phim",
      });
    }
  },

  reset: () => {
    set({ movie: null, isLoading: false, error: null });
  },
}));


