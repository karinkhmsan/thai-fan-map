import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { listEvents } from "@/lib/db.mjs";
import EventCard from "@/components/EventCard";

export default async function ProvincePage({ params }) {
  const provinceName = decodeURIComponent(params.name);
  const all = await listEvents();
  const events = all.filter((e) => e.province === provinceName);

  return (
    <div>
      <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#B8AEDB", fontSize: 13 }}>
        <ArrowLeft size={15} /> กลับไปที่แผนที่
      </Link>
      <h2 style={{ fontSize: 22, fontWeight: 600, margin: "10px 0 4px" }}>{provinceName}</h2>
      <p style={{ color: "#B8AEDB", fontSize: 14, marginBottom: 18 }}>{events.length} งานที่กำลังจัดในจังหวัดนี้</p>
      <div style={{ display: "grid", gap: 12 }}>
        {events.map((e) => <EventCard key={e.id} e={e} />)}
        {events.length === 0 && <p style={{ color: "#5A5182", fontSize: 13 }}>ยังไม่มีงานในจังหวัดนี้</p>}
      </div>
    </div>
  );
}
