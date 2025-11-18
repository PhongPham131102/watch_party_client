"use client";
import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Navigation } from "swiper/modules";
import { Play, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { Movie } from "@/src/types/movie.types";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";

interface HeroSectionProps {
  movies: Movie[];
}

export default function HeroSection({ movies }: HeroSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleSlideChange = (swiper: { activeIndex: number }) => {
    setIsTransitioning(true);
    setActiveIndex(swiper.activeIndex);
    // Text fade out trước
    setTimeout(() => {
      // Sau khi text fade out, background transition
      setTimeout(() => {
        setIsTransitioning(false);
      }, 300);
    }, 200);
  };

  return (
    <div className="relative h-screen w-full overflow-hidden hero-container">
      <Swiper
        modules={[Autoplay, EffectFade, Navigation]}
        effect="fade"
        fadeEffect={{
          crossFade: true,
        }}
        speed={800}
        autoplay={{
          delay: 6000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        navigation={{
          nextEl: ".swiper-button-next-custom",
          prevEl: ".swiper-button-prev-custom",
        }}
        onSlideChange={handleSlideChange}
        className="h-full w-full hero-swiper">
        {movies.map((movie, index) => (
          <SwiperSlide key={movie.id} className="relative">
            <div className="absolute inset-0 z-0">
              {movie.backdropUrl ? (
                <Image
                  src={movie.backdropUrl}
                  alt={movie.title}
                  fill
                  priority={index === 0}
                  className={`hero-backdrop-image ${
                    activeIndex === index && !isTransitioning
                      ? "opacity-100"
                      : "opacity-0"
                  }`}
                  sizes="100vw"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-purple-900 via-pink-900 to-blue-900" />
              )}
            </div>

            {/* Content */}
            <div className="relative z-[4] flex h-full items-end pb-24 pl-6 md:pl-12 lg:pl-20">
              <div
                className={`max-w-2xl space-y-5 transition-all duration-500 ${
                  activeIndex === index && !isTransitioning
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}>
                {/* Title */}
                <div className="space-y-3">
                  {movie.originalTitle && (
                    <h2 className="text-3xl font-bold text-cyan-400 drop-shadow-2xl md:text-4xl lg:text-5xl xl:text-6xl">
                      {movie.originalTitle}
                    </h2>
                  )}
                  <h1 className="text-2xl font-bold text-white drop-shadow-2xl md:text-3xl lg:text-4xl xl:text-5xl">
                    {movie.title}
                  </h1>
                </div>

                {/* Description */}
                {movie.description && (
                  <p className="max-w-2xl text-xs leading-relaxed text-white/95 drop-shadow-lg line-clamp-3 md:text-sm lg:text-base">
                    {movie.description}
                  </p>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-4 pt-2">
                  <button className="group flex items-center gap-2 rounded-md bg-white px-8 py-3 font-semibold text-black shadow-xl transition-all hover:bg-white/90 hover:scale-105 active:scale-95">
                    <Play
                      size={22}
                      fill="currentColor"
                      className="transition-transform group-hover:scale-110"
                    />
                    <span>Phát</span>
                  </button>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Navigation Buttons - Chỉ hiển thị khi hover */}
      <button className="swiper-button-prev-custom absolute left-4 top-1/2 z-30 -translate-y-1/2 rounded-full border border-white/40 bg-black/70 p-2.5 text-white backdrop-blur-md shadow-xl">
        <ChevronLeft size={20} />
      </button>
      <button className="swiper-button-next-custom absolute right-4 top-1/2 z-30 -translate-y-1/2 rounded-full border border-white/40 bg-black/70 p-2.5 text-white backdrop-blur-md shadow-xl">
        <ChevronRight size={20} />
      </button>
    </div>
  );
}
