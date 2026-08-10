import { NextResponse } from "next/server";
import { listProvinceStats } from "@/lib/db.mjs";

// StatsModal fetch("/api/stats") ไม่มี route นี้มาก่อน เลยไม่เคยได้ข้อมูลจังหวัดเลย
// listProvinceStats() มีอยู่แล้วใน lib/db.mjs แค่ไม่เคยถูกเรียกใช้จาก API ไหนเลย
export async function GET() {
  const provinces = await listProvinceStats();
  return NextResponse.json({ provinces });
}