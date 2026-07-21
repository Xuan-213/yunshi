"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import { useProfiles } from "@/lib/store/profile-context";
import { paiPan } from "@/lib/bazi/paiPan";
import { analyzeMingPan } from "@/lib/bazi/analysis";
import { cityToLon } from "@/lib/calendar/cities";

const WX_COLORS: Record<string, string> = {
  "金": "#e8c97a", "木": "#7ec97a", "水": "#7aa8c9", "火": "#c97a7a", "土": "#c9a87a",
};

export default function ProfilePage() {
  const { profiles, activeProfile, loading, setActiveProfile, saveProfile, removeProfile } = useProfiles();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "", year: 1990, month: 1, day: 1, hour: 12, minute: 0,
    gender: "male" as "male" | "female", city: "北京",
  });

  function addProfile() {
    if (!form.name.trim()) return;
    const gan = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"][(form.year - 4) % 10];
    const zhi = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"][(form.year - 4) % 12];
    const lon = cityToLon(form.city);
    saveProfile({
      name: form.name, initial: form.name[0], color: "",
      year: form.year, month: form.month, day: form.day,
      hour: form.hour, minute: form.minute, gender: form.gender, longitude: lon,
      baziSummary: `${gan}${zhi}年 · ${form.gender === "male" ? "男" : "女"}`,
    });
    setShowForm(false);
    setForm({ name: "", year: 1990, month: 1, day: 1, hour: 12, minute: 0, gender: "male", city: "北京" });
  }

  const chart = activeProfile ? paiPan({
    year: activeProfile.year, month: activeProfile.month, day: activeProfile.day,
    hour: activeProfile.hour, minute: activeProfile.minute || 0,
    gender: activeProfile.gender as "male" | "female",
    longitude: activeProfile.longitude || 120,
  }) : null;

  const analysis = chart ? analyzeMingPan(chart) : null;

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

          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center gap-3">
              <span className="w-[3px] h-5 bg-[var(--color-accent)] rounded-sm" />
              <h2 className="font-[var(--font-display)] text-xl font-semibold">命盘</h2>
            </div>
            <div className="flex-1" />
            {profiles.length > 0 && (
              <select className="px-4 py-2 border border-[var(--color-border)] rounded-lg text-sm bg-white outline-none focus:border-[var(--color-accent)]"
                value={activeProfile?.id || ""} onChange={e => setActiveProfile(parseInt(e.target.value))}>
                {profiles.map(p => <option key={p.id} value={p.id}>{p.name} · {p.baziSummary}</option>)}
              </select>
            )}
            {activeProfile && (
              <button onClick={() => removeProfile(activeProfile.id)} className="text-sm text-[var(--color-text-hint)] hover:text-[var(--color-accent)] transition-colors">删除</button>
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
                  <label className="block text-sm font-medium mb-1">出生地</label>
                  <input className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg text-sm bg-[#fdfcfa] outline-none focus:border-[var(--color-accent)]"
                    value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} placeholder="如：北京、成都、上海" />
                  <p className="text-xs text-[var(--color-text-hint)] mt-1">输入城市名，系统自动匹配经纬度计算真太阳时</p>
                </div>
              </div>
              <button onClick={addProfile} className="px-6 py-2 bg-[var(--color-accent)] text-white rounded-full text-sm font-medium hover:bg-[var(--color-accent-deep)] transition-colors">保存命盘</button>
            </div>
          )}

          {/* Empty state */}
          {!loading && !activeProfile && (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🌿</div>
              <h3 className="font-[var(--font-display)] text-lg font-semibold mb-2">还没有命盘</h3>
              <p className="text-sm text-[var(--color-text-dim)] mb-4">点击「新建」录入出生信息</p>
            </div>
          )}

          {/* Full analysis */}
          {chart && analysis && (
            <div className="flex gap-8">
              {/* ====== LEFT: 排盘 ====== */}
              <div className="flex-1 space-y-4" style={{ flex: "0 0 55%" }}>
                {/* 四柱 */}
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: "年柱", p: chart.bazi.year, ss: chart.shiShen.year },
                    { label: "月柱", p: chart.bazi.month, ss: chart.shiShen.month },
                    { label: "日柱", p: chart.bazi.day, ss: "日主" },
                    { label: "时柱", p: chart.bazi.hour, ss: chart.shiShen.hour },
                  ].map(({ label, p, ss }) => (
                    <div key={label} className={`bg-white border rounded-xl p-4 text-center ${label === "日柱" ? "border-[var(--color-accent)] shadow-[0_0_0_1px_var(--color-accent)]" : "border-[var(--color-border)]"}`}>
                      <div className="text-[10px] text-[var(--color-text-dim)] mb-2 tracking-wider uppercase">{label}</div>
                      <div className="text-2xl font-bold font-[var(--font-display)] mb-1">{p.ganZhi}</div>
                      <div className="text-xs text-[var(--color-text-dim)]">{p.gan} · {p.zhi}</div>
                      <div className="text-[10px] mt-1.5 px-2 py-0.5 rounded-full inline-block bg-[#fdfaf4] text-[var(--color-gold)] font-medium">{ss}</div>
                    </div>
                  ))}
                </div>

                {/* 地支藏干 */}
                <div className="bg-white border border-[var(--color-border)] rounded-xl p-4">
                  <div className="text-xs text-[var(--color-text-dim)] mb-3 font-semibold tracking-wider">地支藏干</div>
                  <div className="grid grid-cols-4 gap-3 text-center text-sm">
                    {chart.cangGan.map((cg, i) => (
                      <div key={i}>
                        <span className="text-[10px] text-[var(--color-text-hint)]">{["年","月","日","时"][i]}</span>
                        <div className="font-medium mt-0.5">{cg.join(" ")}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 用神 + 日主 */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white border border-[var(--color-border)] rounded-xl p-5 text-center">
                    <div className="text-xs text-[var(--color-text-dim)] mb-1">日主</div>
                    <div className="text-2xl font-bold font-[var(--font-display)]">{chart.dayMaster}</div>
                    <div className="text-sm text-[var(--color-text-dim)]">{chart.dayMasterWx}命</div>
                  </div>
                  <div className="bg-white border border-[var(--color-border)] rounded-xl p-5">
                    <div className="text-xs text-[var(--color-text-dim)] mb-2 text-center tracking-wider">用神 / 忌神</div>
                    <div className="flex gap-3 justify-center text-sm">
                      <span className="px-3 py-1 rounded-full bg-[var(--color-green-bg)] text-[var(--color-green)] font-semibold">{analysis.yongShen.shen}</span>
                      <span className="px-3 py-1 rounded-full bg-[var(--color-accent-bg)] text-[var(--color-accent)] font-semibold">{analysis.jiShen}</span>
                    </div>
                    <div className="text-xs text-[var(--color-text-dim)] mt-2 text-center">{analysis.yongShen.reason.slice(0, 50)}…</div>
                  </div>
                </div>

                {/* 五行分布 */}
                <div className="bg-white border border-[var(--color-border)] rounded-xl p-5">
                  <div className="text-xs text-[var(--color-text-dim)] mb-4 font-semibold tracking-wider">五行力量分布</div>
                  <div className="space-y-2">
                    {(["金","木","水","火","土"] as const).map(wx => {
                      const pct = Math.round((chart.wuXingCount[wx] / Object.values(chart.wuXingCount).reduce((a, b) => a + b, 0)) * 100);
                      return (
                        <div key={wx} className="flex items-center gap-3">
                          <span className="text-xs w-8 text-right text-[var(--color-text-dim)]">{wx}</span>
                          <div className="flex-1 h-3 bg-[#f3efe9] rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: WX_COLORS[wx] }} />
                          </div>
                          <span className="text-xs text-[var(--color-text-dim)] w-12 text-right">{chart.wuXingCount[wx]} ({pct}%)</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 大运 */}
                <div className="bg-white border border-[var(--color-border)] rounded-xl p-5">
                  <div className="text-xs text-[var(--color-text-dim)] mb-3 font-semibold tracking-wider">大运 ({chart.daYun.startAge}岁起运)</div>
                  <div className="flex flex-wrap gap-2">
                    {chart.daYun.pillars.map((dz, i) => {
                      const age = chart.daYun.startAge + i * 10;
                      return (
                        <div key={i} className="px-3 py-2 bg-[#fdfcfa] border border-[var(--color-border-light)] rounded-lg text-center min-w-[64px]">
                          <div className="text-sm font-semibold">{dz}</div>
                          <div className="text-[10px] text-[var(--color-text-hint)]">{age}-{age+9}岁</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* ====== RIGHT: 解读 ====== */}
              <div className="flex-1 space-y-5" style={{ flex: "0 0 45%" }}>
                {/* 性格 */}
                <div className="bg-white border border-[var(--color-border)] rounded-xl p-5">
                  <h3 className="font-[var(--font-display)] text-sm font-semibold mb-3">性格特征</h3>
                  <p className="text-sm text-[var(--color-text-body)] leading-[1.85]">{analysis.personality}</p>
                </div>

                {/* 总览 */}
                <div className="bg-[#fdfaf4] border border-[var(--color-gold-light)] rounded-xl p-5">
                  <h3 className="font-[var(--font-display)] text-sm font-semibold mb-3 text-[var(--color-gold)]">命局总览</h3>
                  <p className="text-sm text-[var(--color-text-body)] leading-[1.85]">{analysis.overall}</p>
                  <p className="text-xs text-[var(--color-text-dim)] mt-3 leading-relaxed">{analysis.yongShen.advice}</p>
                </div>

                {/* 五维度 */}
                {[analysis.career, analysis.wealth, analysis.love, analysis.health].map(dim => (
                  <div key={dim.title} className="bg-white border border-[var(--color-border)] rounded-xl p-5">
                    <h3 className="font-[var(--font-display)] text-sm font-semibold mb-1">{dim.title}</h3>
                    <p className="text-xs text-[var(--color-gold)] mb-2 font-medium">{dim.summary}</p>
                    <p className="text-sm text-[var(--color-text-body)] leading-[1.85]">{dim.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
