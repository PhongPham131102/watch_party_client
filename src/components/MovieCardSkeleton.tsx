import { Skeleton } from "@/components/ui/skeleton"

export default function MovieCardSkeleton() {
    return (
        <div className="space-y-3">
            {/* Aspect ratio container for poster - 2/3 */}
            <Skeleton className="aspect-2/3 w-full rounded-md" />

            <div className="space-y-2">
                {/* Title skeleton */}
                <Skeleton className="h-4 w-3/4" />

                {/* Metadata skeleton */}
                <div className="flex gap-2">
                    <Skeleton className="h-3 w-10" />
                    <Skeleton className="h-3 w-12" />
                </div>

                {/* Tag skeleton */}
                <Skeleton className="h-5 w-14 rounded" />
            </div>
        </div>
    )
}
