"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, MessageCircle, MapPin, Trash2, Pencil } from "lucide-react";
import { catInfo } from "@/lib/categories";

export default function EventDetailClient({ event: initialEvent, currentUser }) {
  const [event, setEvent] = useState(initialEvent);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const cat = catInfo(event.category);
  const isOwner = currentUser && currentUser.id === event.authorId;

  const sendComment = async () => {
    if (!comment.trim()) return;
    if (!currentUser) { router.push("/login"); return; }
    const res = await fetch(`/api/events/${event.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: comment }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); return; }
    setEvent(data.event);
    setComment("");
  };

  const remove = async () => {
    if (!confirm("ยืนยันลบโพสต์นี้?")) return;
    const res = await fetch(`/api/events/${event.id}`, { method: "DELETE" });
    if (res.ok) router.push("/profile");
  };

  return (
    <div>
      <button onClick={() => router.back()} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: "#B8AEDB", fontSize: 13, cursor: "pointer", padding: 0 }}>
        <ArrowLeft size={15} /> ย้อนกลับ
      </button>

      <div className="card" style={{ marginTop: 12, overflow: "hidden" }}>
        {event.images.length > 0 && (
          <div style={{ display: "flex", gap: 2, overflowX: "auto" }}>
            {event.images.map((img, i) => (
              <img key={i} src={img} alt="" style={{ width: "100%", maxHeight: 320, objectFit: "cover", flexShrink: 0 }} />
            ))}
          </div>
        )}
        <div style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <span style={{ fontSize: 12, padding: "3px 10px", borderRadius: 999, background: cat.color + "22", color: cat.color }}>{cat.label}</span>
            {isOwner && (
              <div style={{ display: "flex", gap: 14 }}>
                <Link href={`/event/${event.id}/edit`} style={{ background: "none", border: "none", color: "#FFC145", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 13, textDecoration: "none" }}>
                  <Pencil size={15} /> แก้ไข
                </Link>
                <button onClick={remove} style={{ background: "none", border: "none", color: "#FF3D8A", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 13 }}>
                  <Trash2 size={15} /> ลบโพสต์
                </button>
              </div>
            )}
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 600, margin: "10px 0 6px" }}>{event.title}</h1>
          <Link href={`/province/${encodeURIComponent(event.province)}`} style={{ display: "flex", alignItems: "center", gap: 5, color: "#B8AEDB", fontSize: 14, marginBottom: 4, width: "fit-content" }}>
            <MapPin size={14} /> {event.district ? `อำเภอ${event.district}, ` : ""}จังหวัด{event.province}
          </Link>

          <div style={{ fontSize: 13, color: "#5A5182", marginBottom: 16 }}>
            โพสต์โดย{" "}
            {event.authorId ? (
              <Link href={`/profile/${event.authorId}`} style={{ color: "#FFC145", textDecoration: "none", fontWeight: 500 }}>
                {event.authorName}
              </Link>
            ) : (
              event.authorName
            )}{" "}
            · {event.createdAt}
          </div>

          <p style={{ fontSize: 15, lineHeight: 1.7, color: "#E4DEFF", whiteSpace: "pre-wrap" }}>{event.description}</p>
        </div>

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: 20 }}>
          <h3 style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 15, fontWeight: 500, marginBottom: 14 }}>
            <MessageCircle size={16} /> ความคิดเห็น ({event.comments.length})
          </h3>
          <div style={{ display: "grid", gap: 10, marginBottom: 14 }}>
            {event.comments.map((c) => (
              <div key={c.id} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: "10px 12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  {c.authorId ? (
                    <Link href={`/profile/${c.authorId}`} style={{ fontSize: 13, fontWeight: 500, color: "#FFC145", textDecoration: "none" }}>
                      {c.authorName}
                    </Link>
                  ) : (
                    <span style={{ fontSize: 13, fontWeight: 500, color: "#FFC145" }}>{c.authorName}</span>
                  )}
                  <span style={{ fontSize: 11, color: "#5A5182" }}>{c.createdAt}</span>
                </div>
                <div style={{ fontSize: 14, color: "#E4DEFF" }}>{c.text}</div>
              </div>
            ))}
            {event.comments.length === 0 && <p style={{ fontSize: 13, color: "#5A5182" }}>ยังไม่มีความคิดเห็น เป็นคนแรกที่คอมเมนต์เลย!</p>}
          </div>
          {error && <p style={{ color: "#FF3D8A", fontSize: 13 }}>{error}</p>}
          <div style={{ display: "flex", gap: 8 }}>
            <input className="input" value={comment} onChange={(e) => setComment(e.target.value)}
              placeholder={currentUser ? `คอมเมนต์ในนาม ${currentUser.username}...` : "เข้าสู่ระบบเพื่อคอมเมนต์"} />
            <button onClick={sendComment} className="btn-primary">ส่ง</button>
          </div>
        </div>
      </div>
    </div>
  );
}