interface MiniCardData {
  type: "monthly" | "yearly";
  label: string;
  title: string;
  desc: string;
}

export default function MiniCards({ cards }: { cards: MiniCardData[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      {cards.map((card) => (
        <div
          key={card.type}
          className="relative bg-white border border-[var(--color-border)] rounded-xl p-5 cursor-pointer overflow-hidden transition-all duration-200 hover:shadow-[0_4px_12px_rgba(44,36,22,0.06)] hover:-translate-y-0.5"
        >
          {/* Left accent bar */}
          <div
            className={`absolute top-0 left-0 w-[3px] h-full rounded-r-sm transition-all duration-200 hover:w-[5px] ${
              card.type === "monthly" ? "bg-[var(--color-gold)]" : "bg-[var(--color-accent)]"
            }`}
          />
          <div className="text-xs text-[var(--color-text-dim)] uppercase tracking-wider mb-1">
            {card.label}
          </div>
          <div
            className={`font-[var(--font-display)] text-lg font-semibold mb-1 ${
              card.type === "monthly" ? "text-[var(--color-gold)]" : "text-[var(--color-accent)]"
            }`}
          >
            {card.title}
          </div>
          <div className="text-sm text-[var(--color-text-dim)] leading-relaxed">
            {card.desc}
          </div>
        </div>
      ))}
    </div>
  );
}
