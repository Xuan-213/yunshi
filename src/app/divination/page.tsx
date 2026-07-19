"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import { useProfiles } from "@/lib/store/profile-context";
import { qiGua, qiGuaByTime, type MeiHuaResult } from "@/lib/meihua/qigua";
import { interpretMeihua } from "@/lib/meihua/jiegua";
import { zhuangGua, type LiuYaoResult } from "@/lib/liuyao/zhuanggua";
import { interpretLiuyao } from "@/lib/liuyao/jiegua";
import { addDivination } from "@/lib/store/local-store";

type DivMode = "meihua" | "liuyao";
type WyMethod = "time" | "image" | "text";

export default function DivinationPage() {
  const { activeProfile } = useProfiles();
  const [mode, setMode] = useState<DivMode>("meihua");
  const [wyMethod, setWyMethod] = useState<WyMethod>("time");
  const [question, setQuestion] = useState("");
  const [questionType, setQuestionType] = useState("财运");

  // 梅花: 3 numbers
  const [nums, setNums] = useState(["3", "8", "5"]);
  // 文字外应
  const [waiyingText, setWaiyingText] = useState("");

  // 六爻: 6 digits
  const [digits, setDigits] = useState(["3","8","5","7","2","4"]);

  // Results
  const [meihuaResult, setMeihuaResult] = useState<MeiHuaResult | null>(null);
  const [meihuaText, setMeihuaText] = useState("");
  const [liuyaoResult, setLiuyaoResult] = useState<LiuYaoResult | null>(null);
  const [liuyaoText, setLiuyaoText] = useState("");

  const now = new Date();

  /** 梅花起卦 */
  function doMeihua() {
    let result: MeiHuaResult;
    if (wyMethod === "time") {
      const inp = qiGuaByTime(now.getFullYear(), now.getMonth() + 1, now.getDate(), now.getHours());
      result = qiGua(inp);
    } else {
      result = qiGua({
        shangGuaNum: parseInt(nums[0]) || 3,
        xiaGuaNum: parseInt(nums[1]) || 8,
        dongYaoNum: parseInt(nums[2]) || 5,
      });
    }
    setMeihuaResult(result);
    const interpretation = interpretMeihua(result, question || "未指定");
    setMeihuaText(interpretation);
    addDivination({ mode: "meihua", question: question || "未指定", profileId: activeProfile?.id ?? null, questionType: "", input: { wyMethod, nums }, result });
  }

  /** 六爻起卦 */
  function doLiuyao() {
    const aaa = parseInt(digits.slice(0,3).join("")) || 385;
    const bbb = parseInt(digits.slice(3,6).join("")) || 724;
    const shang = aaa % 8;
    const xia = bbb % 8;
    const dong = (aaa + bbb) % 6;
    const result = zhuangGua(
      shang, xia, dong, questionType,
      now.getFullYear(), now.getMonth() + 1, now.getDate()
    );
    setLiuyaoResult(result);
    const interpretation = interpretLiuyao(result, question || "未指定", questionType);
    setLiuyaoText(interpretation);
    addDivination({ mode: "liuyao", question: question || "未指定", profileId: activeProfile?.id ?? null, questionType, input: { digits, shang, xia, dong }, result });
  }

  return (
    <>
      <Sidebar />
      <main className="flex-1 px-8 py-8 overflow-y-auto">
        <div className="w-full">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-[3px] h-5 bg-[var(--color-accent)] rounded-sm" />
            <h1 className="font-[var(--font-display)] text-xl font-semibold">起卦</h1>
          </div>

          {/* Mode Switcher */}
          <div className="inline-flex bg-[#f5f0e8] rounded-lg p-1 mb-5">
            <button onClick={() => { setMode("meihua"); setMeihuaResult(null); }}
              className={`px-5 py-2 rounded-md text-sm font-medium transition-all duration-150 ${mode === "meihua" ? "bg-white text-[var(--color-text-primary)] shadow-sm" : "text-[var(--color-text-dim)]"}`}>🌸 梅花易数</button>
            <button onClick={() => { setMode("liuyao"); setLiuyaoResult(null); }}
              className={`px-5 py-2 rounded-md text-sm font-medium transition-all duration-150 ${mode === "liuyao" ? "bg-white text-[var(--color-text-primary)] shadow-sm" : "text-[var(--color-text-dim)]"}`}>🪙 六爻</button>
          </div>

          {/* ====== 梅花易数 ====== */}
          {mode === "meihua" && (
            <div>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">你想问什么？</label>
                <input className="w-full px-4 py-3 border border-[var(--color-border)] rounded-lg text-sm bg-[#fdfcfa] outline-none focus:border-[var(--color-accent)] transition-colors"
                  placeholder="例如：这次换工作能顺利吗？" value={question} onChange={e => setQuestion(e.target.value)} />
              </div>

              <label className="block text-sm font-semibold mb-3">提供外应</label>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {([
                  { id: "time" as const, icon: "🕐", label: "时间外应", hint: "用当前时间起卦" },
                  { id: "image" as const, icon: "📷", label: "图片外应", hint: "拍一张照片" },
                  { id: "text" as const, icon: "✍️", label: "文字外应", hint: "描述观察到的现象" },
                ]).map(m => (
                  <div key={m.id} onClick={() => { setWyMethod(m.id); setMeihuaResult(null); }}
                    className={`p-4 border-2 rounded-xl text-center cursor-pointer transition-all duration-150 ${wyMethod === m.id ? "border-[var(--color-accent)] bg-[var(--color-accent-bg)]" : "border-[var(--color-border)] bg-white hover:border-[var(--color-accent)]"}`}>
                    <div className="text-2xl mb-1">{m.icon}</div>
                    <div className="text-sm font-semibold">{m.label}</div>
                    <div className="text-xs text-[var(--color-text-dim)] mt-0.5">{m.hint}</div>
                  </div>
                ))}
              </div>

              {wyMethod === "time" && (
                <div className="bg-white border border-[var(--color-border)] rounded-xl p-6 text-center mb-4">
                  <p className="text-[var(--color-text-dim)] mb-3">当前时间</p>
                  <p className="text-2xl font-bold">{now.getFullYear()}年{now.getMonth()+1}月{now.getDate()}日 {now.getHours()}:{String(now.getMinutes()).padStart(2,"0")}</p>
                </div>
              )}
              {wyMethod === "image" && (
                <div className="bg-white border border-[var(--color-border)] rounded-xl p-6 text-center mb-4">
                  <div className="w-full h-40 bg-[#fdfcfa] border-2 border-dashed border-[var(--color-border)] rounded-xl flex items-center justify-center flex-col cursor-pointer text-[var(--color-text-hint)]">
                    <span className="text-4xl">📷</span><span className="mt-2">点击上传图片</span><span className="text-xs mt-1">AI 将直接观物取象</span>
                  </div>
                </div>
              )}
              {wyMethod === "text" && (
                <div className="mb-4">
                  <textarea className="w-full px-4 py-3 border border-[var(--color-border)] rounded-lg text-sm bg-[#fdfcfa] outline-none focus:border-[var(--color-accent)] transition-colors resize-none" rows={3}
                    placeholder="描述你观察到的事物或现象，例如：刚才听到三声鸟叫，一阵风吹过，看到窗外的树叶落了三片..."
                    value={waiyingText} onChange={e => setWaiyingText(e.target.value)} />
                </div>
              )}

              {wyMethod !== "time" && wyMethod !== "image" && (
                <div className="flex gap-4 justify-center mb-4">
                  {nums.map((n, i) => (
                    <div key={i} className="text-center">
                      <div className="text-xs text-[var(--color-text-dim)] mb-1">{["上卦","下卦","动爻"][i]}</div>
                      <input className="w-16 h-14 text-center text-2xl font-semibold border-2 border-[var(--color-border)] rounded-xl bg-white focus:border-[var(--color-accent)] outline-none"
                        value={n} maxLength={2} onChange={e => { const cp = [...nums]; cp[i] = e.target.value; setNums(cp); }} />
                    </div>
                  ))}
                </div>
              )}

              <button onClick={doMeihua}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[var(--color-accent)] text-white rounded-full text-sm font-medium hover:bg-[var(--color-accent-deep)] transition-colors">🪙 开始解卦</button>

              {/* ---- Result ---- */}
              {meihuaResult && (
                <div className="mt-8">
                  <div className="flex items-center gap-3 text-xs text-[var(--color-text-hint)] mb-4"><span className="flex-1 h-px bg-[var(--color-border)]" />解卦结果<span className="flex-1 h-px bg-[var(--color-border)]" /></div>
                  <div className="bg-white border border-[var(--color-border)] rounded-xl p-6">
                    <div className="text-center mb-6">
                      <div className="flex justify-center gap-10 mb-4">
                        <div><div className="text-xs text-[var(--color-text-dim)] mb-1">本卦</div><div className="text-xl font-bold">{meihuaResult.benGua.name}</div></div>
                        {meihuaResult.huGua && <div><div className="text-xs text-[var(--color-text-dim)] mb-1">互卦</div><div className="text-xl font-bold">{meihuaResult.huGua.name}</div></div>}
                        <div><div className="text-xs text-[var(--color-text-dim)] mb-1">变卦</div><div className="text-xl font-bold">{meihuaResult.bianGua.name}</div></div>
                      </div>
                      <span className={`inline-block px-4 py-1.5 rounded-2xl text-sm font-semibold ${
                        meihuaResult.tiYong.relation === "用生体" || meihuaResult.tiYong.relation === "体用比和"
                          ? "bg-[var(--color-green-bg)] text-[var(--color-green)]"
                          : meihuaResult.tiYong.relation === "用克体"
                          ? "bg-[var(--color-accent-bg)] text-[var(--color-accent)]"
                          : "bg-[#fff8e8] text-[#b8860b]"
                      }`}>{meihuaResult.tiYong.relation} · {meihuaResult.tiYong.verdict.slice(0, 2)}</span>
                    </div>
                    <div className="text-sm text-[var(--color-text-body)] leading-relaxed whitespace-pre-line">
                      {meihuaText}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ====== 六爻 ====== */}
          {mode === "liuyao" && (
            <div>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">你想问什么？</label>
                <input className="w-full px-4 py-3 border border-[var(--color-border)] rounded-lg text-sm bg-[#fdfcfa] outline-none focus:border-[var(--color-accent)] transition-colors"
                  placeholder="例如：这笔投资能赚钱吗？" value={question} onChange={e => setQuestion(e.target.value)} />
              </div>

              <label className="block text-sm font-semibold mb-2">问题类型（用于选取用神）</label>
              <div className="grid grid-cols-4 gap-2 mb-5">
                {["💰 财运","💼 事业","❤️ 感情","🏥 健康","✈️ 出行","🔍 寻物","📚 学业","💬 其他"].map(t => {
                  const raw = t.replace(/^.\s/, "");
                  return (
                    <span key={t} onClick={() => setQuestionType(raw)}
                      className={`px-3 py-2 border rounded-lg text-center text-sm cursor-pointer transition-all duration-150 ${questionType === raw ? "border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent-bg)]" : "border-[var(--color-border)] bg-white hover:border-[var(--color-accent)]"}`}>{t}</span>
                  );
                })}
              </div>

              <label className="block text-sm font-semibold mb-3">输入 6 位数字（aaabbb）</label>
              <div className="flex gap-2.5 justify-center mb-3">
                {digits.map((d, i) => (
                  <input key={i} maxLength={1} value={d}
                    className={`w-16 h-14 text-center text-2xl font-semibold border-2 border-[var(--color-border)] rounded-xl bg-white focus:border-[var(--color-accent)] outline-none ${i === 2 ? "mr-2" : ""}`}
                    onChange={e => { const cp = [...digits]; cp[i] = e.target.value; setDigits(cp); }} />
                ))}
              </div>
              {(() => {
                const a = parseInt(digits.slice(0,3).join("")) || 0;
                const b = parseInt(digits.slice(3,6).join("")) || 0;
                return <p className="text-xs text-[var(--color-text-hint)] text-center mb-5">上卦: {a} % 8 = <strong className="text-[var(--color-text-primary)]">{a%8||8}</strong> · 下卦: {b} % 8 = <strong className="text-[var(--color-text-primary)]">{b%8||8}</strong> · 动爻: ({a}+{b}) % 6 = <strong className="text-[var(--color-text-primary)]">{(a+b)%6||6}</strong></p>;
              })()}

              <button onClick={doLiuyao}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[var(--color-accent)] text-white rounded-full text-sm font-medium hover:bg-[var(--color-accent-deep)] transition-colors">🪙 开始解卦</button>

              {/* ---- Result ---- */}
              {liuyaoResult && (
                <div className="mt-8">
                  <div className="flex items-center gap-3 text-xs text-[var(--color-text-hint)] mb-4"><span className="flex-1 h-px bg-[var(--color-border)]" />解卦结果<span className="flex-1 h-px bg-[var(--color-border)]" /></div>
                  <div className="bg-white border border-[var(--color-border)] rounded-xl p-6">
                    <div className="text-center mb-5">
                      <div className="text-2xl font-bold">{liuyaoResult.benGuaName} → {liuyaoResult.bianGuaName}</div>
                      <div className="text-sm text-[var(--color-text-dim)] mt-1">{liuyaoResult.gongName}宫 · 世在{["","初","二","三","四","五","上"][liuyaoResult.shiYaoPos]}爻</div>
                    </div>

                    {/* 六爻表 */}
                    <div className="bg-[#fdfcfa] rounded-lg p-4 mb-4 font-mono text-sm">
                      {liuyaoResult.lines.map(row => (
                        <div key={row.position} className={`flex justify-between py-1 border-b border-[var(--color-border-light)] last:border-b-0 ${row.isMoving ? "bg-[var(--color-accent-bg)] -mx-2 px-2 rounded" : ""}`}>
                          <span>{row.position}{row.shiYing ? ` · ${row.shiYing}` : ""}</span>
                          <span>{row.isMoving ? "○" : "  "} {row.original} {row.najiaDiZhi} {row.liuShen}</span>
                          <span className="text-[var(--color-text-dim)]">{row.liuQin}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2 mb-4 flex-wrap">
                      <span className="px-2 py-1 rounded-md text-xs font-medium bg-[var(--color-green-bg)] text-[var(--color-green)]">用神: {liuyaoResult.yongShen.liuQin}爻（{liuyaoResult.yongShen.position}）</span>
                      <span className="px-2 py-1 rounded-md text-xs font-medium bg-[var(--color-green-bg)] text-[var(--color-green)]">原神: {liuyaoResult.yuanShen}爻</span>
                      <span className="px-2 py-1 rounded-md text-xs font-medium bg-[#fff8e8] text-[#b8860b]">忌神: {liuyaoResult.jiShen}爻</span>
                    </div>

                    <div className="text-sm text-[var(--color-text-body)] leading-relaxed whitespace-pre-line">
                      {liuyaoText}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
