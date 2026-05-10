// BaZi (Eight Characters) Fortune Calculation Library
// Uses index-based lookups to avoid encoding issues with Chinese key objects

// Heavenly Stems (10 Tiangan)
export const TIANGAN = ['\u7532','\u4e59','\u4e19','\u4e01','\u620a','\u5df1','\u5e9a','\u8f9b','\u58ec','\u7678'] as const;
// Earthly Branches (12 Dizhi)
export const DIZHI = ['\u5b50','\u4e11','\u5bc5','\u536f','\u8fb0','\u5df3','\u5348','\u672a','\u7533','\u9149','\u620c','\u4ea5'] as const;
// Five Elements
export const WUXING = ['\u6728','\u706b','\u571f','\u91d1','\u6c34'] as const;

export type Tiangan = typeof TIANGAN[number];
export type Dizhi = typeof DIZHI[number];
export type Wuxing = typeof WUXING[number];

// Tiangan -> Five Element index (0=Wood,1=Fire,2=Earth,3=Metal,4=Water)
// ??=?(0), ??=?(1), ??=?(2), ??=?(3), ??=?(4)
const TIANGAN_WUXING_IDX = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4];
// Tiangan yin/yang: ?=yang,?=yin,?=yang,?=yin...
const TIANGAN_YINYANG = ['yang','yin','yang','yin','yang','yin','yang','yin','yang','yin'];

// Dizhi -> Five Element index
// ?=?(4),?=?(2),?=?(0),?=?(0),?=?(2),?=?(1),?=?(1),?=?(2),?=?(3),?=?(3),?=?(2),?=?(4)
const DIZHI_WUXING_IDX = [4, 2, 0, 0, 2, 1, 1, 2, 3, 3, 2, 4];
// Dizhi yin/yang
const DIZHI_YINYANG = ['yang','yin','yang','yin','yang','yin','yang','yin','yang','yin','yang','yin'];

// Five Element sheng (generates) cycle: Wood->Fire->Earth->Metal->Water->Wood
// Index of what each element generates
const SHENG = [1, 2, 3, 4, 0]; // Wood(0)->Fire(1), Fire(1)->Earth(2), ...
// Five Element ke (controls) cycle: Wood->Earth->Water->Fire->Metal->Wood
const KE = [2, 3, 4, 0, 1];    // Wood(0)->Earth(2), Fire(1)->Metal(3), ...

export function getTianganElement(g: Tiangan): Wuxing {
  const idx = TIANGAN.indexOf(g);
  return WUXING[TIANGAN_WUXING_IDX[idx]];
}
export function getDizhiElement(z: Dizhi): Wuxing {
  const idx = DIZHI.indexOf(z);
  return WUXING[DIZHI_WUXING_IDX[idx]];
}

export function getYearGanZhi(year: number): { gan: Tiangan; zhi: Dizhi } {
  const offset = (year - 1900) % 60;
  const ganIndex = ((offset % 10) + 10) % 10;
  const zhiIndex = ((offset % 12) + 12) % 12;
  return { gan: TIANGAN[ganIndex], zhi: DIZHI[zhiIndex] };
}

export function getMonthZhi(month: number): Dizhi {
  // Month 1(Jan)=Yin(2), 2=Mao(3), ..., 11=Zi(0), 12=Chou(1)
  const map = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0, 1];
  return DIZHI[map[month - 1]];
}

export function getMonthGan(yearGan: Tiangan, month: number): Tiangan {
  const yearGanIndex = TIANGAN.indexOf(yearGan);
  // Start Gan for month 1 (Yin month) based on year Gan group
  const startGanMap = [2, 4, 6, 8, 0, 2, 4, 6, 8, 0]; // by yearGanIndex
  const startGan = startGanMap[yearGanIndex] ?? 0;
  const ganIndex = (startGan + month - 1) % 10;
  return TIANGAN[ganIndex];
}

export function getHourZhi(hour: number): Dizhi {
  // zi(23-01)=0, chou(01-03)=1, yin(03-05)=2, ...
  const map = [0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,0];
  return DIZHI[map[hour]];
}

export function getHourGan(dayGan: Tiangan, hour: number): Tiangan {
  const dayGanIndex = TIANGAN.indexOf(dayGan);
  const hourZhiIndex = DIZHI.indexOf(getHourZhi(hour));
  const startGanMap = [0, 2, 4, 6, 8, 0, 2, 4, 6, 8];
  const startGan = startGanMap[dayGanIndex] ?? 0;
  return TIANGAN[(startGan + hourZhiIndex) % 10];
}

export function getDayGanZhi(year: number, month: number, day: number): { gan: Tiangan; zhi: Dizhi } {
  const date = new Date(year, month - 1, day);
  const baseDate = new Date(1900, 0, 1);
  const diffDays = Math.floor((date.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
  const ganIndex = ((diffDays % 10) + 10) % 10;
  const zhiIndex = ((diffDays % 12) + 12) % 12;
  return { gan: TIANGAN[ganIndex], zhi: DIZHI[zhiIndex] };
}

export interface BaziResult {
  yearGan: Tiangan;
  yearZhi: Dizhi;
  monthGan: Tiangan;
  monthZhi: Dizhi;
  dayGan: Tiangan;
  dayZhi: Dizhi;
  hourGan: Tiangan;
  hourZhi: Dizhi;
  wuxingCount: Record<string, number>;
  dayMaster: { element: string; strength: 'strong' | 'weak' | 'balanced' };
  missingElements: string[];
}

export function calculateBazi(year: number, month: number, day: number, hour: number): BaziResult {
  const { gan: yearGan, zhi: yearZhi } = getYearGanZhi(year);
  const monthZhi = getMonthZhi(month);
  const monthGan = getMonthGan(yearGan, month);
  const { gan: dayGan, zhi: dayZhi } = getDayGanZhi(year, month, day);
  const hourZhi = getHourZhi(hour);
  const hourGan = getHourGan(dayGan, hour);

  // Count five elements
  const wuxingCount: Record<string, number> = {};
  for (const w of WUXING) wuxingCount[w] = 0;

  const allGan: Tiangan[] = [yearGan, monthGan, dayGan, hourGan];
  const allZhi: Dizhi[] = [yearZhi, monthZhi, dayZhi, hourZhi];
  for (const g of allGan) wuxingCount[getTianganElement(g)]++;
  for (const z of allZhi) wuxingCount[getDizhiElement(z)]++;

  const dayElement = getTianganElement(dayGan);
  const dayCount = wuxingCount[dayElement];
  const totalCount = Object.values(wuxingCount).reduce((a, b) => a + b, 0);
  const strength: 'strong' | 'weak' | 'balanced' =
    dayCount >= totalCount * 0.35 ? 'strong' :
    dayCount <= totalCount * 0.2  ? 'weak'   : 'balanced';

  const missingElements = WUXING.filter((w) => wuxingCount[w] === 0);

  return {
    yearGan, yearZhi, monthGan, monthZhi, dayGan, dayZhi, hourGan, hourZhi,
    wuxingCount,
    dayMaster: { element: dayElement, strength },
    missingElements,
  };
}

export function getTodayFortune(bazi: BaziResult, today: Date): {
  score: number;
  trend: 'excellent' | 'good' | 'neutral' | 'caution';
  luckyElement: string;
  luckyDirection: string;
  advice: string;
} {
  const { gan: todayGan } = getDayGanZhi(today.getFullYear(), today.getMonth() + 1, today.getDate());
  const todayElement = getTianganElement(todayGan);
  const dayElement = bazi.dayMaster.element;

  const todayIdx = WUXING.indexOf(todayElement as Wuxing);
  const dayIdx = WUXING.indexOf(dayElement as Wuxing);

  let score = 60;
  if (todayIdx >= 0 && dayIdx >= 0) {
    if (SHENG[todayIdx] === dayIdx) score += 20; // today generates day master
    if (todayIdx === dayIdx) score += 10;         // same element
    if (KE[todayIdx] === dayIdx) score -= 15;     // today controls day master
    if (KE[dayIdx] === todayIdx) score += 15;     // day master controls today
  }
  if (bazi.missingElements.includes(todayElement)) score += 10;
  score = Math.max(20, Math.min(98, score));

  const trend: 'excellent' | 'good' | 'neutral' | 'caution' =
    score >= 80 ? 'excellent' : score >= 65 ? 'good' : score >= 50 ? 'neutral' : 'caution';

  const luckyDirections: Record<string, string> = {};
  luckyDirections[WUXING[0]] = '\u4e1c'; // ?->?
  luckyDirections[WUXING[1]] = '\u5357'; // ?->?
  luckyDirections[WUXING[2]] = '\u4e2d'; // ?->?
  luckyDirections[WUXING[3]] = '\u897f'; // ?->?
  luckyDirections[WUXING[4]] = '\u5317'; // ?->?

  const luckyElement = bazi.missingElements[0] ?? dayElement;
  const luckyDirection = luckyDirections[luckyElement] ?? '\u4e2d';

  const adviceTexts: Record<string, string> = {
    excellent: `\u4eca\u65e5\u4e0e\u65e5\u4e3b${dayElement}\u76f8\u751f\u76f8\u5408\uff0c\u5b9c\u79ef\u6781\u63a8\u8fdb\u91cd\u8981\u4e8b\u9879\uff0c\u8d35\u4eba\u8fd0\u5f3a\u3002`,
    good: `\u4eca\u65e5\u8fd0\u52bf\u5e73\u987a\uff0c${dayElement}\u6c14\u7a33\u5065\uff0c\u9002\u5408\u5904\u7406\u65e5\u5e38\u4e8b\u52a1\u548c\u7ef4\u62a4\u4eba\u9645\u5173\u7cfb\u3002`,
    neutral: `\u4eca\u65e5\u8fd0\u52bf\u5e73\u5e73\uff0c\u5efa\u8bae\u4fdd\u6301\u4f4e\u8c03\uff0c\u907f\u514d\u5192\u9669\u51b3\u7b56\uff0c\u4ee5\u9759\u5236\u52a8\u4e3a\u4e0a\u3002`,
    caution: `\u4eca\u65e5\u6c14\u573a\u504f\u5f3a\uff0c\u5bf9\u65e5\u4e3b${dayElement}\u6709\u6240\u538b\u5236\uff0c\u5b9c\u8c28\u614e\u884c\u4e8b\uff0c\u907f\u514d\u91cd\u5927\u51b3\u7b56\u3002`,
  };

  return { score, trend, luckyElement, luckyDirection, advice: adviceTexts[trend] };
}

export function getDaYun(bazi: BaziResult, birthYear: number, gender: 'male' | 'female'): Array<{
  startAge: number; gan: string; zhi: string; element: string; period: string;
}> {
  const yearGanIdx = TIANGAN.indexOf(bazi.yearGan);
  const isForward = (gender === 'male' && TIANGAN_YINYANG[yearGanIdx] === 'yang') ||
                    (gender === 'female' && TIANGAN_YINYANG[yearGanIdx] === 'yin');

  const monthGanIndex = TIANGAN.indexOf(bazi.monthGan);
  const monthZhiIndex = DIZHI.indexOf(bazi.monthZhi);

  return Array.from({ length: 8 }, (_, i) => {
    const offset = isForward ? i + 1 : -(i + 1);
    const ganIndex = ((monthGanIndex + offset) % 10 + 10) % 10;
    const zhiIndex = ((monthZhiIndex + offset) % 12 + 12) % 12;
    const gan = TIANGAN[ganIndex];
    const zhi = DIZHI[zhiIndex];
    return {
      startAge: (i + 1) * 10 - 5,
      gan,
      zhi,
      element: getTianganElement(gan),
      period: `${(i + 1) * 10 - 5}\u5c81`,
    };
  });
}
