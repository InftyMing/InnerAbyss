"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useT } from "@/i18n";

export default function RegisterPage() {
  const t = useT();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function getErrorText(code: string): string {
    type Map = { [k: string]: string };
    const map: Map = {
      emailExists: t.auth.emailExists,
      passwordTooShort: t.auth.passwordTooShort,
      registerFailed: t.auth.registerFailed,
      paramsMissing: t.auth.registerFailed,
    };
    return map[code] ?? t.auth.registerFailed;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password.length < 8) {
      setError(t.auth.passwordTooShort);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(getErrorText(data.errorCode ?? "registerFailed"));
        return;
      }
      await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });
      router.push("/ming");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full px-4 py-3 bg-white border border-ink-200 rounded-xl text-ink-800 text-sm focus:outline-none focus:border-ink-500 focus:ring-1 focus:ring-ink-300 transition-all";

  return (
    <motion.div
      className="card p-8 space-y-5"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div>
        <h2 className="text-xl font-serif font-semibold text-ink-800">{t.auth.registerTitle}</h2>
        <p className="text-xs text-ink-400 mt-1">{t.auth.registerSub}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs text-ink-500 mb-1.5">{t.auth.nameOptional}</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder={t.auth.namePlaceholder}
            className={inputClass}
            maxLength={20}
          />
        </div>
        <div>
          <label className="block text-xs text-ink-500 mb-1.5">{t.auth.email}</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder={t.auth.emailPlaceholder}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs text-ink-500 mb-1.5">{t.auth.password}</label>
          <input
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            placeholder={t.auth.passwordPlaceholder}
            className={inputClass}
          />
        </div>

        {error && (
          <p className="text-sm text-coral-600 bg-coral-50 px-3 py-2 rounded-lg">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-ink-900 text-white rounded-xl font-serif tracking-widest text-sm hover:bg-ink-800 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {loading ? t.auth.creating : t.auth.registerAction}
        </button>
      </form>

      <p className="text-center text-xs text-ink-400">
        {t.auth.hasAccount}{" "}
        <Link href="/login" className="text-jade-600 hover:underline">{t.auth.loginNow}</Link>
      </p>
    </motion.div>
  );
}
