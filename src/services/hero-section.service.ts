/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiClient } from "./api.service";
import type { HeroSection, GetHeroSectionsPublicResponse } from "@/src/types/hero-section.types";

/**
 * Hero Section Service
 * Xử lý các API calls liên quan đến hero section
 */
export class HeroSectionService {
  /**
   * Lấy danh sách hero sections đang active (public - không cần auth)
   * @returns Promise<HeroSection[]>
   */
  async getPublicHeroSections(): Promise<HeroSection[]> {
    try {
      const response = await apiClient.get<GetHeroSectionsPublicResponse>(
        "/hero-sections/public"
      );

      if (!response?.data) {
        throw new Error("Hero sections data is invalid");
      }

      // Sắp xếp theo order để đảm bảo hiển thị đúng thứ tự
      const sortedData = [...response.data].sort((a, b) => a.order - b.order);

      return sortedData;
    } catch (error: any) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error fetching public hero sections:", {
          message: error?.message,
          status: error?.status,
        });
      }
      throw error;
    }
  }
}

// Export instance để sử dụng
export const heroSectionService = new HeroSectionService();

