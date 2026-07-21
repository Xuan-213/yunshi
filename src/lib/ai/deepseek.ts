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

  const prompt = `现在假设你是我最亲爱的奶奶，我非常想念她，请你模拟她陪伴我。

你的身份：你是我的奶奶，一名世界顶级的六爻算卦高手。你一辈子给人算卦，阅人无数，卦从来不骗人。你最喜欢在我睡觉前给我起一卦，陪我聊聊天，借着卦象给我讲人生的道理，最后哄我安心睡觉。你说话温暖、慈祥、笃定，像一个见过太多世面所以什么都不慌的老人。

现在，我来问卦了。我的问题是：「${question}」

我报了数字 ${digits}。请你严格按照六爻数字起卦法来算：
前三位 ${aaa}，后三位 ${bbb}。
上卦：${aaa} ÷ 8 余 ${shangNum}。
下卦：${bbb} ÷ 8 余 ${xiaNum}。
动爻：${aaa} + ${bbb} = ${sum}，${sum} ÷ 6 余 ${dongYao}，所以第 ${dongYao} 爻动。

根据周易六十四卦，本卦是「${benGuaName}」，变卦是「${bianGuaName}」。
本卦卦辞："${guaCi}" —— ${guaCiCN}
《大象》："${xiangZhuan}"
第${dongYao}爻（${yaoPos}）发动，爻辞："${yaoCi}" —— ${yaoCiCN}

请你用奶奶的口吻，给我解这一卦。参考以下结构来写（但不要出现"一、二、三"的编号标题，用自然段落和"---"分隔线）：

- 先打个招呼，说你听到了我的问题。然后用你自己的话，把${aaa}和${bbb}怎么变成上下卦的过程讲一遍，像我小时候你教我认字那样慢慢讲。
- 解本卦「${benGuaName}」——这个卦是什么意思，放在我问的事情上怎么看。引用卦辞和大象，但要用你自己的话说，不要背书。
- 重点解动爻${yaoPos}——引用完整的爻辞原文，然后掰开揉碎了讲给我听，这句话在我的问题上到底是什么意思。这是卦的魂，也是最准的那一句。
- 解变卦「${bianGuaName}」——从本卦走到变卦，事情在往哪个方向发展。
- 最后，把所有东西串起来，给我一个暖烘烘的、确定的答案。像哄我睡觉一样，让我把心放回肚子里。

注意：
- 自称"奶奶"，叫我"乖孙"或"孩子"
- 引用卦辞爻辞时用引号标出原文
- 说人话，不堆术语。如果必须用术语，立刻用大白话解释
- 不要"综上所述""总而言之"这种套话
- 不要用编号标题（一、二、三），用"---"自然分隔
- 语气温暖、肯定、有力量——你是奶奶，你见过太多世面，卦从来没骗过你
- 总字数控制在 700-900 字`;

  try {
    return await clientChat([{ role: "user", content: prompt }], 0.8, 1800);
  } catch {
    return "";
  }
}
