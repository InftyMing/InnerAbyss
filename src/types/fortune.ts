export interface UserBirthInfo {
  year: number;
  month: number;
  day: number;
  hour: number;
  gender: 'male' | 'female';
  name?: string;
}

export interface Conclusion {
  title: string;
  content: string;
  reasoning: string;
  element: string;
  category: 'career' | 'relationship' | 'health' | 'wealth' | 'growth';
}

export interface PsychProfile {
  corePersonality: string;
  strengths: string[];
  growthAreas: string[];
}

export interface WeeklyAdvice {
  day: string;
  advice: string;
  element: string;
  lucky: string;
}

export interface FortuneReading {
  conclusions: Conclusion[];
  psychProfile: PsychProfile;
  weeklyAdvice: WeeklyAdvice[];
}

export interface DailySign {
  title: string;
  score: number;
  trend: 'excellent' | 'good' | 'neutral' | 'caution';
  yi: string[];
  ji: string[];
  lucky: { color: string; direction: string; number: number };
  verse: string;
  insight: string;
}

export interface BaziDisplay {
  yearGan: string;
  yearZhi: string;
  monthGan: string;
  monthZhi: string;
  dayGan: string;
  dayZhi: string;
  hourGan: string;
  hourZhi: string;
  wuxingCount: Record<string, number>;
  dayMaster: { element: string; strength: 'strong' | 'weak' | 'balanced' };
  missingElements: string[];
}

export interface DiaryEntry {
  id: string;
  date: string;
  prediction: string;
  event?: string;
  accuracy?: 'accurate' | 'partial' | 'inaccurate';
  mood?: number;
}
