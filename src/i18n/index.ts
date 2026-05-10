"use client";

import zh from "./zh";
import en from "./en";
import { useStore } from "@/store";

const messages = { zh, en };

export function useT() {
  const locale = useStore((s) => s.locale);
  return messages[locale] ?? zh;
}

export type { Translations } from "./zh";
