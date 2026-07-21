"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import { useProfiles } from "@/lib/store/profile-context";

export default function ProfilePage() {
  const { profiles, activeProfile, loading, setActiveProfile, saveProfile, removeProfile } = useProfiles();
  const [showForm, setShowForm] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [keySaved, setKeySaved] = useState(false);
  const [form, setForm] = useState({
    name: "", year: 1990, month: 1, day: 1, hour: 12, minute: 0,
    gender: "male", longitude: 120,
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
        <div className="w-full max-w-[800px]">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-[3px] h-5 bg-[var(--color-accent)] rounded-sm" />
            <h2 className="font-[var(--font-display)] text-xl font-semibold">命盘管理</h2>
          </div>

          {loading && <p className="text-sm text-[var(--color-text-dim)]">加载中...</p>}

          {!loading && profiles.length === 0 && !showForm && (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">🌿</div>
              <p className="text-sm text-[var(--color-text-dim)] mb-4">还没有命盘，录入你的出生信息开始使用。</p>
            </div>
          )}

          {profiles.map(p => (
            <div key={p.id} className="flex items-center gap-3.5 p-3.5 bg-white rounded-xl mb-2 shadow-[0_1px_3px_rgba(44,36,22,0.05)]">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[var(--color-accent)] to-[#d47070] flex items-center justify-center text-white text-lg font-semibold flex-shrink-0">
                {p.initial}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm">
                  {p.name} {activeProfile?.id === p.id && <span className="text-xs text-[var(--color-accent)] font-normal ml-1">● 当前</span>}
                </div>
                <div className="text-xs text-[var(--color-text-dim)] mt-0.5">
                  {p.year}/{p.month}/{p.day} · {p.gender === "male" ? "男" : "女"} · {p.baziSummary}
                </div>
              </div>
              {activeProfile?.id !== p.id && (
                <button onClick={() => setActiveProfile(p.id)} className="text-xs text-[var(--color-accent)] border border-[var(--color-accent)] px-2 py-1 rounded-full hover:bg-[var(--color-accent-bg)] transition-colors mr-1">设为当前</button>
              )}
              <button onClick={() => removeProfile(p.id)} className="text-[var(--color-text-hint)] hover:text-[var(--color-accent)] text-sm px-2 py-1 transition-colors">删除</button>
            </div>
          ))}

          {!showForm && (
            <button onClick={() => setShowForm(true)} className="w-full mt-2 mb-2 py-2.5 border border-[var(--color-accent)] text-[var(--color-accent)] rounded-full text-sm font-medium hover:bg-[var(--color-accent-bg)] transition-colors">
              + 添加命盘
            </button>
          )}

          {showForm && (
            <div className="bg-white border border-[var(--color-border)] rounded-xl p-6 mb-6 mt-2">
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
              <div className="flex gap-3">
                <button onClick={addProfile} className="px-6 py-2 bg-[var(--color-accent)] text-white rounded-full text-sm font-medium hover:bg-[var(--color-accent-deep)] transition-colors">保存命盘</button>
                <button onClick={() => setShowForm(false)} className="px-6 py-2 border border-[var(--color-border)] rounded-full text-sm text-[var(--color-text-dim)] hover:bg-gray-50 transition-colors">取消</button>
              </div>
            </div>
          )}
          {/* API Key setting */}
          <div className="mt-8 p-5 bg-white border border-[var(--color-border)] rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm">🔑</span>
              <h3 className="font-[var(--font-display)] text-base font-semibold">AI 解卦设置</h3>
            </div>
            <p className="text-xs text-[var(--color-text-dim)] mb-3">填入 DeepSeek API Key 后，六爻解卦将由「奶奶」AI 生成温暖的个性化解读。</p>
            <div className="flex gap-2">
              <input
                type="password"
                className="flex-1 px-3 py-2 border border-[var(--color-border)] rounded-lg text-sm bg-[#fdfcfa] outline-none focus:border-[var(--color-accent)]"
                placeholder="sk-..."
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
              />
              <button
                onClick={() => { localStorage.setItem("ds_key", apiKey.trim()); setKeySaved(true); setTimeout(() => setKeySaved(false), 2000); }}
                className="px-4 py-2 bg-[var(--color-accent)] text-white rounded-lg text-sm font-medium hover:bg-[var(--color-accent-deep)] transition-colors"
              >
                {keySaved ? "✅ 已保存" : "保存"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
