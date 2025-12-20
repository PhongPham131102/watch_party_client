/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiClient } from "./api.service";
import type { Movie } from "@/src/types/movie.types";
import type { FindMoviesQueryDto, PaginationMeta } from "@/src/types/index";

// Response interface cho API getPublicMovies
export interface GetPublicMoviesResponse {
  success: boolean;
  message: string;
  data: {
    data: Movie[];
    meta: PaginationMeta;
  };
  timestamp?: string;
  path?: string;
}

export interface GetMovieDetailResponse {
  success: boolean;
  message: string;
  data: Movie;
  timestamp?: string;
  path?: string;
}

export interface GetRecommendationsResponse {
  success: boolean;
  message: string;
  data: {
    data: Movie[];
  };
  timestamp?: string;
  path?: string;
}

export class MovieService {
  /**
   * Lấy danh sách phim công khai với các filter và pagination
   * @param params - Các tham số query để filter và paginate
   * @returns Promise<GetPublicMoviesResponse>
   */
  async getPublicMovies(
    params: FindMoviesQueryDto = {}
  ): Promise<GetPublicMoviesResponse> {
    try {
      // Xây dựng query string từ params
      const queryParams = new URLSearchParams();

      // Thêm các tham số vào query string
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          // Xử lý array parameters (genreIds, genreSlugs, etc.)
          if (Array.isArray(value)) {
            value.forEach((item) => {
              queryParams.append(key, item.toString());
            });
          } else {
            queryParams.append(key, value.toString());
          }
        }
      });

      const queryString = queryParams.toString();
      const url = queryString
        ? `/movies/public?${queryString}`
        : "/movies/public";

      const response = await apiClient.get<GetPublicMoviesResponse>(url);
      return response;
    } catch (error: any) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error fetching public movies:", {
          message: error?.message,
          status: error?.status,
        });
      }
      throw error;
    }
  }

  async getMovieBySlug(slug: string): Promise<Movie> {
    try {
      const response = await apiClient.get<GetMovieDetailResponse>(
        `/movies/public/${slug}`
      );

      if (!response?.data) {
        throw new Error("Movie data is invalid");
      }

      return response.data;
    } catch (error: any) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error fetching movie detail:", {
          slug,
          message: error?.message,
          status: error?.status,
        });
      }
      throw error;
    }
  }

  async getRecommendations(slug: string, limit?: number): Promise<Movie[]> {
    try {
      const query = limit ? `?limit=${limit}` : "";
      const response = await apiClient.get<GetRecommendationsResponse>(
        `/movies/public/${slug}/recommendations${query}`
      );

      return response?.data?.data ?? [];
    } catch (error: any) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error fetching recommendations:", {
          slug,
          message: error?.message,
          status: error?.status,
        });
      }
      throw error;
    }
  }

  /**
   * Lấy danh sách phim yêu thích của người dùng
   * @returns Promise<GetPublicMoviesResponse>
   */
  async getFavoriteMovies(): Promise<GetPublicMoviesResponse> {
    try {
      const response = await apiClient.get<GetPublicMoviesResponse>("/user-favorites");
      return response;
    } catch (error: any) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error fetching favorite movies:", {
          message: error?.message,
        });
      }
      throw error;
    }
  }

  /**
   * Thêm/Xóa phim khỏi danh sách yêu thích
   * @param movieId - ID của phim
   * @returns Promise<any>
   */
  async toggleFavorite(movieId: string): Promise<any> {
    try {
      const response = await apiClient.post<any>("/user-favorites/toggle", { movieId });
      return response;
    } catch (error: any) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error toggling favorite status:", {
          movieId,
          message: error?.message,
        });
      }
      throw error;
    }
  }

  /**
   * Kiểm tra xem phim đã có trong danh sách yêu thích chưa
   * @param movieId - ID của phim
   * @returns Promise<{ isFavorite: boolean }>
   */
  async checkIsFavorite(movieId: string): Promise<{ isFavorite: boolean }> {
    try {
      const response = await apiClient.get<{ isFavorite: boolean }>(
        `/user-favorites/check/${movieId}`
      );
      // Backend return direct object, and apiClient might wrap it or return as is depending on interceptor
      // If it's standard response { success: true, data: { isFavorite: true } }
      // Then response will be { isFavorite: true } if interceptor returns response.data
      return (response as any).data || response;
    } catch (error: any) {
      return { isFavorite: false };
    }
  }
}

// Export instance để sử dụng
export const movieService = new MovieService();
