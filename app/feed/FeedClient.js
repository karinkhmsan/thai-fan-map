"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { MessageCircle, MapPin } from "lucide-react";
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
      <p style={{ color: "#8177AE", fontSize: 13, marginBottom: 16 }}>
        ไถดูโพสต์งานแฟนคลับล่าสุดจากทุกจังหวัด
      </p>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 18 }}>
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

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {events.map((e) => (
          <FeedCard key={e.id} e={e} />
        ))}
        {events.length === 0 && (
          <p style={{ color: "#5A5182", fontSize: 13, textAlign: "center", padding: "40px 0" }}>
            ยังไม่มีโพสต์ในหมวดนี้
          </p>
        )}
      </div>
    </div>
  );
}

function FeedCard({ e }) {
  const cat = catInfo(e.category);
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
            background: e.authorAvatarUrl ? "transparent" : e.authorAvatarColor || "#E91E63",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          {e.authorAvatarUrl ? (
            <img src={e.authorAvatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            e.authorName?.[0]?.toUpperCase()
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {e.authorName}
          </div>
          <div style={{ fontSize: 11, color: "#8177AE" }}>{e.createdAt}</div>
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
            color: "#E4DEFF",
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
          style={{ width: "100%", height: "clamp(220px, 60vw, 380px)", objectFit: "cover", display: "block" }}
        />
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "10px 16px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#8177AE" }}>
          <MessageCircle size={14} /> {e.comments?.length || 0}
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#8177AE" }}>
          <MapPin size={14} /> {e.district ? `${e.district}, ` : ""}{e.province}
        </span>
      </div>
    </Link>
  );
}
