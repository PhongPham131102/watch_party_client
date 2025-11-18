"use client";
import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Pencil,
  ArrowLeftRight,
  User,
  HelpCircle,
} from "lucide-react";

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

  const menuItems: MenuItem[] = [
    {
      id: "kids",
      label: "Trẻ em",
      icon: (
        <div className="w-8 h-8 rounded overflow-hidden bg-gradient-to-r from-red-500 via-orange-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 flex items-center justify-center shrink-0">
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
      label: "Đăng xuất khỏi Netflix",
      icon: null,
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

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer transition-opacity duration-300 hover:opacity-80"
        aria-label="Menu người dùng"
      >
        <Avatar className="cursor-pointer">
          <AvatarImage src="/avatar.png" alt="User" />
          <AvatarFallback
            className="transition-colors duration-300 bg-white/20 text-white border-white/30"
          >
            U
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
          className="absolute right-0 top-full mt-2 w-56 rounded-lg bg-black/95 backdrop-blur-sm border border-white/10 shadow-xl z-50 transition-all duration-200 ease-out"
        >
          <div className="py-2">
            {menuItems.map((item, index) => (
              <div key={item.id}>
                {item.separator && index > 0 && (
                  <div className="border-t border-white/10 my-1" />
                )}
                <button
                  onClick={() => handleMenuItemClick(item)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left cursor-pointer transition-colors hover:bg-white/5 ${
                    item.id === "logout"
                      ? "text-white font-semibold justify-center"
                      : "text-white/90"
                  }`}
                >
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
