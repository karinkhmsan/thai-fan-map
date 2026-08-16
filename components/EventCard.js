"use client";
import { useState } from "react";
import Link from "next/link";
import { Image as ImageIcon, MapPin, Heart } from "lucide-react";
import { catInfo } from "@/lib/categories";

export default function EventCard({ e }) {
  const cat = catInfo(e.category);
  // สถานะไลค์ฝังมาจาก server ตั้งแต่แรกแล้ว (ดู attachLikedFlag ในหน้าที่เรียกใช้ EventCard)
  // ไม่ต้องยิง fetch เช็คทีละการ์ดอีกต่อไป — เดิมทำให้หน้าที่มีหลายโพสต์ยิง request พร้อมกันเป็นสิบๆ ครั้งจนช้า
  const [liked, setLiked] = useState(!!e.isLiked);
  const [likeCount, setLikeCount] = useState(e.likeCount ?? 0);

  const toggleLike = async (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    setLiked((v) => !v);
    setLikeCount((c) => c + (liked ? -1 : 1));
    try {
      const res = await fetch(`/api/events/${e.id}/like`, { method: "POST" });
      if (res.status === 401) { window.location.href = "/login"; return; }
      const data = await res.json();
      if (typeof data.liked === "boolean") setLiked(data.liked);
      if (typeof data.count === "number") setLikeCount(data.count);
    } catch {
      setLiked((v) => !v);
      setLikeCount((c) => c + (liked ? 1 : -1));
    }
  };

  return (
    <Link href={`/event/${e.id}`} className="card" style={{ padding: 14, display: "flex", gap: 12, textDecoration: "none", color: "inherit" }}>
      <div style={{ width: 72, height: 72, borderRadius: 12, flexShrink: 0, background: e.images[0] ? `url(${e.images[0]}) center/cover` : "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {!e.images[0] && <ImageIcon size={22} color="#565C99" />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 999, background: cat.color + "22", color: cat.color }}>{cat.label}</span>
            <span style={{ fontSize: 12, color: "#565C99" }}>{e.createdAt}</span>
          </div>

          {/* ปุ่มกดไปโปรไฟล์ผู้โพสต์ */}
          {e.authorId && (
            <span
              onClick={(event) => {
                event.preventDefault(); // ป้องกันไม่ให้เด้งไปหน้าโพสต์
                event.stopPropagation();
                window.location.href = `/profile/${e.authorId}`;
              }}
              style={{ fontSize: 12, color: "#FFFFFF", cursor: "pointer" }}
            >
              โดย {e.authorName || e.author?.username}
            </span>
          )}
        </div>

        <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.title}</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 13, color: "#AEB8E0", display: "flex", alignItems: "center", gap: 4 }}>
            <MapPin size={12} /> {e.district ? `${e.district}, ` : ""}{e.province}
          </div>
          <button
            onClick={toggleLike}
            style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: liked ? "#49CAFF" : "#7A85B8", background: "none", border: "none", padding: 0, cursor: "pointer", flexShrink: 0 }}
          >
            <Heart size={13} fill={liked ? "#49CAFF" : "none"} /> {likeCount}
          </button>
        </div>
      </div>
    </Link>
  );
}