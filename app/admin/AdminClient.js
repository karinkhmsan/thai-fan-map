"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, Trash2, Ban, CheckCircle, Flag } from "lucide-react";

export default function AdminPage() {
  const router = useRouter();
  const [data, setData] = useState({ users: [], events: [], reportedComments: [] });
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    const res = await fetch("/api/admin");
    if (res.status === 403) {
      alert("คุณไม่มีสิทธิ์เข้าถึงหน้านี้");
      router.push("/");
      return;
    }
    const resData = await res.json();
    if (resData.users) setData(resData);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleBan = async (userId) => {
    await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggleBan", userId }),
    });
    loadData();
  };

  const deleteEvent = async (eventId) => {
    if (!confirm("ยืนยันที่จะลบโพสต์นี้หรือไม่?")) return;
    await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "deleteEvent", eventId }),
    });
    loadData();
  };

  const deleteComment = async (commentId) => {
    if (!confirm("ยืนยันที่จะลบความคิดเห็นนี้หรือไม่?")) return;
    await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "deleteComment", commentId }),
    });
    loadData();
  };

  if (loading) return <div style={{ color: "#fff", padding: 40, textAlign: "center" }}>กำลังโหลดข้อมูล Admin...</div>;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", paddingBottom: 40 }}>
      <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
        <Shield style={{ color: "#E91E63" }} /> ระบบผู้ดูแลระบบ (Admin Control Panel)
      </h2>

      {/* ตารางจัดการผู้ใช้ */}
      <div className="card" style={{ padding: 20, marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, marginBottom: 16 }}>จัดการผู้ใช้งาน ({data.users.length})</h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #332d4f", color: "#8177AE" }}>
                <th style={{ padding: 10 }}>Username</th>
                <th style={{ padding: 10 }}>Role</th>
                <th style={{ padding: 10 }}>สถานะ</th>
                <th style={{ padding: 10 }}>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {data.users.map((u) => (
                <tr key={u.id} style={{ borderBottom: "1px solid #231f38" }}>
                  <td style={{ padding: 10, fontWeight: 500 }}>{u.username}</td>
                  <td style={{ padding: 10, color: u.role === "ADMIN" ? "#E91E63" : "#B8AEDB" }}>{u.role}</td>
                  <td style={{ padding: 10 }}>
                    {u.isBanned ? <span style={{ color: "#FF3D8A" }}>โดนแบน</span> : <span style={{ color: "#4CAF50" }}>ปกติ</span>}
                  </td>
                  <td style={{ padding: 10 }}>
                    {u.role !== "ADMIN" && (
                      <button
                        onClick={() => toggleBan(u.id)}
                        style={{
                          background: u.isBanned ? "#4CAF50" : "#FF3D8A",
                          color: "#fff",
                          border: "none",
                          padding: "4px 10px",
                          borderRadius: 6,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          fontSize: 12,
                        }}
                      >
                        {u.isBanned ? <CheckCircle size={12} /> : <Ban size={12} />}
                        {u.isBanned ? "ปลดแบน" : "แบนผู้ใช้"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ตารางจัดการโพสต์ */}
      <div className="card" style={{ padding: 20 }}>
        <h3 style={{ fontSize: 16, marginBottom: 16 }}>จัดการโพสต์ทั้งหมด ({data.events.length})</h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #332d4f", color: "#8177AE" }}>
                <th style={{ padding: 10 }}>หัวข้อโพสต์</th>
                <th style={{ padding: 10 }}>ผู้สร้าง</th>
                <th style={{ padding: 10 }}>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {data.events.map((e) => (
                <tr key={e.id} style={{ borderBottom: "1px solid #231f38" }}>
                  <td style={{ padding: 10 }}>{e.title}</td>
                  <td style={{ padding: 10, color: "#B8AEDB" }}>{e.author?.username}</td>
                  <td style={{ padding: 10 }}>
                    <button
                      onClick={() => deleteEvent(e.id)}
                      style={{ background: "none", border: "none", color: "#FF3D8A", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}
                    >
                      <Trash2 size={14} /> ลบโพสต์
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ตารางความคิดเห็นที่ถูกรายงาน */}
      <div className="card" style={{ padding: 20, marginTop: 24 }}>
        <h3 style={{ fontSize: 16, marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
          <Flag size={15} style={{ color: "#FFC145" }} /> ความคิดเห็นที่ถูกรายงาน ({data.reportedComments.length})
        </h3>
        {data.reportedComments.length === 0 ? (
          <p style={{ fontSize: 13, color: "#5A5182" }}>ยังไม่มีความคิดเห็นที่ถูกรายงาน</p>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {data.reportedComments.map((c) => (
              <div key={c.id} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: "12px 14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 6 }}>
                  <div style={{ fontSize: 13 }}>
                    <span style={{ fontWeight: 600, color: "#FFC145" }}>{c.authorName}</span>
                    {c.eventTitle && (
                      <>
                        {" "}ในโพสต์{" "}
                        <Link href={`/event/${c.eventId}`} style={{ color: "#B8AEDB", textDecoration: "underline" }}>
                          {c.eventTitle}
                        </Link>
                      </>
                    )}
                  </div>
                  <span style={{ fontSize: 11, flexShrink: 0, padding: "2px 8px", borderRadius: 999, background: "rgba(255,61,138,0.15)", color: "#FF3D8A" }}>
                    ถูกรายงาน {c.reportCount} ครั้ง
                  </span>
                </div>
                <div style={{ fontSize: 14, color: "#E4DEFF", marginBottom: 10 }}>{c.text}</div>
                <button
                  onClick={() => deleteComment(c.id)}
                  style={{ background: "none", border: "none", color: "#FF3D8A", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}
                >
                  <Trash2 size={14} /> ลบความคิดเห็นนี้
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}