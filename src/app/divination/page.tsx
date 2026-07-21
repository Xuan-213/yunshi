"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import { useProfiles } from "@/lib/store/profile-context";
import { qiGua, qiGuaByTime, type MeiHuaResult } from "@/lib/meihua/qigua";
import { interpretMeihua } from "@/lib/meihua/jiegua";
import { zhuangGua, type LiuYaoResult } from "@/lib/liuyao/zhuanggua";
import { interpretLiuyao } from "@/lib/liuyao/jiegua";
import { aiLiuyaoInterpret, aiFollowUp } from "@/lib/ai/deepseek";
import { addDivination } from "@/lib/store/local-store";

type DivMode = "meihua" | "liuyao";
type WyMethod = "time" | "image" | "text";
type ChatMsg = { role: "user" | "assistant"; content: string };

// ====== Magazine-style renderer ======

const SECTION_NUMS = ["壹", "贰", "叁", "肆", "伍"];

function MagazineResult({ text }: { text: string }) {
  if (!text) return null;
  const sections = text.split("\n---").map(s => s.trim()).filter(Boolean);

  return (
    <div className="max-w-[680px] space-y-10">
      {sections.map((section, idx) => {
        const lines = section.split("\n");
        const firstLine = lines[0] || "";
        const title = firstLine.startsWith("## ") ? firstLine.slice(3) : "";
        const body = (title ? lines.slice(1) : lines).join("\n");

        return (
          <section key={idx}>
            {/* Section number + title */}
            {title && (
              <div className="flex items-baseline gap-3 mb-5">
                <span className="font-[var(--font-display)] text-sm text-[var(--color-gold)] tracking-widest">
                  {SECTION_NUMS[idx] || ""}
                </span>
                <h2 className="font-[var(--font-display)] text-lg font-semibold text-[var(--color-text-primary)]">
                  {title}
                </h2>
              </div>
            )}

            {/* Body with quote parsing */}
            <div className="space-y-4 pl-7">
              {body.split("\n").map((line, i) => {
                const t = line.trim();
                if (!t) return <div key={i} className="h-3" />;
                if (t.startsWith("> ")) {
                  return (
                    <blockquote key={i} className="mx-0 my-5 px-6 py-5 rounded-xl
                      bg-[#fdfaf4] border-l-[3px] border-[var(--color-gold)]
                      font-[var(--font-display)] text-[17px] leading-[1.7] text-[var(--color-text-primary)] italic"
                    >
                      {parseBold(t.slice(2))}
                    </blockquote>
                  );
                }
                return (
                  <p key={i} className="text-[15px] leading-[1.85] text-[var(--color-text-body)]">
                    {parseBold(t)}
                  </p>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function parseBold(text: string): React.ReactNode {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**")
      ? <strong key={i} className="text-[var(--color-text-primary)] font-semibold">{p.slice(2, -2)}</strong>
      : p
  );
}

// ====== Chat component for 追问 ======
function ChatFollowUp({ context, onSend }: {
  context: { question: string; result: string };
  onSend: (msg: string) => Promise<string>;
}) {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function send() {
    if (!input.trim() || loading) return;
    const msg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: msg }]);
    setLoading(true);
    try {
      const reply = await onSend(msg);
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "抱歉，追问暂时无法响应，请稍后再试。" }]);
    }
    setLoading(false);
  }

  return (
    <div className="max-w-[680px] mt-10 pt-8 border-t border-[var(--color-border)]">
      <h3 className="font-[var(--font-display)] text-base font-semibold mb-5 text-[var(--color-text-primary)]">
        继续追问
      </h3>

      {/* Messages */}
      {messages.length > 0 && (
        <div className="space-y-4 mb-5">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
              {m.role === "assistant" && (
                <span className="w-7 h-7 rounded-full bg-[var(--color-accent-bg)] text-[var(--color-accent)] flex items-center justify-center text-xs flex-shrink-0 mt-0.5">易</span>
              )}
              <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-[var(--color-accent)] text-white rounded-br-md"
                  : "bg-[#f8f5f0] text-[var(--color-text-body)] rounded-bl-md"
              }`}>
                {m.content}
              </div>
              {m.role === "user" && (
                <span className="w-7 h-7 rounded-full bg-[var(--color-text-dim)] text-white flex items-center justify-center text-xs flex-shrink-0 mt-0.5">我</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2">
        <input
          className="flex-1 px-4 py-2.5 border border-[var(--color-border)] rounded-full text-sm bg-white outline-none focus:border-[var(--color-accent)] transition-colors"
          placeholder="对解卦结果有疑问？在这里追问..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
        />
        <button
          onClick={send}
          disabled={loading || !input.trim()}
          className="px-5 py-2.5 bg-[var(--color-accent)] text-white rounded-full text-sm font-medium hover:bg-[var(--color-accent-deep)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? "…" : "发送"}
        </button>
      </div>
    </div>
  );
}

// ====== Main Page ======
export default function DivinationPage() {
  const { activeProfile } = useProfiles();
  const [mode, setMode] = useState<DivMode>("meihua");
  const [wyMethod, setWyMethod] = useState<WyMethod>("time");
  const [question, setQuestion] = useState("");
  const [nums, setNums] = useState(["3", "8", "5"]);
  const [waiyingText, setWaiyingText] = useState("");
  const [digits, setDigits] = useState(["3","8","5","7","2","4"]);
  const [meihuaResult, setMeihuaResult] = useState<MeiHuaResult | null>(null);
  const [meihuaText, setMeihuaText] = useState("");
  const [liuyaoResult, setLiuyaoResult] = useState<LiuYaoResult | null>(null);
  const [liuyaoAI, setLiuyaoAI] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [dongYaoNum, setDongYaoNum] = useState(3);
  const [liuyaoContext, setLiuyaoContext] = useState<{ question: string; result: string }>({ question: "", result: "" });

  const now = new Date();

  function doMeihua() {
    let result: MeiHuaResult;
    if (wyMethod === "time") {
      result = qiGua(qiGuaByTime(now.getFullYear(), now.getMonth() + 1, now.getDate(), now.getHours()));
    } else {
      result = qiGua({ shangGuaNum: parseInt(nums[0]) || 3, xiaGuaNum: parseInt(nums[1]) || 8, dongYaoNum: parseInt(nums[2]) || 5 });
    }
    setMeihuaResult(result);
    setMeihuaText(interpretMeihua(result, question || "未指定"));
    addDivination({ mode: "meihua", question: question || "未指定", profileId: activeProfile?.id ?? null, questionType: "", input: { wyMethod, nums }, result });
  }

  async function doLiuyao() {
    const dStr = digits.join("");
    const aaa = parseInt(dStr.slice(0, 3)) || 0;
    const bbb = parseInt(dStr.slice(3, 6)) || 0;
    const shang = aaa % 8 || 8;
    const xia = bbb % 8 || 8;
    const dong = (aaa + bbb) % 6 || 6;
    const result = zhuangGua(shang, xia, dong, "财运", now.getFullYear(), now.getMonth() + 1, now.getDate());
    setLiuyaoResult(result);
    setDongYaoNum(dong);
    setLiuyaoAI("");

    const guaData = (await import("@/lib/liuyao/yaoci")).findGuaData(result.benGuaName);
    const movingYao = guaData.yaoCi[dong - 1];
    setAiLoading(true);
    try {
      const aiText = await aiLiuyaoInterpret(
        question || "这件事", dStr, shang, xia, dong,
        result.benGuaName, result.bianGuaName,
        guaData.guaCi, guaData.guaCiCN, guaData.xiangZhuan,
        movingYao.position, movingYao.text, movingYao.textCN,
      );
      if (aiText) {
        setLiuyaoAI(aiText);
        setLiuyaoContext({ question: question || "这件事", result: aiText });
      }
    } catch { /* fallback to template */ }
    setAiLoading(false);
    addDivination({ mode: "liuyao", question: question || "这件事", profileId: activeProfile?.id ?? null, questionType: "", input: { digits: dStr, shang, xia, dong }, result });
  }

  async function handleFollowUp(msg: string) {
    return aiFollowUp(liuyaoContext, [{ role: "user", content: msg }]);
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
            <button onClick={() => { setMode("liuyao"); setLiuyaoResult(null); setLiuyaoAI(""); }}
              className={`px-5 py-2 rounded-md text-sm font-medium transition-all duration-150 ${mode === "liuyao" ? "bg-white text-[var(--color-text-primary)] shadow-sm" : "text-[var(--color-text-dim)]"}`}>🪙 六爻</button>
          </div>

          {/* ====== MEIHUA ====== */}
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
                    <span className="text-4xl">📷</span><span className="mt-2">点击上传图片</span>
                  </div>
                </div>
              )}
              {wyMethod === "text" && (
                <div className="mb-4">
                  <textarea className="w-full px-4 py-3 border border-[var(--color-border)] rounded-lg text-sm bg-[#fdfcfa] outline-none focus:border-[var(--color-accent)] transition-colors resize-none" rows={3}
                    placeholder="描述你观察到的事物或现象..." value={waiyingText} onChange={e => setWaiyingText(e.target.value)} />
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
              <button onClick={doMeihua} className="inline-flex items-center gap-2 px-6 py-2.5 bg-[var(--color-accent)] text-white rounded-full text-sm font-medium hover:bg-[var(--color-accent-deep)] transition-colors">🪙 开始解卦</button>

              {meihuaResult && (
                <div className="mt-8 max-w-[680px]">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--color-accent-bg)] text-[var(--color-accent)] text-sm font-medium mb-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />第{meihuaResult.dongYao}爻动
                    </div>
                    <h2 className="font-[var(--font-display)] text-2xl font-bold">
                      {meihuaResult.benGua.name}
                      <span className="text-[var(--color-text-dim)] mx-2">→</span>
                      {meihuaResult.bianGua.name}
                    </h2>
                  </div>
                  <div className="prose-p:text-[15px] prose-p:leading-[1.85] prose-p:text-[var(--color-text-body)] space-y-3">
                    {meihuaText.split("\n").map((line, i) => (
                      <p key={i} className="text-[15px] leading-[1.85] text-[var(--color-text-body)]">{line}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ====== LIUYAO ====== */}
          {mode === "liuyao" && (
            <div>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">你想问什么？</label>
                <input className="w-full px-4 py-3 border border-[var(--color-border)] rounded-lg text-sm bg-[#fdfcfa] outline-none focus:border-[var(--color-accent)] transition-colors"
                  placeholder="例如：这笔投资能赚钱吗？" value={question} onChange={e => setQuestion(e.target.value)} />
              </div>

              <label className="block text-sm font-semibold mb-3">输入 6 位数字</label>
              <input
                className="w-full px-4 py-3 border-2 border-[var(--color-border)] rounded-xl text-2xl text-center font-semibold bg-white tracking-[0.3em] outline-none focus:border-[var(--color-accent)] transition-colors"
                maxLength={6} placeholder="446584"
                value={digits.join("")}
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setDigits(val.split("").concat(Array(6).fill("")).slice(0, 6));
                }}
              />
              {(() => {
                const dStr = digits.join("");
                const a = parseInt(dStr.slice(0, 3)) || 0;
                const b = parseInt(dStr.slice(3, 6)) || 0;
                const s = a % 8 || 8; const x = b % 8 || 8; const d = (a + b) % 6 || 6;
                const bagua = ["","乾 ☰","兑 ☱","离 ☲","震 ☳","巽 ☴","坎 ☵","艮 ☶","坤 ☷"];
                return dStr.length === 6 ? (
                  <p className="text-sm text-center mt-3">前 {a} ÷ 8 余 {s} → <strong>{bagua[s]}</strong>（上卦） · 后 {b} ÷ 8 余 {x} → <strong>{bagua[x]}</strong>（下卦） · {a}+{b} ÷ 6 余 {d} → <strong>第{d}爻动</strong></p>
                ) : <p className="text-xs text-[var(--color-text-hint)] text-center mt-2">输入 6 位数字后自动显示卦象预览</p>;
              })()}

              <button onClick={doLiuyao}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[var(--color-accent)] text-white rounded-full text-sm font-medium hover:bg-[var(--color-accent-deep)] transition-colors mt-3">🪙 开始解卦</button>

              {/* ---- LIUYAO RESULT ---- */}
              {liuyaoResult && (
                <div className="mt-8">
                  {/* Header */}
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--color-accent-bg)] text-[var(--color-accent)] text-sm font-medium mb-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />第{["","一","二","三","四","五","六"][dongYaoNum]}爻动
                    </div>
                    <h2 className="font-[var(--font-display)] text-2xl font-bold">
                      {liuyaoResult.benGuaName}
                      <span className="text-[var(--color-text-dim)] mx-2">→</span>
                      {liuyaoResult.bianGuaName}
                    </h2>
                  </div>

                  {/* Loading */}
                  {aiLoading && !liuyaoAI && (
                    <div className="flex flex-col items-center gap-3 py-16 text-[var(--color-text-dim)]">
                      <div className="w-8 h-8 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
                      <p className="text-sm">正在解卦中...</p>
                    </div>
                  )}

                  {/* AI Magazine Result */}
                  {liuyaoAI && <MagazineResult text={liuyaoAI} />}

                  {/* Follow-up chat */}
                  {liuyaoAI && <ChatFollowUp context={liuyaoContext} onSend={handleFollowUp} />}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
