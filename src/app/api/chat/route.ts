import { NextRequest, NextResponse } from "next/server";
import { buildChatSystemPrompt, type Locale } from "@/lib/prompts";
import { streamChatWithBailian, hasBailianKey } from "@/lib/ai";
import type { BaziDisplay } from "@/types";

const MU = '\u6728', HUO = '\u706b', TU = '\u571f', JIN = '\u91d1', SHUI = '\u6c34';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { bazi, messages, locale }: {
      bazi: BaziDisplay;
      messages: Array<{ role: "user" | "assistant"; content: string }>;
      locale?: Locale;
    } = await req.json();
    const lang: Locale = locale === 'en' ? 'en' : 'zh';

    if (!bazi || !messages?.length) {
      return NextResponse.json({ errorCode: "paramsMissing" }, { status: 400 });
    }

    const lastUser = messages[messages.length - 1];
    if (lastUser.role !== "user") {
      return NextResponse.json({ errorCode: "paramsMissing" }, { status: 400 });
    }

    const strengthEn = bazi.dayMaster.strength === "strong" ? "Strong"
      : bazi.dayMaster.strength === "weak" ? "Weak" : "Balanced";
    const strengthZh = bazi.dayMaster.strength === "strong" ? "\u8eab\u5f3a"
      : bazi.dayMaster.strength === "weak" ? "\u8eab\u5f31" : "\u4e2d\u548c";

    const systemContext = lang === 'en'
      ? [
          buildChatSystemPrompt('en'),
          "",
          "User's chart context:",
          `BaZi: ${bazi.yearGan}${bazi.yearZhi} ${bazi.monthGan}${bazi.monthZhi} ${bazi.dayGan}${bazi.dayZhi} ${bazi.hourGan}${bazi.hourZhi}`,
          `Day master: ${bazi.dayGan} (${bazi.dayMaster.element}, ${strengthEn})`,
          `Five elements: Wood ${bazi.wuxingCount[MU] ?? 0}, Fire ${bazi.wuxingCount[HUO] ?? 0}, Earth ${bazi.wuxingCount[TU] ?? 0}, Metal ${bazi.wuxingCount[JIN] ?? 0}, Water ${bazi.wuxingCount[SHUI] ?? 0}`,
          `Missing: ${bazi.missingElements.length > 0 ? bazi.missingElements.join(", ") : "None"}`,
          "",
          "Reply in English plain text only.",
        ].join("\n")
      : [
          buildChatSystemPrompt('zh'),
          "",
          "\u5f53\u524d\u7528\u6237\u547d\u76d8\u4fe1\u606f\uff1a",
          `\u516b\u5b57\uff1a${bazi.yearGan}${bazi.yearZhi}\u5e74 ${bazi.monthGan}${bazi.monthZhi}\u6708 ${bazi.dayGan}${bazi.dayZhi}\u65e5 ${bazi.hourGan}${bazi.hourZhi}\u65f6`,
          `\u65e5\u4e3b\uff1a${bazi.dayGan}\uff08${bazi.dayMaster.element}\uff0c${strengthZh}\uff09`,
          `\u4e94\u884c\uff1a\u6728${bazi.wuxingCount[MU] ?? 0} \u706b${bazi.wuxingCount[HUO] ?? 0} \u571f${bazi.wuxingCount[TU] ?? 0} \u91d1${bazi.wuxingCount[JIN] ?? 0} \u6c34${bazi.wuxingCount[SHUI] ?? 0}`,
          `\u7f3a\u5931\u4e94\u884c\uff1a${bazi.missingElements.join("\u3001") || "\u65e0"}`,
        ].join("\n");

    if (!hasBailianKey()) {
      const replyText = lang === 'en'
        ? `Based on your chart, your day master is ${bazi.dayGan} (${bazi.dayMaster.element}, ${strengthEn}). Your question is a great direction for reflection. Try grounding it in your real situation before deciding.`
        : `\u6839\u636e\u4f60\u7684\u547d\u76d8\uff0c\u65e5\u4e3b${bazi.dayGan}\u5c5e${bazi.dayMaster.element}\uff0c${strengthZh}\u683c\u5c40\u3002\u5173\u4e8e\u4f60\u7684\u95ee\u9898\u662f\u5f88\u597d\u7684\u601d\u8003\u65b9\u5411\uff0c\u5efa\u8bae\u7ed3\u5408\u81ea\u8eab\u5b9e\u9645\u60c5\u51b5\u505a\u51fa\u51b3\u7b56\u3002`;
      const stream = new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(replyText));
          controller.close();
        },
      });
      return new Response(stream, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
        },
      });
    }

    const aiStream = await streamChatWithBailian({
      messages: [
        { role: "system", content: systemContext },
        ...messages.slice(-10),
      ],
      temperature: 0.7,
      model: "qwen-turbo",
      timeoutMs: 45_000,
    });

    return new Response(aiStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ errorCode: "chatFailed" }, { status: 500 });
  }
}
