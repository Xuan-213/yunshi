// ====== Profile [id] API ======

import { NextRequest, NextResponse } from "next/server";
import * as repo from "@/lib/api/repository";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const profile = await repo.updateProfile(Number(id), body);
    if (!profile) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(profile);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await repo.deleteProfile(Number(id));
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
