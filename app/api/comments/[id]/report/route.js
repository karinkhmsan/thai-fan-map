import { NextResponse } from "next/server";
import { reportComment } from "@/lib/db.mjs";
import { getCurrentUser } from "@/lib/auth.mjs";

export async function POST(_req, { params }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "กรุณาเข้าสู่ระบบก่อนรายงาน" }, { status: 401 });

  const result = await reportComment(params.id, user.id);
  if (!result) return NextResponse.json({ error: "ไม่พบความคิดเห็นนี้" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
