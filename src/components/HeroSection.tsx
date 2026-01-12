"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Navigation } from "swiper/modules";
import { Play, ChevronLeft, ChevronRight, Volume2, VolumeX, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { HeroSection as HeroSectionType } from "@/src/types/hero-section.types";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";

const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });

interface HeroSectionProps {
  heroSections: HeroSectionType[];
}

export default function HeroSection({ heroSections }: HeroSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [hasWindow] = useState(typeof window !== "undefined");
  
  // Initialize video states for each hero section
  const [videoStates, setVideoStates] = useState<Record<number, {
    isPlaying: boolean;
    isMuted: boolean;
    showImage: boolean;
    isReady: boolean;
  }>>(() => {
    const initialStates: Record<number, {
      isPlaying: boolean;
      isMuted: boolean;
      showImage: boolean;
      isReady: boolean;
    }> = {};
    heroSections.forEach((_, index) => {
      initialStates[index] = {
        isPlaying: index === 0, // Chỉ play slide đầu tiên
        isMuted: true,
        showImage: true,
        isReady: false,
      };
    });
    return initialStates;
  });

  const handleSlideChange = (swiper: { activeIndex: number }) => {
    setIsTransitioning(true);
    const newIndex = swiper.activeIndex;
    setActiveIndex(newIndex);

    // Pause all videos except active one
    setVideoStates(prev => {
      const newStates = { ...prev };
      Object.keys(newStates).forEach(key => {
        const idx = parseInt(key);
        newStates[idx] = {
          ...newStates[idx],
          isPlaying: idx === newIndex,
        };
      });
      return newStates;
    });

    setTimeout(() => {
      setTimeout(() => {
        setIsTransitioning(false);
      }, 300);
    }, 200);
  };

  const toggleMute = (index: number) => {
    setVideoStates(prev => ({
      ...prev,
      [index]: {
        ...prev[index],
        isMuted: !prev[index]?.isMuted,
      },
    }));
  };

  const skipTrailer = (index: number) => {
    setVideoStates(prev => ({
      ...prev,
      [index]: {
        ...prev[index],
        isPlaying: false,
        showImage: true,
      },
    }));
  };

  const handleVideoReady = (index: number) => {
    setVideoStates(prev => ({
      ...prev,
      [index]: {
        ...prev[index],
        isReady: true,
      },
    }));
  };

  const handleVideoStart = (index: number) => {
    setVideoStates(prev => ({
      ...prev,
      [index]: {
        ...prev[index],
        showImage: false,
      },
    }));
  };

  if (!heroSections || heroSections.length === 0) {
    return null;
  }

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
        {heroSections.map((heroSection, index) => {
          const movie = heroSection.movie;
          // Sử dụng title/description từ hero section nếu có, nếu không thì dùng từ movie
          const displayTitle = heroSection.title || movie.title;
          const displayDescription = heroSection.description || movie.description;

          const videoState = videoStates[index] || {
            isPlaying: false,
            isMuted: true,
            showImage: true,
            isReady: false,
          };

          // Thêm parameters vào URL để tắt tất cả controls và force chất lượng cao nhất
          const getVideoUrl = (url: string) => {
            if (!url) return url;
            const separator = url.includes('?') ? '&' : '?';
            return `${url}${separator}autoplay=1&controls=0&showinfo=0&rel=0&fs=0&modestbranding=1&disablekb=1&iv_load_policy=3&cc_load_policy=0&playsinline=1&enablejsapi=1&hd=1&vq=hd1080&quality=high`;
          };

          return (
            <SwiperSlide key={heroSection.id} className="relative">
              {/* Video Layer - TẠM THỜI ẨN - Chỉ hiển thị nếu có trailerUrl */}
              {false && hasWindow && movie.trailerUrl && (
                <div className="absolute inset-0 z-0">
                  <div className="absolute inset-0 scale-[1.3]">
                    <ReactPlayer
                      src={getVideoUrl(movie.trailerUrl || '')}
                      playing={videoState.isPlaying && activeIndex === index}
                      muted={videoState.isMuted}
                      width="100%"
                      height="100vh"
                      loop={true}
                      controls={false}
                      onReady={() => handleVideoReady(index)}
                      onStart={() => handleVideoStart(index)}
                      onError={(e) => {
                        console.error("Video Error:", e);
                      }}
                      style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
                    />
                  </div>
                </div>
              )}

              {/* Backdrop Image Layer - CHE PHỦ video cho đến khi sẵn sàng */}
              <div 
                className={`absolute inset-0 z-20 transition-opacity duration-1000 ${
                  movie.trailerUrl && !videoState.showImage && videoState.isReady
                    ? "opacity-0 pointer-events-none"
                    : "opacity-100"
                }`}
              >
                {movie.backdropUrl ? (
                  <Image
                    src={movie.backdropUrl}
                    alt={displayTitle}
                    fill
                    priority={index === 0}
                    className={`hero-backdrop-image ${activeIndex === index && !isTransitioning
                      ? "opacity-100"
                      : "opacity-0"
                      }`}
                    sizes="100vw"
                  />
                ) : (
                  <div className="h-full w-full bg-linear-to-br from-[#1a1a2e] via-[#0e0f14] to-[#0a0a0f]" />
                )}
              </div>

              {/* Content */}
              <div className="relative z-30 flex h-full items-end pb-24 pl-6 md:pl-12 lg:pl-20">
                <div
                  className={`max-w-2xl flex flex-col gap-4 md:gap-6 transition-all duration-500 ${activeIndex === index && !isTransitioning
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                    }`}>
                  {/* Title - Hiển thị titleImageUrl nếu có, nếu không thì hiển thị text */}
                  {movie.titleImageUrl ? (
                    <div className="relative w-full max-w-xs md:max-w-sm lg:max-w-md">
                      <Image
                        src={movie.titleImageUrl}
                        alt={displayTitle}
                        width={500}
                        height={200}
                        className="hero-title-image w-full h-auto max-h-28 md:max-h-36 lg:max-h-40 object-contain object-left drop-shadow-2xl"
                        priority={index === 0}
                      />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {movie.originalTitle && (
                        <h2 className="text-3xl font-bold text-primary drop-shadow-2xl md:text-4xl lg:text-5xl xl:text-6xl">
                          {movie.originalTitle}
                        </h2>
                      )}
                      <h1 className="text-2xl font-bold text-white drop-shadow-2xl md:text-3xl lg:text-4xl xl:text-5xl">
                        {displayTitle}
                      </h1>
                    </div>
                  )}

                  {/* Description */}
                  {displayDescription && (
                    <p className="max-w-2xl text-xs leading-relaxed text-white/95 line-clamp-3 md:text-sm lg:text-base" style={{
                      textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8), 0px 0px 8px rgba(0, 0, 0, 0.6), 0px 0px 16px rgba(0, 0, 0, 0.4)'
                    }}>
                      {displayDescription}
                    </p>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center gap-4 pt-2">
                    <Link 
                      href={`/movies/${movie.slug}`}
                      className="group flex items-center gap-2 rounded-md bg-white px-8 py-3 font-semibold text-black shadow-xl transition-all hover:bg-white/90 hover:scale-105 active:scale-95">
                      <Play
                        size={22}
                        fill="currentColor"
                        className="transition-transform group-hover:scale-110"
                      />
                      <span>Phát</span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Video Controls - Chỉ hiển thị khi video đang phát */}
              {movie.trailerUrl && !videoState.showImage && activeIndex === index && (
                <div className="absolute bottom-28 right-6 z-30 flex gap-3 md:bottom-32 md:right-10">
                  <button
                    onClick={() => toggleMute(index)}
                    className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition-all hover:bg-white/20 border border-white/10 shadow-xl"
                  >
                    {videoState.isMuted ? <VolumeX className="h-5 w-5 md:h-6 md:w-6" /> : <Volume2 className="h-5 w-5 md:h-6 md:w-6" />}
                  </button>

                  <button
                    onClick={() => skipTrailer(index)}
                    className="flex items-center gap-2 rounded-full bg-black/40 px-4 py-2 md:px-6 text-xs md:text-sm font-semibold text-white backdrop-blur-md transition-all hover:bg-white/20 border border-white/10 shadow-xl"
                  >
                    <X className="h-3 w-3 md:h-4 md:w-4" />
                    <span className="hidden sm:inline">Đóng trailer</span>
                  </button>
                </div>
              )}
            </SwiperSlide>
          );
        })}
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
