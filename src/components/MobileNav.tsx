"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

const navItems = [
  { label: "Trang chủ", href: "/" },
  { label: "Danh sách của tôi", href: "/my-list" },
  { label: "Phim hành động", href: "/the-loai/hanh-dong" },
  { label: "Phim kinh dị", href: "/the-loai/kinh-di" },

  { label: "Phim lãng mạn", href: "/the-loai/lang-man" },
  { label: "Phim hoạt hình", href: "/the-loai/hoat-hinh" },
  { label: "Phim chính kịch", href: "/the-loai/chinh-kich" },
];

export default function MobileNav({ scrolled }: { scrolled: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="2xl:hidden">
      <button
        onClick={() => setIsOpen(true)}
        className={`p-2 -ml-2 rounded-md transition-colors ${
          scrolled ? "text-white" : "text-white"
        }`}
        aria-label="Open menu"
      >
        <Menu size={24} />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 bottom-0 w-[280px] bg-zinc-950/95 backdrop-blur-xl z-50 p-6 shadow-2xl transition-transform duration-300 ease-in-out border-r border-white/10 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="text-xl font-bold text-primary tracking-wide"
            onClick={() => setIsOpen(false)}
          >
            WATCH PARTY
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex flex-col gap-2">
          {navItems.map((item) => {
            const path = pathname || "/";
            const isActive =
              item.href === "/" ? path === "/" : path.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`px-4 py-3 rounded-lg text-lg font-medium transition-all ${
                  isActive
                    ? "bg-primary/20 text-primary"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
