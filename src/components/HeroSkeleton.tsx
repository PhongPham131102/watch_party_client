import { Skeleton } from "@/components/ui/skeleton"

export default function HeroSkeleton() {
    return (
        <div className="relative h-screen w-full overflow-hidden bg-[#0e0f14]">
            {/* Backdrop skeleton */}
            <Skeleton className="absolute inset-0 h-full w-full opacity-30" />

            {/* Content overlay */}
            <div className="absolute inset-0 bg-linear-to-t from-[#0e0f14] via-transparent to-transparent" />

            {/* Content skeleton */}
            <div className="relative z-10 flex h-full items-end pb-24 pl-6 md:pl-12 lg:pl-20">
                <div className="w-full max-w-2xl space-y-6">
                    {/* Title skeletons */}
                    <div className="space-y-3">
                        <Skeleton className="h-10 w-2/3 md:h-12 lg:h-14 xl:h-16" />
                        <Skeleton className="h-8 w-1/2 md:h-10 lg:h-12" />
                    </div>

                    {/* Description skeletons */}
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                    </div>

                    {/* Button skeleton */}
                    <Skeleton className="h-12 w-32 rounded-md" />
                </div>
            </div>
        </div>
    )
}
