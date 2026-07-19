import { NextRequest, NextResponse } from "next/server";
import { sqlite } from "@/lib/db";

export async function GET() {
  const rows = sqlite.prepare("SELECT * FROM divination_records ORDER BY id DESC LIMIT 50").all();
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const stmt = sqlite.prepare(
    `INSERT INTO divination_records (profile_id, mode, question, question_type, input, result)
     VALUES (@profileId, @mode, @question, @questionType, @input, @result)`
  );
  const result = stmt.run({
    profileId: body.profileId || null, mode: body.mode,
    question: body.question, questionType: body.questionType || "",
    input: JSON.stringify(body.input || {}), result: JSON.stringify(body.result || {}),
  });
  const row = sqlite.prepare("SELECT * FROM divination_records WHERE id = ?").get(result.lastInsertRowid);
  return NextResponse.json(row);
}
