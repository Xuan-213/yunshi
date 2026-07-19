interface LuckyItem {
  icon: string;
  label: string;
  value: string;
}

export default function LuckyStrip({ items }: { items: LuckyItem[] }) {
  return (
    <div className="flex gap-6 px-5 py-4 bg-[var(--color-bg-card-gold)] rounded-xl flex-wrap">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2 text-sm text-[var(--color-text-body)]">
          <span className="text-base">{item.icon}</span>
          {item.label} <strong className="text-[var(--color-text-primary)] font-semibold">{item.value}</strong>
        </div>
      ))}
    </div>
  );
}
