"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useT } from "@/i18n";
import { useStore } from "@/store";
import { computeZiwei } from "@/lib/ziwei";
import type { BaziDisplay, UserBirthInfo } from "@/types";

interface ZiweiPanelProps {
  bazi: BaziDisplay;
  birthInfo: UserBirthInfo;
}

export default function ZiweiPanel({ bazi, birthInfo }: ZiweiPanelProps) {
  const t = useT();
  const locale = useStore((s) => s.locale);

  const ziwei = useMemo(() => computeZiwei({
    yearGan: bazi.yearGan as never,
    yearZhi: bazi.yearZhi as never,
    month: birthInfo.month,
    day: birthInfo.day,
    hour: birthInfo.hour,
  }, locale), [bazi, birthInfo, locale]);

  const relationLabel = {
    in: t.ming.ziweiRelationIn,
    opposite: t.ming.ziweiRelationOpposite,
    adjacent: t.ming.ziweiRelationAdjacent,
    elsewhere: t.ming.ziweiRelationElsewhere,
  }[ziwei.ziweiVsMingGong];

  const palaceName = locale === "en" ? ziwei.ziweiPalace.labelEn : ziwei.ziweiPalace.label;

  return (
    <motion.div
      className="card p-5 space-y-4"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-serif font-semibold text-ink-800">{t.ming.ziweiTitle}</h3>
          <p className="text-xs text-ink-400 mt-0.5">{t.ming.ziweiAbout}</p>
        </div>
        <span className="seal">{t.ming.ziweiSeal}</span>
      </div>

      <hr className="divider-ink" />

      <div className="grid grid-cols-2 gap-3">
        <PalaceTile
          label={t.ming.ziweiPalaceMing}
          ganzhi={`${ziwei.mingGong.gan}${ziwei.mingGong.zhi}`}
          subtitle={`${locale === "en" ? ziwei.mingGong.labelEn : ziwei.mingGong.label}${t.ming.ziweiPalaceSuffix}`}
          color="#7c4da0"
          bg="#f0e8f7"
        />
        <PalaceTile
          label={t.ming.ziweiPalaceShen}
          ganzhi={ziwei.shenGong.zhi}
          subtitle={`${locale === "en" ? ziwei.shenGong.labelEn : ziwei.shenGong.label}${t.ming.ziweiPalaceSuffix}`}
          color="#b8891e"
          bg="#faf3dc"
        />
        <PalaceTile
          label={t.ming.ziweiBureau}
          ganzhi={locale === "en" ? ziwei.ju.nameEn : ziwei.ju.name}
          subtitle={`\u00b7 ${ziwei.ju.element} \u00b7`}
          color="#2e8b57"
          bg="#e8f5ef"
        />
        <PalaceTile
          label={t.ming.ziweiStarPalace}
          ganzhi={palaceName}
          subtitle={relationLabel}
          color="#a85a46"
          bg="#f7ebe7"
        />
      </div>

      {ziwei.mingGongMainStar && (
        <div className="flex items-center justify-between p-3 bg-ink-50 rounded-xl border border-ink-200">
          <span className="text-xs text-ink-400">{t.ming.ziweiMainStar}</span>
          <span className="text-sm font-serif font-bold text-ink-800">
            {ziwei.mingGongMainStar}
          </span>
        </div>
      )}

      <p className="text-[10px] text-ink-400 italic leading-relaxed">{t.ming.ziweiApproxNote}</p>
    </motion.div>
  );
}

function PalaceTile({
  label,
  ganzhi,
  subtitle,
  color,
  bg,
}: {
  label: string;
  ganzhi: string;
  subtitle: string;
  color: string;
  bg: string;
}) {
  return (
    <div className="rounded-lg p-3 border" style={{ backgroundColor: bg, borderColor: `${color}55` }}>
      <p className="text-[10px] tracking-widest uppercase" style={{ color }}>{label}</p>
      <p className="text-lg font-serif font-bold text-ink-800 mt-0.5">{ganzhi}</p>
      <p className="text-[10px] text-ink-500 mt-0.5 truncate">{subtitle}</p>
    </div>
  );
}
