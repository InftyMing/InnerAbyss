"use client";

import Link from "next/link";
import { useStore } from "@/store";
import { useT } from "@/i18n";
import TopBar from "@/components/layout/TopBar";
import ReadingPanel from "@/components/fortune/ReadingPanel";

export default function GuaPage() {
  const t = useT();
  const { bazi, reading } = useStore();

  if (!bazi || !reading) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <TopBar title={t.gua.title} subtitle={t.gua.subtitle} />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center space-y-4">
            <span className="text-5xl font-serif text-ink-300 block">{"\u5366"}</span>
            <p className="text-ink-500">{t.gua.needChart}</p>
            <Link
              href="/ming"
              className="inline-block px-6 py-2.5 bg-ink-900 text-white rounded-xl text-sm hover:bg-ink-800 transition-all"
            >
              {t.gua.goToMing}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar title={t.gua.title} subtitle={t.gua.subtitle} />
      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="max-w-3xl mx-auto">
          <ReadingPanel
            reading={reading}
            baziInfo={{ dayGan: bazi.dayGan, dayMaster: bazi.dayMaster }}
          />
        </div>
      </div>
    </div>
  );
}
