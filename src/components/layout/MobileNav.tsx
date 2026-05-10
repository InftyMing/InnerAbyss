"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { path: "/ming",  char: "\u547d" },
  { path: "/gua",   char: "\u5366" },
  { path: "/wen",   char: "\u95ee" },
  { path: "/qian",  char: "\u7b7e" },
  { path: "/meng",  char: "\u68a6" },
  { path: "/ce",    char: "\u518c" },
  { path: "/ji",    char: "\u8ff9" },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-ink-200 flex">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.path;
        return (
          <Link
            key={item.path}
            href={item.path}
            className={cn(
              "flex-1 flex flex-col items-center py-2 gap-0.5 transition-colors",
              isActive ? "text-coral-500" : "text-ink-400"
            )}
          >
            <span className="text-base font-serif leading-none">{item.char}</span>
            {isActive && (
              <span className="w-1 h-1 rounded-full bg-coral-400" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
