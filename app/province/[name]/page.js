import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { listEventsLight, attachLikedFlag } from "@/lib/db.mjs";
import { getCurrentUser } from "@/lib/auth.mjs";
import EventCard from "@/components/EventCard";

// หมายเหตุ: ฝัง isLiked ของผู้ใช้ปัจจุบันมากับโพสต์ตั้งแต่ฝั่ง server เลย (query เดียวรวด)
// แทนที่จะปล่อยให้ EventCard แต่ละใบยิง fetch เช็คสถานะไลค์ทีละใบ (เดิมคือสาเหตุหลักที่หน้านี้ช้า)
export default async function ProvincePage({ params }) {
  const provinceName = decodeURIComponent(params.name);
  // กรองที่ฐานข้อมูลเลยด้วย province แทนการโหลดโพสต์ทั้งเว็บมากรองทีหลัง
  const [events, user] = await Promise.all([
    listEventsLight({ province: provinceName }),
    getCurrentUser(),
  ]);
  const eventsWithLiked = await attachLikedFlag(events, user?.id);

  return (
    <div>
      <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#AEB8E0", fontSize: 13 }}>
        <ArrowLeft size={15} /> กลับไปที่แผนที่
      </Link>
      <h2 style={{ fontSize: 22, fontWeight: 600, margin: "10px 0 4px" }}>{provinceName}</h2>
      <p style={{ color: "#AEB8E0", fontSize: 14, marginBottom: 18 }}>{eventsWithLiked.length} งานที่กำลังจัดในจังหวัดนี้</p>
      <div style={{ display: "grid", gap: 12 }}>
        {eventsWithLiked.map((e) => <EventCard key={e.id} e={e} />)}
        {eventsWithLiked.length === 0 && <p style={{ color: "#565C99", fontSize: 13 }}>ยังไม่มีงานในจังหวัดนี้</p>}
      </div>
    </div>
  );
}