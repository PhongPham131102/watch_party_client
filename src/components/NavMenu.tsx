"use client";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import Link from "next/link";

const navItems = [
  { label: "Trang chủ", href: "/" },
  { label: "Danh sách của tôi", href: "/my-list" },
  { label: "Phim hành động", href: "/the-loai/hanh-dong" },
  { label: "Phim kinh dị", href: "/the-loai/kinh-di" },
  { label: "Phim viễn tưởng", href: "/the-loai/vien-tuong" },
  { label: "Phim lãng mạn", href: "/the-loai/lang-man" },
  { label: "Phim hoạt hình", href: "/the-loai/hoat-hinh" },
  { label: "Phim chính kịch", href: "/the-loai/chinh-kich" },
];

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "@/src/store/auth.store";
import { useWatchHistoryStore } from "@/src/store/watchHistoryStore";

interface NavMenuProps {
  scrolled: boolean;
}

export default function NavMenu({ scrolled }: NavMenuProps) {
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();
  const { fetchHistory } = useWatchHistoryStore();

  useEffect(() => {
    if (isAuthenticated) {
      void fetchHistory(1, 40); // Fetch enough to cover common cards
    }
  }, [isAuthenticated, fetchHistory]);
  return (
    <NavigationMenu className="w-full">
      <NavigationMenuList className="gap-1 flex-wrap">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <NavigationMenuItem key={item.label}>
              <NavigationMenuLink
                asChild
                className="bg-transparent hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0">
                <Link
                  href={item.href}
                  className={`
                     focus-visible:ring-0 focus-visible:ring-offset-0
                     outline-none!
                     color-transparent!
                    relative px-3 py-2 font-medium text-sm
                    bg-transparent hover:bg-transparent
                    transition-all duration-300 ease-in-out
                    ${isActive
                      ? "text-white"
                      : scrolled
                        ? "text-white/70 hover:text-white"
                        : "text-white/90 hover:text-white"
                    }
                    ${isActive
                      ? "after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary after:transition-all after:duration-300"
                      : "after:absolute after:bottom-0 after:left-1/2 after:h-0.5 after:bg-primary after:transition-all after:duration-300 after:-translate-x-1/2 after:w-0 hover:after:w-full focus:after:w-full"
                    }
                    focus:outline-none focus:bg-transparent! focus:text-white! rounded-md focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary/50 focus-visible:ring-offset-black
                  `}>
                  {item.label}
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          );
        })}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
