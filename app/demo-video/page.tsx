"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Volume2, VolumeX, X, AlertCircle } from "lucide-react";

const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });

export default function FullscreenVideoHero() {
    const [hasWindow, setHasWindow] = useState(false);
    const [isPlaying, setIsPlaying] = useState(true); // Tự động phát ngay khi vào trang
    const [isMuted, setIsMuted] = useState(true);
    const [showImage, setShowImage] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            setHasWindow(true);
        }
    }, []);

    const posterImage = "https://occ-0-325-395.1.nflxso.net/dnm/api/v6/E8vDc_W8CLv7-yMQu8KMEC7Rrr8/AAAABaP_sCSaMjdMAGJTHopvSYYZGtLg2PlWFHS3oOUjQICBzrZdUkd0K_ndl18c4IDCh3EH07TYxbA8dvrHdvzTE4NFMH69i13MFsxZ.webp?r=6e2";
    const youtubeVideoId = "vT8qn_G0K7Y";
    const videoUrl = `https://www.youtube.com/watch?v=${youtubeVideoId}`;

    const skipTrailer = () => {
        setIsPlaying(false);
        setShowImage(true);
        setError(null);
    };

    return (
        <main className="relative h-screen w-screen overflow-hidden bg-black text-white">
            {/* 1. Video Layer */}
            {hasWindow && (
                <div className="absolute inset-0 z-0 scale-[1.3]">
                    <ReactPlayer
                        src={videoUrl}
                        playing={isPlaying}
                        muted={isMuted}
                        width="100%"
                        height="100%"
                        loop={true}
                        onStart={() => setShowImage(false)}
                        onError={(e) => {
                            console.error("Player Error:", e);
                            setError("Không thể tải video. Có thể do cài đặt trình duyệt hoặc tiện ích mở rộng chặn YouTube.");
                        }}
                        onEnded={skipTrailer}
                        config={{
                            youtube: {
                                playerVars: {
                                    controls: 0,
                                    modestbranding: 1,
                                    rel: 0,
                                    showinfo: 0,
                                    autoplay: 1,
                                    mute: 1,
                                    origin: typeof window !== 'undefined' ? window.location.origin : ''
                                },
                            },
                        }}
                        style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
                    />
                </div>
            )}

            {/* 2. Photo Layer (Cover Image) */}
            <div
                className={`absolute inset-0 z-10 transition-opacity duration-1000 ${showImage ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`}
            >
                <img
                    src={posterImage}
                    alt="Hero Background"
                    className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black via-black/20 to-transparent" />
            </div>

            {/* 3. UI Layer */}
            <div className="relative z-20 flex h-full flex-col justify-end pb-20 pl-10 md:pl-20 pointer-events-none">
                <div className="max-w-2xl space-y-4">
                    <h1 className="text-5xl font-black text-white md:text-7xl drop-shadow-2xl uppercase italic tracking-tighter">
                        KUNG FU PANDA 4
                    </h1>
                    <p className="text-lg text-white/80 line-clamp-3 md:text-xl drop-shadow-lg max-w-lg">
                        Gấu Po trở lại trong một cuộc phiêu lưu mới đầy hài hước và màn võ thuật đỉnh cao. Po giờ đây phải đối diện với gã pháp sư biến hình Tắc Kè Hoa.
                    </p>
                    <div className="flex gap-4 pt-4 pointer-events-auto">
                        <button className="rounded-md bg-white px-8 py-3 font-bold text-black transition-all hover:bg-white/90 hover:scale-105 active:scale-95">
                            Phát ngay
                        </button>
                        <button className="rounded-md bg-white/30 px-8 py-3 font-bold text-white backdrop-blur-md transition-all hover:bg-white/40 hover:scale-105 active:scale-95 border border-white/10">
                            Chi tiết
                        </button>
                    </div>
                </div>

                {!showImage && (
                    <div className="absolute bottom-10 right-10 flex gap-4 pointer-events-auto">
                        <button
                            onClick={() => setIsMuted(!isMuted)}
                            className="flex h-12 w-12 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition-all hover:bg-white/20 border border-white/10 shadow-xl"
                        >
                            {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
                        </button>

                        <button
                            onClick={skipTrailer}
                            className="flex items-center gap-2 rounded-full bg-black/40 px-6 py-2 text-sm font-semibold text-white backdrop-blur-md transition-all hover:bg-white/20 border border-white/10 shadow-xl"
                        >
                            <X className="h-4 w-4" />
                            Đóng trailer
                        </button>
                    </div>
                )}
            </div>

            {/* Error Overlay */}
            {error && (
                <div className="absolute top-10 right-10 z-30 flex flex-col items-end gap-2">
                    <div className="flex items-center gap-3 bg-red-500/20 backdrop-blur-md border border-red-500/50 p-4 rounded-lg text-red-100 max-w-xs transition-all animate-in fade-in slide-in-from-right-4">
                        <AlertCircle className="shrink-0 h-5 w-5" />
                        <p className="text-xs font-medium">{error}</p>
                    </div>
                </div>
            )}
        </main>
    );
}