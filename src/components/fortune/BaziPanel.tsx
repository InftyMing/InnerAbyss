"use client";

import { motion } from "framer-motion";
import { GanZhiPillar, WuxingBadge } from "@/components/ui/fortune-ui";
import { useT } from "@/i18n";
import type { BaziDisplay } from "@/types";

const WUXING_ORDER = ['\u6728','\u706b','\u571f','\u91d1','\u6c34'] as const;
const WUXING_COLORS: Record<string, string> = {
  [WUXING_ORDER[0]]: "#2e8b57",
  [WUXING_ORDER[1]]: "#c47a66",
  [WUXING_ORDER[2]]: "#b8891e",
  [WUXING_ORDER[3]]: "#5c5845",
  [WUXING_ORDER[4]]: "#2563eb",
};

interface BaziPanelProps {
  bazi: BaziDisplay;
  name?: string;
}

export default function BaziPanel({ bazi, name }: BaziPanelProps) {
  const t = useT();
  const { yearGan, yearZhi, monthGan, monthZhi, dayGan, dayZhi, hourGan, hourZhi, wuxingCount, dayMaster, missingElements } = bazi;
  const totalCount = Object.values(wuxingCount).reduce((a, b) => a + b, 0);
  const strengthLabel = { strong: t.ming.strong, weak: t.ming.weak, balanced: t.ming.balanced }[dayMaster.strength];
  const strengthColor = { strong: "text-coral-500", weak: "text-jade-500", balanced: "text-gold-500" }[dayMaster.strength];

  return (
    <motion.div className="card p-6 space-y-5" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-serif font-semibold text-ink-800">
            {name ? `${name}${t.ming.chartOf}` : t.ming.myChart}
          </h2>
          <p className="text-xs text-ink-400 mt-0.5">
            {t.ming.dayMaster} <span className="font-serif font-bold text-ink-700">{dayGan}</span>
            {" ("}<span className={`font-semibold ${strengthColor}`}>{dayMaster.element}{" \u00b7 "}{strengthLabel}</span>{")"}
          </p>
        </div>
        <span className="seal">{t.ming.bazi}</span>
      </div>
      <hr className="divider-ink" />
      <div className="grid grid-cols-4 gap-2">
        <GanZhiPillar gan={yearGan}  zhi={yearZhi}  label={t.ming.yearPillar} />
        <GanZhiPillar gan={monthGan} zhi={monthZhi} label={t.ming.monthPillar} />
        <GanZhiPillar gan={dayGan}   zhi={dayZhi}   label={t.ming.dayPillar} isDay />
        <GanZhiPillar gan={hourGan}  zhi={hourZhi}  label={t.ming.hourPillar} />
      </div>
      <hr className="divider-ink" />
      <div>
        <p className="text-xs text-ink-500 mb-3">{t.ming.wuxing}</p>
        <div className="space-y-2">
          {WUXING_ORDER.map((w) => {
            const count = wuxingCount[w] ?? 0;
            const pct = totalCount > 0 ? (count / totalCount) * 100 : 0;
            const isMissing = missingElements.includes(w);
            return (
              <div key={w} className="flex items-center gap-2.5">
                <WuxingBadge element={w} size="sm" />
                <div className="flex-1 h-2 bg-ink-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: WUXING_COLORS[w] }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, delay: WUXING_ORDER.indexOf(w) * 0.1 }}
                  />
                </div>
                <span className="text-xs text-ink-500 w-10 text-right font-sans">{count} {t.ming.wuxingCount}</span>
                {isMissing && (
                  <span className="text-[10px] text-coral-400 bg-coral-100 px-1.5 py-0.5 rounded">{t.ming.missingTag}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {missingElements.length > 0 && (
        <div className="p-3 bg-gold-100 rounded-lg border border-gold-300">
          <p className="text-xs text-gold-600">
            <span className="font-semibold">{t.ming.missing}</span>
            {missingElements.join("\u3001")}
          </p>
          <p className="text-xs text-gold-500 mt-1">{t.ming.missingNote}</p>
        </div>
      )}
    </motion.div>
  );
}
