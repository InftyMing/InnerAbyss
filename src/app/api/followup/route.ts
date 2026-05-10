import { NextRequest, NextResponse } from 'next/server';
import { calculateBazi } from '@/lib/bazi';
import { buildChatSystemPrompt, buildFollowUpPrompt, type Locale } from '@/lib/prompts';
import { chatWithBailian, hasBailianKey } from '@/lib/ai';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { year, month, day, hour, question, previousConclusion, locale } = await req.json();
    const lang: Locale = locale === 'en' ? 'en' : 'zh';
    const bazi = calculateBazi(Number(year), Number(month), Number(day), Number(hour));

    if (!hasBailianKey()) {
      const reply = lang === 'en'
        ? `That's a great question. Fate readings are not absolute predictions \u2014 they highlight tendencies based on the ${bazi.dayMaster.element}-element qualities of your day master. Treat it as a hypothesis and verify against your real experience.`
        : `\u8fd9\u662f\u4e2a\u5f88\u597d\u7684\u95ee\u9898\u3002\u547d\u7406\u89e3\u8bfb\u5e76\u975e\u7edd\u5bf9\u9884\u6d4b\uff0c\u800c\u662f\u57fa\u4e8e${bazi.dayMaster.element}\u6027\u7279\u8d28\u7684\u8d8b\u52bf\u5206\u6790\u3002\u5efa\u8bae\u7ed3\u5408\u81ea\u8eab\u7ecf\u5386\u9a8c\u8bc1\u3002`;
      return NextResponse.json({ reply });
    }

    const prompt = buildFollowUpPrompt(bazi, question, previousConclusion, lang);
    const reply = await chatWithBailian({
      messages: [
        { role: 'system', content: buildChatSystemPrompt(lang) },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      model: 'qwen-turbo',
      timeoutMs: 30_000,
    });

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Follow-up API error:', error);
    return NextResponse.json({ errorCode: 'chatFailed' }, { status: 500 });
  }
}
