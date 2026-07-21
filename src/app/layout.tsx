import type { Metadata } from "next";
import { ProfileProvider } from "@/lib/store/profile-context";
import { HistoryProvider } from "@/lib/store/history-context";
import "./globals.css";

export const metadata: Metadata = {
  title: "运时 Yunshi — 八字日运 · 梅花易数 · 六爻",
  description: "八字看天时，梅花断吉凶，六爻问万事——一个 App 读懂你的运势。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex">
        <ProfileProvider><HistoryProvider>{children}</HistoryProvider></ProfileProvider>
      </body>
    </html>
  );
}
