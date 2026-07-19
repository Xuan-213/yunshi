import Link from "next/link";

export default function RightPanel() {
  return (
    <aside className="w-72 flex-shrink-0 flex flex-col gap-4">
      {/* Quick divination */}
      <div className="bg-white border border-[var(--color-border)] rounded-xl p-5">
        <h3 className="font-[var(--font-display)] text-sm font-semibold text-[var(--color-text-primary)] mb-3">
          🎲 快速起卦
        </h3>
        <div className="flex flex-col gap-2">
          <Link
            href="/divination?mode=meihua"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm border border-[var(--color-border)] bg-[var(--color-bg-card-warm)] text-[var(--color-text-body)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] hover:bg-[var(--color-accent-bg)] transition-all duration-150"
          >
            🌸 梅花易数 · 时间起卦
          </Link>
          <Link
            href="/divination?mode=meihua"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm border border-[var(--color-border)] bg-[var(--color-bg-card-warm)] text-[var(--color-text-body)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] hover:bg-[var(--color-accent-bg)] transition-all duration-150"
          >
            🌸 梅花易数 · 描述外应
          </Link>
          <Link
            href="/divination?mode=liuyao"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm border border-[var(--color-border)] bg-[var(--color-bg-card-warm)] text-[var(--color-text-body)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] hover:bg-[var(--color-accent-bg)] transition-all duration-150"
          >
            🪙 六爻 · 输入数字
          </Link>
        </div>
      </div>

      {/* Recent history */}
      <div className="bg-white border border-[var(--color-border)] rounded-xl p-5">
        <h3 className="font-[var(--font-display)] text-sm font-semibold text-[var(--color-text-primary)] mb-3">
          📋 最近卦例
        </h3>
        <div className="space-y-0">
          {[
            { type: "梅花易数", question: "这次换工作能顺利吗？", time: "今天 18:30" },
            { type: "六爻", question: "这笔投资能赚钱吗？", time: "昨天 14:20" },
            { type: "梅花易数", question: "下个月的旅行顺利吗？", time: "7月15日" },
          ].map((item, i) => (
            <div
              key={i}
              className="py-2 border-b border-[var(--color-border-light)] last:border-b-0 cursor-pointer hover:text-[var(--color-accent)] transition-colors"
            >
              <div className="text-xs text-[var(--color-accent)] font-medium mb-0.5">{item.type}</div>
              <div className="text-sm text-[var(--color-text-primary)] mb-0.5">{item.question}</div>
              <div className="text-xs text-[var(--color-text-hint)]">{item.time}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Daily quote */}
      <div className="bg-[var(--color-bg-card-warm)] border border-[var(--color-gold-light)] rounded-xl p-5">
        <h3 className="font-[var(--font-display)] text-sm font-semibold text-[var(--color-gold)] mb-2">
          💫 每日一签
        </h3>
        <p className="font-[var(--font-display)] text-base text-[var(--color-text-primary)] leading-relaxed italic">
          &ldquo;厚德载物，静水流深。&rdquo;
        </p>
        <p className="text-xs text-[var(--color-text-dim)] mt-2">
          不争不抢，做好自己，好运自然来。
        </p>
      </div>
    </aside>
  );
}
