import { NextRequest, NextResponse } from "next/server";
import { sqlite } from "@/lib/db";

export async function GET() {
  const rows = sqlite.prepare("SELECT * FROM diary_entries ORDER BY id DESC LIMIT 50").all();
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const stmt = sqlite.prepare(
    `INSERT INTO diary_entries (profile_id, period, content)
     VALUES (@profileId, @period, @content)`
  );
  const result = stmt.run({
    profileId: body.profileId || null, period: body.period, content: body.content,
  });
  const row = sqlite.prepare("SELECT * FROM diary_entries WHERE id = ?").get(result.lastInsertRowid);
  return NextResponse.json(row);
}
