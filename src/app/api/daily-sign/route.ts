import { NextRequest, NextResponse } from 'next/server';
import { calculateBazi, getTodayFortune } from '@/lib/bazi';
import { buildSystemPrompt, buildDailySignPrompt, type Locale } from '@/lib/prompts';
import { chatWithBailian, hasBailianKey } from '@/lib/ai';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { year, month, day, hour, locale } = await req.json();
    const lang: Locale = locale === 'en' ? 'en' : 'zh';

    if (!year || !month || !day || hour === undefined) {
      return NextResponse.json({ errorCode: 'paramsMissing' }, { status: 400 });
    }

    const bazi = calculateBazi(Number(year), Number(month), Number(day), Number(hour));
    const today = new Date();
    const fortuneBase = getTodayFortune(bazi, today);

    if (!hasBailianKey()) {
      return NextResponse.json({ bazi, dailySign: getMockDailySign(fortuneBase, lang) });
    }

    const prompt = buildDailySignPrompt(bazi, today, lang);
    const content = await chatWithBailian({
      messages: [
        { role: 'system', content: buildSystemPrompt(lang) },
        { role: 'user', content: prompt },
      ],
      temperature: 0.8,
      jsonMode: true,
      model: 'qwen-turbo',
      timeoutMs: 30_000,
    });

    const dailySign = JSON.parse(content);
    dailySign.score = fortuneBase.score;
    dailySign.trend = fortuneBase.trend;
    return NextResponse.json({ bazi, dailySign });
  } catch (error) {
    console.error('Daily sign API error:', error);
    return NextResponse.json({ errorCode: 'dailySignFailed' }, { status: 500 });
  }
}

function getMockDailySign(fortune: ReturnType<typeof getTodayFortune>, locale: Locale) {
  if (locale === 'en') {
    const titles = {
      excellent: 'Skies Open Bright',
      good:      'Gentle Sun',
      neutral:   'Still Lake, Autumn Moon',
      caution:   'Quiet Waters Run Deep',
    } as const;
    const verses = {
      excellent: 'When the branch invites, do not delay; the bloom will not wait.',
      good:      'Behind the next ridge a willow-shaded hamlet awaits.',
      neutral:   'Move with the moment; contentment makes its own fortune.',
      caution:   'Polish the self in stillness; bide the moon for the right hour.',
    } as const;
    const colorByEl: Record<string, string> = {
      '\u6728': 'Green', '\u706b': 'Coral', '\u571f': 'Yellow', '\u91d1': 'White', '\u6c34': 'Blue',
    };
    const dirByEl: Record<string, string> = {
      '\u6728': 'East', '\u706b': 'South', '\u571f': 'Center', '\u91d1': 'West', '\u6c34': 'North',
    };
    return {
      title: titles[fortune.trend],
      score: fortune.score,
      trend: fortune.trend,
      yi: ['Connect with friends or family', 'Clear the inbox of pending items', 'Learn a new skill or read deeply'],
      ji: ['Avoid impulse spending', 'Avoid heated arguments'],
      lucky: {
        color: colorByEl[fortune.luckyElement] ?? 'Yellow',
        direction: dirByEl[fortune.luckyElement] ?? 'Center',
        number: Math.max(1, Math.floor(fortune.score / 10)),
      },
      verse: verses[fortune.trend],
      insight: `Your inner energy is in a ${fortune.score >= 75 ? 'high' : fortune.score >= 55 ? 'steady' : 'low'} state today. ${fortune.trend === 'caution' ? 'A good moment for reflection and recharging, not a sign of failure.' : 'Stay aware and channel this energy into what truly matters.'}`,
    };
  }
  const titles = {
    excellent: '\u4e91\u5f00\u65e5\u4e3d',
    good:      '\u98ce\u548c\u65e5\u6696',
    neutral:   '\u5e73\u6e56\u79cb\u6708',
    caution:   '\u9759\u6c34\u6df1\u6d41',
  };
  const verses = {
    excellent: '\u82b1\u5f00\u582a\u6298\u76f4\u987b\u6298\uff0c\u83ab\u5f85\u65e0\u82b1\u7a7a\u6298\u679d',
    good:      '\u5c71\u91cd\u6c34\u590d\u7591\u65e0\u8def\uff0c\u67f3\u6697\u82b1\u660e\u53c8\u4e00\u6751',
    neutral:   '\u968f\u9047\u800c\u5b89\u5fc3\u81ea\u5728\uff0c\u77e5\u8db3\u5e38\u4e50\u798f\u81ea\u6765',
    caution:   '\u9759\u4ee5\u4fee\u8eab\uff0c\u4fed\u4ee5\u517b\u5fb7\uff0c\u97ec\u5149\u517b\u6666\u5f85\u65f6\u673a',
  };
  const colorByEl: Record<string, string> = {
    '\u6728': '\u7eff\u8272',
    '\u706b': '\u73ca\u745a',
    '\u571f': '\u9ec4\u8272',
    '\u91d1': '\u767d\u8272',
    '\u6c34': '\u84dd\u8272',
  };
  return {
    title: titles[fortune.trend],
    score: fortune.score,
    trend: fortune.trend,
    yi: ['\u4e0e\u4eb2\u53cb\u8054\u7edc\u611f\u60c5', '\u5904\u7406\u79ef\u538b\u7684\u6587\u4ef6\u4e8b\u52a1', '\u5b66\u4e60\u65b0\u77e5\u8bc6\u65b0\u6280\u80fd'],
    ji: ['\u907f\u514d\u51b2\u52a8\u6d88\u8d39', '\u4e0d\u5b9c\u4e0e\u4eba\u4e89\u6267'],
    lucky: {
      color: colorByEl[fortune.luckyElement] ?? '\u9ec4\u8272',
      direction: fortune.luckyDirection,
      number: Math.max(1, Math.floor(fortune.score / 10)),
    },
    verse: verses[fortune.trend],
    insight: `\u4eca\u65e5\u4f60\u7684\u5185\u5728\u80fd\u91cf\u5904\u4e8e${fortune.score >= 75 ? '\u9ad8\u4f4d' : fortune.score >= 55 ? '\u5e73\u7a33' : '\u4f4e\u8c37'}\u72b6\u6001\uff0c${fortune.trend === 'caution' ? '\u8fd9\u662f\u5185\u7701\u548c\u5145\u7535\u7684\u597d\u65f6\u673a\uff0c\u800c\u975e\u5931\u8d25\u7684\u9884\u5146' : '\u4fdd\u6301\u89c9\u5bdf\uff0c\u5c06\u8fd9\u4efd\u80fd\u91cf\u7528\u5728\u771f\u6b63\u91cd\u8981\u7684\u4e8b\u60c5\u4e0a'}\u3002`,
  };
}
