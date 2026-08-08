"use client";
import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { CATEGORIES, catInfo } from "@/lib/categories";

const ThailandMap = dynamic(() => import("@/components/ThailandMap"), { ssr: false });

export default function HomeClient({ initialEvents }) {
  const [catFilter, setCatFilter] = useState("all");
  const router = useRouter();

  const eventsByProvince = useMemo(() => {
    const map = {};
    initialEvents
      .filter((e) => catFilter === "all" || e.category === catFilter)
      .forEach((e) => {
        (map[e.province] = map[e.province] || []).push(e);
      });
    return map;
  }, [initialEvents, catFilter]);

  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <h1 style={{ fontSize: 26, fontWeight: 600, margin: "0 0 4px" }}>แผนที่งานแฟนคลับทั่วไทย</h1>
        <p style={{ color: "#B8AEDB", fontSize: 14, margin: 0 }}>คลิกจังหวัดหรือหมุดเพื่อดูงานเกมและงานคอสเพลย์ในพื้นที่นั้นๆ</p>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <button
          className={`chip ${catFilter === "all" ? "active" : ""}`}
          onClick={() => setCatFilter("all")}
          style={{
            borderColor: catFilter === "all" ? "#7F77DD" : undefined,
            background: catFilter === "all" ? "#7F77DD22" : undefined,
            color: catFilter === "all" ? "#7F77DD" : undefined,
          }}
        >
          ทั้งหมด
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            className={`chip ${catFilter === c.id ? "active" : ""}`}
            onClick={() => setCatFilter(c.id)}
            style={{
              borderColor: catFilter === c.id ? c.color : undefined,
              background: catFilter === c.id ? c.color + "22" : undefined,
              color: catFilter === c.id ? c.color : undefined,
            }}
          >
            {c.label}
          </button>
        ))}
      </div>

      <ThailandMap
        eventsByProvince={eventsByProvince}
        catColor={(id) => catInfo(id).color}
        onPinClick={(name) => router.push(`/province/${encodeURIComponent(name)}`)}
      />

      <div style={{ marginTop: 22 }}>
        <h3 style={{ fontSize: 15, color: "#B8AEDB", fontWeight: 500, marginBottom: 10 }}>
          จังหวัดที่มีงาน ({Object.keys(eventsByProvince).length})
        </h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {Object.entries(eventsByProvince).map(([name, evs]) => (
            <button key={name} onClick={() => router.push(`/province/${encodeURIComponent(name)}`)} className="chip">
              {name} · {evs.length}
            </button>
          ))}
          {Object.keys(eventsByProvince).length === 0 && (
            <p style={{ color: "#5A5182", fontSize: 13 }}>ยังไม่มีงานในหมวดนี้ ลองเป็นคนแรกที่โพสต์งานดูสิ!</p>
          )}
        </div>
      </div>
    </div>
  );
}