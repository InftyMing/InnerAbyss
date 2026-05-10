"use client";

import { signOut, useSession } from "next-auth/react";
import { useStore } from "@/store";
import { useT } from "@/i18n";
import { motion } from "framer-motion";

interface TopBarProps {
  title?: string;
  subtitle?: string;
}

export default function TopBar({ title, subtitle }: TopBarProps) {
  const { data: session } = useSession();
  const { locale, setLocale, toggleSidebar } = useStore();
  const t = useT();

  return (
    <header className="h-14 border-b border-ink-200 bg-white/80 backdrop-blur-sm flex items-center justify-between px-6 flex-shrink-0">
      {/* 左侧：折叠按钮 + 标题 */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="hidden md:flex w-8 h-8 items-center justify-center rounded-lg hover:bg-ink-100 transition-colors text-ink-400"
          aria-label="Toggle sidebar"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <rect y="2" width="16" height="1.5" rx="0.75" />
            <rect y="7.25" width="16" height="1.5" rx="0.75" />
            <rect y="12.5" width="16" height="1.5" rx="0.75" />
          </svg>
        </button>

        {title && (
          <div>
            <h1 className="text-sm font-serif font-semibold text-ink-800">{title}</h1>
            {subtitle && <p className="text-xs text-ink-400">{subtitle}</p>}
          </div>
        )}
      </div>

      {/* 右侧：语言切换 + 用户 */}
      <div className="flex items-center gap-3">
        {/* 语言切换 */}
        <div className="flex items-center bg-ink-100 rounded-lg p-0.5">
          {(["zh", "en"] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => setLocale(lang)}
              className={`px-2.5 py-1 text-xs rounded-md transition-all ${
                locale === lang
                  ? "bg-white text-ink-800 shadow-sm font-medium"
                  : "text-ink-400 hover:text-ink-600"
              }`}
            >
              {lang === "zh" ? "中" : "EN"}
            </button>
          ))}
        </div>

        {/* 用户头像 */}
        {session?.user && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-coral-100 border border-coral-200 flex items-center justify-center">
              <span className="text-xs font-serif text-coral-600">
                {(session.user.name ?? session.user.email ?? "?").charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="hidden sm:block text-xs text-ink-500 max-w-24 truncate">
              {session.user.name ?? session.user.email}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-xs text-ink-400 hover:text-ink-700 transition-colors"
            >
              {t.auth.logout}
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
