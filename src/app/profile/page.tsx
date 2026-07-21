"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import { useProfiles } from "@/lib/store/profile-context";
import { paiPan, formatMingPan } from "@/lib/bazi/paiPan";

const WX_COLORS: Record<string, string> = {
  "金": "#e8c97a", "木": "#7ec97a", "水": "#7aa8c9", "火": "#c97a7a", "土": "#c9a87a",
};

export default function ProfilePage() {
  const { profiles, activeProfile, loading, setActiveProfile, saveProfile, removeProfile } = useProfiles();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "", year: 1990, month: 1, day: 1, hour: 12, minute: 0,
    gender: "male" as "male" | "female", longitude: 120,
  });

  function addProfile() {
    if (!form.name.trim()) return;
    const gan = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"][(form.year - 4) % 10];
    const zhi = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"][(form.year - 4) % 12];
    saveProfile({
      name: form.name, initial: form.name[0], color: "",
      year: form.year, month: form.month, day: form.day,
      hour: form.hour, minute: form.minute, gender: form.gender, longitude: form.longitude,
      baziSummary: `${gan}${zhi}年 · ${form.gender === "male" ? "男" : "女"}`,
    });
    setShowForm(false);
    setForm({ name: "", year: 1990, month: 1, day: 1, hour: 12, minute: 0, gender: "male", longitude: 120 });
  }

  function deleteProfile(id: number) {
    removeProfile(id);
  }

  // Calculate bazi chart for active profile
  const chart = activeProfile ? paiPan({
    year: activeProfile.year, month: activeProfile.month, day: activeProfile.day,
    hour: activeProfile.hour, minute: activeProfile.minute || 0,
    gender: activeProfile.gender as "male" | "female",
    longitude: activeProfile.longitude || 120,
  }) : null;

  const hourOptions = [
    { v: 0, label: "子时 (23:00-01:00)" },{ v: 1, label: "丑时 (01:00-03:00)" },
    { v: 3, label: "寅时 (03:00-05:00)" },{ v: 5, label: "卯时 (05:00-07:00)" },
    { v: 7, label: "辰时 (07:00-09:00)" },{ v: 9, label: "巳时 (09:00-11:00)" },
    { v: 11, label: "午时 (11:00-13:00)" },{ v: 13, label: "未时 (13:00-15:00)" },
    { v: 15, label: "申时 (15:00-17:00)" },{ v: 17, label: "酉时 (17:00-19:00)" },
    { v: 19, label: "戌时 (19:00-21:00)" },{ v: 21, label: "亥时 (21:00-23:00)" },
  ];

  return (
    <>
      <Sidebar />
      <main className="flex-1 px-8 py-8 overflow-y-auto">
        <div className="w-full">

          {/* Header: dropdown + actions */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center gap-3">
              <span className="w-[3px] h-5 bg-[var(--color-accent)] rounded-sm" />
              <h2 className="font-[var(--font-display)] text-xl font-semibold">命盘</h2>
            </div>
            <div className="flex-1" />
            {profiles.length > 0 && (
              <select
                className="px-4 py-2 border border-[var(--color-border)] rounded-lg text-sm bg-white outline-none focus:border-[var(--color-accent)]"
                value={activeProfile?.id || ""}
                onChange={e => setActiveProfile(parseInt(e.target.value))}
              >
                {profiles.map(p => (
                  <option key={p.id} value={p.id}>{p.name} · {p.baziSummary}</option>
                ))}
              </select>
            )}
            {activeProfile && (
              <button onClick={() => deleteProfile(activeProfile.id)} className="text-sm text-[var(--color-text-hint)] hover:text-[var(--color-accent)] transition-colors">删除当前</button>
            )}
            <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-[var(--color-accent)] text-white rounded-full text-sm font-medium hover:bg-[var(--color-accent-deep)] transition-colors">
              {showForm ? "取消" : "+ 新建"}
            </button>
          </div>

          {/* Form */}
          {showForm && (
            <div className="bg-white border border-[var(--color-border)] rounded-xl p-6 mb-8">
              <h3 className="font-[var(--font-display)] text-base font-semibold mb-4">录入出生信息</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">姓名</label>
                  <input className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg text-sm bg-[#fdfcfa] outline-none focus:border-[var(--color-accent)]"
                    value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="输入姓名或称呼" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">性别</label>
                  <div className="flex gap-2">
                    {(["male","female"] as const).map(g => (
                      <button key={g} onClick={() => setForm({ ...form, gender: g })}
                        className={`flex-1 py-2 rounded-lg text-sm border transition-all ${form.gender === g ? "border-[var(--color-accent)] bg-[var(--color-accent-bg)] text-[var(--color-accent)] font-semibold" : "border-[var(--color-border)] bg-white text-[var(--color-text-body)]"}`}>
                        {g === "male" ? "👨 男" : "👩 女"}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">出生年份</label>
                  <input type="number" className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg text-sm bg-[#fdfcfa] outline-none focus:border-[var(--color-accent)]"
                    value={form.year} onChange={e => setForm({ ...form, year: parseInt(e.target.value) || 1990 })} />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">月</label>
                    <input type="number" min={1} max={12} className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg text-sm bg-[#fdfcfa] outline-none focus:border-[var(--color-accent)]"
                      value={form.month} onChange={e => setForm({ ...form, month: parseInt(e.target.value) || 1 })} />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">日</label>
                    <input type="number" min={1} max={31} className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg text-sm bg-[#fdfcfa] outline-none focus:border-[var(--color-accent)]"
                      value={form.day} onChange={e => setForm({ ...form, day: parseInt(e.target.value) || 1 })} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">时辰</label>
                  <select className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg text-sm bg-[#fdfcfa] outline-none focus:border-[var(--color-accent)]"
                    value={form.hour} onChange={e => setForm({ ...form, hour: parseInt(e.target.value) })}>
                    {hourOptions.map(h => <option key={h.v} value={h.v}>{h.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">出生地经度</label>
                  <input type="number" step="0.1" className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg text-sm bg-[#fdfcfa] outline-none focus:border-[var(--color-accent)]"
                    value={form.longitude} onChange={e => setForm({ ...form, longitude: parseFloat(e.target.value) || 120 })} />
                  <p className="text-xs text-[var(--color-text-hint)] mt-1">北京=120, 成都=104, 上海=121.5</p>
                </div>
              </div>
              <button onClick={addProfile} className="px-6 py-2 bg-[var(--color-accent)] text-white rounded-full text-sm font-medium hover:bg-[var(--color-accent-deep)] transition-colors">保存命盘</button>
            </div>
          )}

          {/* No profile */}
          {!loading && !activeProfile && (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🌿</div>
              <h3 className="font-[var(--font-display)] text-lg font-semibold mb-2">还没有命盘</h3>
              <p className="text-sm text-[var(--color-text-dim)] mb-4">点击「新建」录入出生信息</p>
            </div>
          )}

          {/* Chart display */}
          {chart && (
            <div className="flex gap-8">
              {/* Left: 排盘 */}
              <div className="flex-1 space-y-4">
                {/* 四柱卡片 */}
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: "年柱", p: chart.bazi.year },
                    { label: "月柱", p: chart.bazi.month },
                    { label: "日柱", p: chart.bazi.day },
                    { label: "时柱", p: chart.bazi.hour },
                  ].map(({ label, p }) => (
                    <div key={label} className="bg-white border border-[var(--color-border)] rounded-xl p-4 text-center">
                      <div className="text-xs text-[var(--color-text-dim)] mb-2">{label}</div>
                      <div className="text-2xl font-bold font-[var(--font-display)] mb-1">{p.ganZhi}</div>
                      <div className="text-xs text-[var(--color-text-dim)]">{p.gan} · {p.zhi}</div>
                      <div className="text-[10px] text-[var(--color-gold)] mt-1">{label === "日柱" ? "日主" : chart.shiShen[label === "年柱" ? "year" : label === "月柱" ? "month" : label === "时柱" ? "hour" : "day"]}</div>
                    </div>
                  ))}
                </div>

                {/* 日主 + 五行 */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white border border-[var(--color-border)] rounded-xl p-4 text-center">
                    <div className="text-xs text-[var(--color-text-dim)] mb-1">日主</div>
                    <div className="text-xl font-bold font-[var(--font-display)]">{chart.dayMaster}</div>
                    <div className="text-sm text-[var(--color-text-dim)]">{chart.dayMasterWx}命</div>
                  </div>
                  <div className="bg-white border border-[var(--color-border)] rounded-xl p-4">
                    <div className="text-xs text-[var(--color-text-dim)] mb-2 text-center">五行分布</div>
                    <div className="space-y-1.5">
                      {(["金","木","水","火","土"] as const).map(wx => (
                        <div key={wx} className="flex items-center gap-2">
                          <span className="text-xs w-6 text-right text-[var(--color-text-dim)]">{wx}</span>
                          <div className="flex-1 h-2 bg-[#f3efe9] rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all" style={{ width: `${(chart.wuXingCount[wx]/8)*100}%`, background: WX_COLORS[wx] }} />
                          </div>
                          <span className="text-xs text-[var(--color-text-dim)] w-3">{chart.wuXingCount[wx]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 大运 */}
                <div className="bg-white border border-[var(--color-border)] rounded-xl p-4">
                  <div className="text-xs text-[var(--color-text-dim)] mb-3">大运 ({chart.daYun.startAge}岁起运)</div>
                  <div className="flex flex-wrap gap-2">
                    {chart.daYun.pillars.map((dz, i) => (
                      <span key={i} className="px-3 py-1.5 bg-[#fdfcfa] border border-[var(--color-border-light)] rounded-lg text-sm font-medium">
                        {dz}
                        <span className="text-[10px] text-[var(--color-text-hint)] ml-1.5">{chart.daYun.startAge + i*10}岁</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: 解读 */}
              <div className="w-80 flex-shrink-0 space-y-4">
                <div className="bg-white border border-[var(--color-border)] rounded-xl p-5">
                  <h3 className="font-[var(--font-display)] text-sm font-semibold mb-3">日主解读</h3>
                  <p className="text-sm text-[var(--color-text-body)] leading-relaxed">
                    {chart.dayMaster}为{chart.dayMasterWx}命。{chart.dayMasterWx === "金" ? "金主义，刚毅果断，重义气。" :
                     chart.dayMasterWx === "木" ? "木主仁，温和正直，有生长之力。" :
                     chart.dayMasterWx === "水" ? "水主智，灵活善变，智慧深沉。" :
                     chart.dayMasterWx === "火" ? "火主礼，热情主动，文明有礼。" :
                     "土主信，厚重诚实，承载万物。"}
                  </p>
                </div>

                <div className="bg-white border border-[var(--color-border)] rounded-xl p-5">
                  <h3 className="font-[var(--font-display)] text-sm font-semibold mb-3">十神</h3>
                  <div className="space-y-1.5 text-sm">
                    {Object.entries(chart.shiShen).map(([pillar, ss]) => (
                      <div key={pillar} className="flex justify-between">
                        <span className="text-[var(--color-text-dim)]">{pillar === "year" ? "年柱" : pillar === "month" ? "月柱" : pillar === "day" ? "日柱" : "时柱"}</span>
                        <span className="font-medium">{ss}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white border border-[var(--color-border)] rounded-xl p-5">
                  <h3 className="font-[var(--font-display)] text-sm font-semibold mb-3">五行分析</h3>
                  <p className="text-sm text-[var(--color-text-body)] leading-relaxed">
                    {(() => {
                      const maxWx = Object.entries(chart.wuXingCount).sort((a, b) => b[1] - a[1])[0];
                      const minWx = Object.entries(chart.wuXingCount).sort((a, b) => a[1] - b[1])[0];
                      return `${maxWx[0]}最旺（${maxWx[1]}个），${minWx[0]}最弱（${minWx[1]}个）。${maxWx[0] === chart.dayMasterWx ? "日主得令，自身强旺。" : "日主需补" + chart.dayMasterWx + "，可借助大运流年之力。"}`;
                    })()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
