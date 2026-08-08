import { NextResponse } from "next/server";
import { v4 as uuid } from "uuid";
import { addComment } from "@/lib/db.mjs";
import { getCurrentUser } from "@/lib/auth.mjs";

export async function POST(req, { params }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "กรุณาเข้าสู่ระบบก่อนคอมเมนต์" }, { status: 401 });
  const { text } = await req.json();
  if (!text?.trim()) return NextResponse.json({ error: "พิมพ์ข้อความก่อนส่ง" }, { status: 400 });

  const comment = {
    id: uuid(),
    authorId: user.id,
    authorName: user.username,
    text: text.trim(),
    createdAt: new Date().toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" }),
  };
  const event = await addComment(params.id, comment);
  if (!event) return NextResponse.json({ error: "ไม่พบโพสต์นี้" }, { status: 404 });
  return NextResponse.json({ event });
}
