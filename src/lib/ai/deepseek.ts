// ====== DeepSeek AI Service ======

const DEEPSEEK_API = "https://api.deepseek.com/v1/chat/completions";
const API_KEY = process.env.DEEPSEEK_API_KEY || "";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function chat(messages: ChatMessage[], options?: { temperature?: number; maxTokens?: number }) {
  const res = await fetch(DEEPSEEK_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 1024,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`DeepSeek API error (${res.status}): ${err}`);
  }

  const data = await res.json();
  return data.choices[0].message.content as string;
}

/** 增强梅花易数解读 */
export async function enhanceMeihuaReading(question: string, result: any): Promise<string> {
  const prompt = `你是一位精通梅花易数的命理师。请根据以下卦象结果，为用户的问题提供一段白话解读（200字以内）。

用户问题：${question}
本卦：${result.benGua?.name}
互卦：${result.huGua?.name || "无"}
变卦：${result.bianGua?.name}
体用关系：${result.tiYong?.relation}
体卦：${result.tiYong?.ti?.gua}（${result.tiYong?.ti?.wx}）
用卦：${result.tiYong?.yong?.gua}（${result.tiYong?.yong?.wx}）

请用通俗易懂的中文解释这个卦象对用户问题的含义，给出实用建议。不要堆砌术语。`;

  try {
    return await chat([{ role: "user", content: prompt }], { temperature: 0.5, maxTokens: 512 });
  } catch {
    return result.tiYong?.verdict || "需要结合具体卦象分析。";
  }
}

/** 增强六爻解读 */
export async function enhanceLiuyaoReading(question: string, questionType: string, result: any): Promise<string> {
  const prompt = `你是一位精通六爻纳甲的命理师。请根据以下装卦结果，为用户的问题提供一段白话解读（200字以内）。

用户问题：${question}
问题类型：${questionType}
本卦：${result.benGuaName}
变卦：${result.bianGuaName}
卦宫：${result.gongName}
用神：${result.yongShen?.liuQin}爻（${result.yongShen?.position}）
原神：${result.yuanShen}
忌神：${result.jiShen}
世爻位置：第${result.shiYaoPos}爻

请用通俗易懂的中文给出吉凶判断和行动建议。不要堆砌术语。`;

  try {
    return await chat([{ role: "user", content: prompt }], { temperature: 0.5, maxTokens: 512 });
  } catch {
    return "需要结合具体卦象分析。建议回顾卦辞含义或稍后再试。";
  }
}

/** 增强日运解读 */
export async function enhanceFortuneReading(metaphor: string, plain: string, dayGanZhi: string): Promise<string> {
  const prompt = `你是一位命理师。以下是一段今日运势的解读，请用更生动自然的中文改写，保持原意但让表达更优美、更有人情味（150字以内）。

原比喻：${metaphor}
原解读：${plain}
今日干支：${dayGanZhi}

请输出改写后的运势解读：`;

  try {
    return await chat([{ role: "user", content: prompt }], { temperature: 0.6, maxTokens: 400 });
  } catch {
    return plain;
  }
}
