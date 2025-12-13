import { create } from "zustand";

import type { Movie } from "@/src/types/movie.types";
import { movieService } from "@/src/services/movie.service";

interface MovieRecommendationsState {
  recommendations: Movie[];
  isLoading: boolean;
  error: string | null;
  fetchRecommendations: (slug: string, limit?: number) => Promise<void>;
  reset: () => void;
}

export const useMovieRecommendationsStore =
  create<MovieRecommendationsState>((set) => ({
    recommendations: [],
    isLoading: false,
    error: null,

    fetchRecommendations: async (slug: string, limit?: number) => {
      if (!slug) return;
      set({ isLoading: true, error: null });
      try {
        const data = await movieService.getRecommendations(slug, limit);
        set({ recommendations: data, isLoading: false });
      } catch (error: any) {
        set({
          recommendations: [],
          isLoading: false,
          error:
            error?.response?.data?.message ||
            error?.message ||
            "Không thể tải đề xuất phim",
        });
      }
    },

    reset: () => {
      set({ recommendations: [], isLoading: false, error: null });
    },
  }));

