"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useT } from "@/i18n";
import type { UserBirthInfo } from "@/types";

interface BirthFormProps {
  onSubmit: (info: UserBirthInfo) => void;
  isLoading?: boolean;
}

const HOUR_VALUES: Array<{ value: number; key: keyof ReturnType<typeof useT>["ming"]["hours"] }> = [
  { value: 23, key: "h23" },
  { value: 1,  key: "h1"  },
  { value: 3,  key: "h3"  },
  { value: 5,  key: "h5"  },
  { value: 7,  key: "h7"  },
  { value: 9,  key: "h9"  },
  { value: 11, key: "h11" },
  { value: 13, key: "h13" },
  { value: 15, key: "h15" },
  { value: 17, key: "h17" },
  { value: 19, key: "h19" },
  { value: 21, key: "h21" },
];

export default function BirthForm({ onSubmit, isLoading }: BirthFormProps) {
  const t = useT();
  const [form, setForm] = useState<UserBirthInfo>({
    year: 1995, month: 1, day: 1, hour: 7, gender: "male", name: "",
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(form);
  }

  const inputClass = "w-full px-3 py-2.5 bg-white border border-ink-200 rounded-lg text-ink-800 text-sm focus:outline-none focus:border-ink-500 focus:ring-1 focus:ring-ink-300 transition-all font-sans";
  const labelClass = "block text-xs text-ink-500 mb-1.5 font-sans";

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="card p-6 space-y-5"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-base font-serif font-semibold text-ink-800">{t.ming.formTitle}</h2>
        <span className="seal">{t.ming.seal}</span>
      </div>
      <hr className="divider-ink" />
      <div>
        <label className={labelClass}>{t.ming.nameOptional}</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder={t.ming.namePlaceholder}
          className={inputClass}
          maxLength={10}
        />
      </div>
      <div>
        <label className={labelClass}>{t.ming.gender}</label>
        <div className="grid grid-cols-2 gap-2">
          {(["male", "female"] as const).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setForm((f) => ({ ...f, gender: g }))}
              className={`py-2.5 rounded-lg text-sm font-sans border transition-all ${
                form.gender === g
                  ? "border-ink-700 bg-ink-900 text-white"
                  : "border-ink-200 bg-white text-ink-600 hover:border-ink-400"
              }`}
            >
              {g === "male" ? t.ming.male : t.ming.female}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className={labelClass}>{t.ming.birthYear}</label>
          <input
            type="number"
            value={form.year}
            onChange={(e) => setForm((f) => ({ ...f, year: Number(e.target.value) }))}
            min={1920} max={2010}
            className={inputClass}
            required
          />
        </div>
        <div>
          <label className={labelClass}>{t.ming.birthMonth}</label>
          <select value={form.month} onChange={(e) => setForm((f) => ({ ...f, month: Number(e.target.value) }))} className={inputClass}>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>{m} {t.ming.monthUnit}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>{t.ming.birthDay}</label>
          <select value={form.day} onChange={(e) => setForm((f) => ({ ...f, day: Number(e.target.value) }))} className={inputClass}>
            {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
              <option key={d} value={d}>{d} {t.ming.dayUnit}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className={labelClass}>{t.ming.birthHour}</label>
        <select value={form.hour} onChange={(e) => setForm((f) => ({ ...f, hour: Number(e.target.value) }))} className={inputClass}>
          {HOUR_VALUES.map((h) => <option key={h.value} value={h.value}>{t.ming.hours[h.key]}</option>)}
        </select>
        <p className="mt-1 text-xs text-ink-400">{t.ming.hourNote}</p>
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 bg-ink-900 text-white rounded-lg font-serif text-sm tracking-widest hover:bg-ink-800 active:scale-[0.98] transition-all disabled:opacity-50"
      >
        {isLoading ? t.ming.submitting : t.ming.submit}
      </button>
      <p className="text-center text-xs text-ink-400">{t.ming.disclaimer}</p>
    </motion.form>
  );
}
