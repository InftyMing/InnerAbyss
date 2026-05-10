"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { useT } from "@/i18n";

export default function LoginPage() {
  const t = useT();
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });
      if (res?.error) {
        setError(t.auth.loginFailed);
      } else {
        router.push("/ming");
        router.refresh();
      }
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
        <h2 className="text-xl font-serif font-semibold text-ink-800">{t.auth.loginTitle}</h2>
        <p className="text-xs text-ink-400 mt-1">{t.auth.loginSub}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
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
            placeholder={"\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"}
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
          {loading ? t.auth.loggingIn : t.auth.loginAction}
        </button>
      </form>

      <p className="text-center text-xs text-ink-400">
        {t.auth.noAccount}{" "}
        <Link href="/register" className="text-jade-600 hover:underline">{t.auth.registerNow}</Link>
      </p>
    </motion.div>
  );
}
