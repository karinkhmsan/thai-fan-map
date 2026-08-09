import { NextResponse } from "next/server";
import { deleteComment } from "@/lib/db.mjs";
import { getCurrentUser } from "@/lib/auth.mjs";

export async function DELETE(_req, { params }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });

  const isAdmin = user.role === "ADMIN";
  const event = await deleteComment(params.id, user.id, isAdmin);
  if (!event) {
    return NextResponse.json({ error: "ลบไม่ได้ (ไม่ใช่เจ้าของความคิดเห็นหรือไม่พบความคิดเห็นนี้)" }, { status: 403 });
  }
  return NextResponse.json({ event });
}
