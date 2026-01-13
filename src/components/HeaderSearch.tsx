"use client";
import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface HeaderSearchProps {
  isOpen: boolean;
  onToggle: (isOpen: boolean) => void;
}

export default function HeaderSearch({ isOpen, onToggle }: HeaderSearchProps) {
  const [searchValue, setSearchValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleSearchClick = () => {
    onToggle(true);
  };

  const handleClose = () => {
    setSearchValue("");
    onToggle(false);
  };

  const handleSubmit = () => {
    const trimmed = searchValue.trim();
    if (!trimmed) return;
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    onToggle(false);
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
        onToggle(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        setSearchValue("");
        onToggle(false);
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
          className="p-2 transition-all duration-300 hover:opacity-70 hover:scale-110 text-white"
          aria-label="Mở tìm kiếm"
        >
          <Search size={24} />
        </button>
      ) : (
        <div className="absolute right-0 top-1/2 -translate-y-1/2 z-20 flex items-center">
          <div
            className="relative w-[calc(100vw-80px)] sm:w-64 md:w-72"
            style={{
              animation: "slideInRight 0.3s ease-out",
            }}
          >
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70 z-10"
              size={18}
            />
            <Input
              ref={inputRef}
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder="Tìm kiếm phim..."
              className="pl-10 pr-10 py-2 h-9 sm:h-10 text-sm rounded-md bg-black/95 backdrop-blur-md border border-gray-500/30 text-white placeholder:text-white/50 focus:border-gray-400/50 focus:bg-black/90 focus:outline-none shadow-2xl"
            />
            {searchValue && (
              <button
                onClick={handleClose}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-all"
                aria-label="Delete"
              >
                <X size={14} className="text-white/70" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
