"use client";
import { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type?: "info" | "success" | "warning";
}

interface HeaderNotificationsProps {
  scrolled: boolean;
}

// Mock data - sau này sẽ lấy từ API
const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "Netflix Sắp ra mắt",
    message: "Khám phá những nội dung sắp ra mắt.",
    time: "cách đây 4 tuần",
    read: false,
    type: "info",
  },
  {
    id: "2",
    title: "Nội dung mới Nhập thanh vân",
    message: "Xem ngay bộ phim mới nhất.",
    time: "cách đây 1 tháng",
    read: false,
    type: "info",
  },
  {
    id: "3",
    title: "Top 10 series: Việt Nam",
    message: "Xem các nội dung phổ biến.",
    time: "cách đây 1 tháng",
    read: true,
    type: "info",
  },
  {
    id: "4",
    title: "Nội dung mới Thần đèn ơi, ước đi",
    message: "Bộ phim mới đã có sẵn.",
    time: "cách đây 1 tháng",
    read: true,
    type: "info",
  },
  {
    id: "5",
    title: "Đừng bỏ lỡ",
    message: "Hãy trải nghiệm Wednesday nhiều hơn",
    time: "cách đây 1 tháng",
    read: true,
    type: "info",
  },
];

export default function HeaderNotifications({
  scrolled,
}: HeaderNotificationsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] =
    useState<Notification[]>(mockNotifications);
  const containerRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const handleNotificationClick = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 transition-colors duration-300 hover:opacity-70 ${
          scrolled ? "text-white" : "text-black"
        }`}
        aria-label="Thông báo">
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-lg bg-black/95 backdrop-blur-sm border border-white/10 shadow-xl z-50 transition-all duration-200 ease-out">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <h3 className="text-lg font-semibold text-white">Thông báo</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-primary hover:text-primary/80 transition-colors">
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>

          <div
            onWheel={(e) => {
              // Ngăn scroll event lan ra ngoài
              e.stopPropagation();
            }}
            onTouchMove={(e) => {
              // Ngăn touch scroll lan ra ngoài
              e.stopPropagation();
            }}
          >
            <ScrollArea
              className="h-96"
              scrollBarClassName="bg-white/10"
              scrollBarThumbClassName="bg-white/30"
            >
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-white/60">
                Không có thông báo nào
              </div>
            ) : (
              <div className="divide-y divide-white/10">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification.id)}
                    className={`px-4 py-3 cursor-pointer transition-colors hover:bg-white/5 ${
                      !notification.read ? "bg-white/5" : ""
                    }`}>
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-1 h-2 w-2 rounded-full shrink-0 ${
                          !notification.read ? "bg-primary" : "bg-transparent"
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-medium mb-1 ${
                            !notification.read ? "text-white" : "text-white/70"
                          }`}>
                          {notification.title}
                        </p>
                        <p className="text-xs text-white/60 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-white/40 mt-1">
                          {notification.time}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
          </div>

          {notifications.length > 0 && (
            <div className="border-t border-white/10 px-4 py-3">
              <button className="w-full text-center text-sm text-primary hover:text-primary/80 transition-colors">
                Xem tất cả thông báo
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
