"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useProfiles } from "@/lib/store/profile-context";

const NAV_ITEMS = [
  { href: "/",          icon: "📅", label: "运势" },
  { href: "/divination", icon: "🎲", label: "起卦" },
  { href: "/diary",      icon: "📝", label: "运势日记" },
  { href: "/profile",    icon: "👤", label: "我的" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { activeProfile, profiles, loading } = useProfiles();

  return (
    <aside className="w-56 flex-shrink-0 bg-white border-r border-[var(--color-border)] flex flex-col sticky top-0 h-screen">
      <div className="px-6 pt-8 pb-6 border-b border-[var(--color-border-light)]">
        <h1 className="font-[var(--font-display)] text-2xl font-bold text-[var(--color-accent)] tracking-wide">
          运时
        </h1>
        <p className="font-[var(--font-number)] text-xs text-[var(--color-text-hint)] tracking-[0.08em] uppercase mt-1">
          Yunshi
        </p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "text-[var(--color-accent)] bg-[var(--color-accent-bg)] font-semibold"
                  : "text-[var(--color-text-dim)] hover:text-[var(--color-text-primary)] hover:bg-black/4"
              }`}
            >
              <span className="text-lg w-6 text-center">{item.icon}</span>
              <span>{item.label}</span>
              {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer — active profile */}
      <div className="px-6 py-4 border-t border-[var(--color-border-light)]">
        {loading ? (
          <div className="text-xs text-[var(--color-text-hint)]">加载中...</div>
        ) : activeProfile ? (
          <Link href="/profile" className="flex items-center gap-3 p-1 rounded-lg cursor-pointer hover:bg-black/4 transition-colors no-underline">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--color-accent)] to-[#d47070] flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
              {activeProfile.initial}
            </div>
            <div>
              <div className="text-sm font-medium text-[var(--color-text-primary)]">{activeProfile.name}</div>
              <div className="text-xs text-[var(--color-text-dim)]">{activeProfile.baziSummary || `${activeProfile.birthYear}年生`}</div>
            </div>
          </Link>
        ) : (
          <Link href="/profile" className="text-xs text-[var(--color-text-hint)] hover:text-[var(--color-accent)] transition-colors no-underline">
            + 添加命盘
          </Link>
        )}
      </div>
    </aside>
  );
}
