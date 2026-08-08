import { NextResponse } from "next/server";
import { v4 as uuid } from "uuid";
import { listEvents, createEvent } from "@/lib/db.mjs";
import { getCurrentUser } from "@/lib/auth.mjs";

export async function GET() {
  const events = await listEvents();
  return NextResponse.json({ events });
}

export async function POST(req) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "กรุณาเข้าสู่ระบบก่อนโพสต์งาน" }, { status: 401 });
  }
  const body = await req.json();
  const { title, category, province, district, description, images } = body;

  if (!title?.trim() || !description?.trim() || !province) {
    return NextResponse.json({ error: "กรอกข้อมูลให้ครบ (ชื่องาน จังหวัด รายละเอียด)" }, { status: 400 });
  }

  const event = {
    id: uuid(),
    title: title.trim(),
    category: category || "other",
    province,
    district: district?.trim() || "",
    description: description.trim(),
    images: Array.isArray(images) ? images.slice(0, 6) : [],
    authorId: user.id,
    authorName: user.username,
    createdAt: new Date().toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" }),
    createdAtMs: Date.now(),
    comments: [],
  };
  await createEvent(event);
  return NextResponse.json({ event });
}
