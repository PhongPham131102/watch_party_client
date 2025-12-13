"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import NavMenu from "./NavMenu";
import HeaderSearch from "./HeaderSearch";
import HeaderNotifications from "./HeaderNotifications";
import HeaderAvatar from "./HeaderAvatar";
import AuthModal from "./AuthModal";
import { useAuthStore } from "../store/auth.store";

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
        }`}>
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="text-2xl font-bold text-primary tracking-wide hover:opacity-80 transition-opacity">
            WATCH PARTY
          </Link>
          <NavMenu scrolled={scrolled} />
        </div>
        <div className="flex items-center gap-4">
          <HeaderSearch />
          {isAuthenticated && <HeaderNotifications />}
          <HeaderAvatar scrolled={scrolled} />
        </div>
      </header>
      <AuthModal />
    </>
  );
};

export default Header;
