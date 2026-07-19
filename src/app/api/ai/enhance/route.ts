import { NextRequest, NextResponse } from "next/server";
import { enhanceMeihuaReading, enhanceLiuyaoReading } from "@/lib/ai/deepseek";

export async function POST(req: NextRequest) {
  const { mode, question, questionType, result } = await req.json();

  try {
    let text: string;
    if (mode === "meihua") {
      text = await enhanceMeihuaReading(question, result);
    } else if (mode === "liuyao") {
      text = await enhanceLiuyaoReading(question, questionType, result);
    } else {
      return NextResponse.json({ error: "Unknown mode" }, { status: 400 });
    }
    return NextResponse.json({ text });
  } catch (e: any) {
    console.error("AI enhance error:", e.message);
    return NextResponse.json({ text: "", error: e.message }, { status: 500 });
  }
}
