"use client";
import Link from "next/link";
import { Image as ImageIcon, MapPin } from "lucide-react";
import { catInfo } from "@/lib/categories";

export default function EventCard({ e }) {
  const cat = catInfo(e.category);

  return (
    <Link href={`/event/${e.id}`} className="card" style={{ padding: 14, display: "flex", gap: 12, textDecoration: "none", color: "inherit" }}>
      <div style={{ width: 72, height: 72, borderRadius: 12, flexShrink: 0, background: e.images[0] ? `url(${e.images[0]}) center/cover` : "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {!e.images[0] && <ImageIcon size={22} color="#5A5182" />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 999, background: cat.color + "22", color: cat.color }}>{cat.label}</span>
            <span style={{ fontSize: 12, color: "#5A5182" }}>{e.createdAt}</span>
          </div>

          {/* ปุ่มกดไปโปรไฟล์ผู้โพสต์ */}
          {e.authorId && (
            <span
              onClick={(event) => {
                event.preventDefault(); // ป้องกันไม่ให้เด้งไปหน้าโพสต์
                event.stopPropagation();
                window.location.href = `/profile/${e.authorId}`;
              }}
              style={{ fontSize: 12, color: "#FFC145", cursor: "pointer" }}
            >
              โดย {e.authorName || e.author?.username}
            </span>
          )}
        </div>

        <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.title}</div>
        <div style={{ fontSize: 13, color: "#B8AEDB", display: "flex", alignItems: "center", gap: 4 }}>
          <MapPin size={12} /> {e.district ? `${e.district}, ` : ""}{e.province}
        </div>
      </div>
    </Link>
  );
}