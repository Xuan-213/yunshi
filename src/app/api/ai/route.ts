// ====== AI Proxy API (DeepSeek) ======

import { NextRequest, NextResponse } from "next/server";

const DEEPSEEK_API = "https://api.deepseek.com/v1/chat/completions";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

async function deepseekChat(messages: ChatMessage[], temp = 0.8, maxTokens = 2048): Promise<string> {
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) throw new Error("DEEPSEEK_API_KEY not configured on server");

  const res = await fetch(DEEPSEEK_API, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
    body: JSON.stringify({ model: "deepseek-chat", messages, temperature: temp, max_tokens: maxTokens }),
  });
  if (!res.ok) throw new Error(`DeepSeek API ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.choices[0].message.content;
}

/** Generic chat: { messages: [{ role, content }], temp?, maxTokens? } */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...payload } = body;

    switch (action) {
      case "chat": {
        const { messages, temp, maxTokens } = payload;
        const result = await deepseekChat(messages, temp, maxTokens);
        return NextResponse.json({ content: result });
      }
      case "liuyao": {
        // Build the interpretation prompt server-side, then call DeepSeek
        const {
          question, digits, shangNum, xiaNum, dongYao,
          benGuaName, bianGuaName, guaCi, guaCiCN, xiangZhuan,
          yaoPos, yaoCi, yaoCiCN,
        } = payload;

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

        const result = await deepseekChat([{ role: "user", content: prompt }], 0.8, 1800);
        return NextResponse.json({ content: result });
      }
      case "followup": {
        const { question, result: contextResult, messages: msgs } = payload;
        const systemMsg = "你是一位精通周易六爻的解卦师。之前你为用户做了一次六爻占卜解读。现在用户在追问。请根据之前的解卦内容回答追问。保持专业、清晰。";
        const chatMessages: ChatMessage[] = [
          { role: "system", content: systemMsg },
          { role: "user", content: `之前的问题：「${question}」\n之前的解卦结果：${contextResult.slice(0, 2000)}` },
          { role: "assistant", content: "好的，我已经了解了之前的解卦内容。请问有什么想进一步了解的？" },
          ...msgs.map((m: any) => ({ role: m.role as "user" | "assistant", content: m.content })),
        ];
        const result = await deepseekChat(chatMessages, 0.7, 800);
        return NextResponse.json({ content: result });
      }
      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
