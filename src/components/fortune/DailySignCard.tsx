"use client";

import { motion } from "framer-motion";
import { ScoreRing } from "@/components/ui/fortune-ui";
import { useT } from "@/i18n";
import type { DailySign } from "@/types";

interface DailySignCardProps {
  sign: DailySign;
  today: Date;
}

export default function DailySignCard({ sign, today }: DailySignCardProps) {
  const t = useT();
  const trendCfg = {
    excellent: { label: t.qian.excellent, color: "text-jade-600",  bg: "bg-jade-100 border-jade-300" },
    good:      { label: t.qian.good,      color: "text-gold-600",  bg: "bg-gold-100 border-gold-300" },
    neutral:   { label: t.qian.neutral,   color: "text-ink-500",   bg: "bg-ink-100 border-ink-300" },
    caution:   { label: t.qian.caution,   color: "text-coral-500", bg: "bg-coral-100 border-coral-300" },
  }[sign.trend];

  // Date formatting works for both locales using toLocaleDateString
  const dateStr = today.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric", weekday: "short" });

  return (
    <motion.div className="card overflow-hidden" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} id="daily-sign-card">
      <div className="h-1 bg-gradient-to-r from-coral-400 via-gold-400 to-jade-400" />
      <div className="p-5 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-ink-400 font-sans">{dateStr}</p>
            <h3 className="text-2xl font-serif font-bold text-ink-900 mt-1">{sign.title}</h3>
          </div>
          <div className="flex flex-col items-center gap-1">
            <ScoreRing score={sign.score} size={64} />
            <span className={`text-xs font-semibold ${trendCfg.color}`}>{trendCfg.label}</span>
          </div>
        </div>
        <div className="p-4 bg-ink-50 rounded-xl border border-ink-200 text-center">
          <p className="text-sm font-serif text-ink-700 leading-relaxed tracking-wider">{"\u300c"}{sign.verse}{"\u300d"}</p>
        </div>
        <hr className="divider-ink" />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-jade-600 font-semibold mb-2 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-jade-500 inline-block" />{t.qian.yi}
            </p>
            <ul className="space-y-1.5">
              {sign.yi.map((item, i) => (
                <li key={i} className="text-xs text-ink-600 flex items-start gap-1.5">
                  <span className="text-jade-400 mt-0.5">{"\u2713"}</span>{item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs text-coral-500 font-semibold mb-2 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-coral-500 inline-block" />{t.qian.ji}
            </p>
            <ul className="space-y-1.5">
              {sign.ji.map((item, i) => (
                <li key={i} className="text-xs text-ink-600 flex items-start gap-1.5">
                  <span className="text-coral-400 mt-0.5">{"\u2717"}</span>{item}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <hr className="divider-ink" />
        <div className="flex items-center justify-around">
          <div className="text-center">
            <p className="text-[10px] text-ink-400 mb-1">{t.qian.luckyColor}</p>
            <p className="text-sm font-serif text-ink-700">{sign.lucky.color}</p>
          </div>
          <div className="w-px h-8 bg-ink-200" />
          <div className="text-center">
            <p className="text-[10px] text-ink-400 mb-1">{t.qian.luckyDir}</p>
            <p className="text-sm font-serif text-ink-700">{sign.lucky.direction}</p>
          </div>
          <div className="w-px h-8 bg-ink-200" />
          <div className="text-center">
            <p className="text-[10px] text-ink-400 mb-1">{t.qian.luckyNum}</p>
            <p className="text-sm font-serif text-ink-700">{sign.lucky.number}</p>
          </div>
        </div>
        <div className={`p-3 rounded-lg border ${trendCfg.bg}`}>
          <p className="text-[10px] text-ink-400 mb-1">{t.qian.insight}</p>
          <p className="text-xs text-ink-600 leading-relaxed">{sign.insight}</p>
        </div>
      </div>
    </motion.div>
  );
}
