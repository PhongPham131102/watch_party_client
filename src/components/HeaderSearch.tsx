"use client";
import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";

interface HeaderSearchProps {
  scrolled: boolean;
}

export default function HeaderSearch({ scrolled }: HeaderSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSearchClick = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setSearchValue("");
    setIsOpen(false);
  };

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        !searchValue
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        setSearchValue("");
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
  }, [isOpen, searchValue]);

  return (
    <div ref={containerRef} className="relative flex items-center">
      {!isOpen ? (
        <button
          onClick={handleSearchClick}
          className={`p-2 transition-all duration-300 hover:opacity-70 hover:scale-110 ${
            scrolled ? "text-white" : "text-black"
          }`}
          aria-label="Mở tìm kiếm"
        >
          <Search size={24} />
        </button>
      ) : (
        <div className="relative flex items-center w-64">
          <div
            className="relative w-full"
            style={{
              animation: "slideInRight 0.3s ease-out",
            }}
          >
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70 z-10 transition-colors duration-200"
              size={18}
            />
            <Input
              ref={inputRef}
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Phim, diễn viên, thể loại..."
              className="pl-10 pr-10 py-2.5 rounded-md bg-black/80 backdrop-blur-md border border-gray-500/30 text-white placeholder:text-white/50 focus:border-gray-400/50 focus:bg-black/90 focus:ring-2 focus:ring-gray-400/20 focus:outline-none transition-all duration-200 shadow-lg"
            />
            {searchValue && (
              <button
                onClick={handleClose}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-all duration-200 hover:scale-110"
                aria-label="Xóa tìm kiếm"
              >
                <X size={16} className="text-white/70" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
