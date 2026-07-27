// ====== DeepSeek AI 客户端 ======

interface ChatMessage { role: "system" | "user" | "assistant"; content: string; }

function getKey(): string {
  if (typeof window !== "undefined") return localStorage.getItem("ds_key") || "";
  return process.env.DEEPSEEK_API_KEY || "";
}

/** 直接调 DeepSeek API */
export async function clientChat(messages: ChatMessage[], temp = 0.8, maxTokens = 2048): Promise<string> {
  const key = getKey();
  if (!key) throw new Error("No API key");
  const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
    body: JSON.stringify({ model: "deepseek-chat", messages, temperature: temp, max_tokens: maxTokens }),
  });
  if (!res.ok) throw new Error(`DeepSeek ${res.status}`);
  const data = await res.json();
  return data.choices[0].message.content;
}

/** AI 六爻叙事解卦 */
export async function aiLiuyaoInterpret(
  question: string, digits: string, shangNum: number, xiaNum: number, dongYao: number,
  benGuaName: string, bianGuaName: string,
  guaCi: string, guaCiCN: string, xiangZhuan: string,
  yaoPos: string, yaoCi: string, yaoCiCN: string,
): Promise<string> {
  const res = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "liuyao",
      question, digits, shangNum, xiaNum, dongYao,
      benGuaName, bianGuaName, guaCi, guaCiCN, xiangZhuan,
      yaoPos, yaoCi, yaoCiCN,
    }),
  });
  if (!res.ok) return "";
  const data = await res.json();
  return data.content || "";
}

/** 追问对话 */
export async function aiFollowUp(
  context: { question: string; result: string },
  messages: { role: "user" | "assistant"; content: string }[],
): Promise<string> {
  const res = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "followup", question: context.question, result: context.result, messages }),
  });
  if (!res.ok) throw new Error(`AI API ${res.status}`);
  const data = await res.json();
  return data.content;
}

/** AI 日运生成 */
export async function aiDailyFortune(
  baziSummary: string, dayGanZhi: string, lunarDate: string,
  dimensions: string, userFeedback?: string,
): Promise<{ score: number; scoreLabel: string; tags: string; metaphor: string; analysis: string; advice: string }> {
  const fbLine = userFeedback ? `\n用户反馈：${userFeedback}\n请根据反馈调整解读。` : "";
  const prompt = `你是资深八字命理师。请严格基于以下数据生成今日运势。不要套用模板，每次输出都应是独一无二的分析。

【命盘数据】
${baziSummary}

【今日数据】
干支：${dayGanZhi}（${lunarDate}）
十神分布：${dimensions}

${fbLine}

【你需要做的分析】（不是填写模板，而是真正算）
1. 日主五行是什么？今日干支的五行是什么？生克关系是什么？
2. 今日天干与四柱各天干产生什么十神关系？
3. 今日地支与原局地支有无冲合刑害？
4. 当前大运是什么？与今日干支有无特殊关系？
5. 根据以上分析，今日日主旺衰如何变化？用神是否得力？

【输出格式】JSON（不要markdown代码块）：
{
  "score": 1-5的数字（基于五行生克判断，不是拍脑袋）,
  "scoreLabel": "上上/中上/中等/中下/下",
  "tags": ["核心运势标签", "次要标签"],
  "metaphor": "一段生动的比喻，把今日核心的五行生克关系转化为生活场景，60-100字",
  "analysis": "将上述5条命理分析用人话讲出来——日主与流日的关系、对情绪和决策的实质影响，100-140字",
  "advice": "基于analysis的2-3条具体建议，每条不超过20字"
}

关键：metaphor必须紧扣今日实际的五行生克关系，不能泛泛而谈。analysis必须引用具体的干支和十神关系，不能是\"运势平稳\"这种废话。`;

  try {
    const raw = await clientChat([{ role: "user", content: prompt }], 0.85, 800);
    return JSON.parse(raw.replace(/```json\n?|```/g, "").trim());
  } catch { return { score: 3, scoreLabel: "中等", tags: "[\"平稳\"]", metaphor: "", analysis: "", advice: "" }; }
}

/** AI 单一维度解读 */
export async function aiDimensionFortune(
  dim: string, baziSummary: string, dayGanZhi: string, userFeedback?: string,
): Promise<{ analysis: string; tip: string }> {
  const fbLine = userFeedback ? `\n用户反馈：${userFeedback}\n请根据反馈调整解读。` : "";
  const prompt = `你是一位资深八字命理师。请根据命盘和今日干支，分析${dim}运势。

八字：${baziSummary}
今日：${dayGanZhi}${fbLine}

请用JSON返回（不要markdown）：
{
  "analysis": "80-120字的${dim}运势分析，具体到日主与流日的关系，不要模板化套话",
  "tip": "一句实用的今日${dim}建议（15字以内）"
}`;
  try {
    const raw = await clientChat([{ role: "user", content: prompt }], 0.7, 400);
    return JSON.parse(raw.replace(/```json\n?|```/g, "").trim());
  } catch { return { analysis: "", tip: "" }; }
}
