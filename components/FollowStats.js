"use client";
import { useState } from "react";
import Link from "next/link";
import { X, User } from "lucide-react";

// แสดงจำนวนผู้ติดตาม / กำลังติดตาม แบบกดตัวเลขแล้วเด้งลิสต์บัญชีขึ้นมาดูได้
export default function FollowStats({ userId, followerCount, followingCount }) {
  const [modal, setModal] = useState(null); // "followers" | "following" | null
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);

  const open = async (type) => {
    setModal(type);
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${userId}/${type}`);
      const data = await res.json();
      setList(data.users || []);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div style={{ display: "flex", gap: 18 }}>
        <button onClick={() => open("followers")} style={statBtnStyle}>
          <b style={{ color: "#fff" }}>{followerCount}</b> ผู้ติดตาม
        </button>
        <button onClick={() => open("following")} style={statBtnStyle}>
          <b style={{ color: "#fff" }}>{followingCount}</b> กำลังติดตาม
        </button>
      </div>

      {modal && (
        <div
          onClick={() => setModal(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="card"
            style={{ width: "100%", maxWidth: 380, maxHeight: "70vh", overflowY: "auto", background: "#191332", padding: 0 }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <span style={{ fontWeight: 600, fontSize: 15 }}>{modal === "followers" ? "ผู้ติดตาม" : "กำลังติดตาม"}</span>
              <button onClick={() => setModal(null)} style={{ background: "none", border: "none", color: "#8177AE", cursor: "pointer", display: "flex" }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: 6 }}>
              {loading && <p style={{ padding: 14, fontSize: 13, color: "#8177AE" }}>กำลังโหลด...</p>}
              {!loading && list.length === 0 && (
                <p style={{ padding: 14, fontSize: 13, color: "#5A5182" }}>
                  {modal === "followers" ? "ยังไม่มีผู้ติดตาม" : "ยังไม่ได้ติดตามใคร"}
                </p>
              )}
              {!loading && list.map((u) => (
                <Link
                  key={u.id}
                  href={`/profile/${u.id}`}
                  onClick={() => setModal(null)}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, textDecoration: "none", color: "#E4DEFF" }}
                >
                  <div style={{
                    width: 34, height: 34, borderRadius: "50%", overflow: "hidden", flexShrink: 0,
                    background: u.avatarUrl ? "transparent" : (u.avatarColor || "#E91E63"),
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600,
                  }}>
                    {u.avatarUrl ? (
                      <img src={u.avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      u.username?.[0]?.toUpperCase() || <User size={14} />
                    )}
                  </div>
                  <span style={{ fontSize: 14 }}>{u.username}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const statBtnStyle = {
  background: "none", border: "none", color: "#8177AE", fontSize: 13, cursor: "pointer", padding: 0,
};
