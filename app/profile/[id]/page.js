import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma.mjs";
import { MapPin, Link as LinkIcon, MessageSquare } from "lucide-react";

export default async function PublicProfilePage({ params }) {
  const { id } = params;

  // ดึงข้อมูลผู้ใช้และโพสต์ทั้งหมดของยูสเซอร์คนนี้
  const targetUser = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
      avatarColor: true,
      avatarUrl: true,
      bio: true,
      facebookUrl: true,
      instagramUrl: true,
      tiktokUrl: true,
      createdAt: true,
      events: {
        orderBy: { createdAt: "desc" },
        include: { comments: true },
      },
    },
  });

  if (!targetUser) notFound();

  return (
    <div style={{ maxWidth: 650, margin: "0 auto", paddingBottom: 40, color: "#fff" }}>
      {/* การ์ดข้อมูลผู้ใช้ */}
      <div className="card" style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
          <div
            style={{
              width: 70,
              height: 70,
              borderRadius: "50%",
              overflow: "hidden",
              flexShrink: 0,
              background: targetUser.avatarColor || "#E91E63",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 26,
              fontWeight: 600,
            }}
          >
            {targetUser.avatarUrl ? (
              <img src={targetUser.avatarUrl} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              targetUser.username[0]?.toUpperCase()
            )}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 600 }}>{targetUser.username}</div>
            <div style={{ fontSize: 12, color: "#8177AE", marginTop: 2 }}>
              เข้าร่วมเมื่อ {new Date(targetUser.createdAt).toLocaleDateString("th-TH")}
            </div>
          </div>
        </div>

        {/* Bio & Social Links */}
        {targetUser.bio && (
          <p style={{ fontSize: 14, color: "#D1C9EF", marginBottom: 16, whiteSpace: "pre-line" }}>
            {targetUser.bio}
          </p>
        )}

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", fontSize: 13 }}>
          {targetUser.facebookUrl && (
            <a href={targetUser.facebookUrl} target="_blank" rel="noreferrer" style={{ color: "#4267B2", display: "flex", alignItems: "center", gap: 4, textDecoration: "none" }}>
              <LinkIcon size={14} /> Facebook
            </a>
          )}
          {targetUser.instagramUrl && (
            <a href={targetUser.instagramUrl} target="_blank" rel="noreferrer" style={{ color: "#E1306C", display: "flex", alignItems: "center", gap: 4, textDecoration: "none" }}>
              <LinkIcon size={14} /> Instagram
            </a>
          )}
          {targetUser.tiktokUrl && (
            <a href={targetUser.tiktokUrl} target="_blank" rel="noreferrer" style={{ color: "#00f2fe", display: "flex", alignItems: "center", gap: 4, textDecoration: "none" }}>
              <LinkIcon size={14} /> TikTok
            </a>
          )}
        </div>
      </div>

      {/* รายการโพสต์ของผู้ใช้คนนี้ */}
      <h3 style={{ fontSize: 16, fontWeight: 500, marginBottom: 12, color: "#B8AEDB" }}>
        โพสต์ทั้งหมดของ {targetUser.username} ({targetUser.events.length})
      </h3>

      <div style={{ display: "grid", gap: 12 }}>
        {targetUser.events.map((e) => (
          <Link key={e.id} href={`/event/${e.id}`} style={{ textDecoration: "none", color: "inherit" }}>
            <div className="card" style={{ padding: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{e.title}</div>
                <div style={{ fontSize: 12, color: "#B8AEDB", display: "flex", gap: 12, alignItems: "center" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 2 }}><MapPin size={12} /> {e.province}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 2 }}><MessageSquare size={12} /> {e.comments.length} ความคิดเห็น</span>
                </div>
              </div>
            </div>
          </Link>
        ))}

        {targetUser.events.length === 0 && (
          <p style={{ fontSize: 13, color: "#5A5182" }}>ผู้ใช้คนนี้ยังไม่เคยสร้างโพสต์</p>
        )}
      </div>
    </div>
  );
}