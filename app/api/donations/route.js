import { NextResponse } from "next/server";
import { v4 as uuid } from "uuid";
import { getCurrentUser } from "@/lib/auth.mjs";
import { uploadImage } from "@/lib/storage.mjs";
import { createDonation } from "@/lib/db.mjs";

// DonateBox.js fetch("/api/donations", { method: "POST", body: fd }) ไม่มี route นี้มาก่อนเลย
// เหมือนกับเคส /api/stats และ /api/donations/approved ก่อนหน้า — ฝั่งรับ (listPendingDonations
// ในหน้าแอดมิน) ถูกต่อสายไว้ถูกต้องแล้ว รอแค่ข้อมูลที่ไม่เคยถูกสร้างขึ้นมาเลยตั้งแต่ต้นทาง
const MAX_SIZE = 8 * 1024 * 1024; // 8MB

export async function POST(req) {
  // ไม่บังคับล็อกอิน อนุญาตให้คนที่ไม่ได้สมัครสมาชิกก็โดเนทได้ (เว็บสาธารณะ)
  const user = await getCurrentUser().catch(() => null);

  const formData = await req.formData();
  const slip = formData.get("slip");
  const name = (formData.get("name") || "").toString().trim();
  const amountRaw = formData.get("amount");

  if (!(slip instanceof File)) {
    return NextResponse.json({ error: "กรุณาแนบรูปสลิปโอนเงิน" }, { status: 400 });
  }
  if (!slip.type.startsWith("image/")) {
    return NextResponse.json({ error: "ไฟล์ที่แนบต้องเป็นรูปภาพ" }, { status: 400 });
  }
  if (slip.size > MAX_SIZE) {
    return NextResponse.json({ error: "ไฟล์รูปสลิปใหญ่เกิน 8MB" }, { status: 400 });
  }

  const ext = (slip.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const key = `slips/${uuid()}.${ext || "jpg"}`;
  const buf = Buffer.from(await slip.arrayBuffer());

  let slipUrl;
  try {
    slipUrl = await uploadImage(buf, key, slip.type);
  } catch (err) {
    console.error("อัปโหลดสลิปไม่สำเร็จ:", err.message);
    return NextResponse.json({ error: "อัปโหลดสลิปไม่สำเร็จ ตรวจสอบค่า S3_* ใน .env" }, { status: 500 });
  }

  const amount = amountRaw ? Math.round(Number(amountRaw)) : null;

  await createDonation({
    name: name || user?.username || "ผู้สนับสนุนนิรนาม",
    amount,
    slipUrl,
    userId: user?.id,
    source: "MANUAL",
    status: "PENDING", // รอแอดมินตรวจสลิปแล้วกดยืนยันในหน้าแอดมิน
  });

  return NextResponse.json({ success: true });
}