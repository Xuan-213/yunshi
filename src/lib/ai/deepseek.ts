// ====== DeepSeek AI 客户端 ======

const DEEPSEEK_API = "https://api.deepseek.com/v1/chat/completions";

interface ChatMessage { role: "system" | "user" | "assistant"; content: string; }

/** 调用 DeepSeek chat API */
async function chat(messages: ChatMessage[], temp = 0.8, maxTokens = 2048): Promise<string> {
  const key = typeof window !== "undefined" ? "" : process.env.DEEPSEEK_API_KEY || "";
  if (!key && typeof window === "undefined") throw new Error("No API key");

  const res = await fetch(DEEPSEEK_API, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key || (typeof window !== "undefined" ? (window as any).__DS_KEY : "")}` },
    body: JSON.stringify({ model: "deepseek-chat", messages, temperature: temp, max_tokens: maxTokens }),
  });
  if (!res.ok) throw new Error(`DeepSeek API ${res.status}`);
  const data = await res.json();
  return data.choices[0].message.content;
}

function getKey(): string {
  if (typeof window !== "undefined") return localStorage.getItem("ds_key") || "";
  return process.env.DEEPSEEK_API_KEY || "";
}

/** 客户端调用 DeepSeek */
export async function clientChat(messages: ChatMessage[], temp = 0.8, maxTokens = 2048): Promise<string> {
  const key = getKey();
  if (!key) throw new Error("No API key configured");
  const res = await fetch(DEEPSEEK_API, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
    body: JSON.stringify({ model: "deepseek-chat", messages, temperature: temp, max_tokens: maxTokens }),
  });
  if (!res.ok) throw new Error(`DeepSeek API ${res.status}`);
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
  const aaa = digits.slice(0, 3);
  const bbb = digits.slice(3, 6);
  const sum = parseInt(aaa) + parseInt(bbb);

  const prompt = `你是一位精通周易六爻的解卦师。请根据以下起卦结果，为提问者提供一份专业、清晰的解卦分析。

提问：「${question}」
报数：${digits}

起卦过程：
- 前三位 ${aaa} → ${aaa} ÷ 8 余 ${shangNum} → 上卦
- 后三位 ${bbb} → ${bbb} ÷ 8 余 ${xiaNum} → 下卦
- ${aaa} + ${bbb} = ${sum} → ${sum} ÷ 6 余 ${dongYao} → 第 ${dongYao} 爻动
- 本卦：「${benGuaName}」  变卦：「${bianGuaName}」

本卦卦辞："${guaCi}" —— ${guaCiCN}
《大象》："${xiangZhuan}"
动爻 ${yaoPos} 爻辞："${yaoCi}" —— ${yaoCiCN}

请按以下结构撰写解卦分析（用"---"分隔各部分，不要编号标题）：

- 排卦简述：用简洁的语言说明数字如何得出本卦和变卦。上卦下卦各是什么、象征什么。
- 本卦分析「${benGuaName}」：解释本卦的核心含义，说明卦辞在提问者的问题上如何理解。引用原文。
- 动爻精解${yaoPos}：这是最关键的部分。逐字解释爻辞原文，然后具体应用于提问者的情境。讲清楚这一爻在说什么。
- 变卦走向「${bianGuaName}」：从本卦到变卦的变化意味着什么趋势。
- 综合判断：用一两段话给出整体结论，不模棱两可。

注意：
- 语言专业但不学究，清晰但不生硬
- 引用原文用引号
- 不使用"综上所述""总而言之"
- 700-900 字
- 不要拟人化，不要用"奶奶""乖孙""孩子"等称呼`;

  try {
    return await clientChat([{ role: "user", content: prompt }], 0.8, 1800);
  } catch {
    return "";
  }
}

/** 追问对话 */
export async function aiFollowUp(
  context: { question: string; result: string },
  messages: { role: "user" | "assistant"; content: string }[],
): Promise<string> {
  const systemMsg = `你是一位精通周易六爻的解卦师。之前你为用户做了一次六爻占卜解读。现在用户在追问。请根据之前的解卦内容回答追问。保持专业、清晰。`;
  const chatMessages: ChatMessage[] = [
    { role: "system", content: systemMsg },
    { role: "user", content: `之前的问题：「${context.question}」\n之前的解卦结果：${context.result.slice(0, 2000)}` },
    { role: "assistant", content: "好的，我已经了解了之前的解卦内容。请问有什么想进一步了解的？" },
    ...messages.map(m => ({ role: m.role as "user" | "assistant", content: m.content })),
  ];
  return clientChat(chatMessages, 0.7, 800);
}
