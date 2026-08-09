"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MapPin, Search, Plus, Shield, User, Rss } from "lucide-react";

export default function NavBar({ initialUser }) {
  const [user, setUser] = useState(initialUser);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const router = useRouter();
  const headerRef = useRef(null);

  useEffect(() => {
  setUser(initialUser);
}, [initialUser]);

  // วัดความสูงจริงของแถบบน แล้วเก็บไว้เป็น CSS variable
  // ให้หน้าแผนที่แบบเต็มจอคำนวณความสูงที่เหลือได้พอดี ไม่ว่าจอขนาดไหน
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const setVar = () => {
      document.documentElement.style.setProperty("--navbar-h", `${el.offsetHeight}px`);
    };
    setVar();
    const ro = new ResizeObserver(setVar);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!search.trim()) { setResults([]); return; }
    const t = setTimeout(async () => {
      const res = await fetch("/api/events");
      const { events } = await res.json();
      const q = search.trim().toLowerCase();
      setResults(
        (events || []).filter(
          (e) => e.title.toLowerCase().includes(q) || e.province.includes(q) || e.district?.includes(q)
        ).slice(0, 6)
      );
    }, 200);
    return () => clearTimeout(t);
  }, [search]);

  return (
    <header ref={headerRef} style={{ position: "sticky", top: 0, zIndex: 50, backdropFilter: "blur(12px)", background: "rgba(21,15,46,0.92)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "10px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
        
        {/* แถบบน: โลโก้ + ปุ่มการใช้งานหลัก */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          
          {/* โลโก้ */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, fontSize: 18, textDecoration: "none", color: "#fff", flexShrink: 0 }}>
            <MapPin size={20} color="#FFC145" />
            <span>FanQuest<span style={{ color: "#FF3D8A" }}>Map</span></span>
          </Link>

          {/* กลุ่มปุ่มฝั่งขวา */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            
            {/* ปุ่ม Admin */}
            {user && user.role === "ADMIN" && (
              <Link href="/admin" className="btn-ghost" style={{ padding: "6px 10px", fontSize: 12, display: "flex", alignItems: "center", gap: 4, color: "#FF3D8A", border: "1px solid rgba(255,61,138,0.3)" }}>
                <Shield size={14} /> <span className="mobile-hide">Admin</span>
              </Link>
            )}

            {/* ปุ่มสร้างโพสต์ */}
            <Link href="/create" className="btn-primary" style={{ padding: "6px 12px", fontSize: 13, display: "flex", alignItems: "center", gap: 4 }}>
              <Plus size={15} /> <span className="mobile-hide">สร้างโพสต์</span>
            </Link>

            {/* ปุ่มรูปโปรไฟล์ / ล็อกอิน */}
            {user ? (
              <Link 
                href="/profile" 
                style={{ 
                  width: 36, 
                  height: 36, 
                  borderRadius: "50%", 
                  background: user.avatarUrl ? "transparent" : (user.avatarColor || "#E91E63"), 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  fontWeight: 600, 
                  fontSize: 14, 
                  overflow: "hidden",
                  border: "2px solid #FF3D8A",
                  flexShrink: 0
                }}
              >
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  user.username ? user.username[0].toUpperCase() : <User size={18} />
                )}
              </Link>
            ) : (
              <Link href="/login" className="btn-ghost" style={{ padding: "6px 12px", fontSize: 12 }}>
                เข้าสู่ระบบ
              </Link>
            )}
          </div>
        </div>

        {/* แถบล่าง: กล่องค้นหา + ปุ่มไปหน้าฟีดโซเชียล */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
            <Search size={15} style={{ position: "absolute", left: 12, top: 10, color: "#8177AE" }} />
            <input 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              placeholder="ค้นหางาน จังหวัด หรืออำเภอ..."
              className="input" 
              style={{ paddingLeft: 34, width: "100%", height: 36, fontSize: 13 }} 
            />
            {results.length > 0 && (
              <div className="card" style={{ position: "absolute", top: 42, left: 0, right: 0, maxHeight: 240, overflowY: "auto", padding: 6, zIndex: 60, background: "#191332" }}>
                {results.map((e) => (
                  <div key={e.id} onClick={() => { router.push(`/event/${e.id}`); setSearch(""); }}
                    style={{ padding: "8px 10px", borderRadius: 8, cursor: "pointer", display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ color: "#fff" }}>{e.title}</span>
                    <span style={{ fontSize: 12, color: "#8177AE" }}>{e.province}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ปุ่มไปหน้าฟีดโพสต์แบบโซเชียล (ไถดูโพสต์ต่างๆ ไม่ใช่แผนที่) */}
          <Link
            href="/feed"
            title="ฟีดโพสต์"
            className="btn-ghost"
            style={{ width: 36, height: 36, padding: 0, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
          >
            <Rss size={16} />
          </Link>
        </div>

      </div>
    </header>
  );
}