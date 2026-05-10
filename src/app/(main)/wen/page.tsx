"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useStore } from "@/store";
import { useT } from "@/i18n";
import TopBar from "@/components/layout/TopBar";

export default function WenPage() {
  const t = useT();
  const { bazi, chatHistory, addChatMessage, clearChat, locale } = useStore();
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, streaming, loading]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  async function handleSend() {
    if (!input.trim() || loading || !bazi) return;
    const userMsg = input.trim();
    setInput("");
    addChatMessage({ role: "user", content: userMsg });
    setLoading(true);
    setStreaming("");

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const allMessages = [
        ...chatHistory,
        { role: "user" as const, content: userMsg },
      ];
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bazi, messages: allMessages, locale }),
        signal: ctrl.signal,
      });

      const contentType = res.headers.get("content-type") ?? "";

      if (!res.ok || contentType.includes("application/json")) {
        // Error path: server returned JSON error envelope.
        let code = "chatFailed";
        try {
          const data = await res.json();
          code = data.errorCode ?? code;
        } catch {
          // ignore
        }
        addChatMessage({
          role: "assistant",
          content: (t.errors as Record<string, string>)[code] ?? t.errors.chatFailed,
        });
        return;
      }

      // Stream path
      if (!res.body) {
        addChatMessage({ role: "assistant", content: t.errors.chatFailed });
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        acc += chunk;
        setStreaming(acc);
      }
      addChatMessage({ role: "assistant", content: acc.trim() || t.errors.chatFailed });
    } catch (err) {
      if ((err as Error)?.name !== "AbortError") {
        addChatMessage({ role: "assistant", content: t.errors.chatFailed });
      }
    } finally {
      setStreaming("");
      setLoading(false);
      abortRef.current = null;
    }
  }

  function handleStop() {
    abortRef.current?.abort();
  }

  if (!bazi) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <TopBar title={t.wen.title} subtitle={t.wen.subtitle} />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center space-y-4">
            <span className="text-5xl font-serif text-ink-300 block">{"\u95ee"}</span>
            <p className="text-ink-500">{t.wen.noBazi}</p>
            <Link href="/ming" className="inline-block px-6 py-2.5 bg-ink-900 text-white rounded-xl text-sm">{t.gua.goToMing}</Link>
          </div>
        </div>
      </div>
    );
  }

  const strengthLabel = bazi.dayMaster.strength === "strong" ? t.ming.strong
    : bazi.dayMaster.strength === "weak" ? t.ming.weak : t.ming.balanced;

  const displayMessages = chatHistory.length === 0
    ? [{ role: "assistant" as const, content: t.wen.welcome }]
    : chatHistory;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar title={t.wen.title} subtitle={t.wen.subtitle} />

      <div className="px-6 py-2 bg-ink-50 border-b border-ink-200 flex items-center justify-between">
        <p className="text-xs text-ink-400">
          {t.wen.contextLabel}{" "}
          <span className="font-serif text-ink-600">{bazi.dayGan}{bazi.dayZhi}</span>
          {" \u00b7 "}{t.ming.dayMaster}{" "}{bazi.dayMaster.element}{" ("}{strengthLabel}{")"}
        </p>
        {chatHistory.length > 0 && (
          <button onClick={clearChat} className="text-xs text-ink-400 hover:text-coral-500 transition-colors">
            {t.wen.clear}
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        <AnimatePresence initial={false}>
          {displayMessages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="w-7 h-7 rounded-full bg-ink-800 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                  <span className="text-xs font-serif text-ink-300">{"\u6e0a"}</span>
                </div>
              )}
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap break-words ${
                  msg.role === "user"
                    ? "bg-ink-800 text-white rounded-tr-sm"
                    : "bg-white border border-ink-200 text-ink-700 rounded-tl-sm shadow-sm"
                }`}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="w-7 h-7 rounded-full bg-ink-800 flex items-center justify-center mr-2 flex-shrink-0">
                <span className="text-xs font-serif text-ink-300">{"\u6e0a"}</span>
              </div>
              <div className="max-w-[75%] bg-white border border-ink-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                {streaming ? (
                  <p className="text-sm text-ink-700 whitespace-pre-wrap break-words leading-relaxed">
                    {streaming}
                    <span className="inline-block w-1.5 h-4 bg-ink-400 align-middle ml-0.5 animate-pulse" />
                  </p>
                ) : (
                  <div className="flex gap-1 items-center">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-ink-400"
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      <div className="px-6 py-4 border-t border-ink-200 bg-white">
        <div className="flex gap-3 max-w-3xl mx-auto">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder={t.wen.placeholder}
            className="flex-1 px-4 py-3 border border-ink-200 rounded-xl text-sm focus:outline-none focus:border-ink-400 bg-ink-50"
            disabled={loading}
          />
          {loading ? (
            <button
              onClick={handleStop}
              className="px-5 py-3 bg-coral-500 text-white rounded-xl text-sm hover:bg-coral-600 transition-all"
            >
              {t.wen.stop}
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="px-5 py-3 bg-ink-900 text-white rounded-xl text-sm hover:bg-ink-800 disabled:opacity-40 transition-all"
            >
              {t.wen.send}
            </button>
          )}
        </div>
        <p className="text-center text-[10px] text-ink-300 mt-2">{t.wen.disclaimer}</p>
      </div>
    </div>
  );
}
