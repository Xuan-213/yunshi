interface Dimension {
  icon: string;
  iconBg: string;
  name: string;
  stars: number;
  analysis: React.ReactNode;
  tip: string;
}

export default function DimensionCards({ dimensions }: { dimensions: Dimension[] }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {dimensions.map((dim) => (
        <div
          key={dim.name}
          className="bg-white border border-[var(--color-border)] rounded-xl p-5 transition-all duration-200 hover:shadow-[0_1px_3px_rgba(44,36,22,0.05)]"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
                style={{ background: dim.iconBg }}
              >
                {dim.icon}
              </div>
              <span className="font-[var(--font-display)] text-base font-semibold text-[var(--color-text-primary)]">
                {dim.name}运
              </span>
            </div>
            <span className="text-xs text-[var(--color-gold)] tracking-wider">
              {"★".repeat(Math.floor(dim.stars))}{dim.stars % 1 ? "☆" : ""}
            </span>
          </div>

          {/* Body */}
          <div className="text-sm text-[var(--color-text-body)] leading-relaxed">
            {dim.analysis}
          </div>

          {/* Tip */}
          <div className="mt-3 pt-3 border-t border-[var(--color-border-light)] text-xs text-[var(--color-text-dim)] flex items-start gap-1">
            {dim.tip}
          </div>
        </div>
      ))}
    </div>
  );
}
