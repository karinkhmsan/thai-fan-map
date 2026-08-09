import { NextResponse } from "next/server";
import { createDonation } from "@/lib/db.mjs";

// Webhook รับแจ้งจาก EasyDonate เมื่อมีคนโอนเงินจริงและ EasyDonate ยืนยันแล้ว
// เอา URL นี้ (พร้อม ?secret=...) ไปวางใน EasyDonate Developer Zone ช่อง "Webhook URL"
// ตัวอย่าง: https://thai-fan-map.vercel.app/api/webhook/easydonate?secret=xxxxxxxx
//
// ต้องตั้งค่า ENV ตัวใหม่ใน Vercel ชื่อ EASYDONATE_WEBHOOK_SECRET (ตั้งเป็นค่าอะไรก็ได้ที่คาดเดายาก)
// แล้วเอาค่าเดียวกันไปใส่ต่อท้าย ?secret= ใน URL ที่วางใน EasyDonate กันคนอื่นยิงข้อมูลปลอมเข้ามา
export async function POST(req) {
  const secret = new URL(req.url).searchParams.get("secret");
  if (!process.env.EASYDONATE_WEBHOOK_SECRET || secret !== process.env.EASYDONATE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  // รูปแบบ field จาก EasyDonate อาจต่างกันไปตามเวอร์ชัน เผื่อไว้หลายชื่อ
  const name =
    body.name || body.donorName || body.from || body.donator_name || "ผู้สนับสนุนนิรนาม";
  const amountRaw = body.amount ?? body.price ?? body.total ?? body.donation_amount;
  const amount = amountRaw ? Math.round(Number(amountRaw)) : null;
  const message = body.message || body.comment || body.detail || null;

  // มาจาก webhook ที่ยืนยันตัวตนด้วย secret แล้ว และ EasyDonate เช็คการโอนจริงมาให้แล้ว
  // เลยตั้งสถานะ APPROVED ได้เลยทันที ไม่ต้องรอแอดมินกดยืนยันเหมือนทางแนบสลิปเอง
  await createDonation({ name, amount, message, source: "EASYDONATE", status: "APPROVED" });

  return NextResponse.json({ success: true });
}