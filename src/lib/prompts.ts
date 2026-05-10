// AI prompt templates with locale support.
// All Chinese text uses Unicode escapes to prevent encoding issues during edits.

import { BaziResult } from './bazi';

export type Locale = 'zh' | 'en';

const DAY_NAMES_ZH = ["\u5468\u65e5","\u5468\u4e00","\u5468\u4e8c","\u5468\u4e09","\u5468\u56db","\u5468\u4e94","\u5468\u516d"];
const DAY_NAMES_EN = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function strengthLabel(strength: BaziResult['dayMaster']['strength'], locale: Locale): string {
  if (locale === 'en') {
    return strength === 'strong' ? 'Strong' : strength === 'weak' ? 'Weak' : 'Balanced';
  }
  return strength === 'strong' ? "\u8eab\u5f3a" : strength === 'weak' ? "\u8eab\u5f31" : "\u4e2d\u548c";
}

/**
 * Heavy system prompt for structured JSON outputs (deep reading, daily sign,
 * dream analysis, life-tree). Caller must also enable jsonMode.
 *
 * Chinese-language string fields inside the JSON ARE locale-sensitive but
 * field NAMES (conclusions, psychProfile, etc.) stay English regardless.
 */
export function buildSystemPrompt(locale: Locale = 'zh'): string {
  if (locale === 'en') {
    return [
      "You are a wise mentor blending traditional Chinese BaZi astrology with modern psychology and life philosophy.",
      "",
      "Your reading style:",
      "1. Transparent reasoning: every conclusion must include the BaZi evidence (specific stems/branches/elements).",
      "2. Dual lens: provide both the BaZi perspective AND the psychological perspective.",
      "3. Concrete and actionable: avoid vague advice; give realistic next steps.",
      "4. Objective and balanced: do not exaggerate luck or misfortune; help the user see themselves clearly.",
      "",
      "Output format:",
      "- Return ONLY raw JSON (no markdown code fences, no extra prose).",
      "- All natural-language string values MUST be in English.",
      "- Follow the schema fields the user provides.",
      "",
      "Avoid mushy language like 'might soon' or 'perhaps'; prefer concrete statements such as 'Today X-element enters; it is favorable to ...'.",
    ].join("\n");
  }
  return [
    "\u4f60\u662f\u4e00\u4f4d\u7cbe\u901a\u4e2d\u56fd\u4f20\u7edf\u547d\u7406\u5b66\u7684\u667a\u6167\u5bfc\u5e08\uff0c\u878d\u5408\u4e86\u516b\u5b57\u547d\u7406\u3001\u5fc3\u7406\u5b66\u548c\u4eba\u751f\u54f2\u5b66\u3002",
    "",
    "\u4f60\u7684\u89e3\u8bfb\u98ce\u683c\uff1a",
    "1. \u900f\u660e\u63a8\u7406\uff1a\u6bcf\u4e2a\u7ed3\u8bba\u5fc5\u987b\u9644\u5e26\u547d\u7406\u4f9d\u636e\uff0c\u683c\u5f0f\u4e3a\u300c\u7ed3\u8bba \u2190 \u63a8\u7406\u6839\u636e\uff08\u5177\u4f53\u5e72\u652f\u4e94\u884c\uff09\u300d",
    "2. \u53cc\u8f68\u89e3\u8bfb\uff1a\u540c\u65f6\u63d0\u4f9b\u300c\u547d\u7406\u89c6\u89d2\u300d\u548c\u300c\u5fc3\u7406\u5b66\u89c6\u89d2\u300d\u4e24\u79cd\u89e3\u91ca",
    "3. \u5177\u4f53\u53ef\u884c\uff1a\u7ed9\u51fa\u5b9e\u9645\u53ef\u6267\u884c\u7684\u5efa\u8bae\uff0c\u907f\u514d\u7a7a\u6cdb\u5957\u8bdd",
    "4. \u5ba2\u89c2\u5e73\u8861\uff1a\u4e0d\u5938\u5927\u5409\u51f6\uff0c\u5e2e\u52a9\u7528\u6237\u7406\u6027\u8ba4\u8bc6\u81ea\u5df1\u7684\u7279\u8d28",
    "",
    "\u8f93\u51fa\u683c\u5f0f\u8981\u6c42\uff1a",
    "- \u4ec5\u8fd4\u56de\u7eaf JSON\uff08\u4e0d\u8981\u52a0 markdown \u4ee3\u7801\u5757\u3001\u4e0d\u8981\u52a0\u4efb\u4f55\u989d\u5916\u6587\u5b57\uff09",
    "- \u6240\u6709\u81ea\u7136\u8bed\u8a00\u5b57\u6bb5\u5fc5\u987b\u4f7f\u7528\u4e2d\u6587",
    "- \u6309\u7167\u7528\u6237\u63d0\u4f9b\u7684 schema \u8f93\u51fa\u5b57\u6bb5",
    "",
    "\u4e0d\u8981\u4f7f\u7528\u6a21\u7cca\u8bed\u8a00\u5982\u300c\u8fd1\u671f\u53ef\u80fd\u300d\u300c\u6216\u8bb8\u4f1a\u6709\u300d\uff0c\u6539\u7528\u300c\u4eca\u65e5X\u661f\u5165\u547d\uff0c\u5b9c...\u300d\u7684\u5177\u4f53\u8868\u8ff0\u3002",
  ].join("\n");
}

/**
 * Lightweight system prompt for free-form conversational replies (wen page,
 * follow-up questions). Crucially does NOT request JSON output.
 *
 * Designed to produce flowing natural-prose answers that:
 *  - directly address what the user actually asked
 *  - never break into orphan "1." numbered items
 *  - end with an inline, naturally-phrased suggestion (not a separate list)
 */
export function buildChatSystemPrompt(locale: Locale = 'zh'): string {
  if (locale === 'en') {
    return [
      "You are 'InnerAbyss' \u2014 a thoughtful mentor blending Chinese BaZi astrology with modern psychology.",
      "This is a conversation: speak directly to the user, like a calm friend who listens first and then responds.",
      "",
      "Strict reply rules:",
      "- Open by briefly acknowledging what the user actually asked or feels; do NOT skip straight into a generic reading.",
      "- Weave in at most 1-2 light BaZi cues (e.g. day master, dominant element) as evidence \u2014 no jargon dumps.",
      "- Write as continuous prose. NEVER use numbered lists ('1.', '2.'), bullets ('-', '*', '\u2022'), markdown headings, code blocks, or JSON-like structures.",
      "- If you want to mention multiple points, weave them into sentences with words like 'first... then...', 'on one hand... on the other...', 'for example'.",
      "- Close with a concrete, doable suggestion phrased as a normal sentence at the end of the paragraph \u2014 do NOT prefix it with a number, dash, or 'Suggestion:' label.",
      "- Length: 120-220 English words. Warm but never preachy; no hype, no doom.",
      "- Output plain text only.",
    ].join("\n");
  }
  return [
    // \u4f60\u662f\u300c\u89c2\u6e0a\u300d\u2014\u2014\u4e00\u4f4d\u878d\u5408\u4e2d\u56fd\u4f20\u7edf\u516b\u5b57\u547d\u7406\u4e0e\u73b0\u4ee3\u5fc3\u7406\u5b66\u7684\u667a\u6167\u5bfc\u5e08\u3002
    "\u4f60\u662f\u300c\u89c2\u6e0a\u300d\u2014\u2014\u4e00\u4f4d\u878d\u5408\u4e2d\u56fd\u4f20\u7edf\u516b\u5b57\u547d\u7406\u4e0e\u73b0\u4ee3\u5fc3\u7406\u5b66\u7684\u667a\u6167\u5bfc\u5e08\u3002",
    // \u8fd9\u662f\u4e00\u573a\u5bf9\u8bdd\uff1a\u8bf7\u4ee5\u4e00\u4e2a\u5148\u503e\u542c\u3001\u518d\u56de\u5e94\u7684\u5bc6\u53cb\u53e3\u543b\uff0c\u76f4\u63a5\u5bf9\u7740\u7528\u6237\u8bf4\u8bdd\u3002
    "\u8fd9\u662f\u4e00\u573a\u5bf9\u8bdd\uff1a\u8bf7\u4ee5\u4e00\u4e2a\u5148\u503e\u542c\u3001\u518d\u56de\u5e94\u7684\u5bc6\u53cb\u53e3\u543b\uff0c\u76f4\u63a5\u5bf9\u7740\u7528\u6237\u8bf4\u8bdd\u3002",
    "",
    // \u56de\u590d\u786c\u6027\u8981\u6c42\uff1a
    "\u56de\u590d\u786c\u6027\u8981\u6c42\uff1a",
    // - \u5f00\u5934\u5148\u7b80\u77ed\u56de\u5e94\u7528\u6237\u771f\u6b63\u5728\u95ee\u3001\u5728\u5728\u610f\u7684\u70b9\uff1b\u4e0d\u8981\u8df3\u8fc7\u8fd9\u4e00\u6b65\u76f4\u63a5\u5957\u8bdd\u3002
    "- \u5f00\u5934\u5148\u7b80\u77ed\u56de\u5e94\u7528\u6237\u771f\u6b63\u5728\u95ee\u3001\u5728\u5728\u610f\u7684\u70b9\uff1b\u4e0d\u8981\u8df3\u8fc7\u8fd9\u4e00\u6b65\u76f4\u63a5\u5957\u8bdd\u3002",
    // - \u53ea\u8f7b\u8f7b\u5e26\u5165 1-2 \u5904\u547d\u76d8\u4f9d\u636e\uff08\u5982\u65e5\u4e3b\u3001\u4e3b\u5bfc\u4e94\u884c\uff09\uff0c\u4e0d\u8981\u5806\u67c4\u672f\u8bed\u3002
    "- \u53ea\u8f7b\u8f7b\u5e26\u5165 1-2 \u5904\u547d\u76d8\u4f9d\u636e\uff08\u5982\u65e5\u4e3b\u3001\u4e3b\u5bfc\u4e94\u884c\uff09\uff0c\u4e0d\u8981\u5806\u780c\u672f\u8bed\u3002",
    // - \u5168\u7a0b\u7528\u8fde\u8d2f\u7684\u6563\u6587\u8868\u8fbe\u3002\u4e25\u7981\u4f7f\u7528\u300c1.\u300d\u300c2.\u300d\u300c\uff11\u3001\u300d\u7b49\u7f16\u53f7\uff0c\u4e25\u7981\u300c-\u300d\u300c*\u300d\u300c\u30fb\u300d\u7b49\u9879\u76ee\u7b26\u53f7\uff0c\u4e25\u7981 markdown \u6807\u9898\u3001\u4ee3\u7801\u5757\u3001JSON\u3001\u5927\u62ec\u53f7\u5305\u88f9\u7ed3\u6784\u3002
    "- \u5168\u7a0b\u7528\u8fde\u8d2f\u7684\u6563\u6587\u8868\u8fbe\u3002\u4e25\u7981\u4f7f\u7528\u300c1.\u300d\u300c2.\u300d\u300c\uff11\u3001\u300d\u7b49\u7f16\u53f7\uff0c\u4e25\u7981\u300c-\u300d\u300c*\u300d\u300c\u30fb\u300d\u7b49\u9879\u76ee\u7b26\u53f7\uff0c\u4e25\u7981 markdown \u6807\u9898\u3001\u4ee3\u7801\u5757\u3001JSON\u3001\u5927\u62ec\u53f7\u5305\u88f9\u7ed3\u6784\u3002",
    // - \u5982\u679c\u9700\u8981\u63d0\u591a\u4e2a\u70b9\uff0c\u8bf7\u7528\u300c\u9996\u5148\u2026\u5176\u6b21\u2026\u300d\u300c\u4e00\u65b9\u9762\u2026\u53e6\u4e00\u65b9\u9762\u2026\u300d\u300c\u6bd4\u5982\u300d\u8fd9\u6837\u7684\u8bcd\u8bed\u4e32\u8d77\u6765\uff0c\u4ee5\u53e5\u5b50\u7684\u5f62\u5f0f\u51fa\u73b0\u3002
    "- \u5982\u679c\u9700\u8981\u63d0\u591a\u4e2a\u70b9\uff0c\u8bf7\u7528\u300c\u9996\u5148\u2026\u5176\u6b21\u2026\u300d\u300c\u4e00\u65b9\u9762\u2026\u53e6\u4e00\u65b9\u9762\u2026\u300d\u300c\u6bd4\u5982\u300d\u8fd9\u6837\u7684\u8bcd\u8bed\u4e32\u8d77\u6765\uff0c\u4ee5\u53e5\u5b50\u7684\u5f62\u5f0f\u51fa\u73b0\u3002",
    // - \u7ed3\u5c3e\u628a\u4e00\u6761\u53ef\u6267\u884c\u7684\u5efa\u8bae\u4f5c\u4e3a\u6700\u540e\u4e00\u53e5\u8c03\u8868\u8fbe\u51fa\u6765\uff1b\u4e0d\u8981\u53e6\u8d77\u4e00\u884c\uff0c\u4e0d\u8981\u52a0\u5e8f\u53f7\uff0c\u4e0d\u8981\u51fa\u73b0\u300c\u5efa\u8bae\uff1a\u300d\u8fd9\u6837\u7684\u6807\u7b7e\u3002
    "- \u7ed3\u5c3e\u628a\u4e00\u6761\u53ef\u6267\u884c\u7684\u5efa\u8bae\u81ea\u7136\u8884\u63a5\u5728\u6700\u540e\u4e00\u53e5\u8bdd\u91cc\uff1b\u4e0d\u8981\u53e6\u8d77\u4e00\u884c\uff0c\u4e0d\u8981\u52a0\u5e8f\u53f7\uff0c\u4e0d\u8981\u51fa\u73b0\u300c\u5efa\u8bae\uff1a\u300d\u8fd9\u6837\u7684\u6807\u7b7e\u3002",
    // - \u957f\u5ea6\u63a7\u5236\u5728 120-220 \u5b57\uff1b\u8bed\u6c14\u6e29\u548c\u3001\u4e0d\u8bf4\u6559\uff0c\u4e0d\u5938\u5927\u4e0d\u62a5\u8b66\u3002
    "- \u957f\u5ea6\u63a7\u5236\u5728 120-220 \u5b57\uff1b\u8bed\u6c14\u6e29\u548c\u3001\u4e0d\u8bf4\u6559\uff0c\u4e0d\u5938\u5927\u4e0d\u62a5\u8b66\u3002",
    // - \u4ec5\u8f93\u51fa\u4e2d\u6587\u7eaf\u6587\u672c\u3002
    "- \u4ec5\u8f93\u51fa\u4e2d\u6587\u7eaf\u6587\u672c\u3002",
  ].join("\n");
}

export function buildBaziReadingPrompt(
  bazi: BaziResult,
  gender: string,
  name: string | undefined,
  locale: Locale = 'zh',
): string {
  const { yearGan, yearZhi, monthGan, monthZhi, dayGan, dayZhi, hourGan, hourZhi, wuxingCount, dayMaster, missingElements } = bazi;
  const sLabel = strengthLabel(dayMaster.strength, locale);
  const baziLine = `${yearGan}${yearZhi} ${monthGan}${monthZhi} ${dayGan}${dayZhi} ${hourGan}${hourZhi}`;
  const wx = `\u6728${wuxingCount["\u6728"]} \u706b${wuxingCount["\u706b"]} \u571f${wuxingCount["\u571f"]} \u91d1${wuxingCount["\u91d1"]} \u6c34${wuxingCount["\u6c34"]}`;

  if (locale === 'en') {
    const missingEn = missingElements.length > 0
      ? missingElements.map(m => ({"\u6728":"Wood","\u706b":"Fire","\u571f":"Earth","\u91d1":"Metal","\u6c34":"Water"} as Record<string,string>)[m] ?? m).join(", ")
      : "None";
    return [
      "Please produce a deep reading for the chart below.",
      "",
      "**Basic info**",
      `- Name: ${name ?? "Not provided"}`,
      `- Gender: ${gender}`,
      `- BaZi (Year/Month/Day/Hour): ${baziLine}`,
      "",
      "**Five-Element analysis**",
      `- Counts: Wood ${wuxingCount["\u6728"]}, Fire ${wuxingCount["\u706b"]}, Earth ${wuxingCount["\u571f"]}, Metal ${wuxingCount["\u91d1"]}, Water ${wuxingCount["\u6c34"]}`,
      `- Day master: ${dayGan} (${dayMaster.element}, ${sLabel})`,
      `- Missing elements: ${missingEn}`,
      "",
      "Provide:",
      "1. Personality analysis (based on day master and overall pattern)",
      "2. Career fortune reading (with reasoning chain)",
      "3. Love & relationships analysis (with reasoning chain)",
      "4. Health considerations (with reasoning chain)",
      "5. Wealth pattern analysis (with reasoning chain)",
      "6. 7-day action guide (one concrete daily suggestion)",
      "",
      "Return STRICT JSON exactly in this schema. ALL string values MUST be in English; you may keep stem/branch/element names like '\u7532', '\u6728' inside reasoning when needed but the surrounding sentence should be in English.",
      `{
  "conclusions": [
    {
      "title": "short title",
      "content": "60-90 words of analysis",
      "reasoning": "Conclusion \u2190 BaZi evidence (specific stems/branches/elements)",
      "element": "\u6728|\u706b|\u571f|\u91d1|\u6c34",
      "category": "career|relationship|health|wealth|growth"
    }
  ],
  "psychProfile": {
    "corePersonality": "30-50 words core personality summary",
    "strengths": ["strength 1", "strength 2", "strength 3"],
    "growthAreas": ["growth area 1", "growth area 2"]
  },
  "weeklyAdvice": [
    { "day": "Mon", "advice": "concrete suggestion", "element": "\u6728|\u706b|\u571f|\u91d1|\u6c34", "lucky": "lucky direction or color" }
  ]
}`,
    ].join("\n");
  }

  return [
    "\u8bf7\u4e3a\u4ee5\u4e0b\u547d\u76d8\u8fdb\u884c\u6df1\u5ea6\u89e3\u8bfb\uff1a",
    "",
    "**\u57fa\u672c\u4fe1\u606f**",
    `- \u59d3\u540d\uff1a${name ?? "\u672a\u63d0\u4f9b"}`,
    `- \u6027\u522b\uff1a${gender}`,
    `- \u516b\u5b57\uff1a${yearGan}${yearZhi}\u5e74 ${monthGan}${monthZhi}\u6708 ${dayGan}${dayZhi}\u65e5 ${hourGan}${hourZhi}\u65f6`,
    "",
    "**\u4e94\u884c\u5206\u6790**",
    `- ${wx}`,
    `- \u65e5\u4e3b\uff1a${dayGan}\uff08${dayMaster.element}\uff0c${sLabel}\uff09`,
    `- \u7f3a\u5c11\u4e94\u884c\uff1a${missingElements.length > 0 ? missingElements.join("\u3001") : "\u65e0"}`,
    "",
    "\u8bf7\u63d0\u4f9b\uff1a",
    "1. \u4e2a\u6027\u7279\u8d28\u5206\u6790\uff08\u57fa\u4e8e\u65e5\u4e3b\u548c\u6574\u4f53\u683c\u5c40\uff09",
    "2. \u4e8b\u4e1a\u8fd0\u52bf\u89e3\u8bfb\uff08\u542b\u900f\u660e\u63a8\u7406\u94fe\uff09",
    "3. \u611f\u60c5\u5a5a\u604b\u5206\u6790\uff08\u542b\u900f\u660e\u63a8\u7406\u94fe\uff09",
    "4. \u5065\u5eb7\u6ce8\u610f\u4e8b\u9879\uff08\u542b\u900f\u660e\u63a8\u7406\u94fe\uff09",
    "5. \u8d22\u5bcc\u683c\u5c40\u5206\u6790\uff08\u542b\u900f\u660e\u63a8\u7406\u94fe\uff09",
    "6. \u672c\u5468\u884c\u52a8\u5efa\u8bae\uff087\u5929\uff0c\u6bcf\u5929\u4e00\u53e5\u5177\u4f53\u53ef\u6267\u884c\u7684\u5efa\u8bae\uff09",
    "",
    "\u4e25\u683c\u6309\u7167\u5982\u4e0bJSON\u683c\u5f0f\u8fd4\u56de\uff1a",
    `{
  "conclusions": [
    {
      "title": "\u7ed3\u8bba\u6807\u9898",
      "content": "\u8be6\u7ec6\u5185\u5bb9\uff08100-150\u5b57\uff09",
      "reasoning": "\u63a8\u7406\u94fe\uff1a\u7ed3\u8bba \u2190 \u5e72\u652f\u4e94\u884c\u4f9d\u636e",
      "element": "\u5bf9\u5e94\u4e94\u884c",
      "category": "career|relationship|health|wealth|growth"
    }
  ],
  "psychProfile": {
    "corePersonality": "\u6838\u5fc3\u6027\u683c\u63cf\u8ff0\uff0850\u5b57\uff09",
    "strengths": ["\u4f18\u52bf1", "\u4f18\u52bf2", "\u4f18\u52bf3"],
    "growthAreas": ["\u6210\u957f\u7a7a\u95f41", "\u6210\u957f\u7a7a\u95f42"]
  },
  "weeklyAdvice": [
    { "day": "\u5468\u4e00", "advice": "\u5177\u4f53\u5efa\u8bae", "element": "\u4e94\u884c", "lucky": "\u5409\u65b9\u6216\u5409\u8272" }
  ]
}`,
  ].join("\n");
}

export function buildDailySignPrompt(bazi: BaziResult, today: Date, locale: Locale = 'zh'): string {
  const sLabel = strengthLabel(bazi.dayMaster.strength, locale);
  if (locale === 'en') {
    const todayStr = `${today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} (${DAY_NAMES_EN[today.getDay()]})`;
    return [
      `Today is ${todayStr}. Generate a daily fortune sign for a person whose Day Master is ${bazi.dayGan}${bazi.dayZhi} (${bazi.dayMaster.element}, ${sLabel}).`,
      "",
      "Include:",
      "1. A 3-6 word poetic title (English)",
      "2. Fortune score (0-100)",
      "3. 3 concrete things favorable today",
      "4. 2 specific things to avoid today",
      "5. Lucky color, direction, number",
      "6. A short sign verse, classical-poetic, under 16 English words",
      "7. A 30-50 word psychological insight for today",
      "",
      "Return JSON. ALL string values in English:",
      `{
  "title": "today's theme",
  "score": 75,
  "yi": ["favorable 1", "favorable 2", "favorable 3"],
  "ji": ["avoid 1", "avoid 2"],
  "lucky": { "color": "color", "direction": "N|S|E|W|Center", "number": 8 },
  "verse": "short sign verse",
  "insight": "psychology insight"
}`,
    ].join("\n");
  }
  const todayStr = `${today.getFullYear()}\u5e74${today.getMonth() + 1}\u6708${today.getDate()}\u65e5\uff08${DAY_NAMES_ZH[today.getDay()]}\uff09`;
  return [
    `\u4eca\u5929\u662f${todayStr}\uff0c\u8bf7\u4e3a\u65e5\u4e3b${bazi.dayGan}${bazi.dayZhi}\uff08${bazi.dayMaster.element}\u547d\uff0c${sLabel}\uff09\u751f\u6210\u4eca\u65e5\u547d\u7b7e\u3002`,
    "",
    "\u547d\u7b7e\u9700\u5305\u542b\uff1a",
    "1. \u4eca\u65e5\u4e3b\u9898\uff084-6\u4e2a\u5b57\u7684\u8bd7\u610f\u6807\u9898\uff09",
    "2. \u8fd0\u52bf\u8bc4\u5206\uff080-100\uff09",
    "3. \u4eca\u65e5\u5b9c\uff083\u9879\u5177\u4f53\u884c\u52a8\uff09",
    "4. \u4eca\u65e5\u5fcc\uff082\u9879\u5177\u4f53\u7981\u5fcc\uff09",
    "5. \u5e78\u8fd0\u5143\u7d20\uff08\u989c\u8272/\u65b9\u4f4d/\u6570\u5b57\uff09",
    "6. \u4e00\u53e5\u547d\u7406\u7b7e\u8bed\uff08\u53e4\u98ce\uff0c20\u5b57\u4ee5\u5185\uff09",
    "7. \u5fc3\u7406\u5b66\u89c6\u89d2\u7684\u4eca\u65e5\u6d1e\u89c1\uff0850\u5b57\uff09",
    "",
    "JSON\u683c\u5f0f\u8fd4\u56de\uff1a",
    `{
  "title": "\u4eca\u65e5\u4e3b\u9898",
  "score": 75,
  "yi": ["\u5b9c1", "\u5b9c2", "\u5b9c3"],
  "ji": ["\u5fcc1", "\u5fcc2"],
  "lucky": { "color": "\u989c\u8272", "direction": "\u65b9\u4f4d", "number": 8 },
  "verse": "\u7b7e\u8bed",
  "insight": "\u5fc3\u7406\u5b66\u6d1e\u89c1"
}`,
  ].join("\n");
}

export function buildFollowUpPrompt(
  bazi: BaziResult,
  userQuestion: string,
  previousConclusion: string,
  locale: Locale = 'zh',
): string {
  if (locale === 'en') {
    return [
      `The user is questioning the previous reading: "${previousConclusion}"`,
      "",
      `User's question: ${userQuestion}`,
      "",
      "Use the chart context below to provide a follow-up reply:",
      `Day master: ${bazi.dayGan}${bazi.dayZhi} (${bazi.dayMaster.element})`,
      `Five elements: Wood ${bazi.wuxingCount["\u6728"]}, Fire ${bazi.wuxingCount["\u706b"]}, Earth ${bazi.wuxingCount["\u571f"]}, Metal ${bazi.wuxingCount["\u91d1"]}, Water ${bazi.wuxingCount["\u6c34"]}`,
      "",
      "Please:",
      "1. Acknowledge the question and the limits of fate-reading.",
      "2. Offer an alternative perspective grounded in the chart.",
      "3. Give a concrete next step the user can try.",
      "",
      "Reply in natural English under 150 words. No JSON.",
    ].join("\n");
  }
  return [
    `\u7528\u6237\u5bf9\u547d\u7406\u7ed3\u8bba\u300c${previousConclusion}\u300d\u63d0\u51fa\u4e86\u8d28\u7591\u6216\u8ffd\u95ee\uff1a`,
    "",
    `\u7528\u6237\u95ee\u9898\uff1a${userQuestion}`,
    "",
    "\u8bf7\u57fa\u4e8e\u4ee5\u4e0b\u547d\u76d8\u4fe1\u606f\u7ed9\u51fa\u8865\u5145\u89e3\u91ca\uff1a",
    `\u65e5\u4e3b\uff1a${bazi.dayGan}${bazi.dayZhi}\uff08${bazi.dayMaster.element}\uff09`,
    `\u4e94\u884c\uff1a\u6728${bazi.wuxingCount["\u6728"]} \u706b${bazi.wuxingCount["\u706b"]} \u571f${bazi.wuxingCount["\u571f"]} \u91d1${bazi.wuxingCount["\u91d1"]} \u6c34${bazi.wuxingCount["\u6c34"]}`,
    "",
    "\u8bf7\uff1a",
    "1. \u6b63\u9762\u56de\u5e94\u8d28\u7591\uff0c\u627f\u8ba4\u547d\u7406\u7684\u5c40\u9650\u6027",
    "2. \u63d0\u4f9b\u66ff\u4ee3\u6027\u89e3\u8bfb\u89c6\u89d2",
    "3. \u7ed9\u51fa\u66f4\u5177\u4f53\u7684\u884c\u52a8\u53c2\u8003",
    "",
    "\u7528\u7b80\u6d01\u7684\u5bf9\u8bdd\u53e3\u543b\u56de\u590d\uff08150\u5b57\u4ee5\u5185\uff09\uff0c\u4e0d\u9700\u8981JSON\u683c\u5f0f\u3002",
  ].join("\n");
}

export function buildDreamPrompt(
  dreamContent: string,
  emotionLabel: string,
  bazi: { dayGan: string; dayZhi: string; dayMaster: { element: string; strength: BaziResult['dayMaster']['strength'] }; missingElements: string[] } | undefined,
  locale: Locale = 'zh',
): string {
  if (locale === 'en') {
    const baziCtx = bazi
      ? `\nChart context: Day master ${bazi.dayGan}${bazi.dayZhi} (${bazi.dayMaster.element}, ${strengthLabel(bazi.dayMaster.strength, 'en')}); missing elements: ${bazi.missingElements.length > 0 ? bazi.missingElements.join(", ") : "None"}.`
      : "";
    return [
      "Interpret the following dream, blending classical Chinese dream symbolism with psychology.",
      "",
      `Dream content: ${dreamContent}`,
      `Dream emotion: ${emotionLabel}`,
      baziCtx,
      "",
      "Provide:",
      "1. 3-5 main symbols and their psychological meaning",
      "2. Overall message of the dream (~60 words)",
      "3. Connection to BaZi (if chart provided, ~50 words)",
      "4. One concrete advice (~30 words)",
      "",
      "Return JSON. ALL string values in English:",
      `{
  "title": "dream theme (3-6 English words)",
  "symbolInterpretations": [
    { "symbol": "symbol name", "meaning": "psychological meaning" }
  ],
  "overallMessage": "overall message",
  "fateConnection": "connection to BaZi",
  "advice": "concrete advice"
}`,
    ].join("\n");
  }
  const baziContext = bazi
    ? `\n\u547d\u76d8\u4e0a\u4e0b\u6587\uff1a\u65e5\u4e3b${bazi.dayGan}${bazi.dayZhi}\uff08${bazi.dayMaster.element}\uff0c${strengthLabel(bazi.dayMaster.strength, 'zh')}\uff09\uff0c\u4e94\u884c\u7f3a\uff1a${bazi.missingElements.join("\u3001") || "\u65e0"}`
    : "";
  return [
    "\u8bf7\u89e3\u8bfb\u4ee5\u4e0b\u68a6\u5883\uff0c\u7ed3\u5408\u4e2d\u56fd\u4f20\u7edf\u68a6\u5b66\u4e0e\u547d\u7406\u5fc3\u7406\u5b66\uff1a",
    "",
    `\u68a6\u5883\u5185\u5bb9\uff1a${dreamContent}`,
    `\u68a6\u5883\u60c5\u7eea\uff1a${emotionLabel}`,
    baziContext,
    "",
    "\u8bf7\u63d0\u4f9b\uff1a",
    "1. \u68a6\u5883\u4e2d\u4e3b\u8981\u7b26\u53f7\u7684\u8c61\u5f81\u89e3\u6790\uff083-5\u4e2a\uff09",
    "2. \u6574\u4f53\u68a6\u5883\u5bd3\u610f\uff0860\u5b57\uff09",
    "3. \u4e0e\u547d\u7406\u7684\u5173\u8054\uff08\u5982\u679c\u63d0\u4f9b\u4e86\u547d\u76d8\uff0c\u7ed3\u5408\u65e5\u4e3b\u5206\u6790\uff1b50\u5b57\uff09",
    "4. \u4e00\u6761\u5b9e\u9645\u5efa\u8bae\uff0830\u5b57\uff09",
    "",
    "JSON\u683c\u5f0f\u8fd4\u56de\uff1a",
    `{
  "title": "\u68a6\u5883\u4e3b\u9898\uff084-6\u5b57\uff09",
  "symbolInterpretations": [
    { "symbol": "\u7b26\u53f7\u540d\u79f0", "meaning": "\u8c61\u5f81\u542b\u4e49" }
  ],
  "overallMessage": "\u6574\u4f53\u5bd3\u610f",
  "fateConnection": "\u547d\u7406\u5173\u8054",
  "advice": "\u5b9e\u9645\u5efa\u8bae"
}`,
  ].join("\n");
}

export function buildLifeTreePrompt(
  bazi: { dayGan: string; dayZhi: string; dayMaster: { element: string; strength: BaziResult['dayMaster']['strength'] }; wuxingCount: Record<string, number>; missingElements: string[] },
  lifeEvents: Array<{ date: string; age?: number; title: string; category: string; nodeType: string }>,
  birthYear: number,
  locale: Locale = 'zh',
): string {
  const currentYear = new Date().getFullYear();
  const age = currentYear - birthYear;
  if (locale === 'en') {
    const events = lifeEvents.length > 0
      ? lifeEvents.map(e => `- ${e.date} (age ${e.age ?? '?'}): ${e.title} (${e.category}, ${e.nodeType})`).join("\n")
      : "No records yet.";
    return [
      `Theme: 'parallel timelines'. Based on the chart and life trace below, generate EXACTLY TWO future paths starting from the user's current age (${age}).`,
      "Path 1 (isMain=true) is the most-likely main timeline.",
      "Path 2 (isMain=false) is the second-most-likely alternative timeline \u2014 it should diverge meaningfully from Path 1 in theme or domain.",
      "",
      `Day master: ${bazi.dayGan}${bazi.dayZhi} (${bazi.dayMaster.element}, ${strengthLabel(bazi.dayMaster.strength, 'en')})`,
      `Five elements: Wood ${bazi.wuxingCount["\u6728"]}, Fire ${bazi.wuxingCount["\u706b"]}, Earth ${bazi.wuxingCount["\u571f"]}, Metal ${bazi.wuxingCount["\u91d1"]}, Water ${bazi.wuxingCount["\u6c34"]}`,
      `Missing: ${bazi.missingElements.length > 0 ? bazi.missingElements.join(", ") : "None"}`,
      "",
      "Recorded life events:",
      events,
      "",
      "Each path: 3-4 key future nodes within 1-15 years. Each node title MUST be a concise headline (\u22645 words).",
      "",
      "Return STRICT JSON; ALL strings in English:",
      `{
  "paths": [
    {
      "id": "path_main",
      "label": "main path name (\u22644 words)",
      "description": "1-sentence summary",
      "isMain": true,
      "nodes": [
        { "id": "m1", "title": "concise event title", "year": 2030, "age": 35, "description": "1-2 sentence detail", "probability": "High|Medium|Low" }
      ]
    },
    {
      "id": "path_alt",
      "label": "alternative path name (\u22644 words)",
      "description": "1-sentence summary",
      "isMain": false,
      "nodes": [ ... ]
    }
  ]
}`,
    ].join("\n");
  }
  const eventsDesc = lifeEvents.length > 0
    ? lifeEvents.map((e) => `- ${e.date}\uff08${e.age ?? "?"}\u5c81\uff09\uff1a${e.title}\uff08${e.category}\uff0c${e.nodeType}\uff09`).join("\n")
    : "\u6682\u65e0\u8bb0\u5f55";
  return [
    `\u4e3b\u9898\uff1a\u300c\u5e73\u884c\u65f6\u7a7a\u4e0b\u7684\u4eba\u751f\u8f68\u8ff9\u300d\u3002\u8bf7\u57fa\u4e8e\u4e0b\u9762\u7684\u547d\u76d8\u4e0e\u4eba\u751f\u8bb0\u5f55\uff0c\u751f\u6210\u672a\u6765\u53ef\u80fd\u7684 2 \u6761\u8def\u5f84\uff08\u4ece\u5f53\u524d ${age} \u5c81\u8d77\uff09\u3002`,
    "\u8def\u5f84 1\uff08isMain=true\uff09\u4e3a\u6982\u7387\u6700\u9ad8\u7684\u4e3b\u7ebf\uff1b\u8def\u5f84 2\uff08isMain=false\uff09\u4e3a\u6982\u7387\u6b21\u9ad8\u3001\u4e0e\u4e3b\u7ebf\u5728\u9886\u57df/\u4e3b\u9898\u4e0a\u660e\u663e\u4e0d\u540c\u7684\u53e6\u4e00\u79cd\u53ef\u80fd\u3002",
    "",
    `\u547d\u76d8\uff1a\u65e5\u4e3b${bazi.dayGan}${bazi.dayZhi}\uff08${bazi.dayMaster.element}\uff0c${strengthLabel(bazi.dayMaster.strength, 'zh')}\uff09`,
    `\u4e94\u884c\uff1a\u6728${bazi.wuxingCount["\u6728"]} \u706b${bazi.wuxingCount["\u706b"]} \u571f${bazi.wuxingCount["\u571f"]} \u91d1${bazi.wuxingCount["\u91d1"]} \u6c34${bazi.wuxingCount["\u6c34"]}`,
    `\u7f3a\u5931\uff1a${bazi.missingElements.join("\u3001") || "\u65e0"}`,
    "",
    "\u5df2\u8bb0\u5f55\u7684\u4eba\u751f\u4e8b\u4ef6\uff1a",
    eventsDesc,
    "",
    "\u6bcf\u6761\u8def\u5f84\u5305\u542b 3-4 \u4e2a\u5173\u952e\u8282\u70b9\uff08\u672a\u6765 1-15 \u5e74\u5185\uff09\u3002\u6bcf\u4e2a title \u5fc5\u987b\u662f\u51dd\u7ec3\u7684\u8d77\u540d\uff086\u5b57\u4ee5\u5185\uff09\u3002",
    "",
    "\u4e25\u683c\u8fd4\u56de JSON\uff08\u6240\u6709\u5b57\u6bb5\u4e3a\u4e2d\u6587\uff09\uff1a",
    `{
  "paths": [
    {
      "id": "path_main",
      "label": "\u4e3b\u7ebf\u540d\u79f0\uff086\u5b57\u5185\uff09",
      "description": "\u4e00\u53e5\u8bdd\u6982\u8ff0",
      "isMain": true,
      "nodes": [
        { "id": "m1", "title": "\u51dd\u7ec3\u4e8b\u4ef6\u540d", "year": 2030, "age": 35, "description": "1-2 \u53e5\u8be6\u60c5", "probability": "\u9ad8|\u4e2d|\u4f4e" }
      ]
    },
    {
      "id": "path_alt",
      "label": "\u53e6\u4e00\u79cd\u53ef\u80fd",
      "description": "\u4e00\u53e5\u8bdd\u6982\u8ff0",
      "isMain": false,
      "nodes": [ ... ]
    }
  ]
}`,
  ].join("\n");
}

/** Hypothetical branch: "what if at this past node, X happened differently?" */
export function buildBranchPrompt(
  bazi: { dayGan: string; dayZhi: string; dayMaster: { element: string; strength: BaziResult['dayMaster']['strength'] } },
  anchorEvent: { title: string; year: number; age?: number; description?: string },
  condition: string,
  locale: Locale = 'zh',
): string {
  if (locale === 'en') {
    return [
      "Theme: parallel timelines. Imagine a parallel universe in which the user, at the anchor node below, took a different path described by the user's hypothesis.",
      "",
      `Day master: ${bazi.dayGan}${bazi.dayZhi} (${bazi.dayMaster.element}, ${strengthLabel(bazi.dayMaster.strength, 'en')})`,
      `Anchor node: ${anchorEvent.year} (age ${anchorEvent.age ?? '?'}) \u2014 ${anchorEvent.title}${anchorEvent.description ? ` (${anchorEvent.description})` : ''}`,
      `Hypothesis: ${condition}`,
      "",
      "Generate a 3-node speculative branch starting RIGHT AFTER the anchor year, showing how this 'what-if' could have unfolded.",
      "Each node title \u22645 words.",
      "",
      "Return STRICT JSON; ALL strings in English:",
      `{
  "label": "branch name (\u22644 words)",
  "description": "1-sentence summary of the alternative timeline",
  "nodes": [
    { "id": "b1", "title": "concise event title", "year": ${anchorEvent.year + 1}, "age": ${(anchorEvent.age ?? 25) + 1}, "description": "1-2 sentence detail", "probability": "High|Medium|Low" }
  ]
}`,
    ].join("\n");
  }
  return [
    "\u4e3b\u9898\uff1a\u5e73\u884c\u65f6\u7a7a\u3002\u8bf7\u8bbe\u60f3\u4e00\u4e2a\u5e73\u884c\u5b87\u5b99\uff1a\u7528\u6237\u5728\u4e0b\u9762\u7684\u9519\u9519\u8282\u70b9\u4e0a\u9009\u62e9\u4e86\u53e6\u4e00\u6761\u8def\uff08\u5373\u300c\u5047\u8bbe\u300d\u63cf\u8ff0\u7684\u60c5\u5883\uff09\uff0c\u5176\u540e\u7684\u4eba\u751f\u4f1a\u5982\u4f55\u5c55\u5f00\u3002",
    "",
    `\u547d\u76d8\uff1a\u65e5\u4e3b${bazi.dayGan}${bazi.dayZhi}\uff08${bazi.dayMaster.element}\uff0c${strengthLabel(bazi.dayMaster.strength, 'zh')}\uff09`,
    `\u9519\u9519\u8282\u70b9\uff1a${anchorEvent.year} \u5e74\uff08${anchorEvent.age ?? '?'} \u5c81\uff09\u2014\u2014${anchorEvent.title}${anchorEvent.description ? `\uff08${anchorEvent.description}\uff09` : ''}`,
    `\u5047\u8bbe\uff1a${condition}`,
    "",
    "\u8bf7\u4ece\u9519\u9519\u8282\u70b9\u4e4b\u540e\u7d27\u63a5\u5c55\u5f00\u751f\u6210 3 \u4e2a\u63a8\u6f14\u8282\u70b9\uff0c\u63cf\u7ed8\u5728\u8fd9\u79cd\u5047\u8bbe\u4e0b\u4eba\u751f\u53ef\u80fd\u7684\u8d70\u5411\u3002\u6bcf\u4e2a title \u22646 \u5b57\u3002",
    "",
    "\u4e25\u683c\u8fd4\u56de JSON\uff08\u4e2d\u6587\uff09\uff1a",
    `{
  "label": "\u5206\u652f\u540d\u79f0\uff086\u5b57\u5185\uff09",
  "description": "\u4e00\u53e5\u8bdd\u6982\u8ff0\u8fd9\u6761\u5e73\u884c\u8def\u7ebf",
  "nodes": [
    { "id": "b1", "title": "\u51dd\u7ec3\u4e8b\u4ef6\u540d", "year": ${anchorEvent.year + 1}, "age": ${(anchorEvent.age ?? 25) + 1}, "description": "1-2 \u53e5\u8be6\u60c5", "probability": "\u9ad8|\u4e2d|\u4f4e" }
  ]
}`,
  ].join("\n");
}
