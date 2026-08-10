import { NextResponse } from "next/server";
import { listProvinceStats } from "@/lib/db.mjs";

// สำคัญ: ถ้าไม่มีบรรทัดนี้ Next.js จะมองว่า route นี้ไม่มีอะไร dynamic
// เลย optimize เป็น static แล้ว cache ผลลัพธ์ไว้ตั้งแต่ตอน build/deploy ครั้งแรก
// ทำให้ Vercel ตอบ 304 (ใช้ของแคชเดิม) ตลอด ต่อให้ข้อมูลใน DB เปลี่ยนไปแล้วก็ตาม
export const dynamic = "force-dynamic";

// StatsModal fetch("/api/stats") ไม่มี route นี้มาก่อน เลยไม่เคยได้ข้อมูลจังหวัดเลย
// listProvinceStats() มีอยู่แล้วใน lib/db.mjs แค่ไม่เคยถูกเรียกใช้จาก API ไหนเลย
export async function GET() {
  const provinces = await listProvinceStats();
  return NextResponse.json({ provinces });
}