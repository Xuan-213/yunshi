interface YiJiSectionProps {
  yi: string[];
  ji: string[];
}

export default function YiJiSection({ yi, ji }: YiJiSectionProps) {
  return (
    <div className="mb-5">
      <h4 className="font-[var(--font-display)] text-sm font-semibold text-[var(--color-text-primary)] mb-3">
        今日宜忌
      </h4>
      <div className="grid grid-cols-2 gap-4">
        {/* 宜 */}
        <div className="p-4 rounded-xl bg-[var(--color-green-bg)]">
          <div className="text-xs font-semibold text-[var(--color-green)] mb-2 tracking-wider">
            ✅ 今日宜
          </div>
          <div className="flex flex-wrap gap-2">
            {yi.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-sm font-medium bg-white text-[var(--color-green)]"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
        {/* 忌 */}
        <div className="p-4 rounded-xl bg-[var(--color-red-tag-bg)]">
          <div className="text-xs font-semibold text-[var(--color-accent)] mb-2 tracking-wider">
            ❌ 今日忌
          </div>
          <div className="flex flex-wrap gap-2">
            {ji.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-sm font-medium bg-white text-[var(--color-accent)]"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
