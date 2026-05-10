"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useT } from "@/i18n";
import type { BaziDisplay, DailySign } from "@/types";

const WUXING_KEYS = ['\u6728','\u706b','\u571f','\u91d1','\u6c34'] as const;

const WUXING_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  [WUXING_KEYS[0]]: { text: "#2e8b57", bg: "#e8f5ef", border: "#52b788" },
  [WUXING_KEYS[1]]: { text: "#c47a66", bg: "#f7ebe7", border: "#d4937f" },
  [WUXING_KEYS[2]]: { text: "#b8891e", bg: "#faf3dc", border: "#d4a843" },
  [WUXING_KEYS[3]]: { text: "#5c5845", bg: "#f4f4f2", border: "#9e9880" },
  [WUXING_KEYS[4]]: { text: "#2563eb", bg: "#eff6ff", border: "#93c5fd" },
};

interface ShareCardProps {
  bazi: BaziDisplay;
  name?: string;
  dailySign?: DailySign;
}

export default function ShareCard({ bazi, name, dailySign }: ShareCardProps) {
  const t = useT();
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const elementColors = WUXING_COLORS[bazi.dayMaster.element] ?? WUXING_COLORS[WUXING_KEYS[2]];
  const today = new Date();
  const dateStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, "0")}.${String(today.getDate()).padStart(2, "0")}`;

  async function handleDownload() {
    if (!cardRef.current) return;
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cardRef.current, { scale: 3, backgroundColor: "#f7f5f0", useCORS: true });
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `InnerAbyss_${dateStr}.png`;
      a.click();
    } catch (err) {
      console.error("download failed:", err);
    }
  }

  async function handleCopyText() {
    const strengthMap = { strong: t.ming.strong, weak: t.ming.weak, balanced: t.ming.balanced };
    const text = [
      `${t.ming.bazi}`,
      `${bazi.yearGan}${bazi.yearZhi} ${bazi.monthGan}${bazi.monthZhi} ${bazi.dayGan}${bazi.dayZhi} ${bazi.hourGan}${bazi.hourZhi}`,
      `${t.ming.dayMaster}: ${bazi.dayGan} (${bazi.dayMaster.element}, ${strengthMap[bazi.dayMaster.strength]})`,
      `${t.share.missingFive}: ${bazi.missingElements.length > 0 ? bazi.missingElements.join("\u3001") : t.share.none}`,
      ...(dailySign ? [``, `${t.share.todaySign}: ${dailySign.title} (${dailySign.score})`, `\u300c${dailySign.verse}\u300d`] : []),
      ``,
      `via ${t.brand.name} \u00b7 ${t.brand.nameEn}`,
    ].join("\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const pillars = [
    { gan: bazi.yearGan,  zhi: bazi.yearZhi,  label: t.ming.yearPillar },
    { gan: bazi.monthGan, zhi: bazi.monthZhi, label: t.ming.monthPillar },
    { gan: bazi.dayGan,   zhi: bazi.dayZhi,   label: t.ming.dayPillar },
    { gan: bazi.hourGan,  zhi: bazi.hourZhi,  label: t.ming.hourPillar },
  ];

  const strengthLabel = { strong: t.ming.strong, weak: t.ming.weak, balanced: t.ming.balanced }[bazi.dayMaster.strength];

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="w-full py-2.5 border border-ink-300 rounded-lg text-sm text-ink-600 hover:bg-ink-50 transition-all flex items-center justify-center gap-2">
        <span>{t.share.shareNow}</span><span className="text-xs">&#x2197;</span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsOpen(false)}>
            <motion.div className="w-full max-w-md bg-white rounded-t-2xl p-5 space-y-4" initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 30 }} onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-semibold text-ink-800">{t.share.cardTitle}</h3>
                <button onClick={() => setIsOpen(false)} className="text-ink-400 text-xl">&times;</button>
              </div>
              <div ref={cardRef} className="rounded-2xl overflow-hidden border" style={{ backgroundColor: "#f7f5f0", borderColor: elementColors.border }}>
                <div className="h-1.5" style={{ background: `linear-gradient(to right, ${elementColors.border}, ${elementColors.text})` }} />
                <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs" style={{ color: elementColors.text }}>{t.brand.name}{" \u00b7 "}{t.brand.nameEn}</p>
                      <p className="text-lg font-serif font-bold text-ink-900">{name ? `${name}${t.ming.chartOf}` : t.ming.myChart}</p>
                    </div>
                    <div className="w-12 h-12 rounded-full flex items-center justify-center font-serif text-2xl font-bold" style={{ backgroundColor: elementColors.bg, color: elementColors.text }}>
                      {bazi.dayGan}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 p-3 rounded-xl" style={{ backgroundColor: elementColors.bg }}>
                    {pillars.map((p, i) => (
                      <div key={i} className="flex flex-col items-center gap-0.5">
                        <span className="text-[10px]" style={{ color: elementColors.text }}>{p.label}</span>
                        <span className="text-xl font-serif font-bold text-ink-900">{p.gan}</span>
                        <div className="w-px h-2 bg-ink-300" />
                        <span className="text-xl font-serif font-bold text-ink-700">{p.zhi}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between px-1">
                    <div><p className="text-xs text-ink-400">{t.share.dayMasterFive}</p><p className="text-lg font-serif font-bold" style={{ color: elementColors.text }}>{bazi.dayMaster.element}</p></div>
                    <div><p className="text-xs text-ink-400">{t.share.pattern}</p><p className="text-lg font-serif font-bold text-ink-700">{strengthLabel}</p></div>
                    <div><p className="text-xs text-ink-400">{t.share.missingFive}</p><p className="text-lg font-serif font-bold text-ink-700">{bazi.missingElements.length > 0 ? bazi.missingElements.join("") : t.share.none}</p></div>
                  </div>
                  {dailySign && (
                    <>
                      <div className="h-px bg-ink-200" />
                      <div className="text-center">
                        <p className="text-[10px] text-ink-400 mb-1">{t.share.todaySign}{" \u00b7 "}{dateStr}</p>
                        <p className="text-xl font-serif font-bold text-ink-900">{dailySign.title}</p>
                        <p className="text-xs text-ink-500 mt-1">{"\u300c"}{dailySign.verse}{"\u300d"}</p>
                      </div>
                    </>
                  )}
                  <div className="flex items-center justify-between pt-1">
                    <p className="text-[10px] text-ink-300">{t.brand.slogan}</p>
                    <p className="text-[10px] text-ink-300">{dateStr}</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={handleCopyText} className="py-3 border border-ink-200 rounded-xl text-sm text-ink-600 hover:bg-ink-50 transition-all">
                  {copied ? t.share.copied : t.share.copyText}
                </button>
                <button onClick={handleDownload} className="py-3 bg-ink-900 text-white rounded-xl text-sm hover:bg-ink-800 transition-all">
                  {t.share.saveImage}
                </button>
              </div>
              <p className="text-center text-xs text-ink-300">{t.share.saveHint}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
