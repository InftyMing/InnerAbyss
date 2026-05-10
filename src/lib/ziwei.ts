// Ziwei Doushu (Purple Star) — basic palace + Ziwei placement.
// Uses the canonical Chinese formulas:
// - mingGong (life palace): 寅起正月, 子起子时, 顺数生月逆数生时
// - shenGong (body palace): 寅起正月, 子起子时, 顺数生月顺数生时
// - mingGong gan: derived from year gan via 五虎遁 (Five Tigers) rule
// - 五行局 (bureau): 纳音五行 of mingGong ganzhi → ju number 2..6
// - 紫微星 palace: standard lookup table by (ju, lunar day)
//
// This intentionally avoids a lunar-calendar conversion: it accepts the
// solar day as a proxy and notes the result as approximate.

import { TIANGAN, DIZHI, type Tiangan, type Dizhi, type Wuxing } from "./bazi";

const ZHI_BIRTH = 2; // 寅 starts the cycle for both palaces.

// 五虎遁: which gan starts at 寅 month for each year-gan group.
// 甲己→丙(2), 乙庚→戊(4), 丙辛→庚(6), 丁壬→壬(8), 戊癸→甲(0)
const FIVE_TIGER_OFFSET: Record<number, number> = {
  0: 2, 5: 2, // 甲, 己
  1: 4, 6: 4, // 乙, 庚
  2: 6, 7: 6, // 丙, 辛
  3: 8, 8: 8, // 丁, 壬
  4: 0, 9: 0, // 戊, 癸
};

// 纳音 element pattern (length 15, repeats twice across 30 jiazi pairs)
// Element indices: 0=Wood 木, 1=Fire 火, 2=Earth 土, 3=Metal 金, 4=Water 水
const NAYIN_PATTERN_15: number[] = [
  3, 1, 0, 2, 3,
  1, 4, 2, 3, 0,
  4, 2, 1, 0, 4,
];

// ju number by 纳音 element index. 木3 火6 土5 金4 水2.
const JU_BY_ELEMENT: Record<number, number> = {
  0: 3,  // 木三局
  1: 6,  // 火六局
  2: 5,  // 土五局
  3: 4,  // 金四局
  4: 2,  // 水二局
};

const JU_NAME_ZH: Record<number, string> = {
  2: "\u6c34\u4e8c\u5c40",
  3: "\u6728\u4e09\u5c40",
  4: "\u91d1\u56db\u5c40",
  5: "\u571f\u4e94\u5c40",
  6: "\u706b\u516d\u5c40",
};
const JU_NAME_EN: Record<number, string> = {
  2: "Water Bureau (II)",
  3: "Wood Bureau (III)",
  4: "Metal Bureau (IV)",
  5: "Earth Bureau (V)",
  6: "Fire Bureau (VI)",
};

// 紫微星 lookup tables (palace dizhi index 0..11) by [ju][day-1].
// Day uses lunar calendar in canonical Ziwei; we approximate with the
// solar day-of-month and disclose the approximation in the UI.
const ZIWEI_TABLE: Record<number, number[]> = {
  // 水二局
  2: [
    1, 2, 2, 3, 3, 4, 4, 5, 5, 6,
    6, 7, 7, 8, 8, 9, 9, 10, 10, 11,
    11, 0, 0, 1, 1, 2, 2, 3, 3, 4,
  ],
  // 木三局
  3: [
    4, 1, 2, 5, 2, 3, 6, 3, 4, 7,
    4, 5, 8, 5, 6, 9, 6, 7, 10, 7,
    8, 11, 8, 9, 0, 9, 10, 1, 10, 11,
  ],
  // 金四局
  4: [
    11, 4, 1, 2, 0, 5, 2, 3, 1, 6,
    3, 4, 2, 7, 4, 5, 3, 8, 5, 6,
    4, 9, 6, 7, 5, 10, 7, 8, 6, 11,
  ],
  // 土五局
  5: [
    6, 11, 4, 1, 2, 7, 0, 5, 2, 3,
    8, 1, 6, 3, 4, 9, 2, 7, 4, 5,
    10, 3, 8, 5, 6, 11, 4, 9, 6, 7,
  ],
  // 火六局
  6: [
    9, 6, 11, 4, 1, 2, 10, 7, 0, 5,
    2, 3, 11, 8, 1, 6, 3, 4, 0, 9,
    2, 7, 4, 5, 1, 10, 3, 8, 5, 6,
  ],
};

const ZHI_LABELS_ZH = ["\u5b50","\u4e11","\u5bc5","\u536f","\u8fb0","\u5df3","\u5348","\u672a","\u7533","\u9149","\u620c","\u4ea5"]; // 子-亥
const ZHI_LABELS_EN = ["Zi","Chou","Yin","Mao","Chen","Si","Wu","Wei","Shen","You","Xu","Hai"];
const ZHI_LABELS_PALACE_ZH = ZHI_LABELS_ZH;
const ZHI_LABELS_PALACE_EN = ["Zi","Chou","Yin","Mao","Chen","Si","Wu","Wei","Shen","You","Xu","Hai"];

const HOUR_TO_ZHI_IDX = [0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,0]; // hours 0..23 → 子,丑,丑,寅,寅,...

function findGanzhi60Index(ganIdx: number, zhiIdx: number): number {
  for (let n = ganIdx; n < 60; n += 10) {
    if (n % 12 === zhiIdx) return n;
  }
  // If the parity is wrong (shouldn't happen for derived mingGong), fall back.
  return ganIdx;
}

export interface ZiweiResult {
  mingGong: { gan: Tiangan; zhi: Dizhi; idx: number; label: string; labelEn: string };
  shenGong: { zhi: Dizhi; idx: number; label: string; labelEn: string };
  ju: { num: number; name: string; nameEn: string; element: Wuxing };
  ziweiPalace: { idx: number; label: string; labelEn: string };
  // simplified summary of where 紫微 sits relative to 命宫
  ziweiVsMingGong: "in" | "opposite" | "adjacent" | "elsewhere";
  // Standard 14 主星 layout — name of the major star in 命宫 if any.
  mingGongMainStar: string | null;
  approximation: boolean;   // true because we use solar day as proxy for lunar day
}

// 14 主星 layout: positions are derived from 紫微 + 天府 series.
// 紫微 is fixed; from it the rest follow standard rules.
//
// We only compute the 命宫 main star (one of 14) for a quick highlight.
// This is enough for a card without a full 12-palace chart.
//
// Reference offsets relative to 紫微 (index in 12 palaces, going clockwise = 0..11):
const STAR_OFFSETS_FROM_ZIWEI: Array<[string, string, number]> = [
  // [name_zh, name_en, offsetFromZiweiPalace]
  ["\u7d2b\u5fae", "Ziwei",       0],
  ["\u5929\u673a", "Tianji",     -1], // counter-clockwise 1
  ["\u592a\u9633", "Taiyang",    -3],
  ["\u6b66\u66f2", "Wuqu",       -4],
  ["\u5929\u540c", "Tiantong",   -5],
  ["\u5ec9\u8d1e", "Lianzhen",   -8],
];
// 紫微/天府 series: 天府 is at (0 - offsetZiweiFromYin) - i.e., 紫微 and 天府 are mirrored
// across the 寅申 axis. We compute 天府 separately below.

const STAR_OFFSETS_FROM_TIANFU: Array<[string, string, number]> = [
  ["\u5929\u5e9c", "Tianfu",       0],
  ["\u592a\u9634", "Taiyin",       1],
  ["\u8d2a\u72fc", "Tanlang",      2],
  ["\u5de8\u95e8", "Jumen",        3],
  ["\u5929\u76f8", "Tianxiang",    4],
  ["\u5929\u6881", "Tianliang",    5],
  ["\u4e03\u6740", "Qisha",        6],
  ["\u7834\u519b", "Pojun",       10],
];

function tianfuPalaceIndex(ziweiIdx: number): number {
  // 紫微 + 天府 are symmetric across the 寅(2)–申(8) axis: tianfu = (2 + 8 - ziwei) mod 12
  return ((2 + 8 - ziweiIdx) % 12 + 12) % 12;
}

function mainStarInPalace(palaceIdx: number, ziweiIdx: number): string | null {
  const tianfu = tianfuPalaceIndex(ziweiIdx);
  for (const [zh, , offset] of STAR_OFFSETS_FROM_ZIWEI) {
    const idx = ((ziweiIdx + offset) % 12 + 12) % 12;
    if (idx === palaceIdx) return zh;
  }
  for (const [zh, , offset] of STAR_OFFSETS_FROM_TIANFU) {
    const idx = ((tianfu + offset) % 12 + 12) % 12;
    if (idx === palaceIdx) return zh;
  }
  return null;
}

export interface ComputeZiweiInput {
  yearGan: Tiangan;
  yearZhi: Dizhi;
  month: number;     // 1..12 (Gregorian; treated as approximation of lunar)
  day: number;       // 1..30/31 (Gregorian; capped at 30 for the table lookup)
  hour: number;      // 0..23
}

export function computeZiwei(input: ComputeZiweiInput, locale: "zh" | "en" = "zh"): ZiweiResult {
  const { yearGan, month, day, hour } = input;
  const yearGanIdx = TIANGAN.indexOf(yearGan);
  const hourZhiIdx = HOUR_TO_ZHI_IDX[Math.max(0, Math.min(23, hour))];

  // 命宫地支 = 寅 + (month - 1) - hourZhi (mod 12)
  const mingGongIdx = ((ZHI_BIRTH + (month - 1) - hourZhiIdx) % 12 + 12) % 12;
  // 身宫地支 = 寅 + (month - 1) + hourZhi (mod 12)
  const shenGongIdx = ((ZHI_BIRTH + (month - 1) + hourZhiIdx) % 12 + 12) % 12;

  // 命宫天干 via 五虎遁
  const offsetGan = FIVE_TIGER_OFFSET[yearGanIdx] ?? 0;
  const monthsFromYin = ((mingGongIdx - ZHI_BIRTH) % 12 + 12) % 12;
  const mingGongGanIdx = (offsetGan + monthsFromYin) % 10;

  // 五行局 from 命宫纳音
  const ganzhi60 = findGanzhi60Index(mingGongGanIdx, mingGongIdx);
  const pairIdx = Math.floor(ganzhi60 / 2);
  const elementIdx = NAYIN_PATTERN_15[pairIdx % 15];
  const ju = JU_BY_ELEMENT[elementIdx];

  // 紫微星 palace via lookup; clamp day to [1, 30]
  const lookupDay = Math.max(1, Math.min(30, day));
  const ziweiIdx = ZIWEI_TABLE[ju][lookupDay - 1];

  // Relation between 紫微 and 命宫
  let ziweiVsMingGong: ZiweiResult["ziweiVsMingGong"] = "elsewhere";
  if (ziweiIdx === mingGongIdx) ziweiVsMingGong = "in";
  else if (((mingGongIdx + 6) % 12) === ziweiIdx) ziweiVsMingGong = "opposite";
  else if (((mingGongIdx + 1) % 12) === ziweiIdx || ((mingGongIdx + 11) % 12) === ziweiIdx) ziweiVsMingGong = "adjacent";

  const palaceLabelsZh = ZHI_LABELS_PALACE_ZH;
  const palaceLabelsEn = ZHI_LABELS_PALACE_EN;
  const mingGongMainStar = mainStarInPalace(mingGongIdx, ziweiIdx);

  // Element to localized name
  const ELEMENT_ZH = ["\u6728","\u706b","\u571f","\u91d1","\u6c34"] as const;
  const element = ELEMENT_ZH[elementIdx] as Wuxing;

  return {
    mingGong: {
      gan: TIANGAN[mingGongGanIdx],
      zhi: DIZHI[mingGongIdx],
      idx: mingGongIdx,
      label: palaceLabelsZh[mingGongIdx],
      labelEn: palaceLabelsEn[mingGongIdx],
    },
    shenGong: {
      zhi: DIZHI[shenGongIdx],
      idx: shenGongIdx,
      label: palaceLabelsZh[shenGongIdx],
      labelEn: palaceLabelsEn[shenGongIdx],
    },
    ju: {
      num: ju,
      name: JU_NAME_ZH[ju],
      nameEn: JU_NAME_EN[ju],
      element,
    },
    ziweiPalace: {
      idx: ziweiIdx,
      label: locale === "en" ? palaceLabelsEn[ziweiIdx] : palaceLabelsZh[ziweiIdx],
      labelEn: palaceLabelsEn[ziweiIdx],
    },
    ziweiVsMingGong,
    mingGongMainStar,
    approximation: true,
  };
}
