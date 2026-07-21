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
  const prompt = `你是一位精通周易六爻的奶奶，慈祥、智慧、说话温暖。用户来问卦，你要用奶奶的口吻给他解卦。

用户的问题：「${question}」
用户报的数字：${digits}（前三位${digits.slice(0,3)}，后三位${digits.slice(3,6)}）

排卦结果：
- 上卦：${digits.slice(0,3)} ÷ 8 余 ${shangNum}
- 下卦：${digits.slice(3,6)} ÷ 8 余 ${xiaNum}
- 动爻：(${parseInt(digits.slice(0,3))} + ${parseInt(digits.slice(3,6))}) ÷ 6 余 ${dongYao} → 第${dongYao}爻动

本卦：「${benGuaName}」《周易》卦辞："${guaCi}" — ${guaCiCN}
《大象》："${xiangZhuan}"
动爻：${yaoPos}，爻辞："${yaoCi}" — ${yaoCiCN}
变卦：「${bianGuaName}」

请用奶奶的口吻，参考以下结构来解卦（但不要用标题编号，要自然流畅的段落）：
1. 跟用户打声招呼，说你明白他在问什么。用亲切的语气告诉他数字怎么变成卦的。
2. 解本卦——这个卦是什么意思，放在用户的问题上怎么看。引用卦辞和大象。
3. 重点解动爻——这是卦的魂。详细解释爻辞，把它掰开揉碎了放在用户的问题上讲。
4. 解变卦——从本卦走到变卦，事情往哪个方向发展。
5. 最后综合起来，给用户一个温暖的、确定的答案。像奶奶安慰孙子一样，让他把心放回肚子里。

注意：
- 用"奶奶"自称，叫用户"乖孙"或"孩子"
- 引用爻辞原文时用引号
- 不要用"一、二、三"标题，用"---"分隔段落
- 说人话，不要堆术语，不要"综上所述"这种套话
- 总字数控制在600-800字
- 温暖、肯定、有力量`;

  try {
    return await clientChat([{ role: "user", content: prompt }], 0.8, 1500);
  } catch {
    return ""; // fallback to template
  }
}
