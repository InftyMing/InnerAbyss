import { NextRequest, NextResponse } from "next/server";
import { chatWithBailian, hasBailianKey } from "@/lib/ai";
import { buildSystemPrompt, buildBranchPrompt, type Locale } from "@/lib/prompts";
import type { BaziDisplay } from "@/types";

export const runtime = 'nodejs';

interface AnchorEvent {
  id: string;
  title: string;
  year: number;
  age?: number;
  description?: string;
}

export async function POST(req: NextRequest) {
  try {
    const { bazi, anchor, condition, locale }: {
      bazi: BaziDisplay;
      anchor: AnchorEvent;
      condition: string;
      locale?: Locale;
    } = await req.json();
    const lang: Locale = locale === 'en' ? 'en' : 'zh';

    if (!bazi || !anchor?.title || !condition) {
      return NextResponse.json({ errorCode: "paramsMissing" }, { status: 400 });
    }

    if (!hasBailianKey()) {
      return NextResponse.json({ branch: getMockBranch(anchor, condition, lang) });
    }

    const prompt = buildBranchPrompt(bazi, anchor, condition, lang);
    const content = await chatWithBailian({
      messages: [
        { role: "system", content: buildSystemPrompt(lang) },
        { role: "user", content: prompt },
      ],
      temperature: 0.85,
      jsonMode: true,
      model: "qwen-plus",
      timeoutMs: 45_000,
    });

    const data = JSON.parse(content) as {
      label: string;
      description: string;
      nodes: Array<{ id?: string; title: string; year: number; age: number; description: string; probability: string }>;
    };

    return NextResponse.json({
      branch: {
        label: data.label,
        description: data.description,
        nodes: (data.nodes ?? []).slice(0, 4).map((n, i) => ({
          id: n.id ?? `b-${Date.now()}-${i}`,
          title: n.title,
          year: n.year,
          age: n.age,
          description: n.description,
          probability: n.probability,
        })),
      },
    });
  } catch (error) {
    console.error("Life branch API error:", error);
    return NextResponse.json({ errorCode: "fortuneFailed" }, { status: 500 });
  }
}

function getMockBranch(anchor: AnchorEvent, condition: string, locale: Locale) {
  if (locale === 'en') {
    return {
      label: "Alternate Path",
      description: `What if ${condition}? An imagined branch from age ${anchor.age ?? '?'}.`,
      nodes: [
        { id: `b-${Date.now()}-1`, title: "First step diverges", year: anchor.year + 1, age: (anchor.age ?? 25) + 1, description: "Initial steps in the alternative direction.", probability: "Medium" },
        { id: `b-${Date.now()}-2`, title: "Reality settles", year: anchor.year + 3, age: (anchor.age ?? 25) + 3, description: "The new path stabilizes.", probability: "Medium" },
        { id: `b-${Date.now()}-3`, title: "Long-term outcome", year: anchor.year + 7, age: (anchor.age ?? 25) + 7, description: "Where this could lead in the long run.", probability: "Low" },
      ],
    };
  }
  return {
    label: "\u53e6\u4e00\u6761\u8def",
    description: `\u5982\u679c${condition}\uff0c\u4ece ${anchor.age ?? '?'} \u5c81\u8d77\u7684\u5e73\u884c\u4eba\u751f\u3002`,
    nodes: [
      { id: `b-${Date.now()}-1`, title: "\u8d70\u51fa\u7b2c\u4e00\u6b65", year: anchor.year + 1, age: (anchor.age ?? 25) + 1, description: "\u65b0\u8def\u7ebf\u7684\u8d77\u59cb\u9636\u6bb5\u3002", probability: "\u4e2d" },
      { id: `b-${Date.now()}-2`, title: "\u72b6\u6001\u8d8b\u4e8e\u7a33\u5b9a", year: anchor.year + 3, age: (anchor.age ?? 25) + 3, description: "\u65b0\u8def\u7ebf\u8fdb\u5165\u7a33\u5b9a\u671f\u3002", probability: "\u4e2d" },
      { id: `b-${Date.now()}-3`, title: "\u957f\u8fdc\u8d70\u5411", year: anchor.year + 7, age: (anchor.age ?? 25) + 7, description: "\u8fd9\u6761\u8def\u7684\u957f\u671f\u53ef\u80fd\u7ed3\u679c\u3002", probability: "\u4f4e" },
    ],
  };
}
