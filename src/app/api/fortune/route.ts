// ====== Daily Fortune API ======

import { NextRequest, NextResponse } from "next/server";
import * as repo from "@/lib/api/repository";
import { calculateDayFortune } from "@/lib/bazi/riYun";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const profileId = searchParams.get("profileId");
    const dateStr = searchParams.get("date"); // optional: YYYY-MM-DD

    if (!profileId) {
      return NextResponse.json({ error: "profileId is required" }, { status: 400 });
    }

    const profile = await repo.getProfileById(Number(profileId));
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    let date: { year: number; month: number; day: number } | undefined;
    if (dateStr) {
      const [y, m, d] = dateStr.split("-").map(Number);
      date = { year: y, month: m, day: d };
    }

    const fortune = calculateDayFortune({
      year: profile.year,
      month: profile.month,
      day: profile.day,
      hour: profile.hour,
      minute: profile.minute || 0,
      gender: profile.gender as "male" | "female",
      longitude: profile.longitude || 120,
    }, date);

    return NextResponse.json(fortune);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
