import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma.mjs";

// ค้นหาแบบเบา: กรองที่ฐานข้อมูลด้วย SQL WHERE + จำกัดผลลัพธ์ แทนการโหลดโพสต์ทั้งเว็บ
// มาก search ฝั่ง client ทุกครั้งที่พิมพ์ (ที่ทำให้ช้าเดิม)
export async function GET(req) {
  const q = new URL(req.url).searchParams.get("q")?.trim() || "";
  if (!q) return NextResponse.json({ events: [] });

  const events = await prisma.event.findMany({
    where: {
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { province: { contains: q, mode: "insensitive" } },
        { district: { contains: q, mode: "insensitive" } },
      ],
    },
    select: { id: true, title: true, province: true, district: true },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  return NextResponse.json({ events });
}