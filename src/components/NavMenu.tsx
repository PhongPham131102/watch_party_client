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
  { label: "Series", href: "/series" },
  { label: "Phim", href: "/movies" },
  { label: "Mới & Phổ biến", href: "/popular" },
  { label: "Danh sách của tôi", href: "/my-list" },
  { label: "Duyệt theo ngôn ngữ", href: "/languages" },
];

import { usePathname } from "next/navigation";

interface NavMenuProps {
  scrolled: boolean;
}

export default function NavMenu({ scrolled }: NavMenuProps) {
  const pathname = usePathname();
  return (
    <NavigationMenu>
      <NavigationMenuList className="gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <NavigationMenuItem key={item.label}>
              <NavigationMenuLink asChild>
                <Link
                  href={item.href}
                  className={`
                    relative px-3 py-2 font-medium text-sm
                    bg-transparent hover:bg-transparent
                    transition-all duration-300 ease-in-out
                    ${
                      isActive
                        ? scrolled
                          ? "text-white"
                          : "text-black"
                        : scrolled
                        ? "text-white/70 hover:text-white"
                        : "text-black/80 hover:text-black"
                    }
                    ${
                      isActive
                        ? "after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary after:transition-all after:duration-300"
                        : "after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
                    }
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50 rounded-sm
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
