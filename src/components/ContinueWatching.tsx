"use client";

import { useEffect } from "react";
import { useWatchHistoryStore } from "@/src/store/watchHistoryStore";
import { useAuthStore } from "@/src/store/auth.store";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import MovieCard from "./MovieCard";
import MovieCardSkeleton from "./MovieCardSkeleton";

export default function ContinueWatching() {
    const { history, isLoading, fetchHistory } = useWatchHistoryStore();
    const { isAuthenticated } = useAuthStore();

    useEffect(() => {
        if (isAuthenticated) {
            fetchHistory(1, 10);
        }
    }, [isAuthenticated, fetchHistory]);

    if (!isAuthenticated || (!isLoading && history.length === 0)) {
        return null;
    }

    return (
        <section className="space-y-4 py-8">
            <div className="flex items-center justify-between px-6 md:px-12 lg:px-16">
                <h2 className="text-xl font-bold text-white md:text-2xl lg:text-3xl">
                    Tiếp tục xem
                </h2>
            </div>

            <div className="px-6 md:px-12 lg:px-16">
                <Carousel
                    opts={{
                        align: "start",
                    }}
                    className="w-full"
                >
                    <CarouselContent className="-ml-2 md:-ml-4">
                        {isLoading ? (
                            [...Array(6)].map((_, i) => (
                                <CarouselItem key={i} className="pl-2 md:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6">
                                    <MovieCardSkeleton />
                                </CarouselItem>
                            ))
                        ) : (
                            history.map((item) => (
                                <CarouselItem
                                    key={item.id}
                                    className="pl-2 md:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6"
                                >
                                    <MovieCard
                                        movie={item.movie}
                                        progressSeconds={item.watchDurationSeconds}
                                        totalSeconds={item.totalDurationSeconds || 0}
                                    />
                                </CarouselItem>
                            ))
                        )}
                    </CarouselContent>

                    <CarouselPrevious className="hidden lg:flex" />
                    <CarouselNext className="hidden lg:flex" />
                </Carousel>
            </div>
        </section>
    );
}
