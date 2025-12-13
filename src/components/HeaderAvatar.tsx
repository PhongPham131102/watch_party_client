"use client";
import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pencil, ArrowLeftRight, User, HelpCircle } from "lucide-react";
import { useAuthStore } from "@/src/store/auth.store";

interface HeaderAvatarProps {
  scrolled: boolean;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
  separator?: boolean;
}

export default function HeaderAvatar({ scrolled }: HeaderAvatarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated, user, logout, openAuthModal } = useAuthStore();

  const menuItems: MenuItem[] = [
    {
      id: "kids",
      label: "Trẻ em",
      icon: (
        <div className="w-8 h-8 rounded overflow-hidden bg-[linear-gradient(to_right,#ef4444,#f97316,#eab308,#22c55e,#3b82f6,#a855f7)] flex items-center justify-center shrink-0">
          <User className="w-5 h-5 text-white" />
        </div>
      ),
    },
    {
      id: "manage",
      label: "Quản lý hồ sơ",
      icon: <Pencil size={20} />,
    },
    {
      id: "transfer",
      label: "Chuyển hồ sơ",
      icon: <ArrowLeftRight size={20} />,
    },
    {
      id: "account",
      label: "Tài khoản",
      icon: <User size={20} />,
    },
    {
      id: "help",
      label: "Trung tâm trợ giúp",
      icon: <HelpCircle size={20} />,
      separator: true,
    },
    {
      id: "logout",
      label: "Đăng xuất",
      icon: null,
      onClick: logout,
    },
  ];

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

  const handleMenuItemClick = (item: MenuItem) => {
    if (item.onClick) {
      item.onClick();
    }
    setIsOpen(false);
  };

  // Nếu chưa đăng nhập, hiển thị nút đăng nhập
  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-3">
        <button
          onClick={() => openAuthModal("register")}
          className={`rounded-lg px-4 py-2 text-sm font-bold transition-all duration-300 ${scrolled
            ? "bg-white text-black hover:bg-gray-200 shadow-md"
            : "bg-white/10 backdrop-blur-md border border-white/50 text-white hover:bg-white hover:text-black hover:border-white"
            }`}>
          Đăng ký
        </button>
        <button
          onClick={() => openAuthModal("login")}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90 shadow-lg shadow-primary/20">
          Đăng nhập
        </button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer transition-opacity duration-300 hover:opacity-80"
        aria-label="Menu người dùng">
        <Avatar className="cursor-pointer">
          <AvatarImage src={user?.profile?.avatarUrl || "/avatar.png"} alt="User" />
          <AvatarFallback className="transition-colors duration-300 bg-white/20 text-white border-white/30">
            {user?.profile?.fullName?.charAt(0).toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
      </button>

      {isOpen && (
        <div
          onWheel={(e) => {
            e.stopPropagation();
          }}
          onTouchMove={(e) => {
            e.stopPropagation();
          }}
          className="absolute right-0 top-full mt-2 w-56 rounded-lg bg-black/95 backdrop-blur-sm border border-white/10 shadow-xl z-50 transition-all duration-200 ease-out">
          <div className="py-2">
            {menuItems.map((item, index) => (
              <div key={item.id}>
                {item.separator && index > 0 && (
                  <div className="border-t border-white/10 my-1" />
                )}
                <button
                  onClick={() => handleMenuItemClick(item)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left cursor-pointer transition-colors hover:bg-white/5 ${item.id === "logout"
                    ? "text-white font-semibold justify-center"
                    : "text-white/90"
                    }`}>
                  {item.icon && <span className="shrink-0">{item.icon}</span>}
                  <span className="text-sm">{item.label}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
