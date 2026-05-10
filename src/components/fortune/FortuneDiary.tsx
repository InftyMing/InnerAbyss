"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/store";
import { useT } from "@/i18n";
import type { DiaryEntry } from "@/types";

interface FortuneDiaryProps {
  latestPrediction?: string;
}

export default function FortuneDiary({ latestPrediction }: FortuneDiaryProps) {
  const t = useT();
  const { diaryEntries, addDiaryEntry, removeDiaryEntry } = useStore();
  const [newEvent, setNewEvent] = useState("");
  const [newAccuracy, setNewAccuracy] = useState<DiaryEntry["accuracy"]>();
  const [isAdding, setIsAdding] = useState(false);

  const ACCURACY_CONFIG = {
    accurate:   { label: t.ce.accurate,   color: "text-jade-600",  bg: "bg-jade-100" },
    partial:    { label: t.ce.partial,    color: "text-gold-600",  bg: "bg-gold-100" },
    inaccurate: { label: t.ce.inaccurate, color: "text-coral-500", bg: "bg-coral-100" },
  };

  const accuracyStats = {
    accurate:   diaryEntries.filter((e) => e.accuracy === "accurate").length,
    partial:    diaryEntries.filter((e) => e.accuracy === "partial").length,
    inaccurate: diaryEntries.filter((e) => e.accuracy === "inaccurate").length,
  };
  const totalRated = accuracyStats.accurate + accuracyStats.partial + accuracyStats.inaccurate;
  const accuracyRate = totalRated > 0
    ? Math.round(((accuracyStats.accurate + accuracyStats.partial * 0.5) / totalRated) * 100)
    : null;

  function addEntry() {
    if (!latestPrediction) return;
    const today = new Date();
    addDiaryEntry({
      id: Date.now().toString(),
      date: today.toLocaleDateString(),
      prediction: latestPrediction,
      event: newEvent || undefined,
      accuracy: newAccuracy,
      type: "daily",
    });
    setNewEvent("");
    setNewAccuracy(undefined);
    setIsAdding(false);
  }

  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-serif font-semibold text-ink-800">{t.ce.diaryTitle}</h3>
          <p className="text-xs text-ink-400 mt-0.5">{t.ce.diaryDesc}</p>
        </div>
        <span className="seal">{t.ce.seal}</span>
      </div>

      {totalRated > 0 && (
        <div className="p-3 bg-ink-50 rounded-xl border border-ink-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-ink-500">{t.ce.accuracyStats}</p>
            <p className="text-sm font-serif font-bold text-ink-700">{accuracyRate}% {t.ce.accuracyRate}</p>
          </div>
          <div className="flex gap-1 h-2 rounded-full overflow-hidden">
            {accuracyStats.accurate > 0 && <div className="bg-jade-500 rounded-full" style={{ width: `${(accuracyStats.accurate / totalRated) * 100}%` }} />}
            {accuracyStats.partial > 0 && <div className="bg-gold-400 rounded-full" style={{ width: `${(accuracyStats.partial / totalRated) * 100}%` }} />}
            {accuracyStats.inaccurate > 0 && <div className="bg-coral-400 rounded-full" style={{ width: `${(accuracyStats.inaccurate / totalRated) * 100}%` }} />}
          </div>
        </div>
      )}

      {latestPrediction && (
        <div>
          {!isAdding ? (
            <button
              onClick={() => setIsAdding(true)}
              className="w-full py-2.5 border border-dashed border-ink-300 rounded-lg text-xs text-ink-400 hover:border-ink-400 hover:text-ink-600 transition-all"
            >
              {t.ce.addRecord}
            </button>
          ) : (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-3 p-3 bg-ink-50 rounded-xl border border-ink-200"
              >
                <p className="text-xs text-ink-400 line-clamp-2">{t.ce.predictionRef}{latestPrediction}</p>
                <textarea
                  value={newEvent}
                  onChange={(e) => setNewEvent(e.target.value)}
                  placeholder={t.ce.eventPlaceholder}
                  className="w-full px-3 py-2 text-xs border border-ink-200 rounded-lg bg-white resize-none focus:outline-none focus:border-ink-400"
                  rows={2}
                />
                <div>
                  <p className="text-[10px] text-ink-400 mb-2">{t.ce.accuracyLabel}</p>
                  <div className="flex gap-2">
                    {(["accurate", "partial", "inaccurate"] as const).map((acc) => {
                      const cfg = ACCURACY_CONFIG[acc];
                      return (
                        <button
                          key={acc}
                          onClick={() => setNewAccuracy(acc)}
                          className={`flex-1 py-1.5 text-xs rounded-lg border transition-all ${
                            newAccuracy === acc ? `${cfg.bg} ${cfg.color} border-current` : "border-ink-200 text-ink-400"
                          }`}
                        >
                          {cfg.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setIsAdding(false)} className="flex-1 py-1.5 text-xs border border-ink-200 rounded-lg text-ink-400">{t.ce.cancel}</button>
                  <button onClick={addEntry} className="flex-1 py-1.5 text-xs bg-ink-800 text-white rounded-lg hover:bg-ink-700">{t.ce.saveRecord}</button>
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      )}

      {diaryEntries.length === 0 ? (
        <p className="text-center text-xs text-ink-300 py-4">{t.ce.noEntries}</p>
      ) : (
        <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
          {diaryEntries.map((entry) => (
            <motion.div key={entry.id} className="p-3 bg-white rounded-lg border border-ink-100" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] text-ink-400">{entry.date}</span>
                <div className="flex items-center gap-2">
                  {entry.accuracy && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${ACCURACY_CONFIG[entry.accuracy].bg} ${ACCURACY_CONFIG[entry.accuracy].color}`}>
                      {ACCURACY_CONFIG[entry.accuracy].label}
                    </span>
                  )}
                  <button onClick={() => removeDiaryEntry(entry.id)} className="text-ink-300 hover:text-coral-400 text-xs">&times;</button>
                </div>
              </div>
              <p className="text-xs text-ink-500 line-clamp-2">{entry.prediction}</p>
              {entry.event && <p className="text-xs text-ink-700 mt-1.5 pl-2 border-l-2 border-ink-300">{entry.event}</p>}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
