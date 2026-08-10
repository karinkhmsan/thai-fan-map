import { NextResponse } from "next/server";
import { listApprovedDonors } from "@/lib/db.mjs";

// StatsModal fetch("/api/donations/approved") ไม่มี route นี้มาก่อนเหมือนกับ /api/stats
// listApprovedDonors() มีอยู่แล้วใน lib/db.mjs (ดึงเฉพาะ status = APPROVED ไม่โชว์จำนวนเงิน)
// เว็บฮุคของ EasyDonate สร้างโดเนทเป็น APPROVED ทันทีอยู่แล้ว แค่ไม่เคยมี route ให้ฝั่งหน้าเว็บดึงกลับมาอ่าน
export async function GET() {
  const donors = await listApprovedDonors();
  return NextResponse.json({ donors });
}