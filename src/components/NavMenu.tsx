"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useLayoutEffect } from "react";
import { useAuthStore } from "@/src/store/auth.store";
import { useWatchHistoryStore } from "@/src/store/watchHistoryStore";

const navItems = [
  { label: "Trang chủ", href: "/" },
  { label: "Danh sách của tôi", href: "/my-list" },
  { label: "Phim hành động", href: "/the-loai/hanh-dong" },
  { label: "Phim kinh dị", href: "/the-loai/kinh-di" },

  { label: "Phim lãng mạn", href: "/the-loai/lang-man" },
  { label: "Phim hoạt hình", href: "/the-loai/hoat-hinh" },
  { label: "Phim chính kịch", href: "/the-loai/chinh-kich" },
];

interface NavMenuProps {
  scrolled: boolean;
}

export default function NavMenu({ scrolled }: NavMenuProps) {
  const pathnameFromRouter = usePathname();
  const { isAuthenticated } = useAuthStore();
  const { fetchHistory } = useWatchHistoryStore();

  const [indicator, setIndicator] = useState({ x: 0, width: 0, opacity: 0 });
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    setMounted(true);
    if (isAuthenticated) {
      void fetchHistory(1, 40);
    }
  }, [isAuthenticated, fetchHistory]);

  const update = () => {
    if (!containerRef.current) return;

    const activeEl = containerRef.current.querySelector(
      '[data-active="true"]'
    ) as HTMLElement;

    if (activeEl) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const elRect = activeEl.getBoundingClientRect();

      setIndicator({
        x: elRect.left - containerRect.left,
        width: elRect.width,
        opacity: 1,
      });
    } else {
      setIndicator((prev) => ({ ...prev, opacity: 0 }));
    }
  };

  useLayoutEffect(() => {
    update();
    const t = setTimeout(update, 200);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("resize", update);
      clearTimeout(t);
    };
  }, [pathnameFromRouter, scrolled, mounted]);

  if (!mounted) return null;

  return (
    <nav className="hidden 2xl:block h-full">
      <ul
        ref={containerRef}
        className="flex items-center gap-1 list-none m-0 p-0 h-full relative"
      >
        {navItems.map((item) => {
          const path = pathnameFromRouter || "/";
          const isActive =
            item.href === "/" ? path === "/" : path.startsWith(item.href);

          return (
            <li key={item.href} className="flex items-center h-full relative">
              <Link
                href={item.href}
                data-active={isActive}
                className={`
                  relative px-3 py-2 font-medium text-sm whitespace-nowrap
                  transition-all duration-300
                  ${
                    isActive
                      ? "text-white"
                      : scrolled
                      ? "text-white/70 hover:text-white"
                      : "text-white/90 hover:text-white"
                  }
                  
                  /* Hiệu ứng gạch chân khi hover cho các tab không active */
                  after:absolute after:bottom-0 after:left-1/2 after:h-0.5 after:bg-primary/60 
                  after:transition-all after:duration-300 after:-translate-x-1/2 after:w-0
                  ${!isActive ? "hover:after:w-full" : ""}
                `}
              >
                {item.label}
              </Link>
            </li>
          );
        })}

        {/* Sliding Indicator cho tab ACTIVE */}
        <div
          className="absolute bottom-0 h-0.5 bg-primary transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]"
          style={{
            width: `${indicator.width}px`,
            transform: `translateX(${indicator.x}px)`,
            opacity: indicator.opacity,
          }}
        />
      </ul>
    </nav>
  );
}
