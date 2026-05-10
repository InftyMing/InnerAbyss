"use client";

import { useStore } from "@/store";
import { useT } from "@/i18n";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { locale, setLocale } = useStore();
  const t = useT();
  const isZh = locale === "zh";

  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center p-4">
      <div className="absolute top-4 right-4 flex items-center bg-ink-100 rounded-lg p-0.5">
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
            {lang === "zh" ? "\u4e2d" : "EN"}
          </button>
        ))}
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif text-ink-900 tracking-wider">
            {isZh ? t.brand.name : t.brand.nameEn}
          </h1>
          <p className="text-xs text-ink-400 mt-1 tracking-widest font-sans">
            {isZh ? t.brand.nameEn : t.brand.name}
          </p>
          <p className="text-sm text-ink-500 mt-3">{t.brand.slogan}</p>
        </div>
        {children}
      </div>
    </div>
  );
}
