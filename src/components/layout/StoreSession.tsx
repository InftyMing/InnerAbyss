"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useStore, storeKeyFor } from "@/store";

/**
 * Per-account Zustand persistence:
 * watches the NextAuth session and rewires the persist key to
 * `guanyuan-store::<email>` (or `::guest` when logged out) so that two
 * accounts on the same browser see fully isolated data.
 *
 * Renders nothing.
 */
export default function StoreSession() {
  const { data: session, status } = useSession();
  const lastKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    const userId = session?.user?.email ?? "guest";
    const newKey = storeKeyFor(userId);
    if (lastKeyRef.current === newKey) return;
    lastKeyRef.current = newKey;

    const persistApi = useStore.persist;
    const currentKey = persistApi.getOptions().name;
    if (currentKey === newKey) return;

    // Preserve locale across account switches (UI preference is global).
    const prevLocale = useStore.getState().locale;

    // Reset in-memory state to defaults so the prior account's data
    // never leaks into the next account, even momentarily.
    useStore.setState({
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
    });

    persistApi.setOptions({ name: newKey });
    persistApi.rehydrate()?.then?.(() => {
      // If the new (per-user) bucket has no locale, keep the previous one.
      if (!useStore.getState().locale) {
        useStore.setState({ locale: prevLocale });
      }
    });
  }, [session, status]);

  return null;
}
