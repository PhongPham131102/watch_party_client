import { useQuery } from "@tanstack/react-query";
import { heroSectionService } from "@/src/services/hero-section.service";
import type { HeroSection } from "@/src/types/hero-section.types";

/**
 * Custom hook để fetch hero sections public
 * Sử dụng React Query để cache và quản lý state
 */
export const useHeroSections = () => {
  return useQuery<HeroSection[], Error>({
    queryKey: ["hero-sections", "public"],
    queryFn: () => heroSectionService.getPublicHeroSections(),
    staleTime: 5 * 60 * 1000, // 5 phút
    gcTime: 10 * 60 * 1000, // 10 phút (gcTime thay thế cacheTime)
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

