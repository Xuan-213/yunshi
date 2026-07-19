import { NextRequest, NextResponse } from "next/server";
import { sqlite } from "@/lib/db";

export async function GET() {
  const rows = sqlite.prepare("SELECT * FROM birth_profiles ORDER BY id").all();
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const stmt = sqlite.prepare(
    `INSERT INTO birth_profiles (name, initial, color, year, month, day, hour, minute, gender, longitude, bazi_summary)
     VALUES (@name, @initial, @color, @year, @month, @day, @hour, @minute, @gender, @longitude, @baziSummary)`
  );
  const result = stmt.run({
    name: body.name, initial: body.name[0] || "?", color: body.color || "",
    year: body.year, month: body.month, day: body.day,
    hour: body.hour, minute: body.minute || 0,
    gender: body.gender, longitude: body.longitude || 120,
    baziSummary: body.baziSummary || "",
  });
  const row = sqlite.prepare("SELECT * FROM birth_profiles WHERE id = ?").get(result.lastInsertRowid);
  return NextResponse.json(row);
}

export async function DELETE(req: NextRequest) {
  const id = parseInt(req.nextUrl.searchParams.get("id") || "");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  sqlite.prepare("DELETE FROM birth_profiles WHERE id = ?").run(id);
  return NextResponse.json({ ok: true });
}
