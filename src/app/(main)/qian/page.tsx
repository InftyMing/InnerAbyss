"use client";

import { useState } from "react";
import Link from "next/link";
import { useStore } from "@/store";
import { useT } from "@/i18n";
import TopBar from "@/components/layout/TopBar";
import DailySignCard from "@/components/fortune/DailySignCard";
import { LoadingInk } from "@/components/ui/fortune-ui";

export default function QianPage() {
  const t = useT();
  const { birthInfo, bazi, dailySign, dailySignDate, setDailySign, addDiaryEntry, locale } = useStore();
  const [loading, setLoading] = useState(false);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const today = new Date();
  const todayStr = today.toDateString();
  const hasToday = dailySignDate === todayStr && !!dailySign;

  async function fetchSign() {
    if (!birthInfo) return;
    setLoading(true);
    setErrorKey(null);
    setSaved(false);
    try {
      const res = await fetch("/api/daily-sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...birthInfo, locale }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.errorCode ?? "dailySignFailed");
      setDailySign(data.dailySign, todayStr);
    } catch (err) {
      setErrorKey(err instanceof Error ? err.message : "dailySignFailed");
    } finally {
      setLoading(false);
    }
  }

  function saveToRecord() {
    if (!dailySign) return;
    addDiaryEntry({
      id: Date.now().toString(),
      date: today.toLocaleDateString(),
      prediction: `[${t.qian.title} \u00b7 ${dailySign.title}] ${dailySign.verse}. ${dailySign.insight}`,
      type: "sign",
    });
    setSaved(true);
  }

  function getErrorText(code: string): string {
    if ((t.errors as Record<string, string>)[code]) {
      return (t.errors as Record<string, string>)[code];
    }
    return t.errors.dailySignFailed;
  }

  if (!bazi) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <TopBar title={t.qian.title} subtitle={t.qian.subtitle} />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center space-y-4">
            <span className="text-5xl font-serif text-ink-300 block">{"\u7b7e"}</span>
            <p className="text-ink-500">{t.common.noBazi}</p>
            <Link href="/ming" className="inline-block px-6 py-2.5 bg-ink-900 text-white rounded-xl text-sm hover:bg-ink-800 transition-all">
              {t.gua.goToMing}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar title={t.qian.title} subtitle={t.qian.subtitle} />
      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="max-w-lg mx-auto space-y-4">
          {loading ? (
            <LoadingInk text={t.qian.drawingSign} />
          ) : hasToday && dailySign ? (
            <>
              <DailySignCard sign={dailySign} today={today} />
              <div className="flex gap-3">
                <button
                  onClick={fetchSign}
                  className="flex-1 py-2.5 text-xs text-ink-400 hover:text-ink-600 border border-ink-200 rounded-xl transition-colors"
                >
                  {t.qian.redraw}
                </button>
                <button
                  onClick={saveToRecord}
                  disabled={saved}
                  className="flex-1 py-2.5 text-xs bg-jade-500 text-white rounded-xl hover:bg-jade-600 disabled:opacity-50 transition-colors"
                >
                  {saved ? t.qian.saved : t.qian.saveToRecord}
                </button>
              </div>
            </>
          ) : (
            <div className="card p-12 text-center space-y-6">
              <span className="text-6xl font-serif text-ink-400 block animate-breathe">{"\u7b7e"}</span>
              <div>
                <p className="font-serif text-ink-600 text-lg">{t.qian.notYet}</p>
                <p className="text-sm text-ink-400 mt-1">{t.qian.notYetSub}</p>
              </div>
              <button
                onClick={fetchSign}
                className="px-8 py-3 bg-ink-900 text-white rounded-xl text-sm font-serif tracking-widest hover:bg-ink-800 transition-all"
              >
                {t.qian.draw}
              </button>
            </div>
          )}
          {errorKey && (
            <div className="p-3 bg-coral-100 border border-coral-200 rounded-xl">
              <p className="text-sm text-coral-600">{getErrorText(errorKey)}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
