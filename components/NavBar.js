"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MapPin, Search, Plus } from "lucide-react";

export default function NavBar({ initialUser }) {
  const [user, setUser] = useState(initialUser);
  // ซิงก์สถานะผู้ใช้ทุกครั้งที่ล็อกอิน/ล็อกเอาต์แล้ว router.refresh()
  useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const router = useRouter();

  useEffect(() => {
    if (!search.trim()) { setResults([]); return; }
    const t = setTimeout(async () => {
      const res = await fetch("/api/events");
      const { events } = await res.json();
      const q = search.trim().toLowerCase();
      setResults(
        events.filter(
          (e) => e.title.toLowerCase().includes(q) || e.province.includes(q) || e.district.includes(q)
        ).slice(0, 6)
      );
    }, 200);
    return () => clearTimeout(t);
  }, [search]);

  return (
    <header style={{ position: "sticky", top: 0, zIndex: 30, backdropFilter: "blur(10px)", background: "rgba(21,15,46,0.85)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "14px 20px", display: "flex", alignItems: "center", gap: 14 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 20 }}>
          <MapPin size={22} color="#FFC145" />
          <span>FanQuest<span style={{ color: "#FF3D8A" }}>Map</span></span>
        </Link>

        <div style={{ flex: 1, position: "relative", maxWidth: 340 }}>
          <Search size={16} style={{ position: "absolute", left: 12, top: 11, color: "#8177AE" }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ค้นหางาน จังหวัด หรืออำเภอ..."
            className="input" style={{ paddingLeft: 34 }} />
          {results.length > 0 && (
            <div className="card" style={{ position: "absolute", top: 44, left: 0, right: 0, maxHeight: 260, overflowY: "auto", padding: 6, zIndex: 40 }}>
              {results.map((e) => (
                <div key={e.id} onClick={() => { router.push(`/event/${e.id}`); setSearch(""); }}
                  style={{ padding: "8px 10px", borderRadius: 10, cursor: "pointer", display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 13 }}>{e.title}</span>
                  <span style={{ fontSize: 12, color: "#B8AEDB" }}>{e.province}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <Link href="/create" className="btn-primary" style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Plus size={16} /> สร้างโพสต์
        </Link>

        {user ? (
          <Link href="/profile" style={{ width: 36, height: 36, borderRadius: "50%", background: user.avatarColor, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: 14 }}>
            {user.username[0]}
          </Link>
        ) : (
          <Link href="/login" className="btn-ghost">เข้าสู่ระบบ</Link>
        )}
      </div>
    </header>
  );
}
