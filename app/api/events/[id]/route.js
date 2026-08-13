import { NextResponse } from "next/server";
import { getEvent, deleteEvent, updateEvent, getLikeInfo } from "@/lib/db.mjs";
import { getCurrentUser } from "@/lib/auth.mjs";

export async function GET(_req, { params }) {
  const event = await getEvent(params.id);
  if (!event) return NextResponse.json({ error: "ไม่พบโพสต์นี้" }, { status: 404 });
  const user = await getCurrentUser();
  const { liked } = await getLikeInfo(params.id, user?.id);
  return NextResponse.json({ event: { ...event, isLiked: liked } });
}

export async function PATCH(req, { params }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  const body = await req.json();
  const updated = await updateEvent(params.id, user.id, body);
  if (!updated) return NextResponse.json({ error: "แก้ไขไม่ได้ (ไม่ใช่เจ้าของโพสต์หรือไม่พบโพสต์)" }, { status: 403 });
  return NextResponse.json({ event: updated });
}

export async function DELETE(_req, { params }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  const ok = await deleteEvent(params.id, user.id);
  if (!ok) return NextResponse.json({ error: "ลบไม่ได้ (ไม่ใช่เจ้าของโพสต์หรือไม่พบโพสต์)" }, { status: 403 });
  return NextResponse.json({ ok: true });
}