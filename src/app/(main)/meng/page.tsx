"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/store";
import { useT } from "@/i18n";
import TopBar from "@/components/layout/TopBar";
import type { DreamReading, DreamEntry } from "@/types";

interface EmotionOption {
  id: string;
  value: string;            // sent to API
  label: string;            // displayed
  builtin: boolean;
  color: string;            // active styling
}

export default function MengPage() {
  const t = useT();
  const {
    bazi,
    dreamEntries,
    addDreamEntry,
    removeDreamEntry,
    customEmotions,
    addCustomEmotion,
    removeCustomEmotion,
    locale,
  } = useStore();

  const [content, setContent] = useState("");
  const [activeEmotionId, setActiveEmotionId] = useState<string>("neutral");
  const [loading, setLoading] = useState(false);
  const [reading, setReading] = useState<DreamReading | null>(null);
  const [saved, setSaved] = useState(false);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState("");
  const [showTagInput, setShowTagInput] = useState(false);

  function getErrorText(code: string): string {
    return (t.errors as Record<string, string>)[code] ?? t.errors.dreamFailed;
  }

  const builtinEmotions: EmotionOption[] = [
    { id: "positive", value: "positive", label: t.meng.emotionPositive, builtin: true, color: "text-jade-600 border-jade-300 bg-jade-50" },
    { id: "neutral",  value: "neutral",  label: t.meng.emotionNeutral,  builtin: true, color: "text-ink-500 border-ink-300 bg-ink-50" },
    { id: "negative", value: "negative", label: t.meng.emotionNegative, builtin: true, color: "text-coral-500 border-coral-300 bg-coral-50" },
  ];

  const customOptions: EmotionOption[] = customEmotions.map((e) => ({
    id: e.id,
    value: "custom",
    label: e.label,
    builtin: false,
    color: "text-mystic-700 border-mystic-400 bg-mystic-100",
  }));

  const allEmotions: EmotionOption[] = [...builtinEmotions, ...customOptions];

  async function handleInterpret() {
    if (!content.trim()) return;
    setLoading(true);
    setReading(null);
    setSaved(false);
    setErrorKey(null);

    const active = allEmotions.find((e) => e.id === activeEmotionId) ?? builtinEmotions[1];
    try {
      const res = await fetch("/api/dream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dreamContent: content,
          emotion: active.value,
          emotionLabel: active.label,
          bazi,
          locale,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.errorCode ?? "dreamFailed");
      setReading(data.reading);
    } catch (err) {
      setErrorKey(err instanceof Error ? err.message : "dreamFailed");
    } finally {
      setLoading(false);
    }
  }

  function handleSave() {
    if (!reading) return;
    const active = allEmotions.find((e) => e.id === activeEmotionId);
    const entry: DreamEntry = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString(),
      content,
      interpretation: reading.overallMessage,
      emotion: (active?.value ?? "neutral") as DreamEntry["emotion"],
    };
    addDreamEntry(entry);
    setSaved(true);
  }

  function handleAddTag() {
    const raw = tagInput.trim();
    if (!raw) return;
    raw
      .split(/[,\uFF0C]+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((label) => addCustomEmotion(label));
    setTagInput("");
    setShowTagInput(false);
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar title={t.meng.title} subtitle={t.meng.subtitle} />
      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="card p-5 space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-serif text-ink-600">{"\u68a6"}</span>
                <div>
                  <h3 className="font-serif font-semibold text-ink-800">{t.meng.inputLabel}</h3>
                  <p className="text-xs text-ink-400">{t.meng.inputSub}</p>
                </div>
              </div>

              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={t.meng.inputPlaceholder}
                rows={6}
                className="w-full px-4 py-3 border border-ink-200 rounded-xl text-sm text-ink-700 focus:outline-none focus:border-ink-400 bg-ink-50 resize-none leading-relaxed"
              />

              <div>
                <p className="text-xs text-ink-400 mb-2">{t.meng.emotion}</p>
                <div className="flex flex-wrap gap-2">
                  {allEmotions.map((opt) => {
                    const active = activeEmotionId === opt.id;
                    return (
                      <div key={opt.id} className="relative group">
                        <button
                          onClick={() => setActiveEmotionId(opt.id)}
                          className={`py-1.5 px-3 text-xs rounded-lg border transition-all ${
                            active ? opt.color : "border-ink-200 text-ink-400 bg-white hover:border-ink-400"
                          }`}
                        >
                          {opt.label}
                        </button>
                        {!opt.builtin && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (activeEmotionId === opt.id) setActiveEmotionId("neutral");
                              removeCustomEmotion(opt.id);
                            }}
                            aria-label={t.meng.removeEmotion}
                            className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-coral-400 text-white text-[10px] leading-none opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            &times;
                          </button>
                        )}
                      </div>
                    );
                  })}
                  {!showTagInput && (
                    <button
                      onClick={() => setShowTagInput(true)}
                      className="py-1.5 px-3 text-xs rounded-lg border border-dashed border-ink-300 text-ink-400 hover:border-ink-500 hover:text-ink-600 transition-all"
                    >
                      {t.meng.addEmotion}
                    </button>
                  )}
                </div>

                <AnimatePresence>
                  {showTagInput && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2 flex gap-2"
                    >
                      <input
                        autoFocus
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleAddTag();
                          if (e.key === "Escape") { setShowTagInput(false); setTagInput(""); }
                        }}
                        placeholder={t.meng.addEmotionPlaceholder}
                        maxLength={60}
                        className="flex-1 px-3 py-1.5 text-xs border border-ink-200 rounded-lg bg-white focus:outline-none focus:border-ink-400"
                      />
                      <button
                        onClick={handleAddTag}
                        className="px-3 py-1.5 text-xs bg-ink-900 text-white rounded-lg hover:bg-ink-800"
                      >
                        {t.meng.addEmotionConfirm}
                      </button>
                      <button
                        onClick={() => { setShowTagInput(false); setTagInput(""); }}
                        className="px-3 py-1.5 text-xs border border-ink-200 rounded-lg text-ink-500 hover:bg-ink-50"
                      >
                        {t.common.cancel}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                onClick={handleInterpret}
                disabled={loading || !content.trim()}
                className="w-full py-3 bg-ink-900 text-white rounded-xl text-sm font-serif tracking-widest hover:bg-ink-800 disabled:opacity-50 transition-all"
              >
                {loading ? t.meng.interpreting : t.meng.interpret}
              </button>
            </div>

            {dreamEntries.length > 0 && (
              <div className="card p-4 space-y-3">
                <p className="text-xs font-semibold text-ink-500">{t.meng.history}</p>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {dreamEntries.map((entry) => (
                    <div key={entry.id} className="flex items-start gap-2 p-2.5 bg-ink-50 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-ink-400">{entry.date}</p>
                        <p className="text-xs text-ink-600 line-clamp-2 mt-0.5">{entry.content}</p>
                      </div>
                      <button onClick={() => removeDreamEntry(entry.id)} className="text-ink-300 hover:text-coral-400 text-sm flex-shrink-0">&times;</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            {loading && (
              <div className="card p-8 flex flex-col items-center gap-4">
                <motion.div
                  className="w-16 h-16 rounded-full border-2 border-ink-300"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
                <p className="text-sm text-ink-500">{t.meng.interpreting}</p>
              </div>
            )}

            {errorKey && (
              <div className="p-4 bg-coral-50 border border-coral-200 rounded-xl">
                <p className="text-sm text-coral-600">{getErrorText(errorKey)}</p>
              </div>
            )}

            {reading && !loading && (
              <motion.div
                className="card p-5 space-y-4"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="seal mb-2 inline-block">{t.meng.seal}</span>
                    <h3 className="text-xl font-serif font-bold text-ink-800 mt-1">{reading.title}</h3>
                  </div>
                  <button
                    onClick={handleSave}
                    disabled={saved}
                    className="text-xs px-3 py-1.5 bg-jade-500 text-white rounded-lg hover:bg-jade-600 disabled:opacity-50 transition-colors"
                  >
                    {saved ? `${t.meng.saveToRecord} \u2713` : t.meng.saveToRecord}
                  </button>
                </div>

                <hr className="divider-ink" />

                <div>
                  <p className="text-xs text-ink-400 mb-3">{t.meng.symbols}</p>
                  <div className="space-y-2">
                    {reading.symbolInterpretations.map((s, i) => (
                      <div key={i} className="flex items-start gap-2.5 p-2.5 bg-ink-50 rounded-lg">
                        <span className="text-xs font-serif font-bold text-coral-500 w-20 flex-shrink-0">{s.symbol}</span>
                        <p className="text-xs text-ink-600 leading-relaxed">{s.meaning}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-gold-100 rounded-xl border border-gold-300">
                  <p className="text-[10px] text-gold-600 font-semibold mb-1">{t.meng.overallMessage}</p>
                  <p className="text-sm text-ink-700 leading-relaxed">{reading.overallMessage}</p>
                </div>

                {bazi && (
                  <div className="p-3 bg-mystic-100 rounded-xl border border-mystic-400">
                    <p className="text-[10px] text-mystic-700 font-semibold mb-1">{t.meng.fateConnection}</p>
                    <p className="text-sm text-ink-700 leading-relaxed">{reading.fateConnection}</p>
                  </div>
                )}

                <div className="p-3 bg-jade-100 rounded-xl border border-jade-300">
                  <p className="text-[10px] text-jade-600 font-semibold mb-1">{t.meng.advice}</p>
                  <p className="text-sm text-ink-700">{reading.advice}</p>
                </div>
              </motion.div>
            )}

            {!reading && !loading && !errorKey && (
              <div className="card p-12 text-center">
                <span className="text-6xl font-serif text-ink-200 block mb-4">{"\u68a6"}</span>
                <p className="text-sm text-ink-400">{t.meng.placeholder}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
