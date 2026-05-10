import { NextRequest, NextResponse } from 'next/server';
import { calculateBazi } from '@/lib/bazi';
import { buildSystemPrompt, buildBaziReadingPrompt, type Locale } from '@/lib/prompts';
import { chatWithBailian, hasBailianKey } from '@/lib/ai';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { year, month, day, hour, gender, name, locale } = await req.json();
    const lang: Locale = locale === 'en' ? 'en' : 'zh';

    if (!year || !month || !day || hour === undefined || !gender) {
      return NextResponse.json({ errorCode: 'paramsMissing' }, { status: 400 });
    }

    const bazi = calculateBazi(Number(year), Number(month), Number(day), Number(hour));

    if (!hasBailianKey()) {
      return NextResponse.json({ bazi, reading: getMockReading(bazi, lang) });
    }

    const prompt = buildBaziReadingPrompt(bazi, gender, name, lang);
    const content = await chatWithBailian({
      messages: [
        { role: 'system', content: buildSystemPrompt(lang) },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      jsonMode: true,
      model: 'qwen-plus',
      timeoutMs: 60_000,
    });

    const reading = JSON.parse(content);
    return NextResponse.json({ bazi, reading });
  } catch (error) {
    console.error('Fortune API error:', error);
    return NextResponse.json({ errorCode: 'fortuneFailed' }, { status: 500 });
  }
}

function getMockReading(bazi: ReturnType<typeof calculateBazi>, locale: Locale) {
  const element = bazi.dayMaster.element;
  const strength = bazi.dayMaster.strength;
  const MU = '\u6728', HUO = '\u706b', JIN = '\u91d1', SHUI = '\u6c34';

  if (locale === 'en') {
    const elementEn: Record<string, string> = { [MU]: 'Wood', [HUO]: 'Fire', '\u571f': 'Earth', [JIN]: 'Metal', [SHUI]: 'Water' };
    const personalityByEl: Record<string, string> = {
      [MU]:   'Kind and steady, with persistent vitality and clear long-term goals.',
      [HUO]:  'Warm and expressive, naturally inspiring and motivating to others.',
      [SHUI]: 'Adaptable and insightful, finding opportunity inside change.',
      [JIN]:  'Disciplined and determined, pursuing excellence with strong execution.',
    };
    const personality = personalityByEl[element] ?? 'Grounded and inclusive.';
    const careerByStr = strength === 'strong'
      ? 'Use-god prefers outflow and control'
      : strength === 'weak'
        ? 'Day master is weak; favor support and resources'
        : 'A balanced chart \u2014 multiple directions are viable';
    return {
      conclusions: [
        {
          title: 'Career Outlook',
          content: `Your day master is ${elementEn[element] ?? element}. ${careerByStr}. You have strong execution and focus, well suited to fields requiring depth.`,
          reasoning: `Conclusion \u2190 Day master ${bazi.dayGan} (${elementEn[element] ?? element}); element appears ${bazi.wuxingCount[element]} times.`,
          element,
          category: 'career',
        },
        {
          title: 'Relationships',
          content: 'You value emotional alignment and stable commitments. Practice expressing feelings actively to avoid being too reserved.',
          reasoning: `Conclusion \u2190 Day master ${bazi.dayGan} (${elementEn[element] ?? element}) shapes how affection is communicated.`,
          element,
          category: 'relationship',
        },
        {
          title: 'Health Notes',
          content: `Pay attention to ${bazi.missingElements.length > 0 ? `the organ system tied to ${bazi.missingElements.map(m => elementEn[m] ?? m).join(', ')}` : 'overall balance'}; keep a steady sleep schedule and moderate exercise.`,
          reasoning: `Conclusion \u2190 Missing elements: ${bazi.missingElements.length > 0 ? bazi.missingElements.map(m => elementEn[m] ?? m).join(', ') : 'None'}.`,
          element,
          category: 'health',
        },
        {
          title: 'Wealth Pattern',
          content: `Wealth ${bazi.wuxingCount[JIN] > 2 ? 'flows abundantly; you are good at accumulation' : 'is steady; favor disciplined planning'}. Build wealth through professional skills.`,
          reasoning: `Conclusion \u2190 Metal+Water count = ${bazi.wuxingCount[JIN] + bazi.wuxingCount[SHUI]}, indicating wealth-star strength.`,
          element: JIN,
          category: 'wealth',
        },
        {
          title: 'Growth Direction',
          content: `${bazi.missingElements.length > 0 ? `Cultivating ${bazi.missingElements.map(m => elementEn[m] ?? m).join(', ')} qualities` : 'Five-element balance'} can lift overall fortune.`,
          reasoning: `Conclusion \u2190 Missing elements: ${bazi.missingElements.length > 0 ? bazi.missingElements.map(m => elementEn[m] ?? m).join(', ') : 'None'}.`,
          element: bazi.missingElements[0] ?? element,
          category: 'growth',
        },
      ],
      psychProfile: {
        corePersonality: `${personality} ${strength === 'strong' ? 'Energy is plentiful.' : strength === 'weak' ? 'You leverage allies well.' : 'Tension and ease are well measured.'}`,
        strengths: [
          `Intuition and insight from ${elementEn[element] ?? element} qualities`,
          'Strong drive for self-understanding',
          'Discipline and focused execution',
        ],
        growthAreas: [
          `Cultivate ${bazi.missingElements[0] ? (elementEn[bazi.missingElements[0]] ?? 'balance') : 'balance'} energy`,
          'Find personal rhythm between stability and change',
        ],
      },
      weeklyAdvice: [
        { day: 'Mon', advice: 'Plan the week and clarify priorities', element: MU,   lucky: 'East' },
        { day: 'Tue', advice: 'Strong social day \u2014 advance partnerships', element: HUO,  lucky: 'South' },
        { day: 'Wed', advice: 'Steady wealth \u2014 avoid large impulse spending', element: '\u571f', lucky: 'Center' },
        { day: 'Thu', advice: 'Deep-focus work; minimize distractions', element: JIN,  lucky: 'West' },
        { day: 'Fri', advice: 'Wrap up tasks and recharge for the weekend', element: SHUI, lucky: 'North' },
        { day: 'Sat', advice: 'Recharge in nature or with movement', element: MU,   lucky: 'Outdoors' },
        { day: 'Sun', advice: 'Quiet reflection and prep for next week', element: '\u571f', lucky: 'Home' },
      ],
    };
  }

  // zh fallback (kept identical to previous version)
  const careerByStr = strength === 'strong'
    ? '\u8eab\u5f3a\u7528\u795e\u5b9c\u6cc4\u5b9c\u514b'
    : strength === 'weak'
      ? '\u8eab\u5f31\u559c\u751f\u559c\u52a9'
      : '\u547d\u5c40\u4e2d\u548c\uff0c\u516b\u65b9\u7686\u53ef';

  const personalityByEl: Record<string, string> = {
    [MU]:   '\u4ec1\u6148\u6b63\u76f4\uff0c\u76ee\u6807\u575a\u5b9a\uff0c\u5177\u6709\u6301\u7eed\u6210\u957f\u7684\u751f\u547d\u529b',
    [HUO]:  '\u70ed\u60c5\u5145\u6c9b\uff0c\u5bcc\u6709\u611f\u67d3\u529b\uff0c\u5929\u751f\u7684\u6fc0\u52b1\u8005',
    [SHUI]: '\u667a\u6167\u7075\u52a8\uff0c\u9002\u5e94\u529b\u5f3a\uff0c\u5584\u4e8e\u5728\u53d8\u5316\u4e2d\u5bfb\u627e\u673a\u4f1a',
    [JIN]:  '\u610f\u5fd7\u575a\u5b9a\uff0c\u6267\u884c\u529b\u5f3a\uff0c\u8ffd\u6c42\u5b8c\u7f8e\u4e0e\u5353\u8d8a',
  };
  const personality = personalityByEl[element] ?? '\u8e0f\u5b9e\u7a33\u91cd\uff0c\u5305\u5bb9\u6027\u5f3a';

  return {
    conclusions: [
      {
        title: '\u4e8b\u4e1a\u8fd0\u52bf',
        content: `\u4f60\u7684\u65e5\u4e3b\u4e3a${element}\uff0c${careerByStr}\u3002\u4e8b\u4e1a\u4e0a\u5177\u6709\u8f83\u5f3a\u7684\u6267\u884c\u529b\u548c\u4e13\u6ce8\u5ea6\uff0c\u9002\u5408\u9700\u8981\u6df1\u5ea6\u601d\u8003\u7684\u9886\u57df\u3002`,
        reasoning: `\u7ed3\u8bba \u2190 \u65e5\u4e3b${bazi.dayGan}\u5c5e${element}\uff0c\u547d\u5c40\u4e94\u884c${element}\u51fa\u73b0${bazi.wuxingCount[element]}\u6b21\uff0c\u5176\u5f3a\u5f31\u51b3\u5b9a\u7528\u795e\u65b9\u5411`,
        element,
        category: 'career',
      },
      {
        title: '\u611f\u60c5\u7279\u8d28',
        content: '\u611f\u60c5\u65b9\u9762\u4f60\u91cd\u89c6\u7cbe\u795e\u5951\u5408\u4e0e\u7a33\u5b9a\u627f\u8bfa\u3002\u5efa\u8bae\u4e3b\u52a8\u8868\u8fbe\u60c5\u611f\uff0c\u907f\u514d\u8fc7\u5ea6\u5185\u655b\u3002',
        reasoning: `\u7ed3\u8bba \u2190 \u65e5\u4e3b${bazi.dayGan}${element}\u6027\u4e3b\u573a\uff0c\u5f71\u54cd\u611f\u60c5\u8868\u8fbe\u65b9\u5f0f`,
        element,
        category: 'relationship',
      },
      {
        title: '\u5065\u5eb7\u63d0\u793a',
        content: `\u6839\u636e\u4e94\u884c\u683c\u5c40\uff0c\u9700\u91cd\u70b9\u5173\u6ce8${bazi.missingElements.length > 0 ? bazi.missingElements[0] + '\u5bf9\u5e94\u7684\u5668\u5b98' : '\u6574\u4f53\u5747\u8861'}\uff0c\u4fdd\u6301\u89c4\u5f8b\u4f5c\u606f\u4e0e\u9002\u5ea6\u8fd0\u52a8\u3002`,
        reasoning: `\u7ed3\u8bba \u2190 \u65e5\u4e3b${element}\u5bf9\u5e94\u5668\u5b98\uff0c\u7f3a\u5931\u4e94\u884c${bazi.missingElements.join('\u3001') || '\u65e0'}\u9700\u8865\u5145`,
        element,
        category: 'health',
      },
      {
        title: '\u8d22\u5bcc\u683c\u5c40',
        content: `\u8d22\u5e1b\u5206\u6790\u663e\u793a\uff0c\u4f60\u7684\u8d22\u8fd0${bazi.wuxingCount[JIN] > 2 ? '\u8f83\u65fa\uff0c\u5584\u4e8e\u79ef\u7d2f' : '\u5e73\u7a33\uff0c\u9700\u7a33\u5065\u7406\u8d22'}\u3002\u9002\u5408\u901a\u8fc7\u4e13\u4e1a\u6280\u80fd\u79ef\u7d2f\u8d22\u5bcc\u3002`,
        reasoning: `\u7ed3\u8bba \u2190 \u547d\u5c40\u91d1\u6c34${bazi.wuxingCount[JIN] + bazi.wuxingCount[SHUI]}\u4e2a\uff0c\u8d22\u661f\u529b\u91cf\u5982\u6b64`,
        element: JIN,
        category: 'wealth',
      },
      {
        title: '\u6210\u957f\u65b9\u5411',
        content: `\u547d\u4e2d${bazi.missingElements.length > 0 ? `\u7f3a\u5c11${bazi.missingElements.join('\u3001')}\uff0c\u8865\u5145\u8fd9\u4e9b\u4e94\u884c` : '\u4e94\u884c\u8f83\u4e3a\u5747\u8861'}\u53ef\u4ee5\u63d0\u5347\u6574\u4f53\u8fd0\u52bf\u3002`,
        reasoning: `\u7ed3\u8bba \u2190 \u7f3a\u5931\u4e94\u884c${bazi.missingElements.join('\u3001') || '\u65e0'}\u53ef\u5f25\u8865\u547d\u5c40\u77ed\u677f`,
        element: bazi.missingElements[0] ?? element,
        category: 'growth',
      },
    ],
    psychProfile: {
      corePersonality: `\u5177\u6709${element}\u6027\u7279\u8d28\u7684\u4f60\uff0c${personality}`,
      strengths: [
        `${element}\u6027\u7279\u8d28\u5e26\u6765\u7684\u76f4\u89c9\u4e0e\u6d1e\u5bdf\u529b`,
        `\u547d\u5c40${strength === 'strong' ? '\u8eab\u5f3a\uff0c\u7cbe\u529b\u5145\u6c9b' : strength === 'weak' ? '\u8eab\u5f31\uff0c\u5584\u4e8e\u501f\u52bf' : '\u4e2d\u548c\uff0c\u5f20\u5f1b\u6709\u5ea6'}`,
        '\u5bf9\u81ea\u6211\u8ba4\u77e5\u6709\u8f83\u5f3a\u7684\u63a2\u7d22\u6b32\u671b',
      ],
      growthAreas: [
        `\u8865\u5145\u7f3a\u5931\u7684${bazi.missingElements[0] ?? '\u5747\u8861'}\u4e94\u884c\u7279\u8d28`,
        '\u5728\u7a33\u5b9a\u4e0e\u53d8\u5316\u4e4b\u95f4\u627e\u5230\u4e2a\u4eba\u8282\u594f',
      ],
    },
    weeklyAdvice: [
      { day: '\u5468\u4e00', advice: '\u9002\u5408\u89c4\u5212\u672c\u5468\u76ee\u6807\uff0c\u6574\u7406\u5de5\u4f5c\u601d\u8def', element: MU,   lucky: '\u4e1c\u65b9' },
      { day: '\u5468\u4e8c', advice: '\u793e\u4ea4\u8fd0\u4f73\uff0c\u9002\u5408\u63a8\u8fdb\u5408\u4f5c\u9879\u76ee',          element: HUO,  lucky: '\u5357\u65b9' },
      { day: '\u5468\u4e09', advice: '\u8d22\u8fd0\u5e73\u7a33\uff0c\u907f\u514d\u5927\u989d\u652f\u51fa\u51b3\u7b56',          element: '\u571f', lucky: '\u4e2d\u592e' },
      { day: '\u5468\u56db', advice: '\u4e13\u6ce8\u6df1\u5ea6\u5de5\u4f5c\uff0c\u907f\u514d\u5206\u5fc3',                       element: JIN,  lucky: '\u897f\u65b9' },
      { day: '\u5468\u4e94', advice: '\u6536\u5c3e\u672c\u5468\u4efb\u52a1\uff0c\u4e3a\u5468\u672b\u5145\u7535',                element: SHUI, lucky: '\u5317\u65b9' },
      { day: '\u5468\u516d', advice: '\u9002\u5408\u81ea\u6211\u5145\u7535\uff0c\u63a5\u89e6\u81ea\u7136\u6216\u8fd0\u52a8',     element: MU,   lucky: '\u6237\u5916' },
      { day: '\u5468\u65e5', advice: '\u9759\u5fc3\u6574\u7406\u5185\u5fc3\uff0c\u4e3a\u65b0\u4e00\u5468\u84c4\u80fd',          element: '\u571f', lucky: '\u5bb6\u4e2d' },
    ],
  };
}
