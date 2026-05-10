"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/store";
import { useT } from "@/i18n";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { path: "/ming",  charZh: "命", charEn: "Chart",   labelKey: "mingFull"  as const },
  { path: "/gua",   charZh: "卦", charEn: "Reading", labelKey: "guaFull"   as const },
  { path: "/wen",   charZh: "问", charEn: "Ask",      labelKey: "wenFull"   as const },
  { path: "/qian",  charZh: "签", charEn: "Sign",     labelKey: "qianFull"  as const },
  { path: "/meng",  charZh: "梦", charEn: "Dream",    labelKey: "mengFull"  as const },
  { path: "/ce",    charZh: "册", charEn: "Record",   labelKey: "ceFull"    as const },
  { path: "/ji",    charZh: "迹", charEn: "Trace",    labelKey: "jiFull"    as const },
];

export default function Sidebar() {
  const pathname = usePathname();
  const collapsed = useStore((s) => s.sidebarCollapsed);
  const locale = useStore((s) => s.locale);
  const t = useT();

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col h-screen sticky top-0 bg-sidebar transition-all duration-200 flex-shrink-0",
        collapsed ? "w-16" : "w-56"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 pt-6 pb-5">
        <div className="w-8 h-8 rounded-lg bg-coral-500/20 flex items-center justify-center flex-shrink-0">
          <span className="text-coral-300 font-serif text-base">渊</span>
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="overflow-hidden"
            >
              <p className="text-ink-100 font-serif text-base tracking-wider whitespace-nowrap">
                {locale === "zh" ? "观渊" : "InnerAbyss"}
              </p>
              <p className="text-ink-600 text-[10px] tracking-widest whitespace-nowrap">InnerAbyss</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="h-px bg-ink-800 mx-4 mb-4" />

      {/* 导航项 */}
      <nav className="flex-1 flex flex-col gap-1 px-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link key={item.path} href={item.path}>
              <div
                className={cn(
                  "nav-item",
                  isActive && "active",
                  collapsed && "justify-center px-2"
                )}
              >
                <span
                  className={cn(
                    "nav-icon text-lg font-serif leading-none flex-shrink-0",
                    isActive ? "text-coral-400" : "text-ink-500"
                  )}
                >
                  {locale === "zh" ? item.charZh : item.charEn.charAt(0)}
                </span>
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-sm whitespace-nowrap"
                    >
                      {t.nav[item.labelKey]}
                    </motion.span>
                  )}
                </AnimatePresence>
                {isActive && !collapsed && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="ml-auto w-1 h-4 rounded-full bg-coral-400"
                  />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* 底部 */}
      <div className="px-2 pb-4 space-y-1">
        <div className="h-px bg-ink-800 mx-2 mb-3" />
        <p className={cn("text-[10px] text-ink-700 px-2", collapsed && "hidden")}>
          观渊以知己
        </p>
      </div>
    </aside>
  );
}
