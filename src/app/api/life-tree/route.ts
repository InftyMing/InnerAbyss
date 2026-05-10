import { NextRequest, NextResponse } from "next/server";
import { chatWithBailian, hasBailianKey } from "@/lib/ai";
import { buildSystemPrompt, buildLifeTreePrompt, type Locale } from "@/lib/prompts";
import type { BaziDisplay, LifeEvent } from "@/types";

const MU = '\u6728', HUO = '\u706b', JIN = '\u91d1', SHUI = '\u6c34';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { bazi, lifeEvents, birthYear, locale }: {
      bazi: BaziDisplay;
      lifeEvents: LifeEvent[];
      birthYear: number;
      locale?: Locale;
    } = await req.json();
    const lang: Locale = locale === 'en' ? 'en' : 'zh';

    if (!bazi) {
      return NextResponse.json({ errorCode: "paramsMissing" }, { status: 400 });
    }

    if (!hasBailianKey()) {
      const currentYear = new Date().getFullYear();
      const age = currentYear - birthYear;
      return NextResponse.json({ paths: getMockPaths(age, currentYear, bazi.dayMaster.element, lang) });
    }

    const prompt = buildLifeTreePrompt(bazi, lifeEvents, birthYear, lang);
    const content = await chatWithBailian({
      messages: [
        { role: "system", content: buildSystemPrompt(lang) },
        { role: "user", content: prompt },
      ],
      temperature: 0.85,
      jsonMode: true,
      model: "qwen-plus",
      timeoutMs: 60_000,
    });

    const data = JSON.parse(content) as { paths: Array<{ isMain?: boolean; [k: string]: unknown }> };
    // Hard-cap to 2 paths and ensure exactly one main
    const paths = (data.paths ?? []).slice(0, 2);
    let mainSeen = false;
    for (const p of paths) {
      if (p.isMain && !mainSeen) {
        mainSeen = true;
      } else {
        p.isMain = false;
      }
    }
    if (!mainSeen && paths[0]) paths[0].isMain = true;
    return NextResponse.json({ paths });
  } catch (error) {
    console.error("Life tree API error:", error);
    return NextResponse.json({ errorCode: "fortuneFailed" }, { status: 500 });
  }
}

function getMockPaths(currentAge: number, currentYear: number, element: string, locale: Locale) {
  if (locale === 'en') {
    const labelByEl: Record<string, string> = {
      [MU]:   "Sprout from Earth",
      [HUO]:  "Flame Across Plain",
      [SHUI]: "River of a Thousand Miles",
      [JIN]:  "Forged into Tools",
    };
    return {
      paths: [
        {
          id: "path_main",
          label: labelByEl[element] ?? "Steady Ascent",
          description: "Build on existing strengths step by step.",
          isMain: true,
          nodes: [
            { id: "m1", title: "Deepen specialty", year: currentYear + 1, age: currentAge + 1, description: "Compound depth in your current field.", probability: "High" },
            { id: "m2", title: "Mentor appears", year: currentYear + 3, age: currentAge + 3, description: "Meet a key sponsor or guide.", probability: "Medium" },
            { id: "m3", title: "Career breakthrough", year: currentYear + 6, age: currentAge + 6, description: "Compound effort yields a major opportunity.", probability: "Medium" },
          ],
        },
        {
          id: "path_alt",
          label: "Reinvention Path",
          description: "Pivot bravely, explore new territory.",
          isMain: false,
          nodes: [
            { id: "a1", title: "Inner awakening", year: currentYear + 2, age: currentAge + 2, description: "Re-evaluate life direction.", probability: "Medium" },
            { id: "a2", title: "Bold pivot", year: currentYear + 4, age: currentAge + 4, description: "Step onto a new track.", probability: "Medium" },
            { id: "a3", title: "Steady growth", year: currentYear + 8, age: currentAge + 8, description: "New direction begins to bear fruit.", probability: "Low" },
          ],
        },
      ],
    };
  }
  const labelByEl: Record<string, string> = {
    [MU]:   "\u7834\u571f\u840c\u82bd",
    [HUO]:  "\u70c8\u706b\u71ce\u539f",
    [SHUI]: "\u6c34\u6d41\u5343\u91cc",
    [JIN]:  "\u78e8\u7820\u6210\u5668",
  };
  const HIGH = "\u9ad8", MID = "\u4e2d", LOW = "\u4f4e";
  return {
    paths: [
      {
        id: "path_main",
        label: labelByEl[element] ?? "\u539a\u79ef\u8584\u53d1",
        description: "\u987a\u52bf\u800c\u4e3a\uff0c\u53d1\u6325\u672c\u6027\uff0c\u7a33\u6b65\u63d0\u5347",
        isMain: true,
        nodes: [
          { id: "m1", title: "\u4e13\u4e1a\u6df1\u8015", year: currentYear + 1, age: currentAge + 1, description: "\u5728\u73b0\u6709\u9886\u57df\u6df1\u5ea6\u79ef\u7d2f", probability: HIGH },
          { id: "m2", title: "\u8d35\u4eba\u76f8\u52a9", year: currentYear + 3, age: currentAge + 3, description: "\u9047\u5230\u5173\u952e\u5f15\u8def\u4eba", probability: MID },
          { id: "m3", title: "\u4e8b\u4e1a\u7a81\u7834", year: currentYear + 6, age: currentAge + 6, description: "\u539a\u79ef\u8584\u53d1\uff0c\u8fce\u6765\u91cd\u8981\u8f6c\u673a", probability: MID },
        ],
      },
      {
        id: "path_alt",
        label: "\u8f6c\u8f68\u65b0\u751f",
        description: "\u52c7\u4e8e\u8f6c\u53d8\uff0c\u63a2\u7d22\u5168\u65b0\u9886\u57df",
        isMain: false,
        nodes: [
          { id: "a1", title: "\u5185\u5fc3\u89c9\u9192", year: currentYear + 2, age: currentAge + 2, description: "\u91cd\u65b0\u5ba1\u89c6\u4eba\u751f\u65b9\u5411", probability: MID },
          { id: "a2", title: "\u5927\u80c6\u8f6c\u578b", year: currentYear + 4, age: currentAge + 4, description: "\u8d70\u4e0a\u5168\u65b0\u8d5b\u9053", probability: MID },
          { id: "a3", title: "\u7a33\u5b9a\u6210\u957f", year: currentYear + 8, age: currentAge + 8, description: "\u65b0\u65b9\u5411\u5f00\u82b1\u7ed3\u679c", probability: LOW },
        ],
      },
    ],
  };
}
