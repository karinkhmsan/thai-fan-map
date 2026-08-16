"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, Trash2, Ban, CheckCircle, Flag, Receipt, X, MapPinOff } from "lucide-react";

export default function AdminPage() {
  const router = useRouter();
  const [data, setData] = useState({ users: [], events: [], reportedComments: [], pendingDonations: [], reportedEvents: [] });
  const [loading, setLoading] = useState(true);
  const [slipPreview, setSlipPreview] = useState(null);

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

  const reviewDonation = async (donationId, action) => {
    await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, donationId }),
    });
    loadData();
  };

  const saveAmount = async (donationId, amount) => {
    await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "updateDonationAmount", donationId, amount }),
    });
    loadData();
  };

  const dismissReport = async (eventId) => {
    await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "dismissEventReport", eventId }),
    });
    loadData();
  };

  const clearPin = async (eventId) => {
    if (!confirm("ยืนยันลบเฉพาะหมุดตำแหน่งของโพสต์นี้? (โพสต์ยังอยู่)")) return;
    await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "clearEventPin", eventId }),
    });
    loadData();
  };

  if (loading) return <div style={{ color: "#fff", padding: 40, textAlign: "center" }}>กำลังโหลดข้อมูล Admin...</div>;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", paddingBottom: 40 }}>
      <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
        <Shield style={{ color: "#5271FF" }} /> ระบบผู้ดูแลระบบ (Admin Control Panel)
      </h2>

      {/* ตารางจัดการผู้ใช้ */}
      <div className="card" style={{ padding: 20, marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, marginBottom: 16 }}>จัดการผู้ใช้งาน ({data.users.length})</h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #2A2F5C", color: "#7A85B8" }}>
                <th style={{ padding: 10 }}>Username</th>
                <th style={{ padding: 10 }}>Role</th>
                <th style={{ padding: 10 }}>สถานะ</th>
                <th style={{ padding: 10 }}>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {data.users.map((u) => (
                <tr key={u.id} style={{ borderBottom: "1px solid #1B2048" }}>
                  <td style={{ padding: 10, fontWeight: 500 }}>{u.username}</td>
                  <td style={{ padding: 10, color: u.role === "ADMIN" ? "#5271FF" : "#AEB8E0" }}>{u.role}</td>
                  <td style={{ padding: 10 }}>
                    {u.isBanned ? <span style={{ color: "#49CAFF" }}>โดนแบน</span> : <span style={{ color: "#4CAF50" }}>ปกติ</span>}
                  </td>
                  <td style={{ padding: 10 }}>
                    {u.role !== "ADMIN" && (
                      <button
                        onClick={() => toggleBan(u.id)}
                        style={{
                          background: u.isBanned ? "#4CAF50" : "#49CAFF",
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
              <tr style={{ borderBottom: "1px solid #2A2F5C", color: "#7A85B8" }}>
                <th style={{ padding: 10 }}>หัวข้อโพสต์</th>
                <th style={{ padding: 10 }}>ผู้สร้าง</th>
                <th style={{ padding: 10 }}>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {data.events.map((e) => (
                <tr key={e.id} style={{ borderBottom: "1px solid #1B2048" }}>
                  <td style={{ padding: 10 }}>{e.title}</td>
                  <td style={{ padding: 10, color: "#AEB8E0" }}>{e.author?.username}</td>
                  <td style={{ padding: 10 }}>
                    <button
                      onClick={() => deleteEvent(e.id)}
                      style={{ background: "none", border: "none", color: "#49CAFF", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}
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

      {/* รายการแจ้งโอนเงินที่รอตรวจสอบ */}
      <div className="card" style={{ padding: 20, marginTop: 24 }}>
        <h3 style={{ fontSize: 16, marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
          <Receipt size={15} style={{ color: "#FFFFFF" }} /> รอตรวจสอบสลิปสนับสนุน ({data.pendingDonations.length})
        </h3>
        {data.pendingDonations.length === 0 ? (
          <p style={{ fontSize: 13, color: "#565C99" }}>ยังไม่มีรายการรอตรวจสอบ</p>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {data.pendingDonations.map((d) => (
              <div key={d.id} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: "12px 14px", display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                <img
                  src={d.slipUrl}
                  alt="สลิป"
                  onClick={() => setSlipPreview(d.slipUrl)}
                  style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 8, cursor: "zoom-in", flexShrink: 0 }}
                />
                <div style={{ flex: 1, minWidth: 140 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{d.name}</div>
                  <div style={{ fontSize: 12, color: "#7A85B8", marginTop: 2 }}>{d.createdAt}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
                    <span style={{ fontSize: 12, color: "#7A85B8" }}>ยอดที่แจ้ง:</span>
                    <input
                      key={d.id + d.amount}
                      type="number"
                      defaultValue={d.amount ?? ""}
                      onBlur={(e) => {
                        const val = e.target.value ? Number(e.target.value) : null;
                        if (val !== d.amount) saveAmount(d.id, val);
                      }}
                      placeholder="ไม่ได้แจ้งไว้"
                      style={{ width: 90, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, color: "#E4E9FF", fontSize: 12, padding: "3px 6px" }}
                    />
                    <span style={{ fontSize: 12, color: "#7A85B8" }}>บาท</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => reviewDonation(d.id, "approveDonation")}
                    style={{ background: "#4CAF50", color: "#fff", border: "none", padding: "6px 12px", borderRadius: 6, cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}
                  >
                    <CheckCircle size={13} /> ยืนยัน
                  </button>
                  <button
                    onClick={() => reviewDonation(d.id, "rejectDonation")}
                    style={{ background: "none", border: "1px solid rgba(73,202,255,0.4)", color: "#49CAFF", padding: "6px 12px", borderRadius: 6, cursor: "pointer", fontSize: 12 }}
                  >
                    ปฏิเสธ
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* โพสต์ที่ถูกรายงาน (รวมกรณีปักหมุดผิดเงื่อนไข) */}
      <div className="card" style={{ padding: 20, marginTop: 24 }}>
        <h3 style={{ fontSize: 16, marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
          <Flag size={15} style={{ color: "#49CAFF" }} /> โพสต์ที่ถูกรายงาน ({data.reportedEvents.length})
        </h3>
        {data.reportedEvents.length === 0 ? (
          <p style={{ fontSize: 13, color: "#565C99" }}>ยังไม่มีโพสต์ที่ถูกรายงาน</p>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {data.reportedEvents.map((e) => (
              <div key={e.id} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: "12px 14px", display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 140 }}>
                  <Link href={`/event/${e.id}`} target="_blank" style={{ fontWeight: 600, fontSize: 14, color: "#fff", textDecoration: "none" }}>{e.title}</Link>
                  <div style={{ fontSize: 12, color: "#7A85B8", marginTop: 2 }}>
                    โดย {e.authorName} · ถูกรายงาน {e.reportCount} ครั้ง · {e.createdAt}
                    {e.hasPin && <span style={{ color: "#FFFFFF" }}> · มีหมุดตำแหน่งแม่นยำ</span>}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {e.hasPin && (
                    <button
                      onClick={() => clearPin(e.id)}
                      style={{ background: "none", border: "1px solid rgba(255,255,255,0.4)", color: "#FFFFFF", padding: "6px 12px", borderRadius: 6, cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}
                    >
                      <MapPinOff size={13} /> ลบเฉพาะหมุด
                    </button>
                  )}
                  <button
                    onClick={() => dismissReport(e.id)}
                    style={{ background: "none", border: "1px solid rgba(255,255,255,0.15)", color: "#AEB8E0", padding: "6px 12px", borderRadius: 6, cursor: "pointer", fontSize: 12 }}
                  >
                    เพิกเฉย
                  </button>
                  <button
                    onClick={() => deleteEvent(e.id)}
                    style={{ background: "#49CAFF", color: "#fff", border: "none", padding: "6px 12px", borderRadius: 6, cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}
                  >
                    <Trash2 size={13} /> ลบโพสต์
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ตารางความคิดเห็นที่ถูกรายงาน */}
      <div className="card" style={{ padding: 20, marginTop: 24 }}>
        <h3 style={{ fontSize: 16, marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
          <Flag size={15} style={{ color: "#FFFFFF" }} /> ความคิดเห็นที่ถูกรายงาน ({data.reportedComments.length})
        </h3>
        {data.reportedComments.length === 0 ? (
          <p style={{ fontSize: 13, color: "#565C99" }}>ยังไม่มีความคิดเห็นที่ถูกรายงาน</p>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {data.reportedComments.map((c) => (
              <div key={c.id} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: "12px 14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 6 }}>
                  <div style={{ fontSize: 13 }}>
                    <span style={{ fontWeight: 600, color: "#FFFFFF" }}>{c.authorName}</span>
                    {c.eventTitle && (
                      <>
                        {" "}ในโพสต์{" "}
                        <Link href={`/event/${c.eventId}`} style={{ color: "#AEB8E0", textDecoration: "underline" }}>
                          {c.eventTitle}
                        </Link>
                      </>
                    )}
                  </div>
                  <span style={{ fontSize: 11, flexShrink: 0, padding: "2px 8px", borderRadius: 999, background: "rgba(73,202,255,0.15)", color: "#49CAFF" }}>
                    ถูกรายงาน {c.reportCount} ครั้ง
                  </span>
                </div>
                <div style={{ fontSize: 14, color: "#E4E9FF", marginBottom: 10 }}>{c.text}</div>
                <button
                  onClick={() => deleteComment(c.id)}
                  style={{ background: "none", border: "none", color: "#49CAFF", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}
                >
                  <Trash2 size={14} /> ลบความคิดเห็นนี้
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ดูสลิปแบบเต็มขนาด */}
      {slipPreview && (
        <div onClick={() => setSlipPreview(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <button onClick={() => setSlipPreview(null)} style={{ position: "absolute", top: 18, right: 20, background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "50%", width: 40, height: 40, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X size={20} />
          </button>
          <img src={slipPreview} alt="สลิป" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "90vw", maxHeight: "88vh", objectFit: "contain", borderRadius: 6 }} />
        </div>
      )}
    </div>
  );
}