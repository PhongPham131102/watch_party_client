import { apiClient } from "./apiService";
import type { Movie } from "@/src/types/movie.types";
import type { FindMoviesQueryDto, PaginationMeta } from "@/src/types/api.types";

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
}

// Export instance để sử dụng
export const movieService = new MovieService();

