"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { X, MapPin, Heart } from "lucide-react";

export default function StatsModal({ open, onClose }) {
  const [tab, setTab] = useState("province"); // "province" | "donors"
  const [provinces, setProvinces] = useState(null);
  const [donors, setDonors] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    // โหลดข้อมูลทั้งสองแท็บตอนเปิด modal เลย (ข้อมูลไม่เยอะ สลับแท็บจะได้ไม่ต้องรอโหลดใหม่)
    fetch("/api/stats").then((r) => r.json()).then((d) => setProvinces(d.provinces || []));
    fetch("/api/donations/approved").then((r) => r.json()).then((d) => setDonors(d.donors || []));
  }, [open]);

  if (!open || !mounted) return null;

  const maxCount = provinces?.length ? Math.max(...provinces.map((p) => p.count)) : 1;

  // ใช้ portal render ตรงเข้า document.body แทนที่จะปล่อยให้เป็นลูกของ <header>
  // เพราะ header มี backdrop-filter อยู่ ซึ่งทำให้ position:fixed ของลูกๆ ยึดตำแหน่งกับ header แทนที่จะยึดกับหน้าจอทั้งหมด
  // (บั๊กที่ทำให้ modal ค้างติดอยู่แถวบนสุด เลื่อนไม่ได้)
  return createPortal(
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(10,7,24,0.75)", backdropFilter: "blur(3px)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="card stats-modal"
        style={{ width: "100%", maxWidth: 460, maxHeight: "80vh", display: "flex", flexDirection: "column", background: "#141A3D", overflow: "hidden" }}
      >
        {/* หัว modal */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px 12px" }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>สถิติ</h2>
          <button onClick={onClose} className="btn-ghost" style={{ width: 32, height: 32, padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X size={16} />
          </button>
        </div>

        {/* แท็บ */}
        <div style={{ display: "flex", gap: 6, padding: "0 20px 14px" }}>
          <TabButton active={tab === "province"} onClick={() => setTab("province")}>จังหวัด</TabButton>
          <TabButton active={tab === "donors"} onClick={() => setTab("donors")}>ผู้สนับสนุน</TabButton>
        </div>

        <div style={{ overflowY: "auto", padding: "0 20px 20px", flex: 1 }}>
          {tab === "province" && (
            <>
              {provinces === null ? (
                <Loading />
              ) : provinces.length === 0 ? (
                <Empty text="ยังไม่มีโพสต์งานในระบบ" />
              ) : (
                <div style={{ display: "grid", gap: 10 }}>
                  {provinces.map((p) => (
                    <div key={p.province}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <MapPin size={13} color="#FFFFFF" /> {p.province}
                        </span>
                        <span style={{ color: "#AEB8E0" }}>{p.count} งาน</span>
                      </div>
                      <div style={{ height: 6, borderRadius: 999, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${(p.count / maxCount) * 100}%`, background: "linear-gradient(90deg,#49CAFF,#5271FF)", borderRadius: 999 }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {tab === "donors" && (
            <>
              <Link
                href="/support"
                onClick={onClose}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px 14px", borderRadius: 10, marginBottom: 14, background: "linear-gradient(135deg,#49CAFF,#5271FF)", color: "#fff", fontSize: 13, fontWeight: 600, textDecoration: "none" }}
              >
                <Heart size={14} /> เป็นผู้สนับสนุน
              </Link>

              {donors === null ? (
                <Loading />
              ) : donors.length === 0 ? (
                <Empty text="ยังไม่มีผู้สนับสนุน เป็นคนแรกกันไหม?" />
              ) : (
                <div>
                  {donors.map((d, i) => (
                    <div key={d.id} style={{ padding: "11px 2px", borderBottom: i < donors.length - 1 ? "1px solid rgba(255,255,255,0.08)" : "none", fontSize: 14, fontWeight: 500 }}>
                      {d.name}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "7px 14px",
        borderRadius: 999,
        fontSize: 13,
        border: "none",
        cursor: "pointer",
        background: active ? "rgba(255,255,255,0.12)" : "transparent",
        color: active ? "#fff" : "#7A85B8",
        fontWeight: active ? 600 : 400,
      }}
    >
      {children}
    </button>
  );
}

function Loading() {
  return <p style={{ fontSize: 13, color: "#565C99", textAlign: "center", padding: "20px 0" }}>กำลังโหลด...</p>;
}

function Empty({ text }) {
  return <p style={{ fontSize: 13, color: "#565C99", textAlign: "center", padding: "20px 0" }}>{text}</p>;
}