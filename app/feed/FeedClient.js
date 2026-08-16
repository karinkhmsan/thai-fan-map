"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { MessageCircle, MapPin, Heart } from "lucide-react";
import { CATEGORIES, catInfo } from "@/lib/categories";

export default function FeedClient({ initialEvents }) {
  const [catFilter, setCatFilter] = useState("all");

  const events = useMemo(
    () => initialEvents.filter((e) => catFilter === "all" || e.category === catFilter),
    [initialEvents, catFilter]
  );

  return (
    <div style={{ maxWidth: 560, margin: "0 auto" }}>
      <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>ฟีดโพสต์</h2>
      <p style={{ color: "#7A85B8", fontSize: 13, marginBottom: 16 }}>
        ไถดูโพสต์งานแฟนคลับล่าสุดจากทุกจังหวัด
      </p>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 18 }}>
        <button
          className={`chip ${catFilter === "all" ? "active" : ""}`}
          onClick={() => setCatFilter("all")}
          style={{
            borderColor: catFilter === "all" ? "#5271FF" : undefined,
            background: catFilter === "all" ? "#5271FF22" : undefined,
            color: catFilter === "all" ? "#5271FF" : undefined,
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

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {events.map((e) => (
          <FeedCard key={e.id} e={e} />
        ))}
        {events.length === 0 && (
          <p style={{ color: "#565C99", fontSize: 13, textAlign: "center", padding: "40px 0" }}>
            ยังไม่มีโพสต์ในหมวดนี้
          </p>
        )}
      </div>
    </div>
  );
}

function FeedCard({ e }) {
  const cat = catInfo(e.category);
  // สถานะไลค์ฝังมาจาก server ตั้งแต่แรกแล้ว (ดู attachLikedFlag ใน app/feed/page.js)
  // เดิมการ์ดแต่ละใบยิง fetch เช็คสถานะไลค์เอง ทำให้ฟีดที่มีหลายสิบโพสต์ยิง request พร้อมกันเป็นสิบๆ ครั้งตอนโหลดหน้า — ช้ามาก
  const [liked, setLiked] = useState(!!e.isLiked);
  const [likeCount, setLikeCount] = useState(e.likeCount ?? 0);

  const toggleLike = async (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    // อัปเดตหน้าจอก่อนเลย (optimistic) แล้วค่อยยืนยันกับเซิร์ฟเวอร์
    setLiked((v) => !v);
    setLikeCount((c) => c + (liked ? -1 : 1));
    try {
      const res = await fetch(`/api/events/${e.id}/like`, { method: "POST" });
      if (res.status === 401) { window.location.href = "/login"; return; }
      const data = await res.json();
      if (typeof data.liked === "boolean") setLiked(data.liked);
      if (typeof data.count === "number") setLikeCount(data.count);
    } catch {
      // ทำไม่สำเร็จ ย้อนค่ากลับ
      setLiked((v) => !v);
      setLikeCount((c) => c + (liked ? 1 : -1));
    }
  };

  return (
    <Link
      href={`/event/${e.id}`}
      className="card"
      style={{ display: "block", textDecoration: "none", color: "inherit", overflow: "hidden" }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px 10px" }}>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            overflow: "hidden",
            flexShrink: 0,
            background: e.authorAvatarUrl ? "transparent" : e.authorAvatarColor || "#5271FF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          {e.authorAvatarUrl ? (
            <img src={e.authorAvatarUrl} alt="" loading="lazy" decoding="async" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            e.authorName?.[0]?.toUpperCase()
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {e.authorName}
          </div>
          <div style={{ fontSize: 11, color: "#7A85B8" }}>{e.createdAt}</div>
        </div>
        <span
          style={{
            fontSize: 11,
            padding: "3px 9px",
            borderRadius: 999,
            background: cat.color + "22",
            color: cat.color,
            flexShrink: 0,
          }}
        >
          {cat.label}
        </span>
      </div>

      <div style={{ padding: "0 16px 12px" }}>
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{e.title}</div>
        <p
          style={{
            fontSize: 13.5,
            color: "#E4E9FF",
            lineHeight: 1.6,
            margin: 0,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {e.description}
        </p>
      </div>

      {e.images?.[0] && (
        <img
          src={e.images[0]}
          alt=""
          loading="lazy"
          decoding="async"
          style={{ width: "100%", height: "clamp(220px, 60vw, 380px)", objectFit: "cover", display: "block" }}
        />
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "10px 16px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <button
          onClick={toggleLike}
          style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: liked ? "#49CAFF" : "#7A85B8", background: "none", border: "none", padding: 0, cursor: "pointer" }}
        >
          <Heart size={14} fill={liked ? "#49CAFF" : "none"} /> {likeCount}
        </button>
        <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#7A85B8" }}>
          <MessageCircle size={14} /> {e.commentCount ?? 0}
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#7A85B8" }}>
          <MapPin size={14} /> {e.district ? `${e.district}, ` : ""}{e.province}
        </span>
      </div>
    </Link>
  );
}