"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import NavMenu from "./NavMenu";
import HeaderSearch from "./HeaderSearch";
import HeaderAvatar from "./HeaderAvatar";
import AuthModal from "./AuthModal";
import { useAuthStore } from "../store/auth.store";

import { Users, Sparkles } from "lucide-react";

const Header = () => {
  const { isAuthenticated } = useAuthStore();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`w-full h-16 flex items-center justify-between px-6 fixed top-0 left-0 z-50 transition-colors duration-300 ${
          scrolled ? "bg-black bg-opacity-90" : "bg-transparent"
        }`}
      >
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="text-2xl font-bold text-primary tracking-wide hover:opacity-80 transition-opacity"
          >
            WATCH PARTY
          </Link>
          <NavMenu scrolled={scrolled} />
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group">
            {/* Shaking star outside the button */}
            <div className="absolute -left-3 -top-2 z-20 animate-tilt-shake pointer-events-none">
              <Sparkles
                size={20}
                className="text-amber-300 fill-amber-300 drop-shadow-[0_0_8px_rgba(252,211,77,0.8)]"
              />
            </div>

            <Link
              href="/watch-party"
              className="relative flex items-center gap-2 rounded-full bg-amber-500 px-4 py-1.5 text-[0.7rem] font-bold text-black border-2 border-amber-300 hover:bg-amber-400 hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:shadow-[0_0_30px_rgba(245,158,11,0.6)] overflow-hidden"
            >
              <Users size={14} className="relative z-10" />
              <span className="relative z-10 tracking-tight">
                Tham gia Rạp Chung
              </span>

              {/* Shimmer effect on hover */}
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-linear-to-r from-transparent via-white/40 to-transparent"></span>
            </Link>
          </div>
          <HeaderSearch />
          <HeaderAvatar scrolled={scrolled} />
        </div>
      </header>
      <AuthModal />
    </>
  );
};

export default Header;
