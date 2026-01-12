/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useRef } from "react";
import Artplayer from "artplayer";
import Hls from "hls.js";
import artplayerPluginHlsControl from "artplayer-plugin-hls-control";
import artplayerPluginMultipleSubtitles from "artplayer-plugin-multiple-subtitles";
import { renderToStaticMarkup } from "react-dom/server";
import {
  MdOutlineForward10,
  MdOutlineReplay10,
  MdSubtitles,
} from "react-icons/md";
import { twMerge } from "tailwind-merge";
import { useWatchHistoryStore } from "@/src/store/watchHistoryStore";
import { useAuthStore } from "@/src/store/auth.store";

const replay10Icon = renderToStaticMarkup(
  <MdOutlineReplay10 size={24} color="white" />
);
const forward10Icon = renderToStaticMarkup(
  <MdOutlineForward10 size={24} color="white" />
);
const mdSubtitles = renderToStaticMarkup(
  <MdSubtitles size={24} color="white" />
);

const viDictionary = {
  "AirPlay Not Available": "AirPlay không khả dụng",
  "Aspect Ratio": "Tỷ lệ khung hình",
  "Exit Fullscreen": "Thoát chế độ toàn màn hình",
  "Exit PIP Mode": "Thoát chế độ PIP",
  "Exit Web Fullscreen": "Thoát chế độ toàn màn hình web",
  "Fullscreen Not Supported": "Không hỗ trợ chế độ toàn màn hình",
  "Hide Setting": "Ẩn cài đặt",
  "Jump Play": "Phát",
  "Last Seen": "Lần xem gần nhất",
  "Mini Player": "Trình phát nhỏ",
  "PIP Mode": "Chế độ PIP",
  "PIP Not Supported": "Chế độ PIP không được hỗ trợ",
  "Play Speed": "Tốc độ phát",
  "Show Setting": "Hiển thị cài đặt",
  "Subtitle Offset": "Độ lệch phụ đề",
  "Switch Subtitle": "Chuyển đổi phụ đề",
  "Switch Video": "Chuyển đổi video",
  "Video Flip": "Lật video",
  "Video Info": "Thông tin video",
  "Video Load Failed": "Tải video thất bại",
  "Web Fullscreen": "Toàn màn hình web",
  AirPlay: "AirPlay",
  Close: "Đóng",
  Default: "Mặc định",
  Fullscreen: "Toàn màn hình",
  Horizontal: "Ngang",
  Mute: "Tắt tiếng",
  Normal: "Bình thường",
  Open: "Mở",
  Pause: "Tạm dừng",
  Play: "Phát",
  Rate: "Tốc độ",
  Reconnect: "Kết nối lại",
  Screenshot: "Chụp màn hình",
  Vertical: "Dọc",
  Volume: "Âm lượng",
};

const API_SOURCE_URL =
  process.env.NEXT_PUBLIC_API_SOURCE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "";
console.log("API_SOURCE_URL: ", API_SOURCE_URL);
export interface SubtitleFile {
  language: string;
  file_name: string;
  status: "success" | "processing" | "failed";
}

interface VideoPlayerProps {
  src: string;
  className?: string;
  videoId: string;
  movieId: string;
  episodeId?: string;
  srtFiles?: SubtitleFile[];
  srtFile?: string;
  setSubtitleUrl?: (url: string) => void;
  originArtRef?: React.MutableRefObject<Artplayer | null>;
}

const EMPTY_ARRAY: any[] = [];

export default function VideoPlayer({
  src,
  videoId,
  movieId,
  episodeId,
  className = "",
  srtFiles = EMPTY_ARRAY,
  srtFile = "",
  setSubtitleUrl,
  originArtRef,
}: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const artRef = useRef<Artplayer | null>(null);

  const updateProgress = useWatchHistoryStore((state) => state.updateProgress);
  const getProgress = useWatchHistoryStore((state) => state.getProgress);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const lastHistoryUpdateRef = useRef<number>(0);

  // Refs to keep values fresh inside listeners
  const movieIdRef = useRef(movieId);
  const episodeIdRef = useRef(episodeId);
  const isAuthenticatedRef = useRef(isAuthenticated);

  useEffect(() => {
    movieIdRef.current = movieId;
    episodeIdRef.current = episodeId;
    isAuthenticatedRef.current = isAuthenticated;
  }, [movieId, episodeId, isAuthenticated]);

  const uniqueSrtFiles = useMemo(
    () =>
      srtFiles.filter(
        (item, index, self) =>
          index ===
          self.findIndex(
            (s) => s.language.toLowerCase() === item.language.toLowerCase()
          )
      ),
    [srtFiles]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !src) {
      return () => {};
    }

    const syncProgress = (isFinal = false) => {
      const currentArt = artRef.current;
      if (!currentArt || !isAuthenticatedRef.current) return;

      const currentTime = Math.floor(currentArt.currentTime);
      const duration = Math.floor(currentArt.duration);

      if (currentTime > 0 && duration > 0) {
        // Use navigator.sendBeacon for final exit if possible, but updateProgress is async axios
        // For consistent logic, we just use the store's action
        updateProgress({
          movieId: movieIdRef.current,
          episodeId: episodeIdRef.current,
          watchDurationSeconds: currentTime,
          totalDurationSeconds: duration,
        });

        // If closing tab, browser might kill the request.
        // In a real app we might use navigator.sendBeacon with a direct URL for 'isFinal'
      }
    };

    const handleBeforeUnload = () => {
      syncProgress(true);
    };

    const destroyArtPlayer = () => {
      syncProgress(true); // Sync one last time before destroying
      if (artRef.current) {
        artRef.current.destroy();
        artRef.current = null;
      }
      if (originArtRef?.current) {
        originArtRef.current.destroy();
        originArtRef.current = null;
      }
    };

    destroyArtPlayer();

    const defaultLang = uniqueSrtFiles.find((file) =>
      srtFile.includes(file.file_name)
    )?.language;

    const subtitleSelectors = uniqueSrtFiles
      .filter((file) => file.status === "success")
      .map((file) => ({
        html: file.language.toUpperCase(),
        name: file.language,
        default: file.language === defaultLang,
      }));

    const art = new Artplayer({
      lang: "vi",
      i18n: {
        vi: viDictionary,
      },
      container,
      autoplay: false,
      theme: "#E50914",
      fullscreen: true,
      pip: true,
      autoSize: true,
      autoMini: true,
      screenshot: true,
      setting: true,
      loop: false,
      playbackRate: true,
      miniProgressBar: true,
      autoPlayback: false,
      url: src,
      customType: {
        m3u8(video: HTMLMediaElement, url: string, artInstance: any) {
          if (Hls.isSupported()) {
            if (artInstance.hls) artInstance.hls.destroy();
            const hls = new Hls();
            hls.loadSource(url);
            hls.attachMedia(video);
            artInstance.hls = hls;
            artInstance.on("destroy", () => hls.destroy());
          } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = url;
          } else {
            artInstance.notice.show = "Không hỗ trợ phát định dạng m3u8";
          }
        },
      },
      plugins: [
        artplayerPluginHlsControl({
          quality: {
            setting: true,
            getName: (level: { height: number }) => `${level.height}p`,
            title: "Chất lượng",
            auto: "Tự động",
          },
          audio: {
            control: true,
            setting: true,
            getName: (track: { name: string }) => track.name,
            title: "Âm thanh",
            auto: "Tự động",
          },
        }),
        artplayerPluginMultipleSubtitles({
          subtitles: uniqueSrtFiles
            .filter((s) => s.status === "success")
            .map((s) => ({
              name: s.language,
              url: `${API_SOURCE_URL}/videos/${videoId}/subtitles/${s.file_name}`,
              type: "srt",
            })),
        }),
      ],
      settings: [
        {
          width: 200,
          html: "Phụ đề",
          tooltip: defaultLang,
          icon: mdSubtitles,
          selector: [
            {
              html: "Hiển thị",
              tooltip: "Hiện",
              switch: true,
              onSwitch(item: any) {
                item.tooltip = item.switch ? "Ẩn" : "Hiện";
                art.subtitle.show = !item.switch;
                return !item.switch;
              },
            },
            ...subtitleSelectors,
          ],
          onSelect(item: any) {
            const plugin: any = art.plugins?.multipleSubtitles;
            if (!plugin || typeof plugin.tracks !== "function")
              return item.html;
            if (item.name) {
              const selected = uniqueSrtFiles.find(
                (f) => f.language.toLowerCase() === item.name.toLowerCase()
              );
              if (selected) {
                const url = `${API_SOURCE_URL}/videos/${videoId}/subtitles/${selected.file_name}`;
                plugin.reset?.();
                plugin.tracks([item.name]);
                setSubtitleUrl?.(url);
              }
            }
            return item.html;
          },
        },
      ],
    });

    art.controls.add({
      position: "left",
      html: replay10Icon,
      click: () => (art.backward = 10),
      tooltip: "10 giây trước",
      index: 99,
      style: { padding: "6px" },
    });
    art.controls.add({
      position: "left",
      html: forward10Icon,
      click: () => (art.forward = 10),
      tooltip: "10 giây sau",
      index: 100,
      style: { padding: "6px" },
    });

    art.on("video:timeupdate", () => {
      const now = Date.now();
      // Sync every 5 seconds per USER request
      if (now - lastHistoryUpdateRef.current > 5000) {
        syncProgress();
        lastHistoryUpdateRef.current = now;
      }
    });

    art.on("video:pause", () => {
      syncProgress();
    });

    // Initial seek to last progress
    const initProgress = async () => {
      if (!isAuthenticatedRef.current) return;
      try {
        const progress = await getProgress(movieId, episodeId);
        if (progress && progress.watchDurationSeconds > 10) {
          art.currentTime = progress.watchDurationSeconds;
          art.notice.show = `Đang phát tiếp từ ${Math.floor(
            progress.watchDurationSeconds / 60
          )}:${(Math.floor(progress.watchDurationSeconds) % 60)
            .toString()
            .padStart(2, "0")}`;
        }
      } catch (e) {
        console.error("Failed to load initial progress", e);
      }
    };

    art.once("ready", () => {
      initProgress();
      const plugin: any = art.plugins?.multipleSubtitles;
      if (plugin && typeof plugin.reset === "function") {
        plugin.reset();
        if (defaultLang) {
          plugin.tracks?.([defaultLang]);
        }
      }
    });

    artRef.current = art;
    if (originArtRef) {
      originArtRef.current = art;
    }

    art.on("autoSize", () => {
      setTimeout(() => {
        document
          .querySelectorAll(".art-video-player")
          .forEach((el) =>
            el.setAttribute("style", "border-radius: 12px; overflow: hidden;")
          );
      }, 100);
    });

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      destroyArtPlayer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, srtFile, uniqueSrtFiles, videoId, movieId, episodeId]);

  return (
    <div
      ref={containerRef}
      className={twMerge(
        "h-[360px] w-full overflow-hidden rounded-2xl border border-white/10 bg-black",
        className
      )}
    />
  );
}
