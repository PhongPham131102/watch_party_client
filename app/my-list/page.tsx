"use client";
import { useEffect } from "react";
import { useFavoriteStore } from "@/src/store/favoriteStore";
import MovieCard from "@/src/components/MovieCard";
import MovieCardSkeleton from "@/src/components/MovieCardSkeleton";
import { Heart } from "lucide-react";
import ProtectedRoute from "@/src/components/ProtectedRoute";

export default function MyListPage() {
    const { favorites, isLoading, fetchFavorites } = useFavoriteStore();

    useEffect(() => {
        fetchFavorites();
    }, [fetchFavorites]);

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-[#0e0f14] pt-24 pb-12 px-4 md:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header Section */}
                    <div className="flex items-center gap-3 mb-8 border-b border-white/10 pb-6">

                        <div>
                            <h1 className="text-3xl font-bold text-white">Danh sách yêu thích</h1>
                            <p className="text-white/40 text-sm mt-1">
                                Lưu trữ những bộ phim bạn muốn xem sau
                            </p>
                        </div>
                        <span className="ml-auto bg-white/5 border border-white/10 px-4 py-1.5 rounded-full text-white/70 text-sm font-medium">
                            {favorites.length} phim
                        </span>
                    </div>

                    {/* Content Section */}
                    {isLoading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                            {[...Array(12)].map((_, i) => (
                                <MovieCardSkeleton key={i} />
                            ))}
                        </div>
                    ) : favorites.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                            {favorites.map((movie) => (
                                <MovieCard key={movie.id} movie={movie} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 animate-pulse">
                                <Heart className="text-white/10" size={48} />
                            </div>
                            <h2 className="text-2xl font-semibold text-white mb-3">
                                Danh sách của bạn đang trống
                            </h2>
                            <p className="text-white/40 max-w-sm mb-8 leading-relaxed">
                                Khám phá kho phim khổng lồ và thêm những bộ phim bạn yêu thích để dễ dàng xem lại bất cứ lúc nào.
                            </p>
                            <a
                                href="/"
                                className="px-8 py-3 bg-primary text-white font-semibold rounded-full hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:scale-105 active:scale-95"
                            >
                                Khám phá ngay
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}
