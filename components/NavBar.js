"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { MapPin, Search, Plus, Shield, User, Rss, Menu, Heart, LogOut, LogIn, X, BarChart3 } from "lucide-react";
import StatsModal from "./StatsModal";

export default function NavBar({ initialUser }) {
  const [user, setUser] = useState(initialUser);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const router = useRouter();
  const headerRef = useRef(null);
  const menuRef = useRef(null);

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
      // ใช้ endpoint ค้นหาที่กรองที่ฐานข้อมูลแล้ว (เบากว่าเดิมมาก) แทนการโหลดโพสต์ทั้งเว็บทุกครั้งที่พิมพ์
      const res = await fetch(`/api/events/search?q=${encodeURIComponent(search.trim())}`);
      const { events } = await res.json();
      setResults(events || []);
    }, 200);
    return () => clearTimeout(t);
  }, [search]);

  // ปิดเมนูเมื่อคลิกข้างนอก
  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

  const logout = async () => {
    setMenuOpen(false);
    await fetch("/api/auth/logout", { method: "POST" });
    await signOut({ redirect: false });
    router.push("/");
    router.refresh();
  };

  return (
    <header ref={headerRef} style={{ position: "sticky", top: 0, zIndex: 50, backdropFilter: "blur(12px)", background: "rgba(21,15,46,0.92)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "10px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
        
        {/* แถบบน: เมนูรวม + โลโก้ + ปุ่มการใช้งานหลัก */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>

          <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
            {/* ปุ่มเมนูรวม: รวมลิงก์ไปหน้าอื่นๆ ทั้งหมดไว้ที่เดียว (ฟีด, สนับสนุนเรา, โปรไฟล์, Admin, เข้า/ออกจากระบบ) */}
            <div ref={menuRef} style={{ position: "relative", flexShrink: 0 }}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="btn-ghost"
                style={{ width: 36, height: 36, padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
                aria-label="เมนู"
              >
                {menuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>

              {menuOpen && (
                <div className="card" style={{ position: "absolute", top: 44, left: 0, minWidth: 200, padding: 6, zIndex: 70, background: "#191332" }}>
                  <MenuLink href="/" icon={<MapPin size={16} color="#FFC145" />} label="หน้าหลัก (แผนที่)" onClick={() => setMenuOpen(false)} />
                  <MenuLink href="/feed" icon={<Rss size={16} color="#FF3D8A" />} label="ฟีดโพสต์" onClick={() => setMenuOpen(false)} />
                  <MenuLink href="/support" icon={<Heart size={16} color="#FF3D8A" />} label="สนับสนุนเรา" onClick={() => setMenuOpen(false)} />
                  <button
                    onClick={() => { setMenuOpen(false); setStatsOpen(true); }}
                    style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 8, background: "none", border: "none", color: "#E4DEFF", fontSize: 13, cursor: "pointer", textAlign: "left" }}
                  >
                    <BarChart3 size={16} color="#8177AE" /> สถิติ
                  </button>
                  {user && (
                    <MenuLink href="/profile" icon={<User size={16} color="#8177AE" />} label="โปรไฟล์" onClick={() => setMenuOpen(false)} />
                  )}
                  {user && user.role === "ADMIN" && (
                    <MenuLink href="/admin" icon={<Shield size={16} color="#8177AE" />} label="Admin" onClick={() => setMenuOpen(false)} />
                  )}
                  <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: "6px 4px" }} />
                  {user ? (
                    <button
                      onClick={logout}
                      style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 8, background: "none", border: "none", color: "#FF3D8A", fontSize: 13, cursor: "pointer", textAlign: "left" }}
                    >
                      <LogOut size={16} /> ออกจากระบบ
                    </button>
                  ) : (
                    <MenuLink href="/login" icon={<LogIn size={16} color="#8177AE" />} label="เข้าสู่ระบบ" onClick={() => setMenuOpen(false)} />
                  )}
                </div>
              )}
            </div>

            {/* โลโก้ */}
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, fontSize: 18, textDecoration: "none", color: "#fff", flexShrink: 0, minWidth: 0 }}>
              <MapPin size={20} color="#FFC145" />
              <span>FanQuest<span style={{ color: "#FF3D8A" }}>Map</span></span>
            </Link>
          </div>

          {/* กลุ่มปุ่มฝั่งขวา: เหลือแค่ปุ่มหลักของเว็บ (สร้างโพสต์ + โปรไฟล์) ส่วนลิงก์อื่นย้ายไปอยู่ในเมนูรวมแล้ว */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>

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

        {/* แถบล่าง: กล่องค้นหา */}
        <div style={{ position: "relative", width: "100%" }}>
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

      </div>

      <StatsModal open={statsOpen} onClose={() => setStatsOpen(false)} />
    </header>
  );
}

function MenuLink({ href, icon, label, onClick }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 8, color: "#E4DEFF", fontSize: 13, textDecoration: "none" }}
    >
      {icon} {label}
    </Link>
  );
}