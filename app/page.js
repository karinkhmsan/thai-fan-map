import { prisma } from "@/lib/prisma.mjs";
import HomeClient from "./HomeClient";

// ทำ Cache ข้อมูลไว้ 10 วินาที ช่วยลดภาระฐานข้อมูลและโหลดหน้านี้ได้เร็วมิลลิวินาที
export const revalidate = 10;

export default async function HomePage() {
  // ดึงเฉพาะข้อมูลที่ต้องใช้แสดงปักหมุด เพื่อลดขนาด Payload ที่ส่งมายัง Client
  const events = await prisma.event.findMany({
    select: {
      id: true,
      title: true,
      province: true,
      district: true,
      category: true,
      lat: true,
      lng: true,
      images: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return <HomeClient initialEvents={events} />;
}