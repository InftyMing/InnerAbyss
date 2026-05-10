import { NextRequest, NextResponse } from "next/server";
import { chatWithBailian, hasBailianKey } from "@/lib/ai";
import { buildSystemPrompt, buildDreamPrompt, type Locale } from "@/lib/prompts";
import type { BaziDisplay } from "@/types";

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { dreamContent, emotion, emotionLabel: rawLabel, bazi, locale }: {
      dreamContent: string;
      emotion: "positive" | "neutral" | "negative" | "custom";
      emotionLabel?: string;
      bazi?: BaziDisplay;
      locale?: Locale;
    } = await req.json();
    const lang: Locale = locale === 'en' ? 'en' : 'zh';

    if (!dreamContent) {
      return NextResponse.json({ errorCode: "paramsMissing" }, { status: 400 });
    }

    const presetLabels: Record<Locale, Record<string, string>> = {
      zh: {
        positive: "\u6109\u5feb/\u8f7b\u677e",
        neutral:  "\u5e73\u9759",
        negative: "\u6050\u60e7/\u7126\u8651",
      },
      en: {
        positive: "Joyful / Light",
        neutral:  "Calm",
        negative: "Fear / Anxiety",
      },
    };
    const emotionDisplay =
      (rawLabel && rawLabel.trim().slice(0, 20)) ||
      presetLabels[lang][emotion] ||
      (lang === 'en' ? 'Unknown' : "\u672a\u660e");

    const baziCtx = bazi
      ? { dayGan: bazi.dayGan, dayZhi: bazi.dayZhi, dayMaster: bazi.dayMaster as { element: string; strength: 'strong' | 'weak' | 'balanced' }, missingElements: bazi.missingElements }
      : undefined;
    const prompt = buildDreamPrompt(dreamContent, emotionDisplay, baziCtx, lang);

    if (!hasBailianKey()) {
      return NextResponse.json({ reading: getMockDreamReading(dreamContent, emotion, lang) });
    }

    const content = await chatWithBailian({
      messages: [
        { role: "system", content: buildSystemPrompt(lang) },
        { role: "user", content: prompt },
      ],
      temperature: 0.8,
      jsonMode: true,
      model: "qwen-turbo",
      timeoutMs: 30_000,
    });

    const reading = JSON.parse(content);
    return NextResponse.json({ reading });
  } catch (error) {
    console.error("Dream API error:", error);
    return NextResponse.json({ errorCode: "dreamFailed" }, { status: 500 });
  }
}

function getMockDreamReading(content: string, emotion: string, locale: Locale) {
  const hasWater = content.includes("\u6c34") || content.includes("\u6d77") || content.includes("\u6cb3") || /water|sea|river|lake/i.test(content);
  const hasFlying = content.includes("\u98de") || content.includes("\u5929\u7a7a") || /fly|sky|wing/i.test(content);
  const hasFalling = content.includes("\u843d") || content.includes("\u8dcc") || /fall|drop/i.test(content);

  if (locale === 'en') {
    return {
      title: hasWater ? "Drifting Waters"
           : hasFlying ? "Soaring Skyward"
           : hasFalling ? "Falling Then Rising"
           : "Veiled Dreamscape",
      symbolInterpretations: [
        { symbol: "Dream scene", meaning: "Subconscious projection of present pressures and inner emotional state." },
        { symbol: "Emotional tone", meaning: emotion === "positive" ? "Affirmation of your current direction." : emotion === "negative" ? "Signal of unresolved anxiety asking for attention." : "An inner state of balance and transition." },
        { symbol: "Spatial sense", meaning: "Reflection of how open or contained you feel in your circumstances." },
      ],
      overallMessage: "This dream mirrors your recent inner state; the subconscious is communicating with you through symbols. Stay aware and connect dream scenes with daily life.",
      fateConnection: "The dream resonates with your chart, suggesting introspection aligns with your day master's current trend.",
      advice: "Record this dream and watch for related real-life events over the next 3 days.",
    };
  }
  return {
    title: hasWater ? "\u6c34\u5883\u6d41\u8f6c"
         : hasFlying ? "\u51cc\u4e91\u5fa1\u98ce"
         : hasFalling ? "\u843d\u52bf\u5f85\u8d77"
         : "\u68a6\u5883\u63a2\u5fae",
    symbolInterpretations: [
      { symbol: "\u68a6\u5883\u573a\u666f", meaning: "\u6f5c\u610f\u8bc6\u5bf9\u73b0\u5b9e\u538b\u529b\u7684\u6620\u5c04\uff0c\u53cd\u6620\u5f53\u4e0b\u5fc3\u7406\u72b6\u6001" },
      { symbol: "\u60c5\u7eea\u4f53\u9a8c", meaning: emotion === "positive" ? "\u5185\u5fc3\u5bf9\u5f53\u524d\u72b6\u6001\u7684\u80af\u5b9a" : emotion === "negative" ? "\u5bf9\u67d0\u79cd\u672a\u89e3\u51b3\u95ee\u9898\u7684\u7126\u8651\u4fe1\u53f7" : "\u5185\u5fc3\u5904\u4e8e\u5e73\u8861\u7684\u8fc7\u6e21\u72b6\u6001" },
      { symbol: "\u7a7a\u95f4\u611f\u77e5", meaning: "\u5bf9\u81ea\u8eab\u5904\u5883\u5f00\u653e\u6216\u5c01\u95ed\u7684\u5fc3\u7406\u6295\u5c04" },
    ],
    overallMessage: "\u6b64\u68a6\u6620\u5c04\u4e86\u4f60\u8fd1\u671f\u7684\u5185\u5fc3\u72b6\u6001\uff0c\u6f5c\u610f\u8bc6\u5728\u901a\u8fc7\u8c61\u5f81\u8bed\u8a00\u4e0e\u4f60\u6c9f\u901a\u3002\u4fdd\u6301\u89c9\u5bdf\uff0c\u601d\u8003\u68a6\u4e2d\u573a\u666f\u4e0e\u73b0\u5b9e\u751f\u6d3b\u7684\u8054\u7cfb\u3002",
    fateConnection: "\u68a6\u5883\u4e0e\u547d\u76d8\u76f8\u547c\u5e94\uff0c\u53cd\u6620\u65e5\u4e3b\u5f53\u524d\u7684\u8fd0\u52bf\u8d70\u5411\uff0c\u5b9c\u5185\u89c2\u81ea\u7701\u3002",
    advice: "\u8bb0\u5f55\u6b64\u68a6\uff0c\u7559\u610f\u63a5\u4e0b\u67653\u65e5\u4e0e\u68a6\u5883\u4e3b\u9898\u76f8\u5173\u7684\u73b0\u5b9e\u4e8b\u4ef6\u3002",
  };
}
