import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { Episode } from "../types/episode.types";
import {
  Maximize,
  Pause,
  Play,
  Settings,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";

interface VideoPlayerProps {
  episode: Episode;
  currentTime: number;
  isPlaying: boolean;
  updatedAt: number;
  onPlay: () => void;
  onPause: () => void;
  onSeek: (time: number) => void;
  onNextEpisode?: () => void;
  onPreviousEpisode?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
  useS3?: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  episode,
  currentTime,
  isPlaying,
  updatedAt,
  onPlay,
  onPause,
  onSeek,
  onNextEpisode,
  onPreviousEpisode,
  hasNext = false,
  hasPrevious = false,
  useS3 = true,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSyncingRef = useRef(false);
  const hlsRef = useRef<any>(null);

  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState<string>("auto");
  const [buffered, setBuffered] = useState(0);
  const [localCurrentTime, setLocalCurrentTime] = useState(0);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Determine effective URL and Qualities (fallback to Minio if S3 is empty)
  const effectiveS3Url = useS3 && episode.masterM3u8S3;
  const videoUrl = effectiveS3Url || episode.masterM3u8Minio;
  const qualities = effectiveS3Url ? episode.qualitiesS3 : episode.qualitiesMinio;

  // Initialize HLS
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Reset states when starting new load
    setVideoError(null);

    if (!videoUrl) {
      console.warn("Video URL is missing for episode:", episode.id);
      setVideoError("Không tìm thấy đường dẫn video");
      setIsLoading(false);
      return;
    }

    console.log("Loading video from:", videoUrl);
    setIsLoading(true);

    // Cleanup previous HLS instance if exists
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (Hls.isSupported()) {
      console.log("HLS.js is supported");
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90,
        maxBufferLength: 30,
        maxMaxBufferLength: 600,
      });

      hlsRef.current = hls;

      hls.loadSource(videoUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        console.log("✅ HLS manifest loaded successfully");
        setIsLoading(false);
        // If playing state is true, try to play
        if (isPlaying) {
          video.play().catch(e => console.error("Auto-play error:", e));
        }
      });

      hls.on(Hls.Events.ERROR, function (event: any, data: any) {
        console.error("❌ HLS error:", data);
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.error("Network error, trying to recover...");
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.error("Media error, trying to recover...");
              hls.recoverMediaError();
              break;
            default:
              setVideoError("Không thể phát video: " + data.details);
              setIsLoading(false);
              hls.destroy();
              break;
          }
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      console.log("Using native HLS support");
      video.src = videoUrl;
      setIsLoading(false);
    } else {
      setVideoError("Trình duyệt không hỗ trợ HLS");
      setIsLoading(false);
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      // Also clear video src to stop loading if component unmounts
      if (video) {
        video.removeAttribute('src');
        video.load();
      }
    };
  }, [videoUrl]);

  // Sync video state from props
  useEffect(() => {
    const video = videoRef.current;
    if (!video || isSyncingRef.current) return;

    const timeDiff = Math.abs(video.currentTime - currentTime);

    if (timeDiff > 1) {
      isSyncingRef.current = true;
      video.currentTime = currentTime;
      setTimeout(() => {
        isSyncingRef.current = false;
      }, 100);
    }

    if (isPlaying && video.paused) {
      video.play().catch((err) => console.error("Play error:", err));
    } else if (!isPlaying && !video.paused) {
      video.pause();
    }
  }, [currentTime, isPlaying, updatedAt]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateLocalTime = () => {
      if (!isSyncingRef.current) {
        setLocalCurrentTime(video.currentTime);
      }
    };

    const updateDuration = () => {
      console.log("Duration updated:", video.duration);
      setDuration(video.duration);
      if (video.duration > 0) {
        setIsLoading(false);
      }
    };

    const updateBuffered = () => {
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        setBuffered((bufferedEnd / video.duration) * 100);
      }
    };

    const handleError = (e: any) => {
      console.error("Video error:", e, video.error);
      setVideoError(
        "Lỗi phát video: " + (video.error?.message || "Unknown error")
      );
      setIsLoading(false);
    };

    const handleLoadStart = () => {
      console.log("Video load started");
    };

    const handleCanPlay = () => {
      console.log("Video can play");
      setIsLoading(false);
    };

    video.addEventListener("timeupdate", updateLocalTime);
    video.addEventListener("loadedmetadata", updateDuration);
    video.addEventListener("progress", updateBuffered);
    video.addEventListener("durationchange", updateDuration);
    video.addEventListener("error", handleError);
    video.addEventListener("loadstart", handleLoadStart);
    video.addEventListener("canplay", handleCanPlay);

    return () => {
      video.removeEventListener("timeupdate", updateLocalTime);
      video.removeEventListener("loadedmetadata", updateDuration);
      video.removeEventListener("progress", updateBuffered);
      video.removeEventListener("durationchange", updateDuration);
      video.removeEventListener("error", handleError);
      video.removeEventListener("loadstart", handleLoadStart);
      video.removeEventListener("canplay", handleCanPlay);
    };
  }, []);

  const togglePlay = () => {
    if (isPlaying) {
      onPause();
    } else {
      onPlay();
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const progressBar = progressBarRef.current;
    if (!progressBar) return;

    const rect = progressBar.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = pos * duration;
    onSeek(newTime);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = parseFloat(e.target.value);
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  const handleQualityChange = (quality: string) => {
    setSelectedQuality(quality);
    setShowQualityMenu(false);
  };

  // Calculate height to fit parent to avoid overflow
  const [containerStyle, setContainerStyle] = useState<{ height?: number }>({});

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !container.parentElement) return;

    const parent = container.parentElement;

    const updateHeight = () => {
      if (parent) {
        const { height } = parent.getBoundingClientRect();
        setContainerStyle({ height });
      }
    };

    updateHeight();

    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(parent);

    return () => resizeObserver.disconnect();
  }, []);

  const displayTime = isSyncingRef.current ? currentTime : localCurrentTime;

  return (
    <div
      ref={containerRef}
      style={containerStyle}
      className="relative w-full bg-black overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}>
      {/* Video Element */}
      <video
        ref={videoRef}
        className="block w-full h-full object-contain z-10"
        onClick={togglePlay}
        playsInline
        crossOrigin="anonymous"
      />

      {/* Loading Spinner */}
      {isLoading && !videoError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
            <p className="text-white text-sm">Đang tải video...</p>
            <p className="text-white/50 text-xs max-w-md px-4 text-center break-all">
              {videoUrl}
            </p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {videoError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-30">
          <div className="text-center px-4 max-w-2xl">
            <p className="text-red-500 text-lg mb-3">⚠️ {videoError}</p>
            <p className="text-white/60 text-sm mb-2">Video URL:</p>
            <p className="text-white/40 text-xs break-all bg-white/5 p-3 rounded">
              {videoUrl}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors">
              Thử lại
            </button>
          </div>
        </div>
      )}

      {/* Episode Info Overlay */}
      {!videoError && (
        <div
          className={`absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/80 to-transparent transition-opacity duration-300 z-20 ${showControls ? "opacity-100" : "opacity-0"
            }`}>
          <h2 className="text-white text-2xl font-bold mb-1">
            Tập {episode.episodeNumber}: {episode.title}
          </h2>
          <p className="text-gray-300 text-sm">{episode.description}</p>
        </div>
      )}

      {/* Center Play Button */}
      {!isPlaying && !isLoading && !videoError && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <button
            onClick={togglePlay}
            className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all hover:scale-110">
            <Play className="w-10 h-10 text-white ml-1" />
          </button>
        </div>
      )}

      {/* Controls */}
      {!videoError && (
        <div
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 transition-opacity duration-300 z-20 ${showControls ? "opacity-100" : "opacity-0"
            }`}>
          {/* Progress Bar */}
          <div
            ref={progressBarRef}
            className="w-full h-2 bg-white/20 rounded-full mb-4 cursor-pointer group relative"
            onClick={handleSeek}>
            <div
              className="absolute h-full bg-white/30 rounded-full"
              style={{ width: `${buffered}%` }}
            />
            <div
              className="absolute h-full bg-red-600 rounded-full group-hover:h-3 transition-all"
              style={{ width: `${(displayTime / duration) * 100}%` }}>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="text-white hover:text-red-500 transition-colors">
                {isPlaying ? (
                  <Pause className="w-8 h-8" />
                ) : (
                  <Play className="w-8 h-8" />
                )}
              </button>

              {onPreviousEpisode && (
                <button
                  onClick={onPreviousEpisode}
                  disabled={!hasPrevious}
                  className="text-white hover:text-red-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                  <SkipBack className="w-6 h-6" />
                </button>
              )}

              {onNextEpisode && (
                <button
                  onClick={onNextEpisode}
                  disabled={!hasNext}
                  className="text-white hover:text-red-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                  <SkipForward className="w-6 h-6" />
                </button>
              )}

              <div className="flex items-center gap-2 group">
                <button
                  onClick={toggleMute}
                  className="text-white hover:text-red-500 transition-colors">
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-6 h-6" />
                  ) : (
                    <Volume2 className="w-6 h-6" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-0 group-hover:w-20 transition-all opacity-0 group-hover:opacity-100"
                />
              </div>

              <span className="text-white text-sm font-medium">
                {formatTime(displayTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-3 relative">
              <div className="relative">
                <button
                  onClick={() => setShowQualityMenu(!showQualityMenu)}
                  className="text-white hover:text-red-500 transition-colors">
                  <Settings className="w-6 h-6" />
                </button>

                {showQualityMenu && (
                  <div className="absolute bottom-full right-0 mb-2 bg-black/95 rounded-lg p-2 min-w-32">
                    <div className="text-white text-sm font-semibold mb-2 px-2">
                      Chất lượng
                    </div>
                    <button
                      onClick={() => handleQualityChange("auto")}
                      className={`w-full text-left px-3 py-2 rounded hover:bg-white/10 text-sm transition-colors ${selectedQuality === "auto"
                        ? "text-red-500"
                        : "text-white"
                        }`}>
                      Tự động
                    </button>
                    {qualities.map((q) => (
                      <button
                        key={q.quality}
                        onClick={() => handleQualityChange(q.quality)}
                        className={`w-full text-left px-3 py-2 rounded hover:bg-white/10 text-sm transition-colors ${selectedQuality === q.quality
                          ? "text-red-500"
                          : "text-white"
                          }`}>
                        {q.quality}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={toggleFullscreen}
                className="text-white hover:text-red-500 transition-colors">
                <Maximize className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
