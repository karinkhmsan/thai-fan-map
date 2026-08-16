"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { ArrowLeft, MessageCircle, MapPin, Trash2, Pencil, X, ChevronLeft, ChevronRight, Flag, Navigation, Heart, UserPlus, UserCheck } from "lucide-react";
import { catInfo } from "@/lib/categories";

const EventLocationMap = dynamic(() => import("@/components/EventLocationMap"), { ssr: false });

export default function EventDetailClient({ event: initialEvent, currentUser, initialFollow }) {
  const [event, setEvent] = useState(initialEvent);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [reportedIds, setReportedIds] = useState(new Set());
  const [eventReported, setEventReported] = useState(false);
  const [liked, setLiked] = useState(!!initialEvent.isLiked);
  const [likeCount, setLikeCount] = useState(initialEvent.likeCount ?? 0);
  const [following, setFollowing] = useState(!!initialFollow?.isFollowing);
  const [followerCount, setFollowerCount] = useState(initialFollow?.followerCount ?? 0);
  const router = useRouter();
  const cat = catInfo(event.category);
  const isOwner = currentUser && currentUser.id === event.authorId;
  const isAdmin = currentUser && currentUser.role === "ADMIN";
  const hasPin = event.lat != null && event.lng != null;

  const toggleLike = async () => {
    if (!currentUser) { router.push("/login"); return; }
    setLiked((v) => !v);
    setLikeCount((c) => c + (liked ? -1 : 1));
    const res = await fetch(`/api/events/${event.id}/like`, { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      setLiked(data.liked);
      setLikeCount(data.count);
    }
  };

  const toggleFollow = async () => {
    if (!currentUser) { router.push("/login"); return; }
    setFollowing((v) => !v);
    setFollowerCount((c) => c + (following ? -1 : 1));
    const res = await fetch(`/api/users/${event.authorId}/follow`, { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      setFollowing(data.following);
      setFollowerCount(data.followerCount);
    }
  };

  const reportPost = async () => {
    if (!currentUser) { router.push("/login"); return; }
    if (!confirm("ยืนยันรายงานโพสต์นี้ให้แอดมินตรวจสอบ?")) return;
    const res = await fetch(`/api/events/${event.id}/report`, { method: "POST" });
    if (res.ok) setEventReported(true);
  };

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

  const removeComment = async (commentId) => {
    if (!confirm("ยืนยันลบความคิดเห็นนี้?")) return;
    const res = await fetch(`/api/comments/${commentId}`, { method: "DELETE" });
    const data = await res.json();
    if (res.ok) setEvent(data.event);
    else alert(data.error || "ลบไม่ได้");
  };

  const reportCommentById = async (commentId) => {
    if (!currentUser) { router.push("/login"); return; }
    const res = await fetch(`/api/comments/${commentId}/report`, { method: "POST" });
    if (res.ok) setReportedIds((prev) => new Set(prev).add(commentId));
  };

  const closeLightbox = () => setLightboxIndex(null);
  const showPrev = (e) => { e.stopPropagation(); setLightboxIndex((i) => (i - 1 + event.images.length) % event.images.length); };
  const showNext = (e) => { e.stopPropagation(); setLightboxIndex((i) => (i + 1) % event.images.length); };

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") setLightboxIndex((i) => (i - 1 + event.images.length) % event.images.length);
      if (e.key === "ArrowRight") setLightboxIndex((i) => (i + 1) % event.images.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIndex, event.images.length]);

  return (
    <div>
      <button onClick={() => router.back()} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: "#AEB8E0", fontSize: 13, cursor: "pointer", padding: 0 }}>
        <ArrowLeft size={15} /> ย้อนกลับ
      </button>

      <div className="card" style={{ marginTop: 12, overflow: "hidden" }}>
        <div style={{ padding: "18px 20px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div style={{
                width: 42, height: 42, borderRadius: "50%", overflow: "hidden", flexShrink: 0,
                background: event.authorAvatarUrl ? "transparent" : (event.authorAvatarColor || "#5271FF"),
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 600,
              }}>
                {event.authorAvatarUrl ? (
                  <img src={event.authorAvatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  event.authorName?.[0]?.toUpperCase()
                )}
              </div>
              <div>
                {event.authorId ? (
                  <Link href={`/profile/${event.authorId}`} style={{ color: "#fff", textDecoration: "none", fontWeight: 600, fontSize: 15 }}>
                    {event.authorName}
                  </Link>
                ) : (
                  <span style={{ fontWeight: 600, fontSize: 15 }}>{event.authorName}</span>
                )}
                <div style={{ fontSize: 12, color: "#7A85B8" }}>{event.createdAt}</div>
              </div>
              {!isOwner && event.authorId && (
                <button
                  onClick={toggleFollow}
                  style={{
                    display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600,
                    padding: "5px 12px", borderRadius: 999, cursor: "pointer", marginLeft: 4,
                    background: following ? "rgba(255,255,255,0.08)" : "#5271FF",
                    border: following ? "1px solid rgba(255,255,255,0.15)" : "none",
                    color: "#fff",
                  }}
                >
                  {following ? <UserCheck size={13} /> : <UserPlus size={13} />} {following ? "ติดตามแล้ว" : "ติดตาม"}
                </button>
              )}
            </div>
            {isOwner && (
              <div style={{ display: "flex", gap: 14, flexShrink: 0 }}>
                <Link href={`/event/${event.id}/edit`} style={{ background: "none", border: "none", color: "#FFFFFF", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 13, textDecoration: "none" }}>
                  <Pencil size={15} /> แก้ไข
                </Link>
                <button onClick={remove} style={{ background: "none", border: "none", color: "#49CAFF", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 13 }}>
                  <Trash2 size={15} /> ลบโพสต์
                </button>
              </div>
            )}
            {!isOwner && currentUser && (
              <button
                onClick={reportPost}
                disabled={eventReported}
                title={eventReported ? "รายงานแล้ว" : "รายงานโพสต์นี้"}
                style={{ background: "none", border: "none", color: eventReported ? "#565C99" : "#7A85B8", cursor: eventReported ? "default" : "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 12, flexShrink: 0 }}
              >
                <Flag size={13} /> {eventReported ? "รายงานแล้ว" : "รายงาน"}
              </button>
            )}
          </div>

          <h1 style={{ fontSize: 19, fontWeight: 600, margin: "14px 0 6px" }}>{event.title}</h1>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 13, color: cat.color, fontWeight: 600 }}>#{cat.label}</span>
            <Link href={`/province/${encodeURIComponent(event.province)}`} style={{ display: "flex", alignItems: "center", gap: 4, color: "#7A85B8", fontSize: 13, textDecoration: "none" }}>
              <MapPin size={13} /> {event.district ? `${event.district}, ` : ""}{event.province}
            </Link>
          </div>

          <p style={{ fontSize: 15, lineHeight: 1.7, color: "#E4E9FF", whiteSpace: "pre-wrap", margin: "0 0 16px" }}>{event.description}</p>

          {hasPin && (
            <div style={{ marginBottom: 16 }}>
              <EventLocationMap lat={event.lat} lng={event.lng} />
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${event.lat},${event.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 8, fontSize: 12, color: "#5271FF", textDecoration: "none" }}
              >
                <Navigation size={12} /> นำทางไปยังจุดนี้
              </a>
            </div>
          )}
        </div>

        {event.images.length > 0 && (
          <ImageGrid images={event.images} onOpen={setLightboxIndex} />
        )}

        <div style={{ padding: "12px 20px", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", gap: 18, fontSize: 13 }}>
          <button
            onClick={toggleLike}
            style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", padding: 0, cursor: "pointer", color: liked ? "#49CAFF" : "#7A85B8" }}
          >
            <Heart size={16} fill={liked ? "#49CAFF" : "none"} /> {likeCount} ไลค์
          </button>
          <span style={{ display: "flex", alignItems: "center", gap: 6, color: "#7A85B8" }}>
            <MessageCircle size={16} /> {event.comments.length} ความคิดเห็น
          </span>
          {followerCount > 0 && !isOwner && (
            <span style={{ color: "#565C99" }}>ผู้ติดตาม {followerCount}</span>
          )}
        </div>

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: 20 }}>
          <div style={{ display: "grid", gap: 10, marginBottom: 14 }}>
            {event.comments.map((c) => {
              const isCommentOwner = currentUser && currentUser.id === c.authorId;
              const canDelete = isCommentOwner || isAdmin;
              const canReport = currentUser && !isCommentOwner;
              const alreadyReported = reportedIds.has(c.id);
              return (
                <div key={c.id} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: "10px 12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3, gap: 8 }}>
                    {c.authorId ? (
                      <Link href={`/profile/${c.authorId}`} style={{ fontSize: 13, fontWeight: 500, color: "#FFFFFF", textDecoration: "none" }}>
                        {c.authorName}
                      </Link>
                    ) : (
                      <span style={{ fontSize: 13, fontWeight: 500, color: "#FFFFFF" }}>{c.authorName}</span>
                    )}
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                      <span style={{ fontSize: 11, color: "#565C99" }}>{c.createdAt}</span>
                      {canDelete && (
                        <button
                          onClick={() => removeComment(c.id)}
                          title="ลบความคิดเห็น"
                          style={{ background: "none", border: "none", color: "#49CAFF", cursor: "pointer", padding: 0, display: "flex" }}
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                      {canReport && (
                        <button
                          onClick={() => reportCommentById(c.id)}
                          disabled={alreadyReported}
                          title={alreadyReported ? "รายงานแล้ว" : "รายงานความคิดเห็นนี้"}
                          style={{ background: "none", border: "none", color: alreadyReported ? "#565C99" : "#7A85B8", cursor: alreadyReported ? "default" : "pointer", padding: 0, display: "flex" }}
                        >
                          <Flag size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                  <div style={{ fontSize: 14, color: "#E4E9FF" }}>{c.text}</div>
                </div>
              );
            })}
            {event.comments.length === 0 && <p style={{ fontSize: 13, color: "#565C99" }}>ยังไม่มีความคิดเห็น เป็นคนแรกที่คอมเมนต์เลย!</p>}
          </div>
          {error && <p style={{ color: "#49CAFF", fontSize: 13 }}>{error}</p>}
          <div style={{ display: "flex", gap: 8 }}>
            <input className="input" value={comment} onChange={(e) => setComment(e.target.value)}
              placeholder={currentUser ? `คอมเมนต์ในนาม ${currentUser.username}...` : "เข้าสู่ระบบเพื่อคอมเมนต์"} />
            <button onClick={sendComment} className="btn-primary">ส่ง</button>
          </div>
        </div>
      </div>

      {lightboxIndex !== null && (
        <div onClick={closeLightbox} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <button onClick={closeLightbox} style={{ position: "absolute", top: 18, right: 20, background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "50%", width: 40, height: 40, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X size={20} />
          </button>

          {event.images.length > 1 && (
            <>
              <button onClick={showPrev} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "50%", width: 44, height: 44, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ChevronLeft size={24} />
              </button>
              <button onClick={showNext} style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "50%", width: 44, height: 44, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ChevronRight size={24} />
              </button>
              <div style={{ position: "absolute", bottom: 22, color: "#fff", fontSize: 13, background: "rgba(255,255,255,0.1)", padding: "4px 12px", borderRadius: 999 }}>
                {lightboxIndex + 1} / {event.images.length}
              </div>
            </>
          )}

          <img
            src={event.images[lightboxIndex]}
            alt=""
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "90vw", maxHeight: "88vh", objectFit: "contain", borderRadius: 6 }}
          />
        </div>
      )}
    </div>
  );
}

function ImageGrid({ images, onOpen }) {
  const n = images.length;
  const gridHeight = "clamp(320px, 38vw, 560px)"; // มือถือ = 320px ขั้นต่ำ, เดสก์ท็อปยืดตามความกว้าง

  if (n === 1) {
    return (
      <div onClick={() => onOpen(0)} style={{ position: "relative", overflow: "hidden", cursor: "zoom-in" }}>
        <img src={images[0]} alt="" style={{ width: "100%", height: "clamp(320px, 45vw, 640px)", objectFit: "cover", display: "block" }} />
      </div>
    );
  }

  if (n === 2) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, height: gridHeight, position: "relative", overflow: "hidden" }}>
        {images.map((img, i) => (
          <img key={i} src={img} alt="" onClick={() => onOpen(i)} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", cursor: "zoom-in" }} />
        ))}
      </div>
    );
  }

  if (n === 3) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", gap: 2, height: gridHeight, position: "relative", overflow: "hidden" }}>
        <img src={images[0]} alt="" onClick={() => onOpen(0)} style={{ gridRow: "1 / 3", width: "100%", height: "100%", objectFit: "cover", display: "block", cursor: "zoom-in" }} />
        <img src={images[1]} alt="" onClick={() => onOpen(1)} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", cursor: "zoom-in" }} />
        <img src={images[2]} alt="" onClick={() => onOpen(2)} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", cursor: "zoom-in" }} />
      </div>
    );
  }

  const shown = images.slice(0, 4);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", gap: 2, height: gridHeight, position: "relative", overflow: "hidden" }}>
      {shown.map((img, i) => (
        <div key={i} onClick={() => onOpen(i)} style={{ position: "relative", overflow: "hidden", cursor: "zoom-in" }}>
          <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          {i === 3 && n > 4 && (
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 20, fontWeight: 600 }}>
              +{n - 4}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}