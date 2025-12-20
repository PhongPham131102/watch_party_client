/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import { movieService } from "@/src/services/movie.service";
import type { Movie } from "@/src/types/movie.types";

interface FavoriteState {
    favorites: Movie[];
    isLoading: boolean;
    error: string | null;

    fetchFavorites: () => Promise<void>;
    toggleFavorite: (movie: Movie) => Promise<void>;
}

export const useFavoriteStore = create<FavoriteState>((set, get) => ({
    favorites: [],
    isLoading: false,
    error: null,

    fetchFavorites: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await movieService.getFavoriteMovies();
            if (response.success) {
                set({ favorites: response.data.data, isLoading: false });
            } else {
                set({ error: response.message, isLoading: false });
            }
        } catch (error: any) {
            set({
                error: error?.message || "Failed to fetch favorites",
                isLoading: false,
                favorites: []
            });
        }
    },

    toggleFavorite: async (movie: Movie) => {
        try {
            await movieService.toggleFavorite(movie.id);

            const isAlreadyFavorite = get().favorites.some(f => f.id === movie.id);

            if (isAlreadyFavorite) {
                set({
                    favorites: get().favorites.filter(f => f.id !== movie.id)
                });
            } else {
                set({
                    favorites: [...get().favorites, movie]
                });
            }
        } catch (error: any) {
            console.error("Error toggling favorite:", error);
        }
    }
}));
