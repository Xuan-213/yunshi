"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import { useProfiles, type BirthProfile } from "@/lib/store/profile-context";
import { buildChartFromPillars } from "@/lib/bazi/paiPan";
import { analyzeMingPan } from "@/lib/bazi/analysis";

const TG = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
const DZ = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
const WX_COLORS: Record<string, string> = { "金": "#e8c97a", "木": "#7ec97a", "水": "#7aa8c9", "火": "#c97a7a", "土": "#c9a87a" };

export default function ProfilePage() {
  const { profiles, activeProfile, loading, setActiveProfile, saveProfile, removeProfile } = useProfiles();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "", gender: "male" as "male"|"female", birthYear: 1990,
    yg: "甲", yz: "子", mg: "甲", mz: "子", dg: "甲", dz: "子", hg: "甲", hz: "子",
  });

  function addProfile() {
    if (!form.name.trim()) return;
    const y = `${form.yg}${form.yz}`, m = `${form.mg}${form.mz}`;
    const d = `${form.dg}${form.dz}`, h = `${form.hg}${form.hz}`;
    saveProfile({
      name: form.name, initial: form.name[0], color: "",
      gender: form.gender, birthYear: form.birthYear,
      yearPillar: y, monthPillar: m, dayPillar: d, hourPillar: h,
      baziSummary: `${y}年 · ${form.gender === "male" ? "男" : "女"}`,
    });
    setShowForm(false);
  }

  const chart = activeProfile ? buildChartFromPillars(
    activeProfile.yearPillar, activeProfile.monthPillar,
    activeProfile.dayPillar, activeProfile.hourPillar,
    activeProfile.gender as "male"|"female", activeProfile.birthYear,
  ) : null;
  const analysis = chart ? analyzeMingPan(chart) : null;

  return (
    <>
      <Sidebar />
      <main className="flex-1 px-8 py-8 overflow-y-auto">
        <div className="w-full">
          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center gap-3">
              <span className="w-[3px] h-5 bg-[var(--color-accent)] rounded-sm" />
              <h2 className="font-[var(--font-display)] text-xl font-semibold">命盘</h2>
            </div>
            <div className="flex-1" />
            {profiles.length > 0 && (
              <select className="px-4 py-2 border border-[var(--color-border)] rounded-lg text-sm bg-white"
                value={activeProfile?.id || ""} onChange={e => setActiveProfile(parseInt(e.target.value))}>
                {profiles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            )}
            {activeProfile && (
              <button onClick={() => removeProfile(activeProfile.id)} className="text-sm text-[var(--color-text-hint)] hover:text-[var(--color-accent)]">删除</button>
            )}
            <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-[var(--color-accent)] text-white rounded-full text-sm font-medium">
              {showForm ? "取消" : "+ 新建"}
            </button>
          </div>

          {showForm && (
            <div className="bg-white border border-[var(--color-border)] rounded-xl p-6 mb-8">
              <h3 className="font-[var(--font-display)] text-base font-semibold mb-4">录入八字</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">姓名</label>
                  <input className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg text-sm bg-[#fdfcfa]"
                    value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">性别</label>
                  <div className="flex gap-2">
                    {(["male","female"] as const).map(g => (
                      <button key={g} onClick={() => setForm({...form, gender: g})}
                        className={`flex-1 py-2 rounded-lg text-sm border ${form.gender === g ? "border-[var(--color-accent)] bg-[var(--color-accent-bg)] text-[var(--color-accent)]" : "border-[var(--color-border)]"}`}>
                        {g === "male" ? "男" : "女"}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">出生年份（用于排大运）</label>
                  <input type="number" className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg text-sm bg-[#fdfcfa]"
                    value={form.birthYear} onChange={e => setForm({...form, birthYear: parseInt(e.target.value)||1990})} />
                </div>
              </div>
              {/* 四柱输入 */}
              <label className="block text-sm font-medium mb-3">四柱八字</label>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: "年柱", g: "yg", z: "yz" },
                  { label: "月柱", g: "mg", z: "mz" },
                  { label: "日柱", g: "dg", z: "dz" },
                  { label: "时柱", g: "hg", z: "hz" },
                ].map(({ label, g, z }) => (
                  <div key={label} className="bg-[#fdfcfa] border border-[var(--color-border)] rounded-xl p-3">
                    <div className="text-[10px] text-[var(--color-text-dim)] mb-2">{label}</div>
                    <div className="flex gap-1.5">
                      <select className="flex-1 px-2 py-1.5 border border-[var(--color-border)] rounded text-sm bg-white"
                        value={(form as any)[g]} onChange={e => setForm({...form, [g]: e.target.value})}>
                        {TG.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <select className="flex-1 px-2 py-1.5 border border-[var(--color-border)] rounded text-sm bg-white"
                        value={(form as any)[z]} onChange={e => setForm({...form, [z]: e.target.value})}>
                        {DZ.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={addProfile} className="mt-4 px-6 py-2 bg-[var(--color-accent)] text-white rounded-full text-sm font-medium">
                保存命盘
              </button>
            </div>
          )}

          {!loading && !activeProfile && (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🌿</div>
              <h3 className="font-[var(--font-display)] text-lg font-semibold mb-2">还没有命盘</h3>
              <p className="text-sm text-[var(--color-text-dim)] mb-4">点击「新建」录入八字</p>
            </div>
          )}

          {chart && analysis && (
            <div className="flex gap-8">
              <div className="flex-1 space-y-4" style={{ flex: "0 0 55%" }}>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: "年柱", p: chart.bazi.year, ss: chart.shiShen.year },
                    { label: "月柱", p: chart.bazi.month, ss: chart.shiShen.month },
                    { label: "日柱", p: chart.bazi.day, ss: "日主" },
                    { label: "时柱", p: chart.bazi.hour, ss: chart.shiShen.hour },
                  ].map(({ label, p, ss }) => (
                    <div key={label} className={`bg-white border rounded-xl p-4 text-center ${label === "日柱" ? "border-[var(--color-accent)] shadow-[0_0_0_1px_var(--color-accent)]" : "border-[var(--color-border)]"}`}>
                      <div className="text-[10px] text-[var(--color-text-dim)] mb-2">{label}</div>
                      <div className="text-2xl font-bold font-[var(--font-display)] mb-1">{p.ganZhi}</div>
                      <div className="text-xs text-[var(--color-text-dim)]">{p.gan} · {p.zhi}</div>
                      <div className="text-[10px] mt-1.5 px-2 py-0.5 rounded-full bg-[#fdfaf4] text-[var(--color-gold)]">{ss}</div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white border border-[var(--color-border)] rounded-xl p-5 text-center">
                    <div className="text-xs text-[var(--color-text-dim)] mb-1">日主</div>
                    <div className="text-2xl font-bold font-[var(--font-display)]">{chart.dayMaster}</div>
                    <div className="text-sm text-[var(--color-text-dim)]">{chart.dayMasterWx}命</div>
                  </div>
                  <div className="bg-white border border-[var(--color-border)] rounded-xl p-5">
                    <div className="text-xs text-[var(--color-text-dim)] mb-2 text-center">用神/忌神</div>
                    <div className="flex gap-3 justify-center text-sm">
                      <span className="px-3 py-1 rounded-full bg-[var(--color-green-bg)] text-[var(--color-green)]">{analysis.yongShen.shen}</span>
                      <span className="px-3 py-1 rounded-full bg-[var(--color-accent-bg)] text-[var(--color-accent)]">{analysis.jiShen}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white border border-[var(--color-border)] rounded-xl p-5">
                  <div className="text-xs text-[var(--color-text-dim)] mb-4">五行分布</div>
                  <div className="space-y-2">
                    {(["金","木","水","火","土"] as const).map(wx => {
                      const pct = Math.round((chart.wuXingCount[wx]/Object.values(chart.wuXingCount).reduce((a,b)=>a+b,1))*100);
                      return (<div key={wx} className="flex items-center gap-3"><span className="text-xs w-8 text-right text-[var(--color-text-dim)]">{wx}</span><div className="flex-1 h-3 bg-[#f3efe9] rounded-full overflow-hidden"><div className="h-full rounded-full" style={{width:`${pct}%`,background:WX_COLORS[wx]}}/></div><span className="text-xs text-[var(--color-text-dim)] w-12">{chart.wuXingCount[wx]} ({pct}%)</span></div>);
                    })}
                  </div>
                </div>
                <div className="bg-white border border-[var(--color-border)] rounded-xl p-5">
                  <div className="text-xs text-[var(--color-text-dim)] mb-3">大运 ({chart.daYun.startAge}岁起)</div>
                  <div className="flex flex-wrap gap-2">{chart.daYun.pillars.map((dz,i) => (<div key={i} className="px-3 py-2 bg-[#fdfcfa] border border-[var(--color-border-light)] rounded-lg text-center min-w-[64px]"><div className="text-sm font-semibold">{dz}</div><div className="text-[10px] text-[var(--color-text-hint)]">{chart.daYun.startAge+i*10}岁</div></div>))}</div>
                </div>
              </div>
              <div className="flex-1 space-y-5" style={{ flex: "0 0 45%" }}>
                <div className="bg-white border border-[var(--color-border)] rounded-xl p-5">
                  <h3 className="font-[var(--font-display)] text-sm font-semibold mb-3">性格</h3>
                  <p className="text-sm leading-[1.85] text-[var(--color-text-body)]">{analysis.personality}</p>
                </div>
                <div className="bg-[#fdfaf4] border border-[var(--color-gold-light)] rounded-xl p-5">
                  <h3 className="font-[var(--font-display)] text-sm font-semibold mb-3 text-[var(--color-gold)]">命局总览</h3>
                  <p className="text-sm leading-[1.85] text-[var(--color-text-body)]">{analysis.overall}</p>
                </div>
                {[analysis.career, analysis.wealth, analysis.love, analysis.health].map(dim => (
                  <div key={dim.title} className="bg-white border border-[var(--color-border)] rounded-xl p-5">
                    <h3 className="font-[var(--font-display)] text-sm font-semibold mb-1">{dim.title}</h3>
                    <p className="text-xs text-[var(--color-gold)] mb-2">{dim.summary}</p>
                    <p className="text-sm leading-[1.85] text-[var(--color-text-body)]">{dim.detail}</p>
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
