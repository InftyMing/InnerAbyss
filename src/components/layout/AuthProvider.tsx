"use client";

import { SessionProvider } from "next-auth/react";
import StoreSession from "./StoreSession";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <StoreSession />
      {children}
    </SessionProvider>
  );
}
