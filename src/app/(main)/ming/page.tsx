"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/store";
import { useT } from "@/i18n";
import TopBar from "@/components/layout/TopBar";
import BirthForm from "@/components/fortune/BirthForm";
import BaziPanel from "@/components/fortune/BaziPanel";
import ZiweiPanel from "@/components/fortune/ZiweiPanel";
import ShareCard from "@/components/fortune/ShareCard";
import { LoadingInk } from "@/components/ui/fortune-ui";
import type { UserBirthInfo } from "@/types";

export default function MingPage() {
  const t = useT();
  const { birthInfo, bazi, setBirthInfo, setBazi, setReading, clearAll, locale } = useStore();
  const [loading, setLoading] = useState(false);
  const [errorKey, setErrorKey] = useState<string | null>(null);

  const hasChart = !!bazi;

  async function handleSubmit(info: UserBirthInfo) {
    setLoading(true);
    setErrorKey(null);
    try {
      const res = await fetch("/api/fortune", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...info, locale }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.errorCode ?? "fortuneFailed");
      setBirthInfo(info);
      setBazi(data.bazi);
      setReading(data.reading);
    } catch (err) {
      const code = err instanceof Error ? err.message : "fortuneFailed";
      setErrorKey(code);
    } finally {
      setLoading(false);
    }
  }

  function getErrorText(code: string): string {
    type ErrKey = keyof typeof t.errors;
    if ((t.errors as Record<string, string>)[code]) {
      return (t.errors as Record<ErrKey, string>)[code as ErrKey];
    }
    return t.errors.fortuneFailed;
  }

  const quickLinks = [
    { href: "/gua",  char: "\u5366", label: t.ming.quickGua },
    { href: "/qian", char: "\u7b7e", label: t.ming.quickQian },
    { href: "/meng", char: "\u68a6", label: t.ming.quickMeng },
    { href: "/ji",   char: "\u8ff9", label: t.ming.quickJi },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar title={t.ming.title} subtitle={t.ming.subtitle} />
      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            {!hasChart && !loading && (
              <motion.div
                key="hero"
                className="grid md:grid-cols-2 gap-8 items-start"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex flex-col justify-center py-8 md:py-16">
                  <div className="relative inline-block mb-6 w-fit">
                    <div className="w-24 h-24 rounded-full bg-ink-100 border border-ink-300 flex items-center justify-center animate-breathe">
                      <span className="text-4xl font-serif text-ink-700">{"\u547d"}</span>
                    </div>
                    <div className="absolute inset-0 rounded-full border border-ink-200 scale-125 opacity-40 animate-breathe" style={{ animationDelay: "0.5s" }} />
                  </div>
                  <h1 className="text-3xl font-serif font-bold text-ink-900 mb-3">
                    {t.ming.intro}
                  </h1>
                  <p className="text-ink-500 text-sm leading-relaxed">{t.ming.introSub}</p>
                  <p className="text-xs text-ink-300 mt-4 italic">{t.brand.tagline}</p>
                </div>
                <div>
                  <BirthForm onSubmit={handleSubmit} isLoading={loading} />
                </div>
              </motion.div>
            )}

            {loading && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <LoadingInk text={t.ming.calculating} />
              </motion.div>
            )}

            {hasChart && bazi && !loading && (
              <motion.div
                key="chart"
                className="space-y-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-serif font-bold text-ink-800">
                      {birthInfo?.name ? `${birthInfo.name}${t.ming.chartOf}` : t.ming.myChart}
                    </h2>
                    <p className="text-sm text-ink-400 mt-0.5">{t.ming.chartReady}</p>
                  </div>
                  <button
                    onClick={clearAll}
                    className="text-xs text-ink-400 hover:text-coral-500 transition-colors border border-ink-200 px-3 py-1.5 rounded-lg"
                  >
                    {t.ming.resetChart}
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <BaziPanel bazi={bazi} name={birthInfo?.name} />
                    {birthInfo && <ZiweiPanel bazi={bazi} birthInfo={birthInfo} />}
                  </div>
                  <div className="space-y-4">
                    <ShareCard bazi={bazi} name={birthInfo?.name} />
                    <div className="card p-4">
                      <p className="text-xs text-ink-400 mb-3">{t.ming.nextSteps}</p>
                      <div className="grid grid-cols-2 gap-2">
                        {quickLinks.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-2 p-3 rounded-lg border border-ink-100 hover:border-ink-300 hover:bg-ink-50 transition-all"
                          >
                            <span className="text-lg font-serif text-ink-600">{item.char}</span>
                            <span className="text-xs text-ink-500">{item.label}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {errorKey && (
            <div className="mt-4 p-3 bg-coral-100 border border-coral-300 rounded-lg">
              <p className="text-sm text-coral-600">{getErrorText(errorKey)}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
