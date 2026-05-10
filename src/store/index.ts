import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  UserBirthInfo, BaziDisplay, FortuneReading, DailySign,
  DiaryEntry, DreamEntry, LifeEvent,
  PredictedPath, BranchPath,
} from "@/types";

export interface CustomEmotion {
  id: string;
  label: string;
}

interface GuanyuanStore {
  // UI
  locale: "zh" | "en";
  sidebarCollapsed: boolean;

  // 命盘数据
  birthInfo: UserBirthInfo | null;
  bazi: BaziDisplay | null;
  reading: FortuneReading | null;
  dailySign: DailySign | null;
  dailySignDate: string | null;

  // 问 — 对话历史
  chatHistory: Array<{ role: "user" | "assistant"; content: string }>;

  // 册 — 记录数据
  diaryEntries: DiaryEntry[];
  dreamEntries: DreamEntry[];
  lifeEvents: LifeEvent[];

  // 梦 — 用户自定义情绪标签
  customEmotions: CustomEmotion[];

  // 迹 — 预测主备路径 & 假设分支
  predictedPaths: PredictedPath[];
  branchPaths: BranchPath[];

  // ── Actions ──
  setLocale: (locale: "zh" | "en") => void;
  toggleSidebar: () => void;

  addCustomEmotion: (label: string) => void;
  removeCustomEmotion: (id: string) => void;

  setPredictedPaths: (paths: PredictedPath[]) => void;
  clearPredictedPaths: () => void;

  addBranchPath: (branch: BranchPath) => void;
  removeBranchPath: (id: string) => void;
  clearBranches: () => void;

  setBirthInfo: (info: UserBirthInfo) => void;
  setBazi: (bazi: BaziDisplay) => void;
  setReading: (reading: FortuneReading) => void;
  setDailySign: (sign: DailySign, date: string) => void;

  addChatMessage: (msg: { role: "user" | "assistant"; content: string }) => void;
  clearChat: () => void;

  addDiaryEntry: (entry: DiaryEntry) => void;
  removeDiaryEntry: (id: string) => void;

  addDreamEntry: (entry: DreamEntry) => void;
  removeDreamEntry: (id: string) => void;

  addLifeEvent: (event: LifeEvent) => void;
  removeLifeEvent: (id: string) => void;
  updateLifeEvent: (id: string, updates: Partial<LifeEvent>) => void;

  clearAll: () => void;
}

export const STORE_BASE_KEY = "guanyuan-store";

export function storeKeyFor(userId: string | null | undefined): string {
  return `${STORE_BASE_KEY}::${userId && userId.length > 0 ? userId : "guest"}`;
}

export const useStore = create<GuanyuanStore>()(
  persist(
    (set) => ({
      locale: "zh",
      sidebarCollapsed: false,

      birthInfo: null,
      bazi: null,
      reading: null,
      dailySign: null,
      dailySignDate: null,

      chatHistory: [],

      diaryEntries: [],
      dreamEntries: [],
      lifeEvents: [],

      customEmotions: [],

      predictedPaths: [],
      branchPaths: [],

      setLocale: (locale) => set({ locale }),
      toggleSidebar: () =>
        set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

      addCustomEmotion: (label) =>
        set((s) => {
          const trimmed = label.trim();
          if (!trimmed) return s;
          if (s.customEmotions.some((e) => e.label === trimmed)) return s;
          return {
            customEmotions: [
              ...s.customEmotions,
              { id: `e-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, label: trimmed.slice(0, 20) },
            ],
          };
        }),
      removeCustomEmotion: (id) =>
        set((s) => ({ customEmotions: s.customEmotions.filter((e) => e.id !== id) })),

      setPredictedPaths: (predictedPaths) => set({ predictedPaths }),
      clearPredictedPaths: () => set({ predictedPaths: [] }),

      addBranchPath: (branch) =>
        set((s) => ({ branchPaths: [...s.branchPaths, branch] })),
      removeBranchPath: (id) =>
        set((s) => ({ branchPaths: s.branchPaths.filter((b) => b.id !== id) })),
      clearBranches: () => set({ branchPaths: [] }),

      setBirthInfo: (birthInfo) => set({ birthInfo }),
      setBazi: (bazi) => set({ bazi }),
      setReading: (reading) => set({ reading }),
      setDailySign: (dailySign, dailySignDate) =>
        set({ dailySign, dailySignDate }),

      addChatMessage: (msg) =>
        set((s) => ({ chatHistory: [...s.chatHistory, msg] })),
      clearChat: () => set({ chatHistory: [] }),

      addDiaryEntry: (entry) =>
        set((s) => ({ diaryEntries: [entry, ...s.diaryEntries] })),
      removeDiaryEntry: (id) =>
        set((s) => ({
          diaryEntries: s.diaryEntries.filter((e) => e.id !== id),
        })),

      addDreamEntry: (entry) =>
        set((s) => ({ dreamEntries: [entry, ...s.dreamEntries] })),
      removeDreamEntry: (id) =>
        set((s) => ({
          dreamEntries: s.dreamEntries.filter((e) => e.id !== id),
        })),

      addLifeEvent: (event) =>
        set((s) => ({
          lifeEvents: [...s.lifeEvents, event].sort((a, b) => a.year - b.year),
        })),
      removeLifeEvent: (id) =>
        set((s) => ({
          lifeEvents: s.lifeEvents.filter((e) => e.id !== id),
        })),
      updateLifeEvent: (id, updates) =>
        set((s) => ({
          lifeEvents: s.lifeEvents.map((e) =>
            e.id === id ? { ...e, ...updates } : e
          ),
        })),

      clearAll: () =>
        set({
          birthInfo: null,
          bazi: null,
          reading: null,
          dailySign: null,
          dailySignDate: null,
          chatHistory: [],
          diaryEntries: [],
          dreamEntries: [],
          lifeEvents: [],
          predictedPaths: [],
          branchPaths: [],
        }),
    }),
    {
      name: storeKeyFor("guest"),
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? localStorage : ({} as Storage)
      ),
      partialize: (s) => ({
        locale: s.locale,
        birthInfo: s.birthInfo,
        bazi: s.bazi,
        reading: s.reading,
        dailySign: s.dailySign,
        dailySignDate: s.dailySignDate,
        diaryEntries: s.diaryEntries,
        dreamEntries: s.dreamEntries,
        lifeEvents: s.lifeEvents,
        customEmotions: s.customEmotions,
        branchPaths: s.branchPaths,
      }),
    }
  )
);
