// ====== Diary API ======

import { NextRequest, NextResponse } from "next/server";
import * as repo from "@/lib/api/repository";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const profileId = searchParams.get("profileId");

    if (!profileId) {
      return NextResponse.json({ error: "profileId is required" }, { status: 400 });
    }

    const entries = await repo.getDiariesByProfile(Number(profileId));
    return NextResponse.json(entries);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const entry = await repo.createDiary(body);
    return NextResponse.json(entry, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
