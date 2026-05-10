import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/components/layout/AuthProvider";

export const metadata: Metadata = {
  title: "\u89c2\u6e0a \u00b7 InnerAbyss \u2014 \u89c2\u6e0a\u4ee5\u77e5\u5df1",
  description:
    "\u878d\u5408\u4f20\u7edf\u516b\u5b57\u547d\u7406\u4e0e\u73b0\u4ee3\u5fc3\u7406\u5b66\uff0c\u4ee5\u900f\u660e\u63a8\u7406\u5e2e\u52a9\u4f60\u8ba4\u8bc6\u81ea\u5df1\u3002\u547d\u76d8\u89e3\u8bfb\u3001\u6bcf\u65e5\u8fd0\u7b7e\u3001\u89e3\u68a6\u3001\u4eba\u751f\u8f68\u8ff9\u6811\u3002",
  keywords: "\u516b\u5b57\u7b97\u547d,\u547d\u7406,\u547d\u76d8,\u4eca\u65e5\u8fd0\u52bf,\u900f\u660e\u63a8\u7406,\u81ea\u6211\u8ba4\u77e5,\u4eba\u751f\u8f68\u8ff9",
  openGraph: {
    title: "\u89c2\u6e0a \u00b7 InnerAbyss",
    description: "\u89c2\u6e0a\u4ee5\u77e5\u5df1 / See into the depths, know yourself",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="bg-paper min-h-screen">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
