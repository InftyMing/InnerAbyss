"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WuxingBadge, ReasoningChain } from "@/components/ui/fortune-ui";
import { useT } from "@/i18n";
import { useStore } from "@/store";
import type { FortuneReading, Conclusion } from "@/types";

interface ReadingPanelProps {
  reading: FortuneReading;
  baziInfo: { dayGan: string; dayMaster: { element: string } };
}

function ConclusionCard({ conclusion }: { conclusion: Conclusion }) {
  const t = useT();
  const { birthInfo, locale } = useStore();
  const [reasoningOpen, setReasoningOpen] = useState(false);
  const [questionOpen, setQuestionOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [reply, setReply] = useState("");
  const [isAsking, setIsAsking] = useState(false);

  const categoryLabels: Record<string, string> = {
    career:       t.gua.career,
    relationship: t.gua.relationship,
    health:       t.gua.health,
    wealth:       t.gua.wealth,
    growth:       t.gua.growth,
  };
  const categoryIcons: Record<string, string> = {
    career: "\u2690", relationship: "\u25ce", health: "\u25c7", wealth: "\u25c8", growth: "\u25b3",
  };

  const catLabel = categoryLabels[conclusion.category] ?? conclusion.category;
  const catIcon = categoryIcons[conclusion.category] ?? "\u25cb";

  async function handleAsk() {
    if (!question.trim() || !birthInfo) return;
    setIsAsking(true);
    try {
      const res = await fetch("/api/followup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          year: birthInfo.year,
          month: birthInfo.month,
          day: birthInfo.day,
          hour: birthInfo.hour,
          question,
          previousConclusion: conclusion.title,
          locale,
        }),
      });
      const data = await res.json();
      setReply(data.reply ?? t.errors.chatFailed);
    } catch {
      setReply(t.errors.chatFailed);
    } finally {
      setIsAsking(false);
    }
  }

  return (
    <motion.div className="card p-4 space-y-3" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-start gap-3">
        <WuxingBadge element={conclusion.element} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] text-ink-400">{catIcon} {catLabel}</span>
          </div>
          <h3 className="font-serif font-semibold text-ink-800 text-sm">{conclusion.title}</h3>
        </div>
      </div>
      <p className="text-sm text-ink-600 leading-relaxed pl-10">{conclusion.content}</p>
      <div className="pl-10">
        <ReasoningChain
          conclusion={conclusion.title}
          reasoning={conclusion.reasoning}
          isOpen={reasoningOpen}
          onToggle={() => setReasoningOpen(!reasoningOpen)}
          label={t.gua.reasoning}
        />
      </div>
      <div className="pl-10">
        <button
          onClick={() => setQuestionOpen(!questionOpen)}
          className="text-xs text-ink-400 hover:text-jade-600 transition-colors underline underline-offset-2"
        >
          {questionOpen ? t.gua.collapse : t.gua.question}
        </button>
        <AnimatePresence>
          {questionOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-2 space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder={t.gua.questionPlaceholder}
                  className="flex-1 px-3 py-1.5 text-xs border border-ink-200 rounded-lg bg-ink-50 focus:outline-none focus:border-jade-400"
                  onKeyDown={(e) => e.key === "Enter" && handleAsk()}
                />
                <button
                  onClick={handleAsk}
                  disabled={isAsking}
                  className="px-3 py-1.5 bg-jade-500 text-white text-xs rounded-lg hover:bg-jade-600 disabled:opacity-50 transition-colors"
                >
                  {isAsking ? "..." : t.gua.ask}
                </button>
              </div>
              {reply && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 bg-jade-100 rounded-lg border border-jade-200">
                  <p className="text-xs text-jade-700 leading-relaxed">{reply}</p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default function ReadingPanel({ reading, baziInfo }: ReadingPanelProps) {
  const t = useT();
  const [activeTab, setActiveTab] = useState<"conclusions" | "profile" | "weekly">("conclusions");

  const tabs = [
    { id: "conclusions" as const, label: t.gua.tabs.conclusions },
    { id: "profile"     as const, label: t.gua.tabs.profile },
    { id: "weekly"      as const, label: t.gua.tabs.weekly },
  ];

  return (
    <motion.div className="space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex gap-1 p-1 bg-ink-100 rounded-xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 text-xs font-sans rounded-lg transition-all ${
              activeTab === tab.id ? "bg-white text-ink-800 shadow-sm font-semibold" : "text-ink-500 hover:text-ink-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "conclusions" && (
        <div className="space-y-3">
          {reading.conclusions.map((c, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <ConclusionCard conclusion={c} />
            </motion.div>
          ))}
        </div>
      )}

      {activeTab === "profile" && (
        <motion.div className="card p-5 space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl font-serif text-ink-700">{baziInfo.dayGan}</span>
            <div>
              <p className="text-xs text-ink-400">{t.gua.dayMasterTrait}</p>
              <p className="text-sm font-serif text-ink-700">{baziInfo.dayMaster.element}{t.gua.elementProfile}</p>
            </div>
          </div>
          <div className="p-4 bg-ink-50 rounded-xl border border-ink-200">
            <p className="text-sm text-ink-700 leading-relaxed">{reading.psychProfile.corePersonality}</p>
          </div>
          <div>
            <p className="text-xs text-ink-400 mb-2">{t.gua.strengths}</p>
            <div className="space-y-2">
              {reading.psychProfile.strengths.map((s, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-jade-500 text-xs mt-0.5">{"\u2726"}</span>
                  <p className="text-sm text-ink-600">{s}</p>
                </div>
              ))}
            </div>
          </div>
          <hr className="divider-ink" />
          <div>
            <p className="text-xs text-ink-400 mb-2">{t.gua.growthAreas}</p>
            <div className="space-y-2">
              {reading.psychProfile.growthAreas.map((g, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-gold-500 text-xs mt-0.5">{"\u25c7"}</span>
                  <p className="text-sm text-ink-600">{g}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === "weekly" && (
        <motion.div className="card p-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <p className="text-xs text-ink-400 mb-4">{t.gua.weeklyGuide}</p>
          <div className="space-y-2.5">
            {reading.weeklyAdvice.map((w, i) => (
              <motion.div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-ink-50 border border-ink-100" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                <div className="flex flex-col items-center">
                  <WuxingBadge element={w.element} size="sm" />
                  <span className="text-[10px] text-ink-400 mt-0.5">{w.day}</span>
                </div>
                <p className="flex-1 text-sm text-ink-600">{w.advice}</p>
                <span className="text-[10px] text-ink-400 whitespace-nowrap">{w.lucky}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
