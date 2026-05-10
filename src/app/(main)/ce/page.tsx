"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useStore } from "@/store";
import { useT } from "@/i18n";
import TopBar from "@/components/layout/TopBar";
import FortuneDiary from "@/components/fortune/FortuneDiary";
import type { LifeEvent } from "@/types";

export default function CePage() {
  const t = useT();
  const { reading } = useStore();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar title={t.ce.title} subtitle={t.ce.subtitle} />
      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <FortuneDiary latestPrediction={reading?.conclusions[0]?.content} />
          <CeLifeEvents />
        </div>
      </div>
    </div>
  );
}

function CeLifeEvents() {
  const t = useT();
  const { lifeEvents, addLifeEvent, removeLifeEvent } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", date: "", age: "",
    category: "general" as LifeEvent["category"],
    nodeType: "milestone" as LifeEvent["nodeType"],
  });

  function handleAdd() {
    if (!form.title || !form.date) return;
    const year = parseInt(form.date.split("-")[0]);
    addLifeEvent({
      id: Date.now().toString(),
      title: form.title,
      description: form.description || undefined,
      date: form.date,
      year,
      age: form.age ? parseInt(form.age) : undefined,
      category: form.category,
      nodeType: form.nodeType,
    });
    setForm({ title: "", description: "", date: "", age: "", category: "general", nodeType: "milestone" });
    setShowForm(false);
  }

  const inputClass = "w-full px-3 py-2 text-sm border border-ink-200 rounded-lg bg-white focus:outline-none focus:border-ink-400 transition-colors";

  const categories: Array<{ value: LifeEvent["category"]; label: string }> = [
    { value: "general",      label: t.ce.categories.general },
    { value: "career",       label: t.ce.categories.career },
    { value: "relationship", label: t.ce.categories.relationship },
    { value: "health",       label: t.ce.categories.health },
    { value: "education",    label: t.ce.categories.education },
    { value: "other",        label: t.ce.categories.other },
  ];

  const nodeTypes: Array<{ value: "milestone" | "turning"; label: string }> = [
    { value: "milestone", label: t.ce.nodeTypes.milestone },
    { value: "turning",   label: t.ce.nodeTypes.turning },
  ];

  const categoryColors: Record<string, string> = {
    general:      "bg-ink-100 text-ink-600",
    career:       "bg-jade-100 text-jade-700",
    relationship: "bg-coral-100 text-coral-600",
    health:       "bg-gold-100 text-gold-600",
    education:    "bg-mystic-100 text-mystic-700",
    other:        "bg-ink-100 text-ink-500",
  };

  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-serif font-semibold text-ink-800">{t.ce.eventsTitle}</h3>
          <p className="text-xs text-ink-400 mt-0.5">{t.ce.eventsDesc}</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-3 py-1.5 text-xs bg-ink-900 text-white rounded-lg hover:bg-ink-800 transition-all"
        >
          {showForm ? t.ce.cancel : t.ce.addEvent}
        </button>
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="p-4 bg-ink-50 rounded-xl border border-ink-200 space-y-3"
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs text-ink-400 mb-1">{t.ce.eventTitle} *</label>
              <input value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} placeholder={t.ce.eventTitlePh} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs text-ink-400 mb-1">{t.ce.eventDate} *</label>
              <input type="month" value={form.date} onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs text-ink-400 mb-1">{t.ce.eventAge}</label>
              <input type="number" value={form.age} onChange={(e) => setForm(f => ({ ...f, age: e.target.value }))} placeholder="18" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs text-ink-400 mb-1">{t.ce.eventCategory}</label>
              <select value={form.category} onChange={(e) => setForm(f => ({ ...f, category: e.target.value as LifeEvent["category"] }))} className={inputClass}>
                {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-ink-400 mb-1">{t.ce.eventNodeType}</label>
              <select value={form.nodeType} onChange={(e) => setForm(f => ({ ...f, nodeType: e.target.value as "milestone" | "turning" }))} className={inputClass}>
                {nodeTypes.map(n => <option key={n.value} value={n.value}>{n.label}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-ink-400 mb-1">{t.ce.eventDesc}</label>
              <textarea value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className={`${inputClass} resize-none`} />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowForm(false)} className="flex-1 py-2 text-xs border border-ink-200 rounded-lg text-ink-400">{t.ce.cancel}</button>
            <button onClick={handleAdd} className="flex-1 py-2 text-xs bg-jade-500 text-white rounded-lg hover:bg-jade-600">{t.ce.save}</button>
          </div>
        </motion.div>
      )}

      {lifeEvents.length === 0 ? (
        <p className="text-center text-xs text-ink-300 py-6">{t.ce.noEvents}</p>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {lifeEvents.map((ev) => (
            <div key={ev.id} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-ink-100">
              <div className="flex-shrink-0 text-center">
                <p className="text-xs text-ink-400">{ev.date}</p>
                {ev.age && <p className="text-[10px] text-ink-300">{ev.age}{t.ji.age}</p>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink-700">{ev.title}</p>
                {ev.description && <p className="text-xs text-ink-400 mt-0.5 truncate">{ev.description}</p>}
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${categoryColors[ev.category]}`}>
                  {t.ce.categories[ev.category]}
                </span>
                <button onClick={() => removeLifeEvent(ev.id)} className="text-ink-300 hover:text-coral-400 text-sm">&times;</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
