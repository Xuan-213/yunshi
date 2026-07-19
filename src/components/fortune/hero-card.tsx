interface HeroCardProps {
  score: number;
  scoreLabel: string;
  lunarDate: string;
  solarDate: string;
  ganzhiDay: string;
  tags: { text: string; type: "good" | "warn" }[];
  metaphor: string;
  plainExplanation: string;
}

export default function HeroCard({
  score, scoreLabel, lunarDate, solarDate, ganzhiDay,
  tags, metaphor, plainExplanation,
}: HeroCardProps) {
  return (
    <div className="relative bg-white border border-[var(--color-border)] rounded-2xl p-8 mb-6 overflow-hidden">
      {/* Decorative glow */}
      <div
        className="absolute -top-20 -right-10 w-60 h-60 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(192,64,64,0.05) 0%, rgba(201,169,110,0.03) 40%, transparent 70%)" }}
      />

      <div className="relative z-10">
        {/* Top: Score + Meta */}
        <div className="flex items-start gap-8 mb-6">
          {/* Score Ring */}
          <div className="flex flex-col items-center flex-shrink-0">
            <div className="relative">
              <div
                className="absolute -inset-2 rounded-full pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(192,64,64,0.08) 0%, transparent 70%)" }}
              />
              <div className="relative w-[88px] h-[88px] rounded-full border-[3px] border-[var(--color-accent)] flex items-center justify-center flex-col">
                <span className="font-[var(--font-number)] text-4xl font-bold text-[var(--color-accent)] leading-none -tracking-[0.03em]">
                  {score.toFixed(1)}
                </span>
                <span className="text-xs text-[var(--color-text-dim)] font-medium mt-0.5">
                  {scoreLabel}
                </span>
              </div>
            </div>
            <span className="text-xs text-[var(--color-text-dim)] mt-1">运势较好</span>
          </div>

          {/* Meta info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <span className="font-[var(--font-display)] text-lg font-semibold text-[var(--color-text-primary)]">
                {lunarDate}
              </span>
              <span className="text-sm text-[var(--color-text-dim)]">{solarDate}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-[var(--color-bg-card-gold)] text-[var(--color-gold)] font-medium">
                {ganzhiDay}
              </span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {tags.map((tag) => (
                <span
                  key={tag.text}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    tag.type === "good"
                      ? "bg-[var(--color-green-bg)] text-[var(--color-green)]"
                      : "bg-[var(--color-bg-card-gold)] text-[var(--color-gold)]"
                  }`}
                >
                  {tag.text}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Fortune Text: 比喻 + 白话 */}
        <div className="bg-[var(--color-bg-card-warm)] border border-[var(--color-border-light)] rounded-xl p-5 mb-5">
          <p className="font-[var(--font-display)] text-base text-[var(--color-accent)] font-medium leading-relaxed mb-3 pl-4 border-l-[3px] border-[var(--color-accent)]">
            {metaphor}
          </p>
          <p className="text-sm text-[var(--color-text-body)] leading-relaxed">
            {plainExplanation}
          </p>
        </div>
      </div>
    </div>
  );
}
