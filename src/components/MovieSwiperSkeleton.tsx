import { Skeleton } from "@/components/ui/skeleton"
import MovieCardSkeleton from "./MovieCardSkeleton"

export default function MovieSwiperSkeleton() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between px-6 md:px-12 lg:px-16">
                {/* Section title skeleton */}
                <Skeleton className="h-8 w-48" />
            </div>

            {/* Horizontal horizontal swiper layout skeletons */}
            <div className="flex gap-6 overflow-hidden px-6 md:px-12 lg:px-16">
                {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className="w-[180px] shrink-0 sm:w-[220px] md:w-[240px]">
                        <MovieCardSkeleton />
                    </div>
                ))}
            </div>
        </div>
    )
}
