import { apiClient } from "./api.service";
import {
    WatchHistoryResponse,
    WatchProgressResponse,
    UpdateWatchProgressDto
} from "../types/watch-history.types";

export class WatchHistoryService {
    /**
     * Cập nhật tiến độ xem phim
     */
    async updateProgress(dto: UpdateWatchProgressDto): Promise<void> {
        try {
            await apiClient.post("/watch-history/progress", dto);
        } catch (error) {
            console.error("Error updating watch progress:", error);
        }
    }

    /**
     * Lấy danh sách lịch sử xem phim
     */
    async getMyHistory(page = 1, limit = 10): Promise<WatchHistoryResponse> {
        try {
            return await apiClient.get<WatchHistoryResponse>("/watch-history", { page, limit });
        } catch (error) {
            console.error("Error fetching watch history:", error);
            throw error;
        }
    }

    /**
     * Lấy tiến độ xem của một bộ phim cụ thể
     */
    async getProgressByMovie(movieId: string, episodeId?: string): Promise<WatchProgressResponse> {
        try {
            const params: any = {};
            if (episodeId) params.episodeId = episodeId;
            return await apiClient.get<WatchProgressResponse>(`/watch-history/progress/${movieId}`, params);
        } catch (error) {
            console.error("Error fetching progress by movie:", error);
            return { success: false, data: null } as any;
        }
    }
}

export const watchHistoryService = new WatchHistoryService();
