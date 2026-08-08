import { NextResponse } from "next/server";
import { v4 as uuid } from "uuid";
import { getCurrentUser } from "@/lib/auth.mjs";
import { uploadImage } from "@/lib/storage.mjs";

const MAX_FILES = 6;
const MAX_SIZE = 8 * 1024 * 1024; // 8MB ต่อรูป

export async function POST(req) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "กรุณาเข้าสู่ระบบก่อนอัปโหลดรูป" }, { status: 401 });

  const formData = await req.formData();
  const files = formData.getAll("images").slice(0, MAX_FILES);

  const urls = [];
  for (const file of files) {
    if (!(file instanceof File)) continue;
    if (!file.type.startsWith("image/")) continue;
    if (file.size > MAX_SIZE) continue;
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
    const key = `events/${uuid()}.${ext || "jpg"}`;
    const buf = Buffer.from(await file.arrayBuffer());
    try {
      const url = await uploadImage(buf, key, file.type);
      urls.push(url);
    } catch (err) {
      console.error("อัปโหลดรูปไม่สำเร็จ:", err.message);
      return NextResponse.json({ error: "อัปโหลดรูปไม่สำเร็จ ตรวจสอบค่า S3_* ใน .env" }, { status: 500 });
    }
  }
  return NextResponse.json({ urls });
}
