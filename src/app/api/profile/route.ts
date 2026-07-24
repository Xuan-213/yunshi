// ====== Profile API ======

import { NextRequest, NextResponse } from "next/server";
import * as repo from "@/lib/api/repository";

export async function GET() {
  try {
    const profiles = await repo.getAllProfiles();
    return NextResponse.json(profiles);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const profile = await repo.createProfile(body);
    return NextResponse.json(profile, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
