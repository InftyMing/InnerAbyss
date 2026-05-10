// ── 输入 ──
export interface UserBirthInfo {
  year: number;
  month: number;
  day: number;
  hour: number;
  gender: "male" | "female";
  name?: string;
}

// ── 命盘 ──
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
  dayMaster: { element: string; strength: "strong" | "weak" | "balanced" };
  missingElements: string[];
}

// ── 解读 ──
export interface Conclusion {
  title: string;
  content: string;
  reasoning: string;
  element: string;
  category: "career" | "relationship" | "health" | "wealth" | "growth";
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

// ── 运签 ──
export interface DailySign {
  title: string;
  score: number;
  trend: "excellent" | "good" | "neutral" | "caution";
  yi: string[];
  ji: string[];
  lucky: { color: string; direction: string; number: number };
  verse: string;
  insight: string;
}

// ── 册·记录 ──
export interface DiaryEntry {
  id: string;
  date: string;
  prediction: string;
  event?: string;
  accuracy?: "accurate" | "partial" | "inaccurate";
  type?: "daily" | "dream" | "sign";
}

export interface DreamEntry {
  id: string;
  date: string;
  content: string;
  interpretation?: string;
  emotion?: "positive" | "neutral" | "negative";
}

// ── 迹·人生事件 ──
export interface LifeEvent {
  id: string;
  title: string;
  description?: string;
  date: string;      // YYYY-MM
  year: number;
  age?: number;
  category: "general" | "career" | "relationship" | "health" | "education" | "other";
  nodeType: "milestone" | "turning" | "birth" | "current" | "predicted";
}

// ── 迹·预测节点（来自 AI） ──
export interface PredictedNode {
  id: string;
  title: string;       // short headline (model summarizes)
  year: number;
  age: number;
  description: string; // longer detail
  probability: string; // "High|Medium|Low" or zh "高|中|低"
}

// 主线 + 备选路径（仅两条）
export interface PredictedPath {
  id: string;
  label: string;       // path name
  description: string; // path summary
  isMain: boolean;     // true = main / most-likely path; false = alternative
  nodes: PredictedNode[];
}

// 用户基于过去节点的「假设」分支
export interface BranchPath {
  id: string;
  fromNodeId: string;        // anchor node id (a LifeEvent id)
  condition: string;         // user-specified hypothesis
  label: string;             // model-generated short title
  description: string;       // model summary
  nodes: PredictedNode[];
  createdAt: number;
}

// ── 梦境解读 ──
export interface DreamReading {
  title: string;
  symbolInterpretations: Array<{ symbol: string; meaning: string }>;
  overallMessage: string;
  fateConnection: string;
  advice: string;
}
